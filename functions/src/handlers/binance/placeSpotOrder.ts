import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/logger";
import { BinanceExchangeSymbol, CreateSpotOrderInput } from "../../types/binance";
import { buildBinanceClient, binanceSecretList } from "./utils";

type SymbolConstraints = {
  stepSize?: number;
  stepSizeRaw?: string;
  minQty?: number;
  tickSize?: number;
  tickSizeRaw?: string;
  minNotional?: number;
};

const symbolConstraintsCache = new Map<string, SymbolConstraints | null>();

const parseNumber = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return undefined;
  }
  return numeric;
};

const decimalsFromRaw = (raw?: string, fallback = 8): number => {
  if (!raw) {
    return fallback;
  }
  if (/e/i.test(raw)) {
    const numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return fallback;
    }
    let decimals = 0;
    let value = numeric;
    while (decimals < 12 && Math.abs(Math.round(value) - value) > 1e-12) {
      value *= 10;
      decimals += 1;
    }
    return Math.max(0, Math.min(decimals, 12));
  }
  const normalized = raw.replace(/0+$/u, "");
  const parts = normalized.split(".");
  if (parts.length === 2) {
    return Math.max(0, Math.min(parts[1].length, 12));
  }
  return fallback;
};

const quantizeToStep = (value: number, step?: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return value;
  }
  if (!Number.isFinite(step) || !step || step <= 0) {
    return value;
  }
  const steps = Math.floor(value / step + 1e-12);
  return steps * step;
};

const formatWithStep = (value: number, stepRaw?: string): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return value.toString();
  }
  const decimals = decimalsFromRaw(stepRaw);
  return value
    .toFixed(decimals)
    .replace(/\.0+$/u, "")
    .replace(/(\.\d*?)0+$/u, "$1");
};

const extractSymbolConstraints = (symbol: BinanceExchangeSymbol | null): SymbolConstraints | null => {
  if (!symbol?.filters?.length) {
    return null;
  }
  const constraints: SymbolConstraints = {};
  for (const filter of symbol.filters) {
    if (!filter?.filterType) {
      continue;
    }
    if (filter.filterType === "LOT_SIZE") {
      constraints.stepSize = parseNumber((filter as { stepSize?: string }).stepSize);
      constraints.stepSizeRaw = (filter as { stepSize?: string }).stepSize;
      constraints.minQty = parseNumber((filter as { minQty?: string }).minQty);
    }
    if (filter.filterType === "PRICE_FILTER") {
      constraints.tickSize = parseNumber((filter as { tickSize?: string }).tickSize);
      constraints.tickSizeRaw = (filter as { tickSize?: string }).tickSize;
    }
    if (filter.filterType === "MIN_NOTIONAL" || filter.filterType === "NOTIONAL") {
      constraints.minNotional = parseNumber((filter as { minNotional?: string }).minNotional);
    }
  }
  return constraints;
};

type SpotClient = ReturnType<typeof buildBinanceClient>["client"];

const getSymbolConstraints = async (client: SpotClient, symbol: string) => {
  if (symbolConstraintsCache.has(symbol)) {
    return symbolConstraintsCache.get(symbol) ?? null;
  }
  try {
    const info = await client.getSymbolExchangeInfo(symbol);
    const constraints = extractSymbolConstraints(info);
    symbolConstraintsCache.set(symbol, constraints ?? null);
    return constraints ?? null;
  } catch (error) {
    symbolConstraintsCache.set(symbol, null);
    return null;
  }
};

