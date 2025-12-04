import crypto from "node:crypto";
import {
  CreateSpotOrderInput,
  BinanceOpenOrder,
  BinanceAccountInformation,
  BinanceTickerPrice,
  BinanceDustConversionResponse,
  BinanceExchangeInfo,
  BinanceExchangeSymbol,
} from "../types/binance";

type HttpMethod = "GET" | "POST" | "DELETE";

type SecurityType = "NONE" | "TRADE" | "USER_DATA";

type BinanceRequestParamValue = string | number | boolean | undefined | string[];

interface BinanceRequestOptions {
  path: string;
  method: HttpMethod;
  params?: Record<string, BinanceRequestParamValue>;
  securityType?: SecurityType;
}

export interface BinanceRuntimeConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  recvWindow?: number;
}

const DEFAULT_RECV_WINDOW = 5000;

const encodeParams = (
  params?: Record<string, BinanceRequestParamValue>
): URLSearchParams => {
  const searchParams = new URLSearchParams();
  if (!params) {
    return searchParams;
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry === undefined || entry === null) {
          return;
        }
        searchParams.append(key, String(entry));
      });
      return;
    }
    if (typeof value === "boolean") {
      searchParams.append(key, value ? "true" : "false");
      return;
    }
    searchParams.append(key, String(value));
  });
  return searchParams;
};

const needsSignature = (securityType?: SecurityType): boolean => {
  if (!securityType) {
    return false;
  }
  return securityType === "TRADE" || securityType === "USER_DATA";
};

const buildSignedQuery = (
  params: URLSearchParams,
  apiSecret: string,
  recvWindow?: number
): URLSearchParams => {
  const enriched = new URLSearchParams(params);
  if (!enriched.has("timestamp")) {
    enriched.set("timestamp", Date.now().toString());
  }
  if (recvWindow && !enriched.has("recvWindow")) {
    enriched.set("recvWindow", recvWindow.toString());
  }
  const query = enriched.toString();
  const signature = crypto.createHmac("sha256", apiSecret).update(query).digest("hex");
  enriched.set("signature", signature);
  return enriched;
};

export class BinanceSpotClient {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly restBaseUrl: string;
  private readonly rootBaseUrl: string;
  private readonly recvWindow: number;

  constructor(config: BinanceRuntimeConfig) {
    if (!config.apiKey || !config.apiSecret || !config.baseUrl) {
      throw new Error("BinanceSpotClient: configuration invalide (clé, secret ou URL manquants)");
    }
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    const sanitizedBase = config.baseUrl.replace(/\/+$/, "");
    if (sanitizedBase.endsWith("/api")) {
      this.restBaseUrl = sanitizedBase;
      this.rootBaseUrl = sanitizedBase.replace(/\/api$/, "");
    } else {
      this.rootBaseUrl = sanitizedBase;
      this.restBaseUrl = `${sanitizedBase}/api`;
    }
    this.recvWindow = config.recvWindow ?? DEFAULT_RECV_WINDOW;
  }

  private async request<T>(options: BinanceRequestOptions): Promise<T> {
    const securityType = options.securityType ?? "NONE";
    const queryParams = encodeParams(options.params);
    const shouldSign = needsSignature(securityType);
    const finalParams = shouldSign
      ? buildSignedQuery(queryParams, this.apiSecret, this.recvWindow)
      : queryParams;

    const isSapiPath = options.path.startsWith("/sapi/");
    const baseUrl = isSapiPath ? this.rootBaseUrl : this.restBaseUrl;
    const url = new URL(`${baseUrl}${options.path}`);
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    const fetchInit: RequestInit = {
      method: options.method,
      headers,
    };

    const shouldUseQueryString = options.method === "GET" || options.method === "DELETE";
    if (shouldUseQueryString) {
      url.search = (shouldSign ? finalParams : queryParams).toString();
    }

    if (options.method === "POST") {
      fetchInit.body = (shouldSign ? finalParams : queryParams).toString();
    }

    if (shouldSign) {
      headers["X-MBX-APIKEY"] = this.apiKey;
    }

    const response = await fetch(url, fetchInit);
    const rawData = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      const payload = rawData as { code?: number; msg?: string } | null;
      const message = payload?.msg || response.statusText || "BINANCE_ERROR";
      const error: Error & { code?: number } = new Error(message);
      if (typeof payload?.code === "number") {
        error.code = payload.code;
      }
      throw error;
    }

