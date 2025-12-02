import * as functions from "firebase-functions";
import { exchangeClient } from "../hyperliquidClient";

interface PlaceOrderRequestBody {
  asset?: number;
  side?: "buy" | "sell";
  size?: number | string;
  price?: number | string;
}

export const placeTestOrder = functions.https.onRequest(async (req, res) => {
  try {
    // CORS très simple pour tests
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).send("Method not allowed");
    }

    const { asset, side, size, price } = req.body as PlaceOrderRequestBody;

    if (asset === undefined || asset === null) {
      return res.status(400).json({ error: "Paramètre 'asset' manquant" });
    }
    if (side !== "buy" && side !== "sell") {
      return res.status(400).json({ error: "Paramètre 'side' invalide" });
    }
    if (size === undefined || price === undefined) {
      return res.status(400).json({ error: "Paramètres 'size' et 'price' requis" });
    }

    const numericSize = Number(size);
    const numericPrice = Number(price);

    if (!Number.isFinite(numericSize) || !Number.isFinite(numericPrice)) {
      return res.status(400).json({ error: "Paramètres 'size' et 'price' doivent être numériques" });
    }

    const isBuy = side === "buy";

    const result = await exchangeClient.order({
      orders: [
        {
          a: asset, // id du marché (ex : BTC)
          b: isBuy, // true=buy, false=sell
          p: String(numericPrice), // prix limite
          s: String(numericSize), // taille
          r: false,
          t: { limit: { tif: "Gtc" } },
        },
      ],
      grouping: "na",
    });

    return res.status(200).json({ ok: true, result });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error?.message || "Erreur interne Hyperliquid" });
  }
});
