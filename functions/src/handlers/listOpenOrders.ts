import * as functions from "firebase-functions";
import {
  infoClient,
  hyperliquidAccountAddress,
} from "../hyperliquidClient";

interface NormalizedOrder {
  oid: number;
  coin: string;
  side: "buy" | "sell";
  limitPx: string;
  size: string;
  origSz: string;
  timestamp: number;
  reduceOnly: boolean;
}

interface NormalizedPosition {
  coin: string;
  side: "long" | "short";
  size: string;
  signedSize: string;
  entryPx: string | null;
  markPx: string | null;
  liqPx: string | null;
  leverage: string | null;
  entryTime: number | null;
}

function normalizeOrders(rawOrders: Array<Record<string, unknown>>): NormalizedOrder[] {
  return rawOrders.map((order) => {
    const side = order.side === "B" ? "buy" : "sell";
    return {
      oid: Number(order.oid),
      coin: String(order.coin),
      side,
      limitPx: String(order.limitPx),
      size: String(order.sz),
      origSz: String(order.origSz ?? order.sz ?? "0"),
      timestamp: Number(order.timestamp ?? Date.now()),
      reduceOnly: Boolean(order.reduceOnly),
    };
  });
}

function normalizePositions(
  rawPositions: Array<Record<string, unknown>>,
  mids: Record<string, unknown>
): NormalizedPosition[] {
  return rawPositions
    .map((entry) => {
      if (entry?.type !== "oneWay") {
        return null;
      }
      const position = entry.position as Record<string, unknown> | undefined;
      if (!position || typeof position.coin !== "string") {
        return null;
      }

      const signedSize = Number(position.szi);
      if (!Number.isFinite(signedSize) || signedSize === 0) {
        return null;
      }

      const entryPx = Number(position.entryPx);
      const liqPx = Number(position.liqPx);
      const leverage = Number(position.leverage);
      const markPx = Number(mids?.[position.coin]);
      const entryTime = Number(position.entryTime ?? position.timestamp);

      return {
        coin: position.coin,
        side: signedSize > 0 ? "long" : "short",
        size: Math.abs(signedSize).toString(),
        signedSize: signedSize.toString(),
        entryPx: Number.isFinite(entryPx) ? entryPx.toString() : null,
        markPx: Number.isFinite(markPx) ? markPx.toString() : null,
        liqPx: Number.isFinite(liqPx) ? liqPx.toString() : null,
        leverage: Number.isFinite(leverage) ? leverage.toFixed(2) : null,
        entryTime: Number.isFinite(entryTime) ? entryTime : null,
      };
    })
    .filter(Boolean) as NormalizedPosition[];
}

export const listOpenOrders = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const [openOrders, clearingState, mids] = await Promise.all([
      infoClient.openOrders({ user: hyperliquidAccountAddress }),
      infoClient.clearinghouseState({ user: hyperliquidAccountAddress }),
      infoClient.allMids(),
    ]);

    const normalizedOrders = normalizeOrders(openOrders as Array<Record<string, unknown>>);
    const normalizedPositions = normalizePositions(
      ((clearingState as Record<string, unknown>)?.assetPositions as Array<Record<string, unknown>>) || [],
      (mids as Record<string, unknown>) || {}
    );

    res.status(200).json({
      ok: true,
      counts: {
        orders: normalizedOrders.length,
        positions: normalizedPositions.length,
      },
      openOrders: normalizedOrders,
      openPositions: normalizedPositions,
    });
  } catch (error: any) {
    console.error("listOpenOrders error", error);
    res.status(500).json({
      error: error?.message || "Impossible de récupérer les ordres ouverts Hyperliquid",
    });
  }
});
