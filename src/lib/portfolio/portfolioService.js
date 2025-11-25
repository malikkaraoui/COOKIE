/**
 * Service d'orchestration - Récupération données portfolio
 * Intègre Hyperliquid + Binance pour construire tokensData
 * Sépare logique métier de React
 */

import { getTokenConfig } from '../../config/tokenList'

/**
 * Construit tokensData pour le simulateur à partir des tokens sélectionnés
 * Support multi-sources (Hyperliquid + Binance)
 * 
 * @param {Array<string>} selectedTokens - Tokens au format "SYMBOL:source" ou "SYMBOL"
 * @param {Function} getToken - Hook MarketData pour Hyperliquid
 * @param {Function} getBinanceToken - Hook optionnel pour Binance
 * @returns {Array<Object>} [{ symbol, deltaPct, color, source, name }]
 */
export function buildTokensData(selectedTokens, getToken, getBinanceToken = null) {
  if (!Array.isArray(selectedTokens) || selectedTokens.length === 0) {
    return []
  }

  return selectedTokens.map(symbolWithSource => {
    // Parser format "BTC:hyperliquid" ou "BTC"
    const [symbol, source] = symbolWithSource.includes(':')
      ? symbolWithSource.split(':')
      : [symbolWithSource, 'hyperliquid']

    // Récupérer config statique (couleur, nom)
    const config = getTokenConfig(symbol)

    // Récupérer données de marché selon la source
    let marketData = null

    if (source === 'binance' && getBinanceToken) {
      // Binance : utiliser hook dédié
      marketData = getBinanceToken(symbol)
    } else {
      // Hyperliquid : utiliser MarketData context
      marketData = getToken(symbol)
    }

    return {
      symbol,
      source,
      deltaPct: marketData?.deltaPct || 0,
      color: config?.color || '#666',
      name: config?.name || symbol,
      // Métadonnées utiles pour debug
      price: marketData?.price || null,
      status: marketData?.status || 'loading'
    }
  })
}

/**
 * Convertit tokensData en apyMap utilisable par portfolioCalculations
 * @param {Array<Object>} tokensData - Données tokens avec deltaPct
 * @returns {Object} { BTC: 0.05, ETH: 0.03 } (APY en décimal)
 */
export function buildAPYMap(tokensData) {
  if (!Array.isArray(tokensData)) return {}

  return tokensData.reduce((acc, token) => {
    // deltaPct est en % (ex: 5), on le convertit en décimal (0.05)
    acc[token.symbol] = (token.deltaPct || 0) / 100
    return acc
  }, {})
}

/**
 * Récupère l'APY d'un token spécifique depuis tokensData
 * @param {Array<Object>} tokensData - Données tokens
 * @param {string} symbol - Symbole du token
 * @returns {number} APY en % (ex: 5 pour 5%)
 */
export function getTokenAPY(tokensData, symbol) {
  if (!Array.isArray(tokensData)) return 0
  
  const token = tokensData.find(t => t.symbol === symbol)
  return token?.deltaPct || 0
}

/**
 * Extrait la liste des symboles depuis selectedTokens
 * @param {Array<string>} selectedTokens - Format "BTC:hyperliquid" ou "BTC"
 * @returns {Array<string>} ["BTC", "ETH", "SOL"]
 */
export function extractSymbols(selectedTokens) {
  if (!Array.isArray(selectedTokens)) return []

  return selectedTokens.map(item => {
    const [symbol] = item.includes(':') ? item.split(':') : [item, 'hyperliquid']
    return symbol
  })
}
