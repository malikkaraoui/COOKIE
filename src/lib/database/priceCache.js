// Service de cache des prix dans Realtime Database
// Filet de sécurité si Hyperliquid ne répond pas
import { ref, get, set } from 'firebase/database'
import { db } from '../../config/firebase'

/**
 * Structure du cache dans Realtime Database :
 * 
 * /priceTokenHyper/{coin}/
 *   ├─ price: 95847.50
 *   ├─ prevDayPx: 92432.10
 *   ├─ deltaAbs: 3415.40
 *   ├─ deltaPct: 3.69
 *   ├─ timestamp: 1732176000000
 *   └─ source: "hyperliquid"
 * 
 * /priceTokenBinance/{coin}/
 *   ├─ price: 612.50
 *   ├─ prevDayPx: 598.30
 *   ├─ deltaAbs: 14.20
 *   ├─ deltaPct: 2.37
 *   ├─ timestamp: 1732176000000
 *   └─ source: "binance"
 */

/**
 * Récupère le prix caché pour un coin depuis Hyperliquid
 * 
 * @param {string} coin - Nom du coin (ex: "BTC")
 * @returns {Promise<Object|null>} - Données cachées ou null
 */
export async function getCachedPriceHyper(coin) {
  if (!coin) return null

  try {
    const cacheRef = ref(db, `priceTokenHyper/${coin}`)
    const snapshot = await get(cacheRef)
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      
      // Vérifier que le cache n'est pas trop vieux (> 1 heure)
      const now = Date.now()
      const cacheAge = now - (data.timestamp || 0)
      const MAX_CACHE_AGE = 60 * 60 * 1000 // 1 heure
      
      if (cacheAge > MAX_CACHE_AGE) {
        console.warn(`Cache Hyperliquid trop ancien pour ${coin} (${Math.round(cacheAge / 1000 / 60)} min)`)
        return null
      }
      
      return {
        ...data,
        cacheAge: Math.round(cacheAge / 1000) // en secondes
      }
    }
    
    return null
  } catch (error) {
    console.error(`Erreur lecture cache Hyperliquid ${coin}:`, error)
    return null
  }
}

/**
 * Récupère le prix caché pour un coin depuis Binance
 * 
 * @param {string} coin - Nom du coin (ex: "BNB")
 * @returns {Promise<Object|null>} - Données cachées ou null
 */
export async function getCachedPriceBinance(coin) {
  if (!coin) return null

  try {
    const cacheRef = ref(db, `priceTokenBinance/${coin}`)
    const snapshot = await get(cacheRef)
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      
      // Vérifier que le cache n'est pas trop vieux (> 1 heure)
      const now = Date.now()
      const cacheAge = now - (data.timestamp || 0)
      const MAX_CACHE_AGE = 60 * 60 * 1000 // 1 heure
      
      if (cacheAge > MAX_CACHE_AGE) {
        console.warn(`Cache Binance trop ancien pour ${coin} (${Math.round(cacheAge / 1000 / 60)} min)`)
        return null
      }
      
      return {
        ...data,
        cacheAge: Math.round(cacheAge / 1000) // en secondes
      }
    }
    
    return null
  } catch (error) {
    console.error(`Erreur lecture cache Binance ${coin}:`, error)
    return null
  }
}

// Fonction legacy pour compatibilité
export async function getCachedPrice(coin) {
  return getCachedPriceHyper(coin)
}

/**
 * Enregistre le prix dans le cache Hyperliquid
 * 
 * @param {string} coin - Nom du coin
 * @param {Object} priceData - Données à cacher
 * @param {number} priceData.price - Prix actuel
 * @param {number} priceData.prevDayPx - Prix il y a 24h
 * @param {number} priceData.deltaAbs - Variation absolue
 * @param {number} priceData.deltaPct - Variation en %
 * @returns {Promise<void>}
 */
export async function setCachedPriceHyper(coin, priceData) {
  if (!coin || !priceData) {
    console.warn('❌ setCachedPriceHyper: coin ou priceData manquant', { coin, priceData })
    return
  }

  try {
    const cacheRef = ref(db, `priceTokenHyper/${coin}`)
    
    const dataToCache = {
      price: priceData.price,
      prevDayPx: priceData.prevDayPx,
      deltaAbs: priceData.deltaAbs,
      deltaPct: priceData.deltaPct,
      timestamp: Date.now(),
      source: 'hyperliquid'
    }
    
    await set(cacheRef, dataToCache)
  } catch (error) {
    console.error(`❌ Erreur cache Hyperliquid ${coin}:`, error.code, error.message)
  }
}

/**
 * Enregistre le prix dans le cache Binance
 * 
 * @param {string} coin - Nom du coin
 * @param {Object} priceData - Données à cacher
 * @param {number} priceData.price - Prix actuel
 * @param {number} priceData.prevDayPx - Prix il y a 24h
 * @param {number} priceData.deltaAbs - Variation absolue
 * @param {number} priceData.deltaPct - Variation en %
 * @returns {Promise<void>}
 */
export async function setCachedPriceBinance(coin, priceData) {
  if (!coin || !priceData) {
    console.warn('❌ setCachedPriceBinance: coin ou priceData manquant', { coin, priceData })
    return
  }

  try {
    const cacheRef = ref(db, `priceTokenBinance/${coin}`)
    
    const dataToCache = {
      price: priceData.price,
      prevDayPx: priceData.prevDayPx,
      deltaAbs: priceData.deltaAbs,
      deltaPct: priceData.deltaPct,
      timestamp: Date.now(),
      source: 'binance'
    }
    
    await set(cacheRef, dataToCache)
  } catch (error) {
    console.error(`❌ Erreur cache Binance ${coin}:`, error.code, error.message)
  }
}

// Fonction legacy pour compatibilité
export async function setCachedPrice(coin, priceData, source = 'hyperliquid') {
  if (source === 'binance') {
    return setCachedPriceBinance(coin, priceData)
  }
  return setCachedPriceHyper(coin, priceData)
}

/**
 * Stratégie de récupération des prix avec fallback
 * 
 * 1. Essaie de récupérer depuis Hyperliquid
 * 2. Si échec, utilise le cache
 * 3. Si succès, met à jour le cache
 * 
 * @param {string} coin - Nom du coin
 * @param {Function} fetchFunction - Fonction pour fetch depuis Hyperliquid
 * @returns {Promise<Object>} - { data, source: 'hyperliquid' | 'cache' }
 */
export async function getPriceWithFallback(coin, fetchFunction) {
  try {
    // Tentative 1 : Hyperliquid
    const hyperliquidData = await fetchFunction()
    
    if (hyperliquidData) {
      // Succès ! Mettre à jour le cache
      await setCachedPrice(coin, hyperliquidData)
      
      return {
        ...hyperliquidData,
        source: 'hyperliquid'
      }
    }
  } catch (error) {
    console.warn(`Hyperliquid non disponible pour ${coin}, utilisation du cache`, error.message)
  }
  
  // Tentative 2 : Cache Realtime Database
  const cachedData = await getCachedPrice(coin)
  
  if (cachedData) {
    console.log(`📦 Utilisation du cache pour ${coin} (${cachedData.cacheAge}s)`)
    return cachedData
  }
  
  // Échec total
  throw new Error(`Impossible de récupérer le prix de ${coin} (Hyperliquid ET cache indisponibles)`)
}
