export interface FundingWatchConfig {
  coins: string[];
  schedule: string;
  positiveEntryThreshold: number;
  negativeEntryThreshold: number;
  exitFundingThreshold: number;
  notionalUsd: number;
  leverage: number;
  maxDrawdownPct: number;
}

export const FUNDING_WATCH_CONFIG: FundingWatchConfig = {
  coins: ["BTC", "ETH", "SOL", "BNB"],
  schedule: "every 5 minutes",
  positiveEntryThreshold: 0.0001, // 0.01% / période
  negativeEntryThreshold: -0.0001, // funding paye les longs
  exitFundingThreshold: 0.00005,
  notionalUsd: 100,
  leverage: 3,
  maxDrawdownPct: -0.02, // -2%
};
