export const FUNDING_POS_THRESHOLD = 0.00005; // 0.005%
export const FUNDING_NEG_THRESHOLD = -0.00005; // -0.005%
export const DEFAULT_CAPITAL_USD = 100;
export const PERP_LEVERAGE = 3;
export const SPOT_SHARE = 0.5;
export const EXIT_PNL_PERCENT_TARGET = 1; // 1%
export const WATCHED_COINS = [
	"BTC",
	"ETH",
	"SOL",
	"BNB",
	"POL",
	"PEPE",
	"AVAX",
	"ATOM",
	"APT",
	"ARB",
];
export const WATCH_TIMEZONE = "Europe/Paris";
export const WATCH_SCHEDULE = "every 5 minutes";

// Optionnel : permet de désactiver la jambe spot si l'API Hyperliquid spot n'est pas disponible
export const ENABLE_SPOT_LEG = false;
