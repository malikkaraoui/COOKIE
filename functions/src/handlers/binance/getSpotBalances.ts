import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/logger";
import { buildBinanceClient, binanceSecretList } from "./utils";

const parseAmount = (value?: string): number => {
  const numeric = Number(value ?? "0");
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return numeric;
};

export const listBinanceSpotBalances = onRequest(
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
      const { client } = buildBinanceClient();
      const account = await client.getAccountInformation();
      const balances = account?.balances ?? [];

      const nonZeroBalances = balances
        .map((entry) => {
          const free = parseAmount(entry.free);
          const locked = parseAmount(entry.locked);
          const total = free + locked;
          return {
            asset: entry.asset,
            free: entry.free,
            locked: entry.locked,
            freeNumber: free,
            lockedNumber: locked,
            total,
          };
        })
        .filter((entry) => entry.total > 0)
        .sort((a, b) => b.total - a.total);

      const summary = nonZeroBalances.reduce(
        (acc, entry) => {
          acc.totalFree += entry.freeNumber;
          acc.totalLocked += entry.lockedNumber;
          acc.total += entry.total;
          return acc;
        },
        { totalFree: 0, totalLocked: 0, total: 0 }
      );

      logger.info("📊 Binance spot balances fetched", {
        assets: nonZeroBalances.length,
        canTrade: account?.canTrade,
      });

      res.status(200).json({
        ok: true,
        fetchedAt: new Date().toISOString(),
        summary: {
          assets: nonZeroBalances.length,
          totalFree: summary.totalFree,
          totalLocked: summary.totalLocked,
          total: summary.total,
          canTrade: account?.canTrade ?? null,
          canDeposit: account?.canDeposit ?? null,
          canWithdraw: account?.canWithdraw ?? null,
          updateTime: account?.updateTime ?? null,
        },
        balances: nonZeroBalances.map((entry) => ({
          asset: entry.asset,
          free: entry.free,
          locked: entry.locked,
          total: entry.total,
        })),
      });
    } catch (error) {
      logger.error("❌ Erreur récupération balances Binance", {
        message: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }
);