const applySymbolConstraints = async (
  client: SpotClient,
  orderInput: CreateSpotOrderInput
): Promise<CreateSpotOrderInput> => {
  const constraints = await getSymbolConstraints(client, orderInput.symbol);
  if (!constraints) {
    return orderInput;
  }

  let quantityValue = orderInput.quantity ? Number(orderInput.quantity) : undefined;
  if (Number.isFinite(quantityValue) && quantityValue! > 0) {
    quantityValue = quantizeToStep(quantityValue!, constraints.stepSize);
    if (!Number.isFinite(quantityValue) || quantityValue! <= 0) {
      throw new Error(`Quantité invalide pour ${orderInput.symbol}`);
    }
    if (constraints.minQty && quantityValue! < constraints.minQty) {
      throw new Error(
        `Quantité trop faible pour ${orderInput.symbol}. Min ${constraints.minQty}`
      );
    }
  }

  let priceValue = orderInput.price ? Number(orderInput.price) : undefined;
  if (orderInput.type === "LIMIT" && Number.isFinite(priceValue) && priceValue! > 0) {
    priceValue = quantizeToStep(priceValue!, constraints.tickSize);
    if (!Number.isFinite(priceValue) || priceValue! <= 0) {
      throw new Error(`Prix invalide pour ${orderInput.symbol}`);
    }
  }

  if (
    orderInput.type === "LIMIT" &&
    Number.isFinite(priceValue) &&
    Number.isFinite(quantityValue) &&
    constraints.minNotional
  ) {
    const notional = priceValue! * quantityValue!;
    if (notional < constraints.minNotional) {
      throw new Error(
        `Notional trop faible (${notional.toFixed(4)}). Min ${constraints.minNotional}`
      );
    }
  }

  return {
    ...orderInput,
    quantity:
      Number.isFinite(quantityValue) && quantityValue! > 0
        ? formatWithStep(quantityValue!, constraints.stepSizeRaw)
        : orderInput.quantity,
    price:
      Number.isFinite(priceValue) && priceValue! > 0
        ? formatWithStep(priceValue!, constraints.tickSizeRaw)
        : orderInput.price,
  };
};

const valueToString = (value: unknown): string | undefined => {
  if (value == null) {
    return undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toString();
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return undefined;
};

const normalizeTimeInForce = (value: string | undefined): CreateSpotOrderInput["timeInForce"] => {
  if (!value) {
    return undefined;
  }
  const upper = value.toUpperCase();
  if (upper === "GTC" || upper === "IOC" || upper === "FOK") {
    return upper;
  }
  throw new Error("'timeInForce' doit être GTC, IOC ou FOK");
};

const validateOrderInput = (body: unknown): CreateSpotOrderInput => {
  if (!body || typeof body !== "object") {
    throw new Error("Payload invalide : body requis");
  }

  const raw = body as Record<string, unknown>;
  const symbol = valueToString(raw.symbol)?.toUpperCase();
  const side = valueToString(raw.side)?.toUpperCase();
  const type = valueToString(raw.type)?.toUpperCase();
  const quantity = valueToString(raw.quantity);
  const quoteOrderQty = valueToString(raw.quoteOrderQty);
  const price = valueToString(raw.price);
  const timeInForce = normalizeTimeInForce(valueToString(raw.timeInForce));
  const newClientOrderId = valueToString(raw.newClientOrderId);

  if (!symbol) {
    throw new Error("'symbol' est requis");
  }

  if (side !== "BUY" && side !== "SELL") {
    throw new Error("'side' doit être 'BUY' ou 'SELL'");
  }

  if (type !== "LIMIT" && type !== "MARKET") {
    throw new Error("'type' doit être 'LIMIT' ou 'MARKET'");
  }

  if (type === "LIMIT") {
    if (!price || !quantity) {
      throw new Error("Une LIMIT order nécessite 'price' et 'quantity'");
    }
  } else if (!quantity && !quoteOrderQty) {
    throw new Error("Une MARKET order nécessite 'quantity' ou 'quoteOrderQty'");
  }

  return {
    symbol,
    side,
    type,
    quantity,
    quoteOrderQty,
    price,
    timeInForce,
    newClientOrderId,
  };
};

export const placeBinanceSpotOrder = onRequest(
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
      const orderInput = validateOrderInput(req.body);
      const { client, baseUrl } = buildBinanceClient();
      const normalizedOrder = await applySymbolConstraints(client, orderInput);

      const result = await client.placeSpotOrder({
        ...normalizedOrder,
        timeInForce:
          normalizedOrder.timeInForce ?? (normalizedOrder.type === "LIMIT" ? "GTC" : undefined),
        newClientOrderId:
          normalizedOrder.newClientOrderId ?? `cookie_binance_${Date.now().toString(36)}`,
      });

      logger.info("✅ Binance Spot order envoyé", {
        symbol: normalizedOrder.symbol,
        side: normalizedOrder.side,
        type: normalizedOrder.type,
        hasQuantity: Boolean(normalizedOrder.quantity),
        hasQuoteOrderQty: Boolean(normalizedOrder.quoteOrderQty),
        baseUrl,
      });

      res.status(200).json({ ok: true, result });
    } catch (error) {
      logger.error("❌ Erreur envoi Binance Spot", {
        message: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }
);
