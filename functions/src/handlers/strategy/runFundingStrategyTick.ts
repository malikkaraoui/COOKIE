import * as functions from "firebase-functions/v1";
import {
  WATCHED_COINS,
} from "../../config/fundingStrategyConfig";
import {
  buildFundingContext,
  maybeCloseFundingPosition,
  FundingContext,
  FundingStrategyState,
} from "../../strategies/hyperliquidFundingStrategy";
import {
  loadStrategyState,
  saveStrategyState,
} from "../../store/fundingStrategyStore";

interface RunResult {
  coin: string;
  action: "close" | "idle" | "error";
  fundingRate?: number;
  state?: FundingStrategyState | null;
  error?: string;
}

function parseCoins(body: unknown): string[] {
  const bodyCoins = Array.isArray((body as any)?.coins)
    ? ((body as any)?.coins as unknown[])
        .map((coin) => (typeof coin === "string" ? coin.trim().toUpperCase() : null))
        .filter((coin): coin is string => Boolean(coin))
    : null;
  return bodyCoins && bodyCoins.length > 0 ? bodyCoins : WATCHED_COINS;
}

async function processCoin(coin: string, ctx?: FundingContext): Promise<RunResult> {
  const fundingCtx = ctx ?? (await buildFundingContext(coin));
  const currentState = await loadStrategyState(coin);
  const nextState = await maybeCloseFundingPosition(currentState, fundingCtx);

  if (nextState && (!currentState || nextState !== currentState)) {
    await saveStrategyState(nextState);
  }

  return {
    coin,
    action: currentState?.isOpen && !nextState?.isOpen ? "close" : "idle",
    fundingRate: fundingCtx.fundingRate,
    state: nextState ?? null,
  };
}

export const runFundingStrategyTick = functions.https.onRequest(async (req, res) => {
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

  const coins = parseCoins(req.body);
  const results: RunResult[] = [];

  for (const coin of coins) {
    try {
      const result = await processCoin(coin);
      results.push(result);
    } catch (error: any) {
      console.error("[runFundingStrategyTick]", coin, error);
      results.push({
        coin,
        action: "error",
        error: error?.message || "Erreur inconnue",
      });
    }
  }

  res.status(200).json({ ok: true, results });
});
