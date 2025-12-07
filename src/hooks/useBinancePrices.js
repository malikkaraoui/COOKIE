/**
 * Hook pour récupérer TOUS les prix Binance depuis la whitelist
 * Rafraîchissement automatique toutes les 5 secondes
 * Écrit tous les tokens dans Firebase priceTokenBinance/{id}
 * 
 * Utilise src/config/binanceTrackedTokens.js comme source (30 tokens)
 */

import { useEffect } from 'react'
import { getBinanceTicker24hr } from '../lib/binance/binanceClient'
import { BINANCE_DEFAULT_TOKENS } from '../config/binanceTrackedTokens.js'
import { setCachedPriceBinance } from '../lib/database/priceCache'

export function useBinancePrices() {
  useEffect(() => {
    let isMounted = true

    async function fetchAllBinancePrices() {
      // Fetch tous les tokens de la whitelist en parallèle
      const promises = BINANCE_DEFAULT_TOKENS.map(async (token) => {
        try {
          const data = await getBinanceTicker24hr(token.symbol)
          
          if (isMounted) {
            // Écriture dans Firebase /priceTokenBinance/{id}
            await setCachedPriceBinance(token.id, {
              price: data.price,
              prevDayPx: data.prevClosePrice,
              deltaAbs: data.priceChange,
              deltaPct: data.priceChangePercent
            })
          }
        } catch (error) {
          console.error(`❌ Erreur fetch Binance ${token.id}:`, error.message)
        }
      })

      await Promise.all(promises)
    }

    // Fetch initial
    fetchAllBinancePrices()

    // Rafraîchissement toutes les 5 secondes
    const interval = setInterval(fetchAllBinancePrices, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // Ce hook ne retourne rien, il écrit juste dans Firebase
  return null
}
