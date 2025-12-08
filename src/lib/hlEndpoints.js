import { getFunctionsBaseUrl } from "./hyperliquidOrders";

export const IS_TESTNET = true;
export const WS_URL = IS_TESTNET
  ? "wss://api.hyperliquid-testnet.xyz/ws"
  : "wss://api.hyperliquid.xyz/ws";

const DIRECT_INFO_URL = IS_TESTNET
  ? "https://api.hyperliquid-testnet.xyz/info"
  : "https://api.hyperliquid.xyz/info";

function resolveEnv(key) {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && key in import.meta.env) {
      return import.meta.env[key];
    }
  } catch {
    // ignore
  }

  const procEnv = typeof globalThis !== "undefined" && globalThis.process && globalThis.process.env
    ? globalThis.process.env
    : undefined;
  if (procEnv && key in procEnv) {
    return procEnv[key];
  }
  return undefined;
}

const proxyOverride = resolveEnv("VITE_HL_INFO_PROXY_URL") ?? resolveEnv("HL_INFO_PROXY_URL");
const defaultProxyUrl = `${getFunctionsBaseUrl()}/hyperliquidInfoProxy`;

export const INFO_URL = proxyOverride?.trim()
  ? proxyOverride.trim()
  : defaultProxyUrl || DIRECT_INFO_URL;
