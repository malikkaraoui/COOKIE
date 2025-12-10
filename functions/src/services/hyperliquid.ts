import { exchangeClient, infoClient } from "../hyperliquidClient";

export type PerpSide = "LONG" | "SHORT";

export interface PerpFundingInfo {
  coin: string;
  fundingRate: number;
  fundingTimeMs: number;
  markPx: number;
  sizeDecimals: number;
}

const INFO_URL = process.env.HL_INFO_URL ?? "https://api.hyperliquid-testnet.xyz/info";

interface MetaUniverseEntry {
  name?: string;
  szDecimals?: number;
}

interface MetaAndAssetCtxsResponse {
  universe?: MetaUniverseEntry[];
}

interface AssetCtx {
  funding?: string | number;
}

async function postInfoEndpoint<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch(INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Hyperliquid info ${body.type} failed (${response.status}): ${text || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

async function resolveAssetId(coin: string): Promise<number> {
  const normalized = coin.trim().toUpperCase();
  if (!normalized) {
    throw new Error("coin requis pour resolveAssetId");
  }

  const meta = await infoClient.meta();
  const universe: Array<{ name?: string }> = (meta as any)?.universe ?? [];
  const assetIndex = universe.findIndex((entry) => entry?.name?.toUpperCase() === normalized);
  if (assetIndex < 0) {
    throw new Error(`Actif ${normalized} introuvable dans meta()`);
  }
  return assetIndex;
}

export async function ensurePerpLeverage(params: {
  coin: string;
  leverage: number;
  isCross?: boolean;
  assetId?: number;
}): Promise<void> {
  const normalized = params.coin.trim().toUpperCase();
  if (!normalized) {
    throw new Error("coin requis pour ensurePerpLeverage");
  }

  const leverageValue = Number(params.leverage);
  if (!Number.isFinite(leverageValue) || leverageValue <= 0) {
    throw new Error("leverage doit être un nombre positif");
  }

  const leverageInt = Math.max(1, Math.floor(leverageValue));
  const isCross = params.isCross !== undefined ? Boolean(params.isCross) : true;

  let assetId = params.assetId;
  if (assetId == null) {
    assetId = await resolveAssetId(normalized);
  }

  await exchangeClient.updateLeverage({
    asset: assetId,
    isCross,
    leverage: leverageInt,
  });
}

function pickMarketishPrice(markPx: number, side: PerpSide): number {
  if (!Number.isFinite(markPx) || markPx <= 0) {
    throw new Error("markPx invalide pour calculer un prix de marché");
  }
  const buffer = 0.01; // 1% de marge pour maximiser les chances de fill en IOC
  return side === "LONG" ? markPx * (1 + buffer) : markPx * (1 - buffer);
}

function computePriceTickMeta(price: number): { tick: number; decimals: number } {
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Prix invalide pour calculer le tick Hyperliquid");
  }
  const exponent = Math.floor(Math.log10(price));
  const rawExp = exponent - 4; // réduit la précision lorsque le prix est élevé
  const clampedExp = Math.max(-8, Math.min(rawExp, 8));
  const tick = Number(Math.pow(10, clampedExp).toFixed(Math.max(0, -clampedExp)));
  const decimals = clampedExp < 0 ? Math.min(8, -clampedExp) : 0;
  return { tick, decimals };
}

function quantizeOrderPrice(price: number, side: PerpSide): string {
  const meta = computePriceTickMeta(price);
  const scaled = price / meta.tick;
  const adjusted = side === "LONG" ? Math.ceil(scaled) : Math.floor(scaled);
  let quantized = adjusted * meta.tick;
  if (quantized <= 0) {
    quantized = meta.tick;
  }
  return meta.decimals > 0 ? quantized.toFixed(meta.decimals) : quantized.toFixed(0);
}

export async function getPerpFundingInfo(coin: string): Promise<PerpFundingInfo> {
  const normalized = coin.trim().toUpperCase();
  if (!normalized) {
    throw new Error("coin requis pour getPerpFundingInfo");
  }

  const [metaCtxs, mids] = await Promise.all([
    postInfoEndpoint<[MetaAndAssetCtxsResponse, AssetCtx[]]>({ type: "metaAndAssetCtxs" }),
    postInfoEndpoint<Record<string, string | number>>({ type: "allMids" }),
  ]);

  if (!Array.isArray(metaCtxs) || metaCtxs.length < 2) {
    throw new Error("Réponse metaAndAssetCtxs inattendue");
  }

  const universe = metaCtxs[0]?.universe ?? [];
  const contexts = metaCtxs[1] ?? [];
  const assetIndex = universe.findIndex((entry) => entry?.name?.toUpperCase() === normalized);

  if (assetIndex < 0 || !contexts[assetIndex]) {
    throw new Error(`Actif ${normalized} introuvable dans metaAndAssetCtxs`);
  }

  const ctx = contexts[assetIndex];
  const fundingRate = Number(ctx.funding);
  if (!Number.isFinite(fundingRate)) {
    throw new Error(`Funding rate invalide pour ${normalized}`);
  }

  const sizeDecimalsRaw = universe[assetIndex]?.szDecimals;
  const sizeDecimals = typeof sizeDecimalsRaw === "number"
    ? Math.max(0, Math.min(8, sizeDecimalsRaw))
    : 4;

  const midRaw = mids?.[normalized];
  const markPx = Number(midRaw);
  if (!Number.isFinite(markPx) || markPx <= 0) {
    throw new Error(`Mark price introuvable pour ${normalized}`);
  }

  return {
    coin: normalized,
    fundingRate,
    fundingTimeMs: Date.now(),
    markPx,
    sizeDecimals,
  };
}

export async function getSpotMidPrice(coin: string): Promise<number> {
  const normalized = coin.trim().toUpperCase();
  if (!normalized) {
    throw new Error("coin requis pour getSpotMidPrice");
  }

  const mids = await postInfoEndpoint<Record<string, string | number>>({ type: "allMids" });
  const midRaw = mids?.[normalized];
  const mid = Number(midRaw);
  if (!Number.isFinite(mid) || mid <= 0) {
    throw new Error(`Mid Hyperliquid introuvable pour ${normalized}`);
  }
  return mid;
}

export async function openPerpPosition(params: {
  coin: string;
  side: PerpSide;
  size: number; // taille en coin
  leverage: number;
}): Promise<{ positionId?: string; filledSize: number; entryPx: number }> {
  const normalized = params.coin.trim().toUpperCase();
  if (!normalized) {
    throw new Error("coin requis pour openPerpPosition");
  }
  if (!Number.isFinite(params.size) || params.size <= 0) {
    throw new Error("size doit être un nombre positif");
  }

  const assetId = await resolveAssetId(normalized);
  await ensurePerpLeverage({ coin: normalized, leverage: params.leverage, assetId });
  const markPx = await getSpotMidPrice(normalized);
  const orderPx = pickMarketishPrice(markPx, params.side);
  const isBuy = params.side === "LONG";

  const orderPayload = {
    orders: [
      {
        a: assetId,
        b: isBuy,
        p: quantizeOrderPrice(orderPx, params.side),
        s: params.size.toString(),
        r: false,
        t: { limit: { tif: "Ioc" as const } },
      },
    ],
    grouping: "na" as const,
  };

  const result = await exchangeClient.order(orderPayload as any);
  const status = (result as any)?.response?.data?.statuses?.[0] ?? (result as any)?.statuses?.[0];
  const oid = status?.resting?.oid ?? status?.filled?.oid ?? null;
  const filledSize = Number(status?.filled?.sz ?? status?.resting?.sz ?? params.size);
  const entryPx = Number(status?.filled?.px ?? orderPx);

  return {
    positionId: oid != null ? String(oid) : undefined,
    filledSize: Number.isFinite(filledSize) ? filledSize : params.size,
    entryPx: Number.isFinite(entryPx) ? entryPx : orderPx,
  };
}

export async function closePerpPosition(params: {
  coin: string;
  side: PerpSide;
  size: number;
}): Promise<void> {
  const normalized = params.coin.trim().toUpperCase();
  if (!normalized) {
    throw new Error("coin requis pour closePerpPosition");
  }
  if (!Number.isFinite(params.size) || params.size <= 0) {
    throw new Error("size doit être un nombre positif");
  }

  const assetId = await resolveAssetId(normalized);
  const markPx = await getSpotMidPrice(normalized);
  const opposite: PerpSide = params.side === "LONG" ? "SHORT" : "LONG";
  const price = pickMarketishPrice(markPx, opposite);
  const isBuy = opposite === "LONG";

  const payload = {
    orders: [
      {
        a: assetId,
        b: isBuy,
        p: quantizeOrderPrice(price, opposite),
        s: params.size.toString(),
        r: true,
        t: { limit: { tif: "Ioc" as const } },
      },
    ],
    grouping: "na" as const,
  };

  await exchangeClient.order(payload as any);
}

export async function buySpot(params: { coin: string; notionalUsd: number }): Promise<{ filledQty: number; avgPx: number }> {
  // Hyperliquid spot n'est pas exposé dans le SDK actuel (@nktkas/hyperliquid).
  // On retourne une erreur explicite afin que la stratégie puisse gérer la
  // dégradation (ex. passer en perp-only) sans crasher silencieusement.
  throw new Error("Hyperliquid spot indisponible dans le SDK actuel");
}

export async function sellSpot(params: { coin: string; qty: number }): Promise<void> {
  throw new Error("Hyperliquid spot indisponible dans le SDK actuel");
}
