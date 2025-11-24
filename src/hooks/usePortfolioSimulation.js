/**
 * Hook de simulation de portfolio crypto
 * Calcule APY pondéré, valeur finale, profit selon poids et capital
 */

import { useState } from 'react'

// APY fixes par token (simulation)
const TOKEN_APY = {
  BTC: 0.15,   // 15%
  ETH: 0.20,   // 20%
  SOL: 0.35,   // 35%
  DOGE: -0.10  // -10%
}

/**
 * Hook de simulation de portfolio
 * @param {number} initialCapital - Capital de départ en $
 * @param {Object} initialWeights - Poids initiaux { BTC: 0.25, ETH: 0.40, ... }
 * @returns {Object} { weights, setWeight, capitalInitial, setCapitalInitial, results }
 */
export function usePortfolioSimulation(initialCapital = 1000, initialWeights = null) {
  // Poids par défaut équilibrés (25% chacun)
  const defaultWeights = {
    BTC: 0.25,
    ETH: 0.25,
    SOL: 0.25,
    DOGE: 0.25
  }

  const [capitalInitial, setCapitalInitial] = useState(initialCapital)
  const [weights, setWeights] = useState(initialWeights || defaultWeights)

  /**
   * Ajuste un poids et redistribue proportionnellement sur les autres
   * @param {string} token - Token à modifier
   * @param {number} newWeight - Nouveau poids (0-1)
   */
  const setWeight = (token, newWeight) => {
    // Borner entre 0 et 1
    const boundedWeight = Math.max(0, Math.min(1, newWeight))

    // Calculer la différence
    const oldWeight = weights[token]
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
    setWeights(defaultWeights)
  }

  // Calculs dérivés
  const results = calculateResults(capitalInitial, weights)

  return {
    capitalInitial,
    setCapitalInitial,
    weights,
    setWeight,
    resetWeights,
    results
  }
}

/**
 * Calcule les métriques du portfolio
 * @param {number} capital - Capital initial
 * @param {Object} weights - Poids par token
 * @returns {Object} { apyMoyen, valeurFinale, profit, rendementPct }
 */
function calculateResults(capital, weights) {
  // APY moyen pondéré
  const apyMoyen = Object.keys(weights).reduce((sum, token) => {
    const apy = TOKEN_APY[token] || 0
    return sum + (weights[token] * apy)
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
 * Récupère l'APY d'un token
 * @param {string} token - Symbole du token
 * @returns {number} APY (ex: 0.15 pour 15%)
 */
export function getTokenAPY(token) {
  return TOKEN_APY[token] || 0
}

/**
 * Récupère tous les APY
 * @returns {Object} { BTC: 0.15, ... }
 */
export function getAllAPY() {
  return { ...TOKEN_APY }
}
