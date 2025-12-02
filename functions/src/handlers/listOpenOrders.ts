import * as functions from "firebase-functions";
import { infoClient, hyperliquidAccountAddress } from "../hyperliquidClient";

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
    const openOrders = await infoClient.openOrders({
      user: hyperliquidAccountAddress,
    });

    const normalized = normalizeOrders(openOrders as Array<Record<string, unknown>>);

    res.status(200).json({
      ok: true,
      count: normalized.length,
      openOrders: normalized,
    });
  } catch (error: any) {
    console.error("listOpenOrders error", error);
    res.status(500).json({
      error: error?.message || "Impossible de récupérer les ordres ouverts Hyperliquid",
    });
  }
});
