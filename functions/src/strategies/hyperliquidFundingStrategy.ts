import {
  buySpot,
  closePerpPosition,
  getPerpFundingInfo,
  openPerpPosition,
  sellSpot,
} from "../services/hyperliquid";
import {
  DEFAULT_CAPITAL_USD,
  ENABLE_SPOT_LEG,
  EXIT_PNL_PERCENT_TARGET,
  FUNDING_NEG_THRESHOLD,
  FUNDING_POS_THRESHOLD,
  PERP_LEVERAGE,
  SPOT_SHARE,
} from "../config/fundingStrategyConfig";

export type StrategyMode = "IDLE" | "DOUBLE_SHORT_FUNDING" | "SIMPLE_LONG_FUNDING";

export type StrategySource = "auto" | "manual";

export interface FundingStrategyState {
  coin: string;
  mode: StrategyMode;
  capitalUsd: number;
  perpSize: number;
  spotSize: number;
  entryMarkPx: number;
  entryTimeMs: number;
  estimatedFundingPnlUsd?: number;
  exitPnLPercentTarget: number;
  minFundingRate: number;
  isOpen: boolean;
  source?: StrategySource;
  updatedAt?: number;
}

export interface FundingContext {
  coin: string;
  fundingRate: number;
  markPx: number;
  nowMs: number;
  sizeDecimals: number;
}

function quantizePerpSize(size: number, decimals: number): number {
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error("Taille perp invalide");
  }

  const safeDecimals = Number.isFinite(decimals)
    ? Math.max(0, Math.min(8, Math.floor(decimals)))
    : 4;

  const quantized = Number(size.toFixed(safeDecimals));
  if (!Number.isFinite(quantized) || quantized <= 0) {
    throw new Error(`Taille perp (${size}) trop petite pour ${safeDecimals} décimales`);
  }

  return quantized;
}

export function computeApproxPnlPercent(state: FundingStrategyState, ctx: FundingContext): number {
  if (!state.isOpen) return 0;

  const directionMultiplier = state.mode === "SIMPLE_LONG_FUNDING" ? 1 : -1; // LONG perp => +1, SHORT perp => -1
  const perpPnlUsd = ((ctx.markPx - state.entryMarkPx) / state.entryMarkPx) * state.perpSize * directionMultiplier * state.entryMarkPx;

  const spotPnlUsd = state.mode === "DOUBLE_SHORT_FUNDING"
    ? (ctx.markPx - state.entryMarkPx) * state.spotSize
    : 0;

  const fundingPnlUsd = state.estimatedFundingPnlUsd ?? 0;
  const pnlTotalUsd = perpPnlUsd + spotPnlUsd + fundingPnlUsd;
  return (pnlTotalUsd / state.capitalUsd) * 100;
}

export async function maybeOpenFundingPosition(
  state: FundingStrategyState | null,
  ctx: FundingContext,
): Promise<FundingStrategyState | null> {
  if (state?.isOpen) {
    return state;
  }

  // Cas A : funding positif -> collect shorts (double jambe si possible)
  if (ctx.fundingRate > FUNDING_POS_THRESHOLD) {
    const capitalUsd = DEFAULT_CAPITAL_USD;
    const capitalSpotUsd = ENABLE_SPOT_LEG ? capitalUsd * SPOT_SHARE : 0;
    const capitalPerpUsd = capitalUsd - capitalSpotUsd;
    const spotMid = ctx.markPx;

    const spotSize = capitalSpotUsd > 0 ? capitalSpotUsd / spotMid : 0;
    const perpNotionalUsd = capitalPerpUsd * PERP_LEVERAGE;
    const perpSize = quantizePerpSize(perpNotionalUsd / spotMid, ctx.sizeDecimals);

    let filledSpotSize = 0;
    if (ENABLE_SPOT_LEG && spotSize > 0) {
      const spotResult = await buySpot({ coin: ctx.coin, notionalUsd: capitalSpotUsd });
      filledSpotSize = spotResult.filledQty;
    }

    const perpResult = await openPerpPosition({
      coin: ctx.coin,
      side: "SHORT",
      size: perpSize,
      leverage: PERP_LEVERAGE,
    });

    const newState: FundingStrategyState = {
      coin: ctx.coin,
      mode: "DOUBLE_SHORT_FUNDING",
      capitalUsd,
      perpSize: perpResult.filledSize,
      spotSize: filledSpotSize,
      entryMarkPx: ctx.markPx,
      entryTimeMs: ctx.nowMs,
      exitPnLPercentTarget: EXIT_PNL_PERCENT_TARGET,
      minFundingRate: FUNDING_POS_THRESHOLD,
      isOpen: true,
    };

    return newState;
  }

  // Cas B : funding négatif -> collect longs (long perp only)
  if (ctx.fundingRate < FUNDING_NEG_THRESHOLD) {
    const capitalUsd = DEFAULT_CAPITAL_USD;
    const spotMid = ctx.markPx;
    const perpNotionalUsd = capitalUsd * PERP_LEVERAGE;
    const perpSize = quantizePerpSize(perpNotionalUsd / spotMid, ctx.sizeDecimals);

    const perpResult = await openPerpPosition({
      coin: ctx.coin,
      side: "LONG",
      size: perpSize,
      leverage: PERP_LEVERAGE,
    });

    const newState: FundingStrategyState = {
      coin: ctx.coin,
      mode: "SIMPLE_LONG_FUNDING",
      capitalUsd,
      perpSize: perpResult.filledSize,
      spotSize: 0,
      entryMarkPx: ctx.markPx,
      entryTimeMs: ctx.nowMs,
      exitPnLPercentTarget: EXIT_PNL_PERCENT_TARGET,
      minFundingRate: FUNDING_NEG_THRESHOLD,
      isOpen: true,
    };

    return newState;
  }

  return state;
}

export async function maybeCloseFundingPosition(
  state: FundingStrategyState | null,
  ctx: FundingContext,
): Promise<FundingStrategyState | null> {
  if (!state || !state.isOpen) {
    return state;
  }

  const pnlTotalPercent = computeApproxPnlPercent(state, ctx);
  const fundingSignChanged = Math.sign(ctx.fundingRate) !== Math.sign(state.minFundingRate);
  const shouldExit = pnlTotalPercent <= state.exitPnLPercentTarget || fundingSignChanged;

  if (!shouldExit) {
    return state;
  }

  if (state.mode === "DOUBLE_SHORT_FUNDING") {
    // Fermer le perp short
    await closePerpPosition({
      coin: state.coin,
      side: "SHORT",
      size: state.perpSize,
    });

    // Vendre le spot si ouvert
    if (ENABLE_SPOT_LEG && state.spotSize > 0) {
      await sellSpot({ coin: state.coin, qty: state.spotSize });
    }
  } else if (state.mode === "SIMPLE_LONG_FUNDING") {
    await closePerpPosition({
      coin: state.coin,
      side: "LONG",
      size: state.perpSize,
    });
  }

  const closedState: FundingStrategyState = {
    ...state,
    isOpen: false,
  };

  return closedState;
}

// Utilitaire facultatif pour récupérer le funding ctx directement depuis l'API
export async function buildFundingContext(coin: string): Promise<FundingContext> {
  const info = await getPerpFundingInfo(coin);
  return {
    coin: info.coin,
    fundingRate: info.fundingRate,
    markPx: info.markPx,
    nowMs: Date.now(),
    sizeDecimals: info.sizeDecimals,
  };
}
