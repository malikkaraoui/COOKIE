/**
 * Hook de simulation de portfolio crypto
 * Calcule APY pondéré, valeur finale, profit selon poids et capital
 * Utilise les tokens sélectionnés avec leurs deltaPct comme APY
 */

import { useState, useMemo } from 'react'

/**
 * Hook de simulation de portfolio dynamique
 * @param {number} initialCapital - Capital de départ en $
 * @param {Array} tokensData - Tableau de { symbol, deltaPct } depuis les tokens sélectionnés
 * @returns {Object} { weights, setWeight, capitalInitial, setCapitalInitial, results, tokensData }
 */
export function usePortfolioSimulation(initialCapital = 1000, tokensData = []) {
  const [capitalInitial, setCapitalInitial] = useState(initialCapital)

  // Initialiser les poids équitablement selon le nombre de tokens
  const initialWeights = useMemo(() => {
    if (tokensData.length === 0) return {}
    
    const equalWeight = 1 / tokensData.length
    return tokensData.reduce((acc, token) => {
      acc[token.symbol] = equalWeight
      return acc
    }, {})
  }, [tokensData])

  const [weights, setWeights] = useState(initialWeights)

  /**
   * Ajuste un poids et redistribue proportionnellement sur les autres
   * @param {string} token - Token à modifier
   * @param {number} newWeight - Nouveau poids (0-1)
   */
  const setWeight = (token, newWeight) => {
    // Borner entre 0 et 1
    const boundedWeight = Math.max(0, Math.min(1, newWeight))

    // Calculer la différence
    const oldWeight = weights[token] || 0
    const diff = boundedWeight - oldWeight

    // Si pas de changement, sortir
    if (Math.abs(diff) < 0.0001) return

    // Calculer la somme des autres poids
    const otherTokens = Object.keys(weights).filter(t => t !== token)
    const otherWeightsSum = otherTokens.reduce((sum, t) => sum + weights[t], 0)

    // Nouveau state
    const newWeights = { ...weights, [token]: boundedWeight }

    // Redistribuer proportionnellement sur les autres
    if (otherWeightsSum > 0) {
      otherTokens.forEach(t => {
        const proportion = weights[t] / otherWeightsSum
        const adjustment = -diff * proportion
        newWeights[t] = Math.max(0, weights[t] + adjustment)
      })
    } else {
      // Si tous les autres sont à 0, répartir équitablement
      const remainingWeight = 1 - boundedWeight
      const equalShare = remainingWeight / otherTokens.length
      otherTokens.forEach(t => {
        newWeights[t] = equalShare
      })
    }

    // Normaliser pour garantir somme = 1
    const totalWeight = Object.values(newWeights).reduce((sum, w) => sum + w, 0)
    if (totalWeight > 0) {
      Object.keys(newWeights).forEach(t => {
        newWeights[t] = newWeights[t] / totalWeight
      })
    }

    setWeights(newWeights)
  }

  /**
   * Réinitialiser les poids à l'équilibre
   */
  const resetWeights = () => {
    setWeights(initialWeights)
  }

  // Calculs dérivés
  const results = calculateResults(capitalInitial, weights, tokensData)

  return {
    capitalInitial,
    setCapitalInitial,
    weights,
    setWeight,
    resetWeights,
    results,
    tokensData
  }
}

/**
 * Calcule les métriques du portfolio
 * @param {number} capital - Capital initial
 * @param {Object} weights - Poids par token
 * @param {Array} tokensData - Données des tokens avec deltaPct
 * @returns {Object} { apyMoyen, valeurFinale, profit, rendementPct }
 */
function calculateResults(capital, weights, tokensData) {
  // Guard si tokensData n'est pas un tableau
  if (!Array.isArray(tokensData) || tokensData.length === 0) {
    return {
      apyMoyen: 0,
      apyMoyenPct: 0,
      valeurFinale: capital,
      profit: 0,
      rendementPct: 0
    }
  }

  // Créer un map symbol -> deltaPct pour accès rapide
  const apyMap = tokensData.reduce((acc, token) => {
    // deltaPct est déjà en %, on le convertit en décimal
    // Ex: +5% → 0.05
    acc[token.symbol] = (token.deltaPct || 0) / 100
    return acc
  }, {})

  // APY moyen pondéré
  const apyMoyen = Object.keys(weights).reduce((sum, symbol) => {
    const apy = apyMap[symbol] || 0
    return sum + (weights[symbol] * apy)
  }, 0)

  // Valeur finale après 1 an
  const valeurFinale = capital * (1 + apyMoyen)

  // Profit en $
  const profit = valeurFinale - capital

  // Rendement en %
  const rendementPct = apyMoyen * 100

  return {
    apyMoyen,
    apyMoyenPct: apyMoyen * 100,
    valeurFinale,
    profit,
    rendementPct
  }
}

/**
 * Récupère l'APY d'un token depuis tokensData
 * @param {Array} tokensData - Données des tokens
 * @param {string} symbol - Symbole du token
 * @returns {number} APY en % (ex: 5 pour 5%)
 */
export function getTokenAPY(tokensData, symbol) {
  if (!Array.isArray(tokensData)) return 0
  const token = tokensData.find(t => t.symbol === symbol)
  return token?.deltaPct || 0
}
