import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/logger";
import { buildBinanceClient, binanceSecretList } from "./utils";
import { BinanceSpotClient } from "../../services/binanceSpotClient";

const CLOSEABLE_BASE_ASSETS = new Set([
  "BTC",
  "ETH",
  "BNB",
  "SOL",
  "XRP",
  "ADA",
  "TON",
  "TRX",
  "AVAX",
  "DOGE",
  "SHIB",
  "PEPE",
  "LINK",
  "DOT",
  "POL",
  "UNI",
  "RUNE",
  "INJ",
  "ATOM",
  "SUI",
  "APT",
  "ARB",
  "OP",
  "SEI",
  "TIA",
  "LTC",
  "BCH",
  "ORDI",
  "JUP",
  "CAKE",
]);

const QUOTE_ASSET = "USDT";
const BNB_QUOTE_ASSET = "BNB";
const MIN_POSITION_QUANTITY = 1e-8;
const MIN_NOTIONAL_USDT = 100;
const DUST_CONVERSION_MAX_ASSETS = 10;

type ClosePositionResult = {
  asset: string;
  symbol: string;
  quantity: string;
  status: "closed" | "skipped" | "error";
  price?: string;
  notional?: string;
  reason?: string;
  error?: string;
  orderResponse?: unknown;
};

type PriceFetcher = (symbol: string) => Promise<number>;

