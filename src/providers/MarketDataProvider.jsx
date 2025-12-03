// Contexte global des données de marché (prix + variation 24h) avec cache navigateur
// Responsable de :
//  - Polling REST assetCtxs toutes les 5s (markPx + prevDayPx)
//  - Calcul variation via priceCalculations
//  - Persistance locale (localStorage) pour affichage instantané
//  - Écriture dans Realtime Database (filet de sécurité) via priceCache.js
//  - Fournir un accès uniformisé aux tokens (BTC pour l'instant, extensible)

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { INFO_URL } from '../lib/hlEndpoints'
import { calculatePriceChange } from '../lib/priceCalculations'
import { setCachedPriceHyper } from '../lib/database/priceCache'
import { getHyperliquidTokenSymbols } from '../config/tokenList'
import { ref, onValue } from 'firebase/database'
import { db } from '../config/firebase'

const MarketDataContext = createContext(null)

// Clef localStorage pour le cache navigateur
const LS_KEY = 'marketDataCache_v1'

export function MarketDataProvider({ children }) {
  const [tokens, setTokens] = useState({}) // { BTC: { price, prevDayPx, deltaAbs, deltaPct, status, source, updatedAt } }
  const mountedRef = useRef(false)

  // Hydratation initiale depuis localStorage (affichage instantané)
  useEffect(() => {
    mountedRef.current = true
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          // Normaliser / recalculer delta si absent mais price & prevDayPx présents
          const normalized = {}
          Object.keys(parsed).forEach(sym => {
            const t = parsed[sym]
            if (t && typeof t === 'object') {
              const copy = { ...t }
              if ((copy.deltaAbs == null || copy.deltaPct == null) && copy.price != null && copy.prevDayPx != null) {
                const change = calculatePriceChange(copy.price, copy.prevDayPx)
                if (change) {
                  copy.deltaAbs = change.deltaAbs
                  copy.deltaPct = change.deltaPct
                }
              }
              // Marquer statut cache si pas live
              if (!copy.status) copy.status = 'cached'
              if (!copy.source) copy.source = 'cache'
              normalized[sym] = copy
            }
          })
          setTokens(normalized)
        }
      }
    } catch (e) {
      console.warn('Hydratation localStorage échouée:', e)
    }
    return () => { mountedRef.current = false }
  }, [])

  // Persistance vers localStorage à chaque modification
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(tokens))
    } catch {
      // Ignorer erreurs quota
    }
  }, [tokens])

  // Polling assetCtxs toutes les 5s (prix + prevDayPx en une seule requête)
  useEffect(() => {
    async function fetchAssetCtxs() {
      const symbols = getHyperliquidTokenSymbols() // Uniquement tokens Hyperliquid
      
      try {
        const res = await fetch(INFO_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'assetCtxs', coins: symbols })
        })
        if (!res.ok) throw new Error('HTTP ' + res.status)
        const data = await res.json()
        
        if (Array.isArray(data)) {
          data.forEach((tokenData, index) => {
            const symbol = symbols[index]
            const markPx = Number(tokenData.markPx)
            const prevDayPx = Number(tokenData.prevDayPx)
            
            if (!isNaN(markPx) && !isNaN(prevDayPx) && prevDayPx > 0) {
              console.log(`✅ assetCtxs ${symbol}:`, { markPx, prevDayPx })
              updateToken(symbol, { 
                price: markPx, 
                prevDayPx,
                source: 'hyperliquid',
                status: 'live',
                error: null
              })
            } else {
              console.warn(`⚠️ Données assetCtxs invalides pour ${symbol}:`, tokenData)
              updateToken(symbol, { status: 'error', error: 'Données invalides' })
            }
          })
        } else {
          console.warn('⚠️ Format assetCtxs inattendu:', data)
          symbols.forEach(sym => updateToken(sym, { status: 'error', error: 'Format inattendu' }))
        }
      } catch (e) {
        console.warn('❌ Erreur fetch assetCtxs:', e.message)
        symbols.forEach(sym => updateToken(sym, { status: 'error', error: e.message }))
      }
    }

    // Fetch initial
    fetchAssetCtxs()

    // Polling toutes les 5s
    const pollTimer = setInterval(fetchAssetCtxs, 5000)

    return () => {
      clearInterval(pollTimer)
    }
  }, [])

  // Listener temps réel pour les tokens Binance depuis Firebase
  useEffect(() => {
    const binanceRef = ref(db, 'priceTokenBinance')
    
    const unsubscribe = onValue(binanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const binanceData = snapshot.val()
        
        // Pour chaque token Binance dans Firebase
        Object.keys(binanceData).forEach(symbol => {
          const tokenData = binanceData[symbol]
          
          if (tokenData && tokenData.price != null) {
            console.log(`📊 Firebase Binance ${symbol}:`, {
              price: tokenData.price,
              deltaPct: tokenData.deltaPct
            })
            
            // Mettre à jour dans notre state local
            updateToken(symbol, {
              price: tokenData.price,
              prevDayPx: tokenData.prevDayPx,
              deltaAbs: tokenData.deltaAbs,
              deltaPct: tokenData.deltaPct,
              source: 'binance',
              status: 'live'
            })
          }
        })
      }
    }, (error) => {
      console.error('❌ Erreur listener Binance Firebase:', error)
    })

    return () => unsubscribe()
  }, [])

  // Fonction utilitaire de mise à jour atomique
  function updateToken(symbol, patch) {
    setTokens(prev => {
      const current = prev[symbol] || { status: 'loading', source: 'cache' }
      const appliedPatch = typeof patch === 'function' ? patch(current) : patch
      const merged = { ...current, ...appliedPatch }

      // Calcul variation si price + prevDayPx présents
      if (merged.price != null && merged.prevDayPx != null) {
        const change = calculatePriceChange(merged.price, merged.prevDayPx)
        if (change) {
          merged.deltaAbs = change.deltaAbs
          merged.deltaPct = change.deltaPct
        }
      }
      merged.updatedAt = Date.now()

      // Écriture Realtime DB UNIQUEMENT pour Hyperliquid
      // (Binance est déjà écrit par useBinancePrices)
      if (merged.source === 'hyperliquid' && merged.price != null && merged.prevDayPx != null) {
        console.log(`🔥 Tentative écriture Firebase Hyperliquid ${symbol}:`, {
          price: merged.price,
          prevDayPx: merged.prevDayPx,
          deltaAbs: merged.deltaAbs,
          deltaPct: merged.deltaPct
        })
        setCachedPriceHyper(symbol, {
          price: merged.price,
          prevDayPx: merged.prevDayPx,
          deltaAbs: merged.deltaAbs,
          deltaPct: merged.deltaPct
        }).then(() => {
          console.log(`✅ Écriture Firebase Hyperliquid ${symbol} réussie!`)
        }).catch((err) => {
          console.error(`❌ Échec écriture Firebase Hyperliquid ${symbol}:`, err.code, err.message)
        })
      }
      return { ...prev, [symbol]: merged }
    })
  }

  const value = {
    getToken: (symbol) => tokens[symbol] || null,
    tokens
  }

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export function useMarketData() {
  const ctx = useContext(MarketDataContext)
  if (!ctx) throw new Error('useMarketData doit être utilisé dans MarketDataProvider')
  return ctx
}
