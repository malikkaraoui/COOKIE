import { auth } from "../config/firebase";
import { getUserProfile } from "../lib/database/userService";
import { placeHyperliquidTestOrder } from "../lib/hyperliquidOrders";
import { saveFundingTrade } from "../lib/trading/fundingTradeStore";
import {
  FundingDirection,
  FundingSignal,
  computeHedgeSizes,
  getFundingSignal,
  getSpotMid,
} from "../services/hyperliquidFunding";
import { upsertFundingStrategyState, FundingStrategyState } from "../services/fundingStrategyClient";
import { setActiveFundingSignal } from "../lib/database/xpService";

export const FUNDING_POSITIVE_THRESHOLD = 0.0001; // 0.01% / 8h
export const FUNDING_NEGATIVE_THRESHOLD = -0.0001;
const EXIT_PNL_TARGET_PERCENT = 1; // aligné sur la config backend

interface RawOrderStatus {
  resting?: { oid?: number };
  filled?: { oid?: number };
  error?: string;
}

type OrderSide = "buy" | "sell";

interface PriceTickMeta {
  tick: number;
  decimals: number;
}

const MANUAL_LEVERAGE = 1;
const LEVERAGE_DECREASE_ERROR = "decrease leverage";

export interface OpenFundingTradeParams {
  coin: string;
  notionalUsd: number;
  hedgeFactor?: number;
  minFundingRate?: number;
}

export interface OpenFundingTradeResult {
  tradeId: string;
  direction: FundingDirection;
  spotOrderId: number | null;
  perpOrderId: number | null;
  funding: FundingSignal;
}

function ensurePremiumAccess(profile: any) {
  const membership = profile?.membership;
  const isPremium = Boolean(membership?.active && membership?.tier === "premium");
  if (!isPremium) {
    throw new Error("Bouillon Funding réservé aux membres COOKIE Premium");
  }
}

function validateParams(params: OpenFundingTradeParams) {
  const { coin, notionalUsd, hedgeFactor, minFundingRate } = params;
  if (!coin || !coin.trim()) {
    throw new Error("coin requis pour openFundingTrade");
  }
  if (!Number.isFinite(notionalUsd) || notionalUsd <= 0) {
    throw new Error("notionalUsd doit être positif");
  }
  if (hedgeFactor !== undefined && (!Number.isFinite(hedgeFactor) || hedgeFactor <= 0)) {
    throw new Error("hedgeFactor doit être positif");
  }
  if (minFundingRate !== undefined && (!Number.isFinite(minFundingRate) || minFundingRate <= 0)) {
    throw new Error("minFundingRate doit être positif");
  }
}

function extractOrderId(status?: RawOrderStatus): number | null {
  if (!status) {
    return null;
  }
  if (status.error) {
    throw new Error(`Hyperliquid order rejeté: ${status.error}`);
  }
  const filled = status.filled?.oid;
  const resting = status.resting?.oid;
  return typeof filled === "number" ? filled : typeof resting === "number" ? resting : null;
}

function computePriceTickMeta(price: number): PriceTickMeta {
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("spotPrice doit être positif pour calculer le tick");
  }

  const exponent = Math.floor(Math.log10(price));
  const rawExp = exponent - 4;
  const clampedExp = Math.max(-8, Math.min(rawExp, 8));
  const tick = Number(Math.pow(10, clampedExp).toFixed(Math.max(0, -clampedExp)));
  const decimals = clampedExp < 0 ? Math.min(8, -clampedExp) : 0;

  return { tick, decimals };
}

function pickImpactPrice(side: OrderSide, funding: FundingSignal, fallback: number): number {
  const candidate = side === "buy" ? funding.impactAsk : funding.impactBid;
  if (candidate !== undefined && Number.isFinite(candidate) && candidate > 0) {
    return candidate;
  }
  return fallback;
}

