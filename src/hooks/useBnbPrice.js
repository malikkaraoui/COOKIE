/**
 * Hook pour récupérer le prix BNB depuis Binance API
 * Rafraîchissement automatique toutes les 5 secondes
 * Écrit dans priceTokenBinance/BNB dans Firebase
 */

import { useState, useEffect } from 'react'
import { getBinanceTicker24hr } from '../lib/binance/binanceClient'
import { BINANCE_SYMBOLS } from '../config/binanceConfig'
import { setCachedPriceBinance } from '../lib/database/priceCache'

export function useBnbPrice() {
  const [bnbData, setBnbData] = useState({
    price: null,
    priceChange: null,
    priceChangePercent: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    let isMounted = true

    async function fetchBnbPrice() {
      try {
        const data = await getBinanceTicker24hr(BINANCE_SYMBOLS.BNB)
        
        if (isMounted) {
          setBnbData({
            price: data.price,
            priceChange: data.priceChange,
            priceChangePercent: data.priceChangePercent,
            loading: false,
            error: null
          })
          
          // Écriture dans Firebase priceTokenBinance/BNB
          await setCachedPriceBinance('BNB', {
            price: data.price,
            prevDayPx: data.prevClosePrice,
            deltaAbs: data.priceChange,
            deltaPct: data.priceChangePercent
          })
        }
      } catch (error) {
        if (isMounted) {
          setBnbData(prev => ({
            ...prev,
            loading: false,
            error: error.message
          }))
        }
      }
    }

    // Fetch initial
    fetchBnbPrice()

    // Rafraîchissement toutes les 5 secondes
    const interval = setInterval(fetchBnbPrice, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return bnbData
}
