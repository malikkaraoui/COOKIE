import type { FundingDirection } from "../../services/hyperliquidFunding";

const STORAGE_KEY = "fundingTradesStore_v1";

export interface FundingTradeRecord {
  tradeId: string;
  coin: string;
  direction: FundingDirection;
  spotOrderId?: number | null;
  perpOrderId?: number | null;
  spotQty: number;
  perpQty: number;
  notionalUsd: number;
  leverage: number;
  hedgeFactor: number;
  createdAt: number;
  extra?: Record<string, unknown>;
}

function safeParseStorage(): FundingTradeRecord[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FundingTradeRecord[]) : [];
  } catch (error) {
    console.warn("Impossible de parser fundingTradeStore:", error);
    return [];
  }
}

function persist(records: FundingTradeRecord[]) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Impossible de persister fundingTradeStore:", error);
  }
}

export function listFundingTrades(limit?: number): FundingTradeRecord[] {
  const records = safeParseStorage();
  if (typeof limit === "number" && limit > 0) {
    return records.slice(-limit).reverse();
  }
  return records.slice().reverse();
}

export function saveFundingTrade(record: FundingTradeRecord): FundingTradeRecord {
  const now = Date.now();
  const sanitized: FundingTradeRecord = {
    ...record,
    createdAt: record.createdAt ?? now,
  };

  const existing = safeParseStorage();
  const updated = [...existing, sanitized].slice(-100); // garder un historique raisonnable
  persist(updated);
  return sanitized;
}

export function clearFundingTrades() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
