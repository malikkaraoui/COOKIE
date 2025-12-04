import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/logger";
import { CreateSpotOrderInput } from "../../types/binance";
import { buildBinanceClient, binanceSecretList } from "./utils";

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

      const result = await client.placeSpotOrder({
        ...orderInput,
        timeInForce: orderInput.timeInForce ?? (orderInput.type === "LIMIT" ? "GTC" : undefined),
        newClientOrderId:
          orderInput.newClientOrderId ?? `cookie_binance_${Date.now().toString(36)}`,
      });

      logger.info("✅ Binance Spot order envoyé", {
        symbol: orderInput.symbol,
        side: orderInput.side,
        type: orderInput.type,
        hasQuantity: Boolean(orderInput.quantity),
        hasQuoteOrderQty: Boolean(orderInput.quoteOrderQty),
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
