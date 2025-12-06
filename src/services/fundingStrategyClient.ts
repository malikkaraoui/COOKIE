import { getFunctionsBaseUrl } from "../lib/hyperliquidOrders";

const FUNCTIONS_BASE_URL = getFunctionsBaseUrl();
const RUN_ENDPOINT = `${FUNCTIONS_BASE_URL}/runFundingStrategyTick`;
const STATE_ENDPOINT = `${FUNCTIONS_BASE_URL}/getFundingStrategyState`;
const UPSERT_ENDPOINT = `${FUNCTIONS_BASE_URL}/upsertFundingStrategyState`;

export type StrategyMode = "IDLE" | "DOUBLE_SHORT_FUNDING" | "SIMPLE_LONG_FUNDING";

export type StrategySource = "auto" | "manual";

export interface FundingStrategyState {
  coin: string;
  mode: StrategyMode;
  capitalUsd: number;
  perpSize: number;
  spotSize: number;
  entryMarkPx: number;
  entryTimeMs: number;
  exitPnLPercentTarget: number;
  minFundingRate: number;
  isOpen: boolean;
  estimatedFundingPnlUsd?: number;
  updatedAt?: number;
  source?: StrategySource;
}

export interface FundingStrategyStateMap {
  [coin: string]: FundingStrategyState;
}

export interface StrategyRunResult {
  coin: string;
  action: "idle" | "close" | "error";
  fundingRate?: number;
  state?: FundingStrategyState | null;
  error?: string;
}

async function safeJson(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function runFundingStrategyTick(coins?: string[]): Promise<StrategyRunResult[]> {
  let response: Response;
  try {
    response = await fetch(RUN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coins }),
    });
  } catch (error: any) {
    throw new Error(`Impossible de contacter runFundingStrategyTick: ${error?.message || error}`);
  }

  const parsed = await safeJson(response).catch((error) => {
    throw new Error(`Réponse invalide de runFundingStrategyTick: ${error?.message || error}`);
  });

  if (!response.ok) {
    const message = parsed?.error || response.statusText;
    throw new Error(`runFundingStrategyTick a échoué (${response.status}): ${message}`);
  }

  return Array.isArray(parsed?.results) ? (parsed.results as StrategyRunResult[]) : [];
}

export async function fetchFundingStrategyStates(): Promise<FundingStrategyStateMap> {
  let response: Response;
  try {
    response = await fetch(STATE_ENDPOINT);
  } catch (error: any) {
    throw new Error(`Impossible de contacter getFundingStrategyState: ${error?.message || error}`);
  }

  const parsed = await safeJson(response).catch((error) => {
    throw new Error(`Réponse invalide de getFundingStrategyState: ${error?.message || error}`);
  });

  if (!response.ok) {
    const message = parsed?.error || response.statusText;
    throw new Error(`getFundingStrategyState a échoué (${response.status}): ${message}`);
  }

  return (parsed?.states as FundingStrategyStateMap) ?? {};
}

export async function upsertFundingStrategyState(state: FundingStrategyState): Promise<void> {
  let response: Response;
  try {
    response = await fetch(UPSERT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
  } catch (error: any) {
    throw new Error(`Impossible d'enregistrer la stratégie Firebase: ${error?.message || error}`);
  }

  const parsed = await safeJson(response).catch((error) => {
    throw new Error(`Réponse invalide de upsertFundingStrategyState: ${error?.message || error}`);
  });

  if (!response.ok) {
    const message = parsed?.error || response.statusText;
    throw new Error(`upsertFundingStrategyState a échoué (${response.status}): ${message}`);
  }
}
