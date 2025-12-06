import * as admin from "firebase-admin";
import { PerpSide } from "../services/hyperliquid";

if (!admin.apps.length) {
  admin.initializeApp();
}

export type FundingDirection = "collect_short" | "collect_long";

export interface StoredFundingPosition {
  coin: string;
  direction: FundingDirection;
  side: PerpSide;
  size: number;
  entryPx: number;
  entryFundingRate: number;
  openedAt: number;
  leverage: number;
  notionalUsd: number;
  positionId?: string;
  lastFundingRate?: number;
  lastMarkPx?: number;
  updatedAt?: number;
}

const POSITIONS_PATH = "hyperliquidFunding/positions";

function db() {
  return admin.database();
}

export async function getFundingPosition(coin: string): Promise<StoredFundingPosition | null> {
  const normalized = coin.trim().toUpperCase();
  if (!normalized) {
    throw new Error("coin requis pour getFundingPosition");
  }
  const snapshot = await db().ref(`${POSITIONS_PATH}/${normalized}`).get();
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.val() as StoredFundingPosition;
}

export async function saveFundingPosition(position: StoredFundingPosition): Promise<void> {
  await db()
    .ref(`${POSITIONS_PATH}/${position.coin}`)
    .set({ ...position, updatedAt: Date.now() });
}

export async function clearFundingPosition(coin: string): Promise<void> {
  const normalized = coin.trim().toUpperCase();
  if (!normalized) {
    return;
  }
  await db().ref(`${POSITIONS_PATH}/${normalized}`).remove();
}

export async function listFundingPositions(): Promise<StoredFundingPosition[]> {
  const snapshot = await db().ref(POSITIONS_PATH).get();
  if (!snapshot.exists()) {
    return [];
  }
  const value = snapshot.val() as Record<string, StoredFundingPosition>;
  return Object.values(value ?? {});
}