    return rawData as T;
  }

  async placeSpotOrder(input: CreateSpotOrderInput) {
    const params: Record<string, string> = {
      symbol: input.symbol,
      side: input.side,
      type: input.type,
    };

    if (input.type === "LIMIT") {
      const tif = input.timeInForce ?? "GTC";
      if (!input.price || !input.quantity) {
        throw new Error("LIMIT order requires price and quantity");
      }
      params.timeInForce = tif;
      params.price = input.price;
      params.quantity = input.quantity;
    } else {
      if (!input.quantity && !input.quoteOrderQty) {
        throw new Error("MARKET order requires quantity or quoteOrderQty");
      }
      if (input.quantity) {
        params.quantity = input.quantity;
      }
      if (input.quoteOrderQty) {
        params.quoteOrderQty = input.quoteOrderQty;
      }
    }

    if (input.newClientOrderId) {
      params.newClientOrderId = input.newClientOrderId;
    }

    if (input.reduceOnly) {
      params.reduceOnly = String(Boolean(input.reduceOnly));
    }

    return this.request({
      path: "/v3/order",
      method: "POST",
      params,
      securityType: "TRADE",
    });
  }

  async getOpenOrders(symbol?: string): Promise<BinanceOpenOrder[]> {
    const params = symbol ? { symbol } : undefined;
    return this.request<BinanceOpenOrder[]>({
      path: "/v3/openOrders",
      method: "GET",
      params,
      securityType: "USER_DATA",
    });
  }

  async getAllOrders(symbol: string, limit?: number): Promise<BinanceOpenOrder[]> {
    if (!symbol) {
      throw new Error("'symbol' est requis pour lister les ordres");
    }
    const params: Record<string, string | number> = { symbol };
    if (typeof limit === "number" && Number.isFinite(limit)) {
      params.limit = Math.min(Math.max(Math.floor(limit), 1), 100);
    }
    return this.request<BinanceOpenOrder[]>({
      path: "/v3/allOrders",
      method: "GET",
      params,
      securityType: "USER_DATA",
    });
  }

  async cancelAllOpenOrdersOnSymbol(symbol: string) {
    if (!symbol) {
      throw new Error("'symbol' est requis pour annuler les ordres");
    }
    return this.request({
      path: "/v3/openOrders",
      method: "DELETE",
      params: { symbol },
      securityType: "TRADE",
    });
  }

  async cancelAllOpenOrdersForAllSymbols() {
    const openOrders = await this.getOpenOrders();
    const symbols = Array.from(new Set(openOrders.map((order) => order.symbol)));
    const results: Record<string, unknown> = {};
    for (const symbol of symbols) {
      try {
        results[symbol] = await this.cancelAllOpenOrdersOnSymbol(symbol);
      } catch (error) {
        results[symbol] = {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
    return results;
  }

  async getAccountInformation(): Promise<BinanceAccountInformation> {
    return this.request<BinanceAccountInformation>({
      path: "/v3/account",
      method: "GET",
      securityType: "USER_DATA",
    });
  }

  async getTickerPrice(symbol: string): Promise<BinanceTickerPrice> {
    return this.request<BinanceTickerPrice>({
      path: "/v3/ticker/price",
      method: "GET",
      params: { symbol },
      securityType: "NONE",
    });
  }

  async getExchangeInfo(symbol?: string): Promise<BinanceExchangeInfo> {
    const params = symbol ? { symbol } : undefined;
    return this.request<BinanceExchangeInfo>({
      path: "/v3/exchangeInfo",
      method: "GET",
      params,
      securityType: "NONE",
    });
  }

  async getSymbolExchangeInfo(symbol: string): Promise<BinanceExchangeSymbol | null> {
    const info = await this.getExchangeInfo(symbol);
    if (!info?.symbols?.length) {
      return null;
    }
    return info.symbols.find((entry) => entry.symbol === symbol) ?? null;
  }

  async convertSmallBalancesToBnb(assets: string[]) {
    if (!Array.isArray(assets) || assets.length === 0) {
      throw new Error("Au moins un asset est requis pour la conversion dust");
    }
    const filtered = assets.filter((asset) => typeof asset === "string" && asset.trim().length > 0);
    const uniqueAssets = Array.from(new Set(filtered.map((asset) => asset.trim().toUpperCase())));
    if (!uniqueAssets.length) {
      throw new Error("Aucun asset valide fourni pour la conversion dust");
    }
    return this.request<BinanceDustConversionResponse>({
      path: "/sapi/v1/asset/dust",
      method: "POST",
      params: { asset: uniqueAssets },
      securityType: "USER_DATA",
    });
  }
}

export const createBinanceSpotClient = (config: BinanceRuntimeConfig) =>
  new BinanceSpotClient(config);
