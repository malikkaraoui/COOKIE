import { defineSecret } from "firebase-functions/params";
import { createBinanceSpotClient } from "../../services/binanceSpotClient";

export const binanceApiKey = defineSecret("BINANCE_API_KEY");
export const binanceApiSecret = defineSecret("BINANCE_API_SECRET");
export const binanceBaseUrl = defineSecret("BINANCE_SPOT_BASE_URL");
export const binanceRecvWindow = defineSecret("BINANCE_RECV_WINDOW");
export const binanceUseTestnet = defineSecret("BINANCE_USE_TESTNET");

export const binanceSecretList = [
  binanceApiKey,
  binanceApiSecret,
  binanceBaseUrl,
  binanceRecvWindow,
  binanceUseTestnet,
] as const;

export const buildBinanceClient = () => {
  const recvWindow = Number(binanceRecvWindow.value());
  const preferTestnet = String(binanceUseTestnet.value() ?? "true").toLowerCase() === "true";
  const configuredBaseUrl = binanceBaseUrl.value();
  const baseUrl = configuredBaseUrl
    ? configuredBaseUrl
    : preferTestnet
      ? "https://testnet.binance.vision/api"
      : "https://api.binance.com/api";

  const client = createBinanceSpotClient({
    apiKey: binanceApiKey.value(),
    apiSecret: binanceApiSecret.value(),
    baseUrl,
    recvWindow: Number.isFinite(recvWindow) && recvWindow > 0 ? recvWindow : undefined,
  });

  return { client, baseUrl };
};
