import * as functions from "firebase-functions";
import { exchangeClient, infoClient } from "../hyperliquidClient";

type AllowedTif = "Gtc" | "Ioc" | "Alo" | "FrontendMarket" | "LiquidationMarket";

const ALLOWED_TIFS = new Set<AllowedTif>([
  "Gtc",
  "Ioc",
  "Alo",
  "FrontendMarket",
  "LiquidationMarket",
]);

interface IncomingOrder {
  asset?: number;
  symbol?: string;
  side?: "buy" | "sell";
  size?: number | string;
  price?: number | string;
  tif?: AllowedTif;
  reduceOnly?: boolean;
}

interface PlaceOrderRequestBody {
  orders?: IncomingOrder[];
  // Legacy single-order fields:
  asset?: number;
  symbol?: string;
  side?: "buy" | "sell";
  size?: number | string;
  price?: number | string;
  tif?: AllowedTif;
  reduceOnly?: boolean;
  leverageConfig?: LeverageConfigPayload;
}

interface LeverageConfigPayload {
  asset?: number;
  symbol?: string;
  leverage?: number;
  isCross?: boolean;
}

type ExchangeOrderPayload = {
  a: number;
  b: boolean;
  p: string;
  s: string;
  r: boolean;
  t: { limit: { tif: AllowedTif } };
};

async function buildCoinToAssetMap(): Promise<Map<string, number>> {
  const meta = await infoClient.meta();
  const map = new Map<string, number>();
  (meta?.universe || []).forEach((entry: { name?: string }, index: number) => {
    if (entry?.name) {
      map.set(entry.name.toUpperCase(), index);
    }
  });
  return map;
}

function normalizeIncomingOrders(body: PlaceOrderRequestBody): IncomingOrder[] {
  if (Array.isArray(body.orders) && body.orders.length > 0) {
    return body.orders;
  }

  if (body.asset !== undefined || body.symbol) {
    return [
      {
        asset: body.asset,
        symbol: body.symbol,
        side: body.side,
        size: body.size,
        price: body.price,
        tif: body.tif,
        reduceOnly: body.reduceOnly,
      },
    ];
  }

  return [];
}

function parsePositiveNumber(value: number | string | undefined, field: string): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error(`Le champ '${field}' doit être un nombre strictement positif`);
  }
  return num;
}

function normalizeSide(side: IncomingOrder["side"], index: number): boolean {
  if (side !== "buy" && side !== "sell") {
    throw new Error(`Ordre #${index + 1}: 'side' doit être 'buy' ou 'sell'`);
  }
  return side === "buy";
}

function normalizeTif(tif: IncomingOrder["tif"], index: number): AllowedTif {
  if (!tif) {
    return "Gtc";
  }
  if (!ALLOWED_TIFS.has(tif)) {
    throw new Error(`Ordre #${index + 1}: 'tif' invalide (${tif})`);
  }
  return tif;
}

function normalizeLeverageConfig(payload?: LeverageConfigPayload | null): LeverageConfigPayload | null {
  if (!payload) {
    return null;
  }

  const leverageValue = Number(payload.leverage);
  if (!Number.isFinite(leverageValue) || leverageValue <= 0) {
    throw new Error("leverageConfig.leverage doit être un nombre positif");
  }

  const leverageInt = Math.max(1, Math.floor(leverageValue));
  const normalized: LeverageConfigPayload = {
    leverage: leverageInt,
    isCross: payload.isCross !== undefined ? Boolean(payload.isCross) : true,
  };

  if (typeof payload.asset === "number" && Number.isInteger(payload.asset) && payload.asset >= 0) {
    normalized.asset = payload.asset;
  }

  if (payload.symbol) {
    const symbol = payload.symbol.toUpperCase().trim();
    if (!symbol) {
      throw new Error("leverageConfig.symbol doit être non vide");
    }
    normalized.symbol = symbol;
  }

  if (normalized.asset == null && !normalized.symbol) {
    throw new Error("Fournis 'asset' ou 'symbol' dans leverageConfig");
  }

  return normalized;
}

async function updateLeverageIfRequested(
  leverageConfig: LeverageConfigPayload | null,
  coinMap: Map<string, number> | null,
): Promise<void> {
  if (!leverageConfig) {
    return;
  }

  let assetId = leverageConfig.asset;
  if (assetId == null) {
    const symbol = leverageConfig.symbol;
    if (!symbol) {
      throw new Error("Impossible de déterminer l'actif pour updateLeverage");
    }
    assetId = coinMap?.get(symbol);
    if (assetId == null) {
      throw new Error(`Actif ${symbol} introuvable pour updateLeverage`);
    }
  }

  await exchangeClient.updateLeverage({
    asset: assetId,
    isCross: leverageConfig.isCross !== undefined ? Boolean(leverageConfig.isCross) : true,
    leverage: leverageConfig.leverage ?? 1,
  });
}

export const placeTestOrder = functions.https.onRequest(async (req, res) => {
  try {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const rawBody = req.body as PlaceOrderRequestBody;
    const ordersPayload = normalizeIncomingOrders(rawBody);
    const leverageConfig = normalizeLeverageConfig(rawBody.leverageConfig);

    if (!ordersPayload.length) {
      res.status(400).json({
        error: "Aucun ordre détecté. Fournis 'orders' ou les champs d'un ordre unique.",
      });
      return;
    }

    if (ordersPayload.length > 10) {
      res.status(400).json({
        error: "Maximum 10 ordres simultanés pour des raisons de sécurité",
      });
      return;
    }

    const needsSymbolResolution = ordersPayload.some((order) => order.asset == null)
      || Boolean(leverageConfig && leverageConfig.symbol && leverageConfig.asset == null);
    const coinMap = needsSymbolResolution ? await buildCoinToAssetMap() : null;

    const exchangeOrders: ExchangeOrderPayload[] = ordersPayload.map((order, index) => {
      const symbol = order.symbol?.toUpperCase().trim();
      const assetId = order.asset ?? (symbol ? coinMap?.get(symbol) : undefined);

      if (assetId === undefined) {
        throw new Error(
          `Ordre #${index + 1}: impossible de résoudre l'actif. Fournis 'asset' ou 'symbol'.`
        );
      }

      const size = parsePositiveNumber(order.size, "size");
      const price = parsePositiveNumber(order.price, "price");
      const tif = normalizeTif(order.tif, index);
      const isBuy = normalizeSide(order.side, index);

      return {
        a: assetId,
        b: isBuy,
        p: price.toString(),
        s: size.toString(),
        r: Boolean(order.reduceOnly),
        t: { limit: { tif } },
      };
    });

    await updateLeverageIfRequested(leverageConfig, coinMap);

    const result = await exchangeClient.order({
      orders: exchangeOrders,
      grouping: "na",
    });

    res.status(200).json({
      ok: true,
      ordersSubmitted: exchangeOrders.length,
      result,
    });
    return;
  } catch (error: any) {
    console.error(error);
    const message =
      typeof error?.message === "string" ? error.message : "Erreur interne Hyperliquid";
    res.status(500).json({ error: message });
    return;
  }
});
