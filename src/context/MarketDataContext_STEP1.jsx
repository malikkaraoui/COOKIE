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
import { setCachedPrice } from '../lib/database/priceCache'

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
      try {
        const res = await fetch(INFO_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'assetCtxs', coins: ['BTC'] })
        })
        if (!res.ok) throw new Error('HTTP ' + res.status)
        const data = await res.json()
        
        if (Array.isArray(data) && data[0]) {
          const btcData = data[0]
          const markPx = Number(btcData.markPx)
          const prevDayPx = Number(btcData.prevDayPx)
          
          if (!isNaN(markPx) && !isNaN(prevDayPx) && prevDayPx > 0) {
            console.log('✅ assetCtxs BTC:', { markPx, prevDayPx })
            updateToken('BTC', { 
              price: markPx, 
              prevDayPx,
              source: 'live',
              status: 'live'
            })
          } else {
            console.warn('⚠️ Données assetCtxs invalides:', btcData)
            updateToken('BTC', { status: 'error', error: 'Données invalides' })
          }
        } else {
          console.warn('⚠️ Format assetCtxs inattendu:', data)
          updateToken('BTC', { status: 'error', error: 'Format inattendu' })
        }
      } catch (e) {
        console.warn('❌ Erreur fetch assetCtxs:', e.message)
        updateToken('BTC', { status: 'error', error: e.message })
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

      // Écriture Realtime DB (async, best effort) uniquement si source live
      if (merged.source === 'live' && merged.price != null && merged.prevDayPx != null) {
        setCachedPrice(symbol, {
          price: merged.price,
          prevDayPx: merged.prevDayPx,
          deltaAbs: merged.deltaAbs,
          deltaPct: merged.deltaPct
        }).catch(() => {})
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

export function useMarketData() {
  const ctx = useContext(MarketDataContext)
  if (!ctx) throw new Error('useMarketData doit être utilisé dans MarketDataProvider')
  return ctx
}
