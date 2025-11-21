// Service de cache des prix dans Realtime Database
// Filet de sécurité si Hyperliquid ne répond pas
import { ref, get, set } from 'firebase/database'
import { db } from '../../config/firebase'

/**
 * Structure du cache dans Realtime Database :
 * 
 * /priceCache/{coin}/
 *   ├─ price: 95847.50
 *   ├─ prevDayPx: 92432.10
 *   ├─ deltaAbs: 3415.40
 *   ├─ deltaPct: 3.69
 *   ├─ timestamp: 1732176000000
 *   └─ source: "hyperliquid" | "cache"
 */

/**
 * Récupère le prix caché pour un coin
 * 
 * @param {string} coin - Nom du coin (ex: "BTC")
 * @returns {Promise<Object|null>} - Données cachées ou null
 */
export async function getCachedPrice(coin) {
  if (!coin) return null

  try {
    const cacheRef = ref(db, `priceCache/${coin}`)
    const snapshot = await get(cacheRef)
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      
      // Vérifier que le cache n'est pas trop vieux (> 1 heure)
      const now = Date.now()
      const cacheAge = now - (data.timestamp || 0)
      const MAX_CACHE_AGE = 60 * 60 * 1000 // 1 heure
      
      if (cacheAge > MAX_CACHE_AGE) {
        console.warn(`Cache trop ancien pour ${coin} (${Math.round(cacheAge / 1000 / 60)} min)`)
        return null
      }
      
      return {
        ...data,
        source: 'cache',
        cacheAge: Math.round(cacheAge / 1000) // en secondes
      }
    }
    
    return null
  } catch (error) {
    console.error(`Erreur lecture cache ${coin}:`, error)
    return null
  }
}

/**
 * Enregistre le prix dans le cache
 * 
 * @param {string} coin - Nom du coin
 * @param {Object} priceData - Données à cacher
 * @param {number} priceData.price - Prix actuel
 * @param {number} priceData.prevDayPx - Prix il y a 24h
 * @param {number} priceData.deltaAbs - Variation absolue
 * @param {number} priceData.deltaPct - Variation en %
 * @returns {Promise<void>}
 */
export async function setCachedPrice(coin, priceData) {
  if (!coin || !priceData) {
    console.warn('❌ setCachedPrice: coin ou priceData manquant', { coin, priceData })
    return
  }

  console.log(`💾 Tentative d'écriture cache ${coin}:`, {
    price: priceData.price,
    prevDayPx: priceData.prevDayPx,
    deltaAbs: priceData.deltaAbs,
    deltaPct: priceData.deltaPct
  })

  try {
    const cacheRef = ref(db, `priceCache/${coin}`)
    
    const dataToCache = {
      price: priceData.price,
      prevDayPx: priceData.prevDayPx,
      deltaAbs: priceData.deltaAbs,
      deltaPct: priceData.deltaPct,
      timestamp: Date.now(),
      source: 'hyperliquid'
    }
    
    await set(cacheRef, dataToCache)
    
    console.log(`✅ Prix ${coin} écrit dans le cache avec succès!`, dataToCache)
  } catch (error) {
    console.error(`❌ Erreur mise en cache ${coin}:`, error.code, error.message)
    console.error('Détails:', error)
  }
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
