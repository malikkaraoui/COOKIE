/**
 * Hook pour récupérer TOUS les prix Binance
 * Rafraîchissement automatique toutes les 5 secondes
 * Écrit tous les tokens dans Firebase priceTokenBinance/{symbol}
 */

import { useEffect } from 'react'
import { getBinanceTicker24hr } from '../lib/binance/binanceClient'
import { BINANCE_SYMBOLS } from '../config/binanceConfig'
import { setCachedPriceBinance } from '../lib/database/priceCache'

export function useBinancePrices() {
  useEffect(() => {
    let isMounted = true

    async function fetchAllBinancePrices() {
      const symbols = Object.entries(BINANCE_SYMBOLS)
      
      // Fetch tous les tokens en parallèle
      const promises = symbols.map(async ([coin, tradingPair]) => {
        try {
          const data = await getBinanceTicker24hr(tradingPair)
          
          if (isMounted) {
            console.log(`📊 Binance ${coin}: $${data.price.toFixed(coin === 'SHIB' ? 8 : 2)} (${data.priceChangePercent >= 0 ? '+' : ''}${data.priceChangePercent.toFixed(2)}%)`)
            
            // Écriture dans Firebase priceTokenBinance/{coin}
            await setCachedPriceBinance(coin, {
              price: data.price,
              prevDayPx: data.prevClosePrice,
              deltaAbs: data.priceChange,
              deltaPct: data.priceChangePercent
            })
          }
        } catch (error) {
          console.error(`❌ Erreur fetch Binance ${coin}:`, error.message)
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
