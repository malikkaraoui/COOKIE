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
 * Import de la whitelist de tokens Binance
 * Voir src/config/binanceTrackedTokens.js pour la liste complète (30 tokens)
 */
import { BINANCE_DEFAULT_TOKENS } from './binanceTrackedTokens.js'

// Export pour compatibilité avec le code existant
export const BINANCE_TOKENS = BINANCE_DEFAULT_TOKENS

// Map {id -> symbol} pour accès rapide (ex: {BTC: 'BTCUSDT'})
export const BINANCE_SYMBOLS = BINANCE_DEFAULT_TOKENS.reduce((acc, token) => {
  acc[token.id] = token.symbol
  return acc
}, {})
