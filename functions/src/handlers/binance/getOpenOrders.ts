import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/logger";
import { buildBinanceClient, binanceSecretList } from "./utils";

export const listBinanceOpenOrders = onRequest(
  {
    secrets: [...binanceSecretList],
    cors: true,
    region: "europe-west1",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("OK");
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const rawSymbol = typeof req.query.symbol === "string" ? req.query.symbol.trim() : undefined;
      const symbol = rawSymbol ? rawSymbol.toUpperCase() : undefined;
      const includeClosedParam = typeof req.query.includeClosed === "string" ? req.query.includeClosed : undefined;
      const includeClosed = includeClosedParam ? ["1", "true", "yes"].includes(includeClosedParam.toLowerCase()) : false;
      const limitParam = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
      const historySymbolRaw = typeof req.query.historySymbol === "string" ? req.query.historySymbol.trim() : undefined;
      const historySymbol = historySymbolRaw ? historySymbolRaw.toUpperCase() : symbol;

      const { client } = buildBinanceClient();
      const openOrders = await client.getOpenOrders(symbol);
      let recentOrders: unknown[] | undefined;
      if (includeClosed) {
        const fallbackSymbol = historySymbol || "BTCUSDT";
        const computedLimit = Number.isFinite(limitParam) ? Math.floor(Number(limitParam)) : undefined;
        const safeLimit = computedLimit ? Math.min(Math.max(computedLimit, 1), 50) : 25;
        recentOrders = await client.getAllOrders(fallbackSymbol, safeLimit);
      }

      logger.info("📋 Binance open orders récupérés", {
        symbol,
        count: openOrders.length,
        includeClosed,
      });

      res.status(200).json({
        ok: true,
        openOrders,
        symbol,
        recentOrders,
        historySymbol: includeClosed ? historySymbol || "BTCUSDT" : undefined,
      });
    } catch (error) {
      logger.error("❌ Erreur fetch open orders Binance", {
        message: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }
);
