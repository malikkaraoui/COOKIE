import * as admin from "firebase-admin";
import { FundingStrategyState } from "../strategies/hyperliquidFundingStrategy";

const COLLECTION = "hyperliquidFundingStrategies";

if (!admin.apps.length) {
  admin.initializeApp();
}

function db() {
  return admin.database();
}

export async function loadStrategyState(coin: string): Promise<FundingStrategyState | null> {
  const normalized = coin.trim().toUpperCase();
  if (!normalized) {
    throw new Error("coin requis pour loadStrategyState");
  }
  const snapshot = await db().ref(`${COLLECTION}/${normalized}`).get();
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.val() as FundingStrategyState;
}

export async function saveStrategyState(state: FundingStrategyState): Promise<void> {
  if (!state?.coin) {
    throw new Error("state.coin requis pour saveStrategyState");
  }
  const payloadEntries = Object.entries({ ...state, updatedAt: Date.now() })
    .filter(([, value]) => value !== undefined);

  const payload = Object.fromEntries(payloadEntries);

  await db()
    .ref(`${COLLECTION}/${state.coin.toUpperCase()}`)
    .set(payload);
}

export async function listStrategyStates(): Promise<Record<string, FundingStrategyState>> {
  const snapshot = await db().ref(COLLECTION).get();
  if (!snapshot.exists()) {
    return {};
  }
  const value = snapshot.val() as Record<string, FundingStrategyState>;
  return value ?? {};
}
