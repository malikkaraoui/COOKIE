import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/logger";
import type { Request, Response } from "express";

const INFO_URL = process.env.HL_INFO_URL ?? "https://api.hyperliquid-testnet.xyz/info";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function forwardInfoRequest(body: JsonRecord): Promise<unknown> {
  const response = await fetch(INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Hyperliquid info proxy failed (${response.status}): ${text || response.statusText}`);
  }

  return response.json();
}

const hyperliquidInfoProxyHandler = async (req: Request, res: Response) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("\n");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isRecord(req.body)) {
    res.status(400).json({ error: "JSON body requis" });
    return;
  }

  const type = req.body.type;
  if (typeof type !== "string" || !type.trim()) {
    res.status(400).json({ error: "Le champ 'type' est requis" });
    return;
  }

  try {
    const payload = await forwardInfoRequest(req.body);
    res.status(200).json(payload);
  } catch (error: any) {
    logger.error("hyperliquidInfoProxy failure", {
      message: error?.message,
      stack: error?.stack,
    });
    res.status(500).json({ error: error?.message || "Hyperliquid proxy error" });
  }
};

export const hyperliquidInfoProxy = onRequest(
  {
    region: "us-central1",
    memory: "1GiB",
    timeoutSeconds: 30,
    maxInstances: 10,
  },
  hyperliquidInfoProxyHandler,
);
