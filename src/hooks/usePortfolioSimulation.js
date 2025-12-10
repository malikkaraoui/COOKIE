/**
 * Hook de simulation de portfolio crypto
 * Orchestration : gère état React + appelle logique métier pure (lib/portfolio)
 * Sauvegarde automatique des poids personnalisés dans Firebase (debounced)
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  initializeEqualWeights,
  redistributeWeights,
  calculatePortfolioMetrics
} from '../lib/portfolio/portfolioCalculations'
import { buildAPYMap } from '../lib/portfolio/portfolioService'
import { savePortfolioWeights, getPortfolioWeights } from '../lib/database/userService'
import { useAuth } from './useAuth'

const ENABLE_PORTFOLIO_DEBUG = import.meta.env?.VITE_ENABLE_DEBUG_LOGS === 'true'
const debugLog = (...args) => {
  if (ENABLE_PORTFOLIO_DEBUG) {
    console.log(...args)
  }
}

/**
 * Hook de simulation de portfolio dynamique
 * @param {number} initialCapital - Capital de départ en $
 * @param {Array} tokensData - Tableau de { symbol, deltaPct, color } depuis les tokens sélectionnés
 * @returns {Object} { weights, setWeight, capitalInitial, setCapitalInitial, results, tokensData }
 */
export function usePortfolioSimulation(initialCapital = 1000, tokensData = [], tokenSymbolList = []) {
  const [capitalInitial, setCapitalInitial] = useState(initialCapital)
  const { user } = useAuth()
  const isAdjustingWeightsRef = useRef(false)

  // Initialiser les poids équitablement selon le nombre de tokens
  const tokenSymbols = useMemo(() => {
    if (tokenSymbolList && tokenSymbolList.length > 0) {
      return tokenSymbolList
    }
    return tokensData.map(t => t.symbol)
  }, [tokenSymbolList, tokensData])
  const tokenSymbolsKey = useMemo(() => tokenSymbols.slice().sort().join('|'), [tokenSymbols])

  const initialWeights = useMemo(() => {
    return initializeEqualWeights(tokenSymbols)
  }, [tokenSymbols])

  const [weights, setWeights] = useState(initialWeights)
  const [isLoadingWeights, setIsLoadingWeights] = useState(true)
  const saveTimerRef = useRef(null)

  // Charger les poids sauvegardés depuis Firebase au démarrage
  useEffect(() => {
    if (!user?.uid || tokenSymbols.length === 0) {
      setIsLoadingWeights(false)
      return
    }

    let isMounted = true

    async function loadSavedWeights() {
      try {
        const savedWeights = await getPortfolioWeights(user.uid)
        if (!isMounted) return

        if (savedWeights) {
          // Vérifier que les tokens sauvegardés correspondent aux tokens actuels
          const currentSymbols = tokenSymbols.slice().sort()
          const savedSymbols = Object.keys(savedWeights).sort()
          
          const sameTokens = currentSymbols.length === savedSymbols.length &&
            currentSymbols.every((sym, i) => sym === savedSymbols[i])
          
          if (sameTokens) {
            debugLog('✅ Poids restaurés depuis Firebase:', savedWeights)
            if (!isAdjustingWeightsRef.current) {
              setWeights(prev => {
                const prevEntries = Object.entries(prev)
                const savedEntries = Object.entries(savedWeights)
                if (prevEntries.length === savedEntries.length &&
                  prevEntries.every(([k, v]) => savedWeights[k] === v)) {
                  return prev
                }
                return savedWeights
              })
            }
          } else {
            debugLog('⚠️ Tokens changés, reset aux poids équitables')
            setWeights(initialWeights)
            // Sauvegarder immédiatement les nouveaux poids
            if (user?.uid) {
              await savePortfolioWeights(user.uid, initialWeights)
            }
          }
        } else {
          setWeights(initialWeights)
        }
      } catch (error) {
        console.error('❌ Erreur chargement poids:', error)
        setWeights(initialWeights)
      } finally {
        if (isMounted) {
          setIsLoadingWeights(false)
        }
      }
    }

    loadSavedWeights()

    return () => {
      isMounted = false
    }
  }, [user?.uid, tokenSymbolsKey, initialWeights, tokenSymbols])

  // Réinitialiser les poids quand tokensData change (ajout/suppression)
  // Mais seulement si les tokens ont changé
  useEffect(() => {
    if (isLoadingWeights) return // Attendre le chargement initial
    
    const currentSymbols = Object.keys(weights).sort().join(',')
    const newSymbols = tokenSymbols.slice().sort().join(',')
    
    if (currentSymbols !== newSymbols) {
      debugLog('🔄 Tokens modifiés, reset des poids')
      setWeights(initialWeights)
      
      // Sauvegarder immédiatement les nouveaux poids
      if (user?.uid) {
        savePortfolioWeights(user?.uid, initialWeights)
          .then(() => debugLog('💾 Nouveaux poids sauvegardés après changement'))
          .catch(err => console.error('❌ Erreur sauvegarde après changement:', err))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokensData, initialWeights, isLoadingWeights])

  /**
   * Ajuste un poids et redistribue proportionnellement sur les autres
   * Sauvegarde automatiquement dans Firebase (debounced 500ms)
   */
  const setWeight = (token, newWeight) => {
    isAdjustingWeightsRef.current = true
    const newWeights = redistributeWeights(weights, token, newWeight)
    setWeights(newWeights)
    
    // Sauvegarde différée (debounce) pour éviter trop d'écritures pendant l'ajustement
    if (!user?.uid) {
      isAdjustingWeightsRef.current = false
      return
    }

    // Annuler le timer précédent
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    
    // Sauvegarder après 600ms d'inactivité
    saveTimerRef.current = setTimeout(async () => {
      try {
        await savePortfolioWeights(user.uid, newWeights)
        debugLog('💾 Poids sauvegardés:', newWeights)
      } catch (error) {
        console.error('❌ Erreur sauvegarde poids:', error)
      } finally {
        isAdjustingWeightsRef.current = false
      }
    }, 600)
  }

  /**
   * Réinitialiser les poids à l'équilibre
   */
  const resetWeights = async () => {
    isAdjustingWeightsRef.current = true
    setWeights(initialWeights)
    
    // Annuler le debounce en cours
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    
    // Sauvegarder immédiatement les poids équitables
    if (user?.uid) {
      try {
        await savePortfolioWeights(user.uid, initialWeights)
        debugLog('💾 Poids réinitialisés et sauvegardés')
      } catch (error) {
        console.error('❌ Erreur sauvegarde reset:', error)
      } finally {
        isAdjustingWeightsRef.current = false
      }
    } else {
      isAdjustingWeightsRef.current = false
    }
  }

  // Cleanup du timer au démontage
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  // Calculs dérivés : construire apyMap puis calculer métriques
  const results = useMemo(() => {
    const apyMap = buildAPYMap(tokensData)
    return calculatePortfolioMetrics(capitalInitial, weights, apyMap)
  }, [capitalInitial, weights, tokensData])

  return {
    capitalInitial,
    setCapitalInitial,
    weights,
    setWeight,
    resetWeights,
    results,
    tokensData,
    isLoadingWeights
  }
}
