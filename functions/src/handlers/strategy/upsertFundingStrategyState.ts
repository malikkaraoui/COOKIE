import * as functions from "firebase-functions/v1";
import { FundingStrategyState, StrategyMode, StrategySource } from "../../strategies/hyperliquidFundingStrategy";
import { saveStrategyState } from "../../store/fundingStrategyStore";

const ALLOWED_MODES: StrategyMode[] = ["IDLE", "DOUBLE_SHORT_FUNDING", "SIMPLE_LONG_FUNDING"];
const ALLOWED_SOURCES: StrategySource[] = ["auto", "manual"];

function normalizeNumber(value: unknown, field: string, options?: { positive?: boolean }): number {
  const num = Number(value);
  if (!Number.isFinite(num) || (options?.positive && num <= 0)) {
    throw new Error(`${field} doit être un nombre${options?.positive ? " positif" : ""}`);
  }
  return num;
}

function normalizeState(payload: any): FundingStrategyState {
  if (!payload || typeof payload !== "object") {
    throw new Error("state requis dans le corps de la requête");
  }

  const coinRaw = typeof payload.coin === "string" ? payload.coin.trim().toUpperCase() : "";
  if (!coinRaw) {
    throw new Error("coin requis");
  }

  const mode = ALLOWED_MODES.includes(payload.mode) ? payload.mode : undefined;
  if (!mode || mode === "IDLE") {
    throw new Error("mode invalide pour une position manuelle");
  }

  const capitalUsd = normalizeNumber(payload.capitalUsd, "capitalUsd", { positive: true });
  const perpSize = normalizeNumber(payload.perpSize, "perpSize", { positive: true });
  const spotSize = Math.max(0, Number(payload.spotSize) || 0);
  const entryMarkPx = normalizeNumber(payload.entryMarkPx, "entryMarkPx", { positive: true });
  const entryTimeMs = Number.isFinite(payload.entryTimeMs) ? Number(payload.entryTimeMs) : Date.now();
  const exitPnLPercentTarget = normalizeNumber(payload.exitPnLPercentTarget, "exitPnLPercentTarget");
  const minFundingRate = normalizeNumber(payload.minFundingRate, "minFundingRate");
  const isOpen = Boolean(payload.isOpen);
  const estimatedFundingPnlUsd = Number.isFinite(payload.estimatedFundingPnlUsd)
    ? Number(payload.estimatedFundingPnlUsd)
    : undefined;
  const source = ALLOWED_SOURCES.includes(payload.source) ? payload.source : "manual";
  const ownerUidRaw = typeof payload.ownerUid === "string" ? payload.ownerUid.trim() : "";
  const ownerUid = ownerUidRaw && ownerUidRaw.length <= 200 ? ownerUidRaw : undefined;

  return {
    coin: coinRaw,
    mode,
    capitalUsd,
    perpSize,
    spotSize,
    entryMarkPx,
    entryTimeMs,
    exitPnLPercentTarget,
    minFundingRate,
    isOpen,
    estimatedFundingPnlUsd,
    source,
    ownerUid,
  };
}

export const upsertFundingStrategyState = functions.https.onRequest(async (req, res) => {
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
    const state = normalizeState(req.body?.state ?? req.body);
    await saveStrategyState({ ...state, updatedAt: Date.now() });
    res.status(200).json({ ok: true, state });
  } catch (error: any) {
    console.error("[upsertFundingStrategyState]", error);
    res.status(400).json({ error: error?.message || "Payload invalide" });
  }
});