const createPriceFetcher = (client: BinanceSpotClient): PriceFetcher => {
  const cache = new Map<string, number>();
  return async (symbol: string) => {
    if (cache.has(symbol)) {
      return cache.get(symbol)!;
    }
    const ticker = await client.getTickerPrice(symbol);
    const price = Number(ticker.price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Prix indisponible pour ${symbol}`);
    }
    cache.set(symbol, price);
    return price;
  };
};

const createTradingConstraintsFetcher = (client: BinanceSpotClient) => {
  const cache = new Map<string, TradingConstraints | null>();
  return async (symbol: string): Promise<TradingConstraints | null> => {
    if (cache.has(symbol)) {
      return cache.get(symbol) ?? null;
    }
    try {
      const info = await client.getSymbolExchangeInfo(symbol);
      if (!info) {
        cache.set(symbol, null);
        return null;
      }
      const constraints: TradingConstraints = {};
      for (const filter of info.filters ?? []) {
        if (!filter?.filterType) {
          continue;
        }
        if (filter.filterType === "LOT_SIZE") {
          const stepSize = Number(filter.stepSize ?? "0");
          const minQty = Number(filter.minQty ?? "0");
          if (Number.isFinite(stepSize) && stepSize > 0) {
            constraints.stepSize = stepSize;
          }
          if (Number.isFinite(minQty) && minQty > 0) {
            constraints.minQty = minQty;
          }
        }
        if (filter.filterType === "MIN_NOTIONAL" || filter.filterType === "NOTIONAL") {
          const minNotional = Number((filter as { minNotional?: string }).minNotional ?? "0");
          if (Number.isFinite(minNotional) && minNotional > 0) {
            constraints.minNotional = minNotional;
          }
        }
      }
      cache.set(symbol, constraints);
      return constraints;
    } catch (error) {
      logger.warn("⚠️ Impossible de récupérer les filtres Binance", {
        symbol,
        message: error instanceof Error ? error.message : String(error),
      });
      cache.set(symbol, null);
      return null;
    }
  };
};

const quantizeToStep = (value: number, stepSize?: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  if (!Number.isFinite(stepSize) || !stepSize || stepSize <= 0) {
    return value;
  }
  const steps = Math.floor(value / stepSize + 1e-12);
  return steps * stepSize;
};

const buildQuantityString = (value: number, constraints?: TradingConstraints): string => {
  const quantized = quantizeToStep(value, constraints?.stepSize);
  if (!Number.isFinite(quantized) || quantized <= 0) {
    return "";
  }
  if (constraints?.minQty && quantized < constraints.minQty) {
    return "";
  }
  return formatQuantity(quantized);
};

type DustBalanceDetail = {
  asset: string;
  symbol: string | null;
  quantity: string;
  price?: string;
  notional?: string;
  status: "eligible" | "skipped" | "error";
  reason?: string;
  error?: string;
};

type DustConversionSummary = {
  status: "converted" | "skipped" | "error";
  requestedAssets: string[];
  convertedAssets: string[];
  details: DustBalanceDetail[];
  rawResponse?: unknown;
  error?: string;
  message?: string;
};

type TradingConstraints = {
  minQty?: number;
  stepSize?: number;
  minNotional?: number;
};

const formatQuantity = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }
  const decimals = value >= 1 ? 4 : value >= 0.01 ? 6 : 8;
  return value.toFixed(decimals).replace(/\.0+$/, "").replace(/\.([0-9]*?)0+$/, ".$1").replace(/\.$/, "");
};

const getSymbolFromAsset = (asset: string): string | null => {
  if (!asset || !CLOSEABLE_BASE_ASSETS.has(asset)) {
    return null;
  }
  return `${asset}${QUOTE_ASSET}`;
};

const closeTrackedSpotPositions = async (
  client: BinanceSpotClient,
  priceFetcher?: PriceFetcher
): Promise<ClosePositionResult[]> => {
  const account = await client.getAccountInformation();
  const balances = account?.balances ?? [];
  const results: ClosePositionResult[] = [];
  const fetchPrice = priceFetcher ?? createPriceFetcher(client);

  for (const balance of balances) {
    const asset = balance.asset?.toUpperCase();
    if (!asset) {
      continue;
    }
    const symbol = getSymbolFromAsset(asset);
    if (!symbol) {
      continue;
    }
    const freeQty = Number(balance.free ?? "0");
    if (!Number.isFinite(freeQty) || freeQty <= MIN_POSITION_QUANTITY) {
      continue;
    }

    try {
      const price = await fetchPrice(symbol);
      const notional = freeQty * price;
      if (notional < MIN_NOTIONAL_USDT) {
        results.push({
          asset,
          symbol,
          quantity: balance.free,
          status: "skipped",
          price: price.toString(),
          notional: notional.toFixed(2),
          reason: "Notional trop faible (<5 USDT)",
        });
        continue;
      }

      const qtyString = formatQuantity(freeQty);
      if (!qtyString) {
        results.push({
          asset,
          symbol,
          quantity: balance.free,
          status: "skipped",
          reason: "Quantité non exploitable",
        });
        continue;
      }

      const orderResponse = await client.placeSpotOrder({
        symbol,
        side: "SELL",
        type: "MARKET",
        quantity: qtyString,
      });

      results.push({
        asset,
        symbol,
        quantity: qtyString,
        status: "closed",
        price: price.toString(),
        notional: (Number(qtyString) * price).toFixed(2),
        orderResponse,
      });
    } catch (error) {
      results.push({
        asset,
        symbol,
        quantity: balance.free,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
};

const normalizeSymbol = (value: unknown): string => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim().toUpperCase();
  }
  throw new Error("'symbol' est requis dans le payload");
};

const convertDustBalancesToBnb = async (
  client: BinanceSpotClient,
  priceFetcher?: PriceFetcher
): Promise<DustConversionSummary> => {
  const fetchPrice = priceFetcher ?? createPriceFetcher(client);
  const account = await client.getAccountInformation();
  const balances = account?.balances ?? [];
  const details: DustBalanceDetail[] = [];

  for (const balance of balances) {
    const asset = balance.asset?.toUpperCase();
    if (!asset || asset === QUOTE_ASSET || asset === "BNB") {
      continue;
    }
    const symbol = getSymbolFromAsset(asset);
    if (!symbol) {
      continue;
    }
    const freeQty = Number(balance.free ?? "0");
    if (!Number.isFinite(freeQty) || freeQty <= MIN_POSITION_QUANTITY) {
      continue;
    }
    try {
      const price = await fetchPrice(symbol);
      const notional = freeQty * price;
      if (notional >= MIN_NOTIONAL_USDT) {
        continue;
      }
      details.push({
        asset,
        symbol,
        quantity: balance.free,
        price: price.toString(),
        notional: notional.toFixed(4),
        status: "eligible",
      });
    } catch (error) {
      details.push({
        asset,
        symbol,
        quantity: balance.free,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const requestedAssets = Array.from(
    new Set(details.filter((entry) => entry.status === "eligible").map((entry) => entry.asset))
  );

  if (!requestedAssets.length) {
    return {
      status: "skipped",
      requestedAssets: [],
      convertedAssets: [],
      details,
      message: "Aucune miette (<5 USDT) à convertir en BNB",
    };
  }

  const limitedAssets = requestedAssets.slice(0, DUST_CONVERSION_MAX_ASSETS);
  try {
    const rawResponse = await client.convertSmallBalancesToBnb(limitedAssets);
    const convertedAssets = Array.isArray(rawResponse?.transferResult)
      ? rawResponse.transferResult
          .map((entry) => entry?.fromAsset)
          .filter((asset): asset is string => Boolean(asset))
      : [];
    return {
      status: "converted",
      requestedAssets: limitedAssets,
      convertedAssets,
      details,
      rawResponse,
    };
  } catch (error) {
    return {
      status: "error",
      requestedAssets: limitedAssets,
      convertedAssets: [],
      details,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const cancelBinanceOpenOrdersOnSymbol = onRequest(
  {
    secrets: [...binanceSecretList],
    cors: true,
    region: "europe-west1",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("OK");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const symbol = normalizeSymbol(req.body?.symbol);
      const { client } = buildBinanceClient();
      const result = await client.cancelAllOpenOrdersOnSymbol(symbol);

      logger.info("🧹 Binance cancel symbol", { symbol });
      res.status(200).json({ ok: true, symbol, result });
    } catch (error) {
      logger.error("❌ Erreur cancel symbol Binance", {
        message: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }
);

export const cancelAllBinanceOpenOrders = onRequest(
  {
    secrets: [...binanceSecretList],
    cors: true,
    region: "europe-west1",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("OK");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { client } = buildBinanceClient();
      const shouldClosePositions = req.body?.closePositions !== false;
      const result = await client.cancelAllOpenOrdersForAllSymbols();
      let closedPositions: ClosePositionResult[] | undefined;

      if (shouldClosePositions) {
        closedPositions = await closeTrackedSpotPositions(client);
      }

      logger.info("🧹 Binance cancel all symbols", {
        symbols: Object.keys(result),
        closed: closedPositions?.length ?? 0,
      });
      res.status(200).json({ ok: true, result, closedPositions });
    } catch (error) {
      logger.error("❌ Erreur cancel all Binance", {
        message: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }
);

export const closeAndDustBinancePositions = onRequest(
  {
    secrets: [...binanceSecretList],
    cors: true,
    region: "europe-west1",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("OK");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { client } = buildBinanceClient();
      const priceFetcher = createPriceFetcher(client);
      const cancelResult = await client.cancelAllOpenOrdersForAllSymbols();
      const closedPositions = await closeTrackedSpotPositions(client, priceFetcher);
      const dust = await convertDustBalancesToBnb(client, priceFetcher);

      logger.info("🧹 Binance close + dust", {
        symbols: Object.keys(cancelResult),
        closed: closedPositions.length,
        dustStatus: dust.status,
        convertedDust: dust.convertedAssets.length,
      });

      res.status(200).json({
        ok: true,
        result: cancelResult,
        closedPositions,
        dust,
      });
    } catch (error) {
      logger.error("❌ Erreur close + dust Binance", {
        message: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }
);
