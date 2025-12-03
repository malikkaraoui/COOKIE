// "CASH OUT" function to close all open positions and cancel all open orders on Hyperliquid

import * as functions from "firebase-functions";
import { infoClient, exchangeClient, hyperliquidAccountAddress } from "../hyperliquidClient";

type CoinToAssetMap = Map<string, number>;

async function buildCoinToAssetMap(): Promise<CoinToAssetMap> {
  const meta = await infoClient.meta();
  const map: CoinToAssetMap = new Map();
  (meta?.universe || []).forEach((asset: { name?: string }, index: number) => {
    if (asset?.name) {
      map.set(asset.name, index);
    }
  });
  return map;
}

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 0;
}

function estimateTickSize(prices: number[], fallback = 1): number {
  if (!prices || prices.length < 2) {
    return fallback;
  }
  const sorted = Array.from(new Set(prices.filter((px) => Number.isFinite(px))))
    .sort((a, b) => a - b);
  if (sorted.length < 2) {
    return fallback;
  }
  const scale = 1e6;
  let tick = 0;
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round(Math.abs(sorted[i] - sorted[i - 1]) * scale);
    if (diff === 0) {
      continue;
    }
    tick = tick === 0 ? diff : gcd(tick, diff);
    if (tick === 1) {
      break;
    }
  }
  return tick > 0 ? tick / scale : fallback;
}

async function buildTickSizeMap(coins: Set<string>): Promise<Map<string, number>> {
  if (coins.size === 0) {
    return new Map();
  }

  const entries = await Promise.all(
    Array.from(coins).map(async (coin) => {
      try {
        const book = await infoClient.l2Book({ coin });
        const levels = [
          ...(((book as any)?.levels?.[0] as Array<Record<string, unknown>>) || []),
          ...(((book as any)?.levels?.[1] as Array<Record<string, unknown>>) || []),
        ];
        const prices = levels
          .map((level) => Number(level?.px))
          .filter((px) => Number.isFinite(px));
        const tick = estimateTickSize(prices, 1);
        return [coin, tick] as const;
      } catch (error) {
        console.error(`Impossible de récupérer le carnet L2 pour ${coin}`, error);
        return [coin, 1] as const;
      }
    })
  );

  return new Map(entries);
}

function quantizePrice(
  rawPrice: number,
  tickSize: number,
  isBuy: boolean,
  fallback: string
): string {
  if (!Number.isFinite(rawPrice) || rawPrice <= 0 || !Number.isFinite(tickSize) || tickSize <= 0) {
    return fallback;
  }
  const ratio = rawPrice / tickSize;
  const adjustedRatio = isBuy ? Math.ceil(ratio) : Math.floor(ratio);
  const normalizedRatio = adjustedRatio <= 0 ? 1 : adjustedRatio;
  const price = normalizedRatio * tickSize;
  if (!Number.isFinite(price) || price <= 0) {
    return fallback;
  }
  return price.toFixed(6).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export const closeAllPositions = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const [coinMap, openOrders, clearingState, mids] = await Promise.all([
      buildCoinToAssetMap(),
      infoClient.openOrders({ user: hyperliquidAccountAddress }),
      infoClient.clearinghouseState({ user: hyperliquidAccountAddress }),
      infoClient.allMids(),
    ]);

    const cancels = (openOrders || [])
      .map((order: Record<string, unknown>) => {
        const coin = String(order.coin ?? "");
        const assetId = coinMap.get(coin);
        if (assetId === undefined) {
          return null;
        }
        return {
          a: assetId,
          o: Number(order.oid),
        };
      })
      .filter(Boolean) as Array<{ a: number; o: number }>;

    let cancelResult: unknown = null;
    if (cancels.length > 0) {
      cancelResult = await exchangeClient.cancel({ cancels });
    }

    const positions = clearingState?.assetPositions || [];
    const coinsToClose = new Set<string>();
    positions.forEach((entry: any) => {
      if (entry?.type === "oneWay" && entry.position) {
        const size = toNumber(entry.position.szi);
        if (size !== 0 && typeof entry.position.coin === "string") {
          coinsToClose.add(entry.position.coin);
        }
      }
    });

    const tickSizeMap = await buildTickSizeMap(coinsToClose);

    const closeOrders = positions
      .map((entry: any) => {
        if (entry?.type !== "oneWay") {
          return null;
        }
        const position = entry.position;
        if (!position) {
          return null;
        }
        const size = toNumber(position.szi);
        if (size === 0) {
          return null;
        }
        const coin = position.coin as string;
        const assetId = coinMap.get(coin);
        if (assetId === undefined) {
          return null;
        }
        const isLong = size > 0;
        const midPrice = toNumber((mids as Record<string, unknown>)[coin]);
        const tickSize = tickSizeMap.get(coin) ?? 1;
        const rawPrice = isLong ? midPrice * 0.8 : midPrice * 1.2;
        const fallbackPrice = isLong ? "0.01" : "9999999";
        const price = quantizePrice(rawPrice, tickSize, !isLong, fallbackPrice);
        return {
          a: assetId,
          b: !isLong,
          p: price,
          s: Math.abs(size).toString(),
          r: false,
          t: { limit: { tif: "Ioc" as const } },
        };
      })
      .filter(Boolean) as Array<{
        a: number;
        b: boolean;
        p: string;
        s: string;
        r: boolean;
        t: { limit: { tif: "Ioc" } };
      }>;

    let closeResult: unknown = null;
    if (closeOrders.length > 0) {
      closeResult = await exchangeClient.order({
        orders: closeOrders,
        grouping: "na",
      });
    }

    res.status(200).json({
      ok: true,
      canceledOrders: cancels.length,
      closeOrdersPlaced: closeOrders.length,
      cancelResult,
      closeResult,
    });
  } catch (error: any) {
    console.error("closeAllPositions error", error);
    res.status(500).json({
      error: error?.message || "Impossible de fermer les positions Hyperliquid",
    });
  }
});