function formatImpactPrice(price: number, side: OrderSide, meta: PriceTickMeta): string {
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Prix Hyperliquid invalide");
  }

  const { tick, decimals } = meta;
  const scaled = price / tick;
  const adjusted = side === "buy" ? Math.ceil(scaled) : Math.floor(scaled);
  let quantized = adjusted * tick;

  if (quantized <= 0) {
    quantized = tick;
  }

  return decimals > 0 ? quantized.toFixed(decimals) : quantized.toFixed(0);
}

function quantizeOrderSize(quantity: number, decimals: number): string {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("La taille d'ordre doit être un nombre positif");
  }
  const safeDecimals = Number.isFinite(decimals)
    ? Math.max(0, Math.min(8, Math.floor(decimals)))
    : 6;
  const factor = 10 ** safeDecimals;
  const floored = Math.floor(quantity * factor) / factor;
  if (floored <= 0) {
    throw new Error("Taille d'ordre trop faible après arrondi Hyperliquid");
  }
  return floored.toFixed(safeDecimals);
}

/**
 * Ouvre le combo funding décrit dans la page Bouillon de légumes.
 * 1. Vérifie l'accès premium + les paramètres.
 * 2. Récupère funding + prix spot + tailles delta-neutrales.
 * 3. Soumet deux ordres limites GTC reposant sur les prix d'impact Hyperliquid
 *    pour éviter les rejets « could not immediately match ».
 * 4. Persiste l'opération dans l'historique local.
 */
