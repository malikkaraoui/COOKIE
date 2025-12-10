// src/config/binanceTrackedTokens.ts

/**
 * Liste typée des tokens que l'on suit sur Binance Spot.
 *
 * - id           : identifiant interne (utilisé par priceCache, ex. "BTC")
 * - symbol       : symbole complet Binance Spot (ex. "BTCUSDT")
 * - baseAsset    : asset de base (ex. "BTC")
 * - quoteAsset   : asset de cotation (ici toujours "USDT")
 * - source       : identifiant de la source de prix ("binance-spot")
 *
 * Cette liste sert de "whitelist" de 30 tokens majeurs, tous disponibles sur Binance.
 * Copilot peut s'appuyer dessus pour écrire les services de prix / synchro.
 */
export interface BinanceTrackedToken {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  source: "binance-spot";
}

export const BINANCE_DEFAULT_TOKENS: BinanceTrackedToken[] = [
  // ⚠ Garder BTC / ETH / BNB en tête de liste
  { id: "BTC",  symbol: "BTCUSDT",  baseAsset: "BTC",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "ETH",  symbol: "ETHUSDT",  baseAsset: "ETH",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "BNB",  symbol: "BNBUSDT",  baseAsset: "BNB",  quoteAsset: "USDT", source: "binance-spot" },

  // Majors L1
  { id: "SOL",  symbol: "SOLUSDT",  baseAsset: "SOL",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "XRP",  symbol: "XRPUSDT",  baseAsset: "XRP",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "ADA",  symbol: "ADAUSDT",  baseAsset: "ADA",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "TON",  symbol: "TONUSDT",  baseAsset: "TON",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "TRX",  symbol: "TRXUSDT",  baseAsset: "TRX",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "AVAX", symbol: "AVAXUSDT", baseAsset: "AVAX", quoteAsset: "USDT", source: "binance-spot" },

  // Meme / communautaires (ne jamais retirer ceux-là)
  { id: "DOGE", symbol: "DOGEUSDT", baseAsset: "DOGE", quoteAsset: "USDT", source: "binance-spot" },
  { id: "SHIB", symbol: "SHIBUSDT", baseAsset: "SHIB", quoteAsset: "USDT", source: "binance-spot" },
  { id: "PEPE", symbol: "PEPEUSDT", baseAsset: "PEPE", quoteAsset: "USDT", source: "binance-spot" },

  // DeFi / blue chips
  { id: "LINK", symbol: "LINKUSDT", baseAsset: "LINK", quoteAsset: "USDT", source: "binance-spot" },
  { id: "DOT",  symbol: "DOTUSDT",  baseAsset: "DOT",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "POL",  symbol: "POLUSDT",  baseAsset: "POL",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "UNI",  symbol: "UNIUSDT",  baseAsset: "UNI",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "RUNE", symbol: "RUNEUSDT", baseAsset: "RUNE", quoteAsset: "USDT", source: "binance-spot" },
  { id: "INJ",  symbol: "INJUSDT",  baseAsset: "INJ",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "ATOM", symbol: "ATOMUSDT", baseAsset: "ATOM", quoteAsset: "USDT", source: "binance-spot" },

  // L1/L2 récents
  { id: "SUI",  symbol: "SUIUSDT",  baseAsset: "SUI",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "APT",  symbol: "APTUSDT",  baseAsset: "APT",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "ARB",  symbol: "ARBUSDT",  baseAsset: "ARB",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "OP",   symbol: "OPUSDT",   baseAsset: "OP",   quoteAsset: "USDT", source: "binance-spot" },
  { id: "SEI",  symbol: "SEIUSDT",  baseAsset: "SEI",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "TIA",  symbol: "TIAUSDT",  baseAsset: "TIA",  quoteAsset: "USDT", source: "binance-spot" },

  // “Old school”
  { id: "LTC",  symbol: "LTCUSDT",  baseAsset: "LTC",  quoteAsset: "USDT", source: "binance-spot" },
  { id: "BCH",  symbol: "BCHUSDT",  baseAsset: "BCH",  quoteAsset: "USDT", source: "binance-spot" },

  // Narrative ordinals / infra
  { id: "ORDI", symbol: "ORDIUSDT", baseAsset: "ORDI", quoteAsset: "USDT", source: "binance-spot" },
  { id: "JUP",  symbol: "JUPUSDT",  baseAsset: "JUP",  quoteAsset: "USDT", source: "binance-spot" },

  // DeFi BSC / Pancake
  { id: "CAKE", symbol: "CAKEUSDT", baseAsset: "CAKE", quoteAsset: "USDT", source: "binance-spot" },
];

/**
 * Renvoie uniquement la liste des symboles Binance Spot (ex. ["BTCUSDT", ...]).
 * Utile pour boucler sur les appels /api/v3/ticker/price et /api/v3/ticker/24hr.
 */
export const BINANCE_DEFAULT_SYMBOLS: string[] = BINANCE_DEFAULT_TOKENS.map(
  (token) => token.symbol
);

/**
 * Renvoie uniquement la liste des id internes (ex. ["BTC", "ETH", ...]).
 * Utile pour indexer proprement le priceCache dans Firebase (/priceCache/{id}).
 */
export const BINANCE_DEFAULT_IDS: string[] = BINANCE_DEFAULT_TOKENS.map(
  (token) => token.id
);
