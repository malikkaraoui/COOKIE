import { INFO_URL } from "../lib/hlEndpoints";

/**
 * Direction d'arbitrage funding.
 * - "collect_short": funding positif, les longs payent les shorts → on veut être short perp.
 * - "collect_long": funding négatif, les shorts payent les longs → on veut être long perp.
 */
export type FundingDirection = "collect_short" | "collect_long";

export interface FundingSignal {
  coin: string;
  fundingRate: number;
  premium: number;
  direction: FundingDirection;
  sizeDecimals: number;
  impactBid?: number;
  impactAsk?: number;
}

export interface FundingMarketSnapshot {
  coin: string;
  markPrice: number;
  fundingRate: number;
  premium: number;
  direction: FundingDirection;
}

export interface ComputeHedgeSizesInput {
  notionalUsd: number;
  spotPrice: number;
  /**
   * hedgeFactor permet d'introduire un biais directionnel léger.
   * 1 = delta-neutral pur, < 1 = sous-couvert (biais long), > 1 = sur-couvert (biais short).
   */
  hedgeFactor?: number;
}

export interface HedgeSizesResult {
  spotQty: number;
  perpQty: number;
}

interface UniverseEntry {
  name?: string;
  szDecimals?: number;
}

interface MetaAndAssetCtxsResponse {
  universe?: UniverseEntry[];
}

interface AssetCtx {
  funding?: string | number;
  premium?: string | number;
  impactPxs?: Array<string | number> | null;
}

async function postInfoEndpoint<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch(INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await safeReadError(response);
    throw new Error(`Hyperliquid info ${body.type} failed (${response.status}): ${message}`);
  }

  return response.json() as Promise<T>;
}

async function safeReadError(res: Response): Promise<string> {
  try {
    const text = await res.text();
    return text || res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function getFundingSignal(coin: string): Promise<FundingSignal> {
  const normalized = coin.trim().toUpperCase();
  if (!normalized) {
    throw new Error("coin requis pour getFundingSignal");
  }

  const data = await postInfoEndpoint<[MetaAndAssetCtxsResponse, AssetCtx[]]>({
    type: "metaAndAssetCtxs",
  });

  if (!Array.isArray(data) || data.length < 2) {
    throw new Error("Réponse metaAndAssetCtxs inattendue");
  }

  const universe = data[0]?.universe ?? [];
  const contexts = data[1] ?? [];
  const assetIndex = universe.findIndex((entry) => entry?.name?.toUpperCase() === normalized);

  if (assetIndex < 0 || !contexts[assetIndex]) {
    throw new Error(`Actif ${normalized} introuvable dans metaAndAssetCtxs`);
  }

  const ctx = contexts[assetIndex];
  const universeEntry = universe[assetIndex];
  const fundingRate = Number(ctx.funding);
  const premium = Number(ctx.premium ?? 0);
  const sizeDecimals = typeof universeEntry?.szDecimals === "number"
    ? Math.max(0, Math.min(8, universeEntry.szDecimals))
    : 4;
  const impactBid = ctx.impactPxs?.[0] != null ? Number(ctx.impactPxs[0]) : undefined;
  const impactAsk = ctx.impactPxs?.[1] != null ? Number(ctx.impactPxs[1]) : undefined;

  if (!Number.isFinite(fundingRate)) {
    throw new Error(`Funding rate invalide pour ${normalized}`);
  }

  const direction: FundingDirection = fundingRate > 0 ? "collect_short" : "collect_long";

  return {
    coin: normalized,
    fundingRate,
    premium: Number.isFinite(premium) ? premium : 0,
    direction,
    sizeDecimals,
    impactBid: Number.isFinite(impactBid) ? impactBid : undefined,
    impactAsk: Number.isFinite(impactAsk) ? impactAsk : undefined,
  };
}

export async function getFundingMarketsSnapshot(coins: string[]): Promise<FundingMarketSnapshot[]> {
  const targetCoins = Array.from(
    new Set(
      (coins || [])
        .map((coin) => coin?.trim().toUpperCase())
        .filter((coin): coin is string => Boolean(coin)),
    ),
  );

  if (!targetCoins.length) {
    return [];
  }

  const [metaResponse, mids] = await Promise.all([
    postInfoEndpoint<[MetaAndAssetCtxsResponse, AssetCtx[]]>({ type: "metaAndAssetCtxs" }),
    postInfoEndpoint<Record<string, string | number>>({ type: "allMids" }),
  ]);

  if (!Array.isArray(metaResponse) || metaResponse.length < 2) {
    throw new Error("Réponse metaAndAssetCtxs inattendue pour snapshot markets");
  }

  const universe = metaResponse[0]?.universe ?? [];
  const contexts = metaResponse[1] ?? [];

  return targetCoins
    .map((symbol) => {
      const assetIndex = universe.findIndex((entry) => entry?.name?.toUpperCase() === symbol);
      if (assetIndex < 0 || !contexts[assetIndex]) {
        return null;
      }

      const ctx = contexts[assetIndex];
      const fundingRate = Number(ctx.funding);
      if (!Number.isFinite(fundingRate)) {
        return null;
      }

      const premium = Number(ctx.premium ?? 0);
      const direction: FundingDirection = fundingRate > 0 ? "collect_short" : "collect_long";
      const markPriceRaw = mids?.[symbol];
      const markPrice = Number(markPriceRaw);

      return {
        coin: symbol,
        markPrice: Number.isFinite(markPrice) ? markPrice : 0,
        fundingRate,
        premium: Number.isFinite(premium) ? premium : 0,
        direction,
      } as FundingMarketSnapshot;
    })
    .filter((entry): entry is FundingMarketSnapshot => Boolean(entry));
}

export async function getSpotMid(coin: string): Promise<number> {
  const normalized = coin.trim().toUpperCase();
  if (!normalized) {
    throw new Error("coin requis pour getSpotMid");
  }

  const mids = await postInfoEndpoint<Record<string, string | number>>({
    type: "allMids",
  });

  const rawMid = mids?.[normalized];
  const mid = Number(rawMid);
  if (!Number.isFinite(mid) || mid <= 0) {
    throw new Error(`Mid Hyperliquid introuvable pour ${normalized}`);
  }

  return mid;
}

export function computeHedgeSizes(input: ComputeHedgeSizesInput): HedgeSizesResult {
  const { notionalUsd, spotPrice, hedgeFactor = 1 } = input;

  if (!Number.isFinite(notionalUsd) || notionalUsd <= 0) {
    throw new Error("notionalUsd doit être un nombre positif");
  }
  if (!Number.isFinite(spotPrice) || spotPrice <= 0) {
    throw new Error("spotPrice doit être un nombre positif");
  }
  if (!Number.isFinite(hedgeFactor) || hedgeFactor <= 0) {
    throw new Error("hedgeFactor doit être un nombre positif");
  }

  const spotQty = notionalUsd / spotPrice;
  const perpQty = spotQty * hedgeFactor;

  return { spotQty, perpQty };
}
