// Contexte global des données de marché (prix + variation 24h) avec cache navigateur
// Responsable de :
//  - Connexion WebSocket unique (allMids)
//  - Fetch initial meta (prevDayPx)
//  - Calcul variation via priceCalculations
//  - Persistance locale (localStorage) pour affichage instantané
//  - Écriture dans Realtime Database (filet de sécurité) via priceCache.js
//  - Fournir un accès uniformisé aux tokens (BTC pour l’instant, extensible)

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { INFO_URL } from '../lib/hlEndpoints'
import { calculatePriceChange } from '../lib/priceCalculations'
import { setCachedPrice, getCachedPrice } from '../lib/database/priceCache'

const MarketDataContext = createContext(null)

// Clef localStorage pour le cache navigateur
const LS_KEY = 'marketDataCache_v1'

// Intervalle de polling assetCtxs (ms)
const POLL_INTERVAL_MS = 5 * 1000 // 5 secondes

export function MarketDataProvider({ children }) {
  const [tokens, setTokens] = useState({}) // { BTC: { price, prevDayPx, deltaAbs, deltaPct, status, source, updatedAt } }
  const pollTimerRef = useRef(null)
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
    } catch (e) {
      // Ignorer erreurs quota
    }
  }, [tokens])

  // Connexion WebSocket allMids (une seule pour toute l’app)
  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'allMids' }
      }))
    }

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data)
        if (msg?.channel === 'allMids' && msg?.data?.mids) {
          const mids = msg.data.mids
          // Pour l’instant : uniquement BTC (U prefix fallback)
          const rawBtc = mids['BTC'] ?? mids['UBTC']
          if (rawBtc != null) {
            updateToken('BTC', { price: Number(rawBtc), source: 'live' })
          }
        }
      } catch (e) {
        // Ignore messages non parsables
      }
    }

    ws.onerror = () => {
      updateToken('BTC', { status: 'error' })
    }

    ws.onclose = () => {
      // Marquer source comme cache si on avait déjà un prix
      updateToken('BTC', (prev) => (prev?.price ? { source: 'cache', status: 'closed' } : { status: 'closed' }))
    }

    return () => {
      try { ws.close(1000, 'provider_unmount') } catch {}
    }
  }, [])

  // Fetch meta (prevDayPx) initial + rafraîchissement périodique
  useEffect(() => {
    async function fetchMeta() {
      try {
        const res = await fetch(INFO_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'meta' })
        })
        if (!res.ok) throw new Error('HTTP ' + res.status)
        const data = await res.json()
        const universe = data?.[0]?.universe || []
        const metaArr = data?.[1] || []
        const btcIndex = universe.findIndex(c => c.name === 'BTC')
        if (btcIndex !== -1 && metaArr[btcIndex]) {
          const prevDayPx = Number(metaArr[btcIndex].prevDayPx)
          if (!isNaN(prevDayPx)) {
            updateToken('BTC', { prevDayPx })
          }
        }
      } catch (e) {
        console.warn('fetchMeta error:', e.message)
      }
    }

    // Fetch initial (éviter double appel)
    if (!metaFetchedRef.current) {
      metaFetchedRef.current = true
      fetchMeta()
    }
    // Rafraîchissement périodique
    metaTimerRef.current = setInterval(fetchMeta, META_REFRESH_MS)
    return () => { clearInterval(metaTimerRef.current) }
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
