import * as hl from "@nktkas/hyperliquid";
import { Wallet } from "ethers";
import * as dotenv from "dotenv";

// Charge les variables d'environnement uniquement si nécessaire
if (!process.env.HL_API_PRIVATE_KEY || !process.env.HL_ACCOUNT_ADDRESS) {
  dotenv.config({ path: ".env" });
  dotenv.config({ path: ".env.local", override: true });
}

const privateKey =
  process.env.HL_API_PRIVATE_KEY_OVERRIDE ?? process.env.HL_API_PRIVATE_KEY;
const accountAddress =
  process.env.HL_ACCOUNT_ADDRESS_OVERRIDE ?? process.env.HL_ACCOUNT_ADDRESS;

if (!privateKey || !accountAddress) {
  throw new Error("HL_API_PRIVATE_KEY ou HL_ACCOUNT_ADDRESS manquants");
}

// Transport HTTP vers le TESTNET Hyperliquid
const transport = new hl.HttpTransport({ isTestnet: true });

// Wallet = ton portefeuille API (COOKIE)
const wallet = new Wallet(privateKey);

export const infoClient = new hl.InfoClient({ transport });

export const exchangeClient = new hl.ExchangeClient({
  wallet,
  transport,
  isTestnet: true,
});

// Optionnel : petite util pour debug
export async function getAccountSummary() {
  return infoClient.allMarginSummary(accountAddress);
}