export async function openFundingTrade(params: OpenFundingTradeParams): Promise<OpenFundingTradeResult> {
  validateParams(params);

  const leverage = MANUAL_LEVERAGE;

  const user = auth.currentUser;
  if (!user) {
    throw new Error("Connecte-toi avec Google pour ouvrir un combo funding");
  }

  const profile = await getUserProfile(user.uid);
  ensurePremiumAccess(profile);

  // Normalise le symbole et récupère toutes les métriques nécessaires
  // (funding, prix spot et métadonnées tick size/quantités).
  const coin = params.coin.trim().toUpperCase();
  const funding = await getFundingSignal(coin);
  const customThreshold = Number.isFinite(params.minFundingRate) && params.minFundingRate! > 0
    ? params.minFundingRate!
    : FUNDING_POSITIVE_THRESHOLD;
  const isCollectShort = funding.fundingRate >= customThreshold;
  const isCollectLong = funding.fundingRate <= -customThreshold;

  if (!isCollectShort && !isCollectLong) {
    throw new Error(
      `Funding insuffisant sur Hyperliquid. Attendre que |taux| dépasse ±${(customThreshold * 100).toFixed(3)}% pour lancer un combo.`,
    );
  }
  const spotPrice = await getSpotMid(coin);
  const priceTickMeta = computePriceTickMeta(spotPrice);
  let spotQty = 0;
  let perpQty = 0;
  let includeSpotLeg = false;
  let perpSide: OrderSide = "sell";

  if (isCollectShort) {
    const hedgeSizes = computeHedgeSizes({
      notionalUsd: params.notionalUsd,
      spotPrice,
      hedgeFactor: params.hedgeFactor,
    });
    spotQty = hedgeSizes.spotQty;
    perpQty = hedgeSizes.perpQty;
    includeSpotLeg = true;
    perpSide = "sell";
  } else if (isCollectLong) {
    spotQty = 0;
    const perpNotionalUsd = params.notionalUsd * leverage;
    perpQty = perpNotionalUsd / spotPrice;
    perpSide = "buy";
  }

  const orders: Array<Record<string, unknown>> = [];
  let spotSize: string | null = null;
  if (includeSpotLeg && spotQty > 0) {
    spotSize = quantizeOrderSize(spotQty, funding.sizeDecimals);
    const spotSide: OrderSide = "buy";
    orders.push({
      symbol: coin,
      side: spotSide,
      size: spotSize,
      price: formatImpactPrice(pickImpactPrice(spotSide, funding, spotPrice), spotSide, priceTickMeta),
      tif: "Gtc",
      reduceOnly: false,
    });
  }

  const perpSize = quantizeOrderSize(perpQty, funding.sizeDecimals);
  orders.push({
    symbol: coin,
    side: perpSide,
    size: perpSize,
    price: formatImpactPrice(pickImpactPrice(perpSide, funding, spotPrice), perpSide, priceTickMeta),
    tif: "Gtc",
    reduceOnly: false,
  });

  // Envoie les deux ordres via la Cloud Function et extrait les IDs pour suivi.
  const leverageConfig = {
    symbol: coin,
    leverage,
    isCross: true,
  };
  const basePayload = { orders } as Record<string, unknown>;

  const sendOrders = async (payload: Record<string, unknown>) => {
    return placeHyperliquidTestOrder(payload);
  };

  const shouldRetryWithoutLeverage = (error: any) => {
    const message = typeof error?.message === "string" ? error.message.toLowerCase() : "";
    return message.includes(LEVERAGE_DECREASE_ERROR);
  };

  let response;
  try {
    response = await sendOrders({ ...basePayload, leverageConfig });
  } catch (error) {
    if (shouldRetryWithoutLeverage(error)) {
      console.warn("Hyperliquid refuse de réduire le levier : relance sans leverageConfig.", error);
      response = await sendOrders(basePayload);
    } else {
      throw error;
    }
  }
  const statuses = (response?.result?.response?.data?.statuses ?? []) as RawOrderStatus[];

  const spotOrderStatus = includeSpotLeg ? statuses[0] : undefined;
  const perpOrderStatus = includeSpotLeg ? statuses[1] : statuses[0];

  const spotOrderId = includeSpotLeg ? extractOrderId(spotOrderStatus) : null;
  const perpOrderId = extractOrderId(perpOrderStatus);
  const normalizedSpotSize = spotSize ? Number(spotSize) : 0;
  const normalizedPerpSize = Number(perpSize);
  const entryTimeMs = Date.now();

  const manualState: FundingStrategyState = {
    coin,
    mode: includeSpotLeg ? "DOUBLE_SHORT_FUNDING" : "SIMPLE_LONG_FUNDING",
    capitalUsd: params.notionalUsd,
    perpSize: normalizedPerpSize,
    spotSize: normalizedSpotSize,
    entryMarkPx: spotPrice,
    entryTimeMs,
    exitPnLPercentTarget: EXIT_PNL_TARGET_PERCENT,
    minFundingRate: isCollectShort ? customThreshold : -customThreshold,
    isOpen: true,
    source: "manual" as const,
    ownerUid: user.uid,
  };

  const tradeId = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `funding-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    await upsertFundingStrategyState(manualState);
  } catch (error: any) {
    console.error("upsertFundingStrategyState error", error);
    throw new Error(
      "Trade Hyperliquid envoyé mais impossible d'enregistrer l'état Firebase : " +
        (error?.message || error || "raison inconnue"),
    );
  }

  setActiveFundingSignal(user.uid, {
    coin,
    mode: manualState.mode,
    tradeId,
    entryTimeMs,
    source: "manual",
  }).catch((error) => {
    console.warn("Impossible de taguer le bouillon actif pour l'XP:", error);
  });

  saveFundingTrade({
    tradeId,
    coin,
    direction: funding.direction,
    spotOrderId,
    perpOrderId,
    spotQty,
    perpQty,
    notionalUsd: params.notionalUsd,
    leverage,
    hedgeFactor: params.hedgeFactor ?? 1,
    createdAt: entryTimeMs,
    extra: {
      fundingRate: funding.fundingRate,
      premium: funding.premium,
      spotPrice,
      priceTick: priceTickMeta.tick,
      includeSpotLeg,
    },
  });

  return {
    tradeId,
    direction: funding.direction,
    spotOrderId,
    perpOrderId,
    funding,
  };
}
