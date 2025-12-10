const DEFAULT_BINANCE_FUNCTIONS_BASE_URL = "https://europe-west1-cookie1-b3592.cloudfunctions.net";

export type BinanceOrderSide = "BUY" | "SELL";
export type BinanceOrderType = "MARKET" | "LIMIT";

export interface PlaceBinanceOrderPayload {
  symbol: string;
  side: BinanceOrderSide;
  type: BinanceOrderType;
  quantity?: string;
  quoteOrderQty?: string;
  price?: string;
  timeInForce?: "GTC" | "IOC" | "FOK";
}

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

const getFunctionsBaseUrl = () => {
  const override = import.meta.env?.VITE_BINANCE_FUNCTIONS_BASE_URL;
  if (override && typeof override === "string" && override.trim().length > 0) {
    return override.replace(/\/+$/, "");
  }
  return DEFAULT_BINANCE_FUNCTIONS_BASE_URL;
};

const buildUrl = (path: string) => `${getFunctionsBaseUrl()}${path}`;

const placeOrderEndpoint = () => buildUrl("/placeBinanceSpotOrder");
const listOpenOrdersEndpoint = () => buildUrl("/listBinanceOpenOrders");
const listSpotBalancesEndpoint = () => buildUrl("/listBinanceSpotBalances");
const cancelSymbolEndpoint = () => buildUrl("/cancelBinanceOpenOrdersOnSymbol");
const cancelAllEndpoint = () => buildUrl("/cancelAllBinanceOpenOrders");
const closeAndDustEndpoint = () => buildUrl("/closeAndDustBinancePositions");

async function performRequest<T>(input: string, init?: FetchOptions): Promise<T> {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout = init?.timeoutMs ?? 15000;
  const timer = controller
    ? setTimeout(() => controller.abort(), timeout)
    : null;

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller?.signal,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message = data?.error || data?.msg || response.statusText;
      throw new Error(message || "BINANCE_FUNCTION_ERROR");
    }

    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Requête Binance expirée (timeout)");
    }
    throw error instanceof Error
      ? error
      : new Error("Erreur inconnue lors de l'appel Binance");
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export const BINANCE_PRESET_ORDER: PlaceBinanceOrderPayload = {
  symbol: "BTCUSDT",
  side: "BUY",
  type: "MARKET",
  quoteOrderQty: "20",
};

export const BINANCE_LARGE_PRESET_ORDER: PlaceBinanceOrderPayload = {
  symbol: "BTCUSDT",
  side: "BUY",
  type: "MARKET",
  quoteOrderQty: "100",
};

export async function placeBinanceOrder(payload: PlaceBinanceOrderPayload) {
  return performRequest<{ ok: boolean; result: unknown }>(placeOrderEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function placeBinancePresetOrder() {
  return placeBinanceOrder(BINANCE_PRESET_ORDER);
}

export async function placeBinanceLargePresetOrder() {
  return placeBinanceOrder(BINANCE_LARGE_PRESET_ORDER);
}

export interface FetchBinanceOrdersOptions {
  symbol?: string;
  includeClosed?: boolean;
  limit?: number;
  historySymbol?: string;
}

export interface BinanceOrdersResponse {
  ok: boolean;
  openOrders: unknown[];
  symbol?: string;
  recentOrders?: unknown[];
  historySymbol?: string;
}

export interface BinanceSpotBalanceEntry {
  asset: string;
  free: string;
  locked: string;
  total: number;
}

export interface BinanceSpotBalancesSummary {
  assets: number;
  totalFree: number;
  totalLocked: number;
  total: number;
  canTrade: boolean | null;
  canDeposit: boolean | null;
  canWithdraw: boolean | null;
  updateTime: number | null;
}

export interface BinanceSpotBalancesResponse {
  ok: boolean;
  fetchedAt: string;
  summary: BinanceSpotBalancesSummary;
  balances: BinanceSpotBalanceEntry[];
  error?: string;
}

export async function fetchBinanceOpenOrders(options?: FetchBinanceOrdersOptions) {
  const params = new URLSearchParams();
  if (options?.symbol) {
    params.set("symbol", options.symbol);
  }
  if (options?.includeClosed) {
    params.set("includeClosed", "true");
  }
  if (typeof options?.limit === "number") {
    params.set("limit", String(options.limit));
  }
  if (options?.historySymbol) {
    params.set("historySymbol", options.historySymbol);
  }
  const query = params.toString();
  const url = query ? `${listOpenOrdersEndpoint()}?${query}` : listOpenOrdersEndpoint();
  return performRequest<BinanceOrdersResponse>(url);
}

export async function cancelBinanceOrdersOnSymbol(symbol: string) {
  return performRequest<{ ok: boolean; symbol: string; result: unknown }>(cancelSymbolEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol }),
  });
}

export async function fetchBinanceSpotBalances() {
  return performRequest<BinanceSpotBalancesResponse>(listSpotBalancesEndpoint());
}

export interface CancelAllBinanceOrdersPayload {
  closePositions?: boolean;
}

export interface ClosePositionResult {
  asset: string;
  symbol: string;
  quantity: string;
  status: "closed" | "skipped" | "error";
  price?: string;
  notional?: string;
  reason?: string;
  error?: string;
  orderResponse?: unknown;
}

export interface CancelAllBinanceOrdersResponse {
  ok: boolean;
  result: Record<string, unknown>;
  closedPositions?: ClosePositionResult[];
}

export interface DustBalanceDetail {
  asset: string;
  symbol?: string | null;
  quantity: string;
  price?: string;
  notional?: string;
  status: "eligible" | "skipped" | "error";
  reason?: string;
  error?: string;
}

export interface DustConversionSummary {
  status: "converted" | "skipped" | "error";
  requestedAssets: string[];
  convertedAssets: string[];
  details: DustBalanceDetail[];
  rawResponse?: unknown;
  error?: string;
  message?: string;
}

export interface CloseAndDustResponse {
  ok: boolean;
  result: Record<string, unknown>;
  closedPositions?: ClosePositionResult[];
  dust?: DustConversionSummary;
}

export async function cancelAllBinanceOrders(payload?: CancelAllBinanceOrdersPayload) {
  const body = JSON.stringify({ closePositions: true, ...payload });
  return performRequest<CancelAllBinanceOrdersResponse>(cancelAllEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

export async function closeAndDustBinancePositions() {
  return performRequest<CloseAndDustResponse>(closeAndDustEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}
