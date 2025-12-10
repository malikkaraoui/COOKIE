import * as functions from "firebase-functions/v1";
import { WATCHED_COINS, WATCH_SCHEDULE, WATCH_TIMEZONE } from "../config/fundingStrategyConfig";
import { buildFundingContext, maybeCloseFundingPosition } from "./hyperliquidFundingStrategy";
import { loadStrategyState, saveStrategyState } from "../store/fundingStrategyStore";

export const watchHyperliquidFunding = functions.pubsub
  .schedule(WATCH_SCHEDULE)
  .timeZone(WATCH_TIMEZONE)
  .onRun(async () => {
    const results: Array<{ coin: string; action: string; fundingRate?: number; pnl?: number; reason?: string }> = [];

    for (const coin of WATCHED_COINS) {
      try {
        const ctx = await buildFundingContext(coin);
        const currentState = await loadStrategyState(coin);
        const nextState = await maybeCloseFundingPosition(currentState, ctx);

        if (nextState && (!currentState || nextState !== currentState)) {
          await saveStrategyState(nextState);
        }

        results.push({
          coin,
          action: currentState?.isOpen && !nextState?.isOpen ? "close" : nextState?.isOpen ? "holding" : "idle",
          fundingRate: ctx.fundingRate,
        });
      } catch (error: any) {
        console.error(`[FundingWatcher] ${coin} erreur`, error);
        results.push({ coin, action: "error", reason: error?.message });
      }
    }

    console.log("[FundingWatcher] cycle terminé", { results });
    return null;
  });
