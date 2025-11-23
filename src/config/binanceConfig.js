/**
 * Configuration Binance Spot API
 * Documentation: https://developers.binance.com/docs/binance-spot-api-docs/rest-api
 */

// URL de base de l'API Binance Spot (publique, pas besoin de clé API)
export const BINANCE_API_BASE = 'https://api.binance.com'

// Endpoints
export const BINANCE_ENDPOINTS = {
  // Prix simple d'un symbole
  PRICE: `${BINANCE_API_BASE}/api/v3/ticker/price`,
  
  // Prix + statistiques 24h (price, priceChange, priceChangePercent, etc.)
  TICKER_24HR: `${BINANCE_API_BASE}/api/v3/ticker/24hr`
}

/**
 * Symboles Binance (paires de trading)
 * Format: {ASSET}{QUOTE} (ex: BNBUSDT)
 */
export const BINANCE_SYMBOLS = {
  BNB: 'BNBUSDT',
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  POL: 'POLUSDT',
  DOT: 'DOTUSDT',
  ATOM: 'ATOMUSDT',
  DOGE: 'DOGEUSDT',
  SHIB: 'SHIBUSDT'
}
