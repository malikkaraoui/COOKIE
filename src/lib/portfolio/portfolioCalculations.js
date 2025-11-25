/**
 * Logique métier pure - Calculs de portfolio crypto
 * Fonctions pures sans dépendances React
 * Réutilisables et testables
 */

const MIN_WEIGHT = 0.01 // 1% minimum par token

/**
 * Calcule l'APY moyen pondéré du portfolio
 * @param {Object} weights - Poids par token { BTC: 0.5, ETH: 0.5 }
 * @param {Object} apyMap - APY par token en décimal { BTC: 0.05, ETH: 0.03 }
 * @returns {number} APY moyen en décimal (ex: 0.04 pour 4%)
 */
export function calculateWeightedAPY(weights, apyMap) {
  if (!weights || !apyMap) return 0

  return Object.keys(weights).reduce((sum, symbol) => {
    const weight = weights[symbol] || 0
    const apy = apyMap[symbol] || 0
    return sum + (weight * apy)
  }, 0)
}

/**
 * Redistribue les poids proportionnellement quand un token change
 * Garantit somme = 1 et minimum 1% par token
 * @param {Object} weights - Poids actuels
 * @param {string} targetToken - Token à modifier
 * @param {number} newWeight - Nouveau poids (0-1)
 * @returns {Object} Nouveaux poids normalisés
 */
export function redistributeWeights(weights, targetToken, newWeight) {
  // Borner entre 1% et 100%
  const boundedWeight = Math.max(MIN_WEIGHT, Math.min(1, newWeight))

  // Calculer la différence
  const oldWeight = weights[targetToken] || MIN_WEIGHT
  const diff = boundedWeight - oldWeight

  // Si pas de changement significatif, retourner inchangé
  if (Math.abs(diff) < 0.0001) return weights

  // Calculer la somme des autres poids
  const otherTokens = Object.keys(weights).filter(t => t !== targetToken)
  const otherWeightsSum = otherTokens.reduce((sum, t) => sum + weights[t], 0)

  // Nouveau state
  const newWeights = { ...weights, [targetToken]: boundedWeight }

  // Redistribuer proportionnellement sur les autres (avec minimum 1%)
  if (otherWeightsSum > 0) {
    otherTokens.forEach(t => {
      const proportion = weights[t] / otherWeightsSum
      const adjustment = -diff * proportion
      newWeights[t] = Math.max(MIN_WEIGHT, weights[t] + adjustment)
    })
  } else {
    // Si tous les autres sont à 0, répartir équitablement (minimum 1%)
    const remainingWeight = 1 - boundedWeight
    const equalShare = Math.max(MIN_WEIGHT, remainingWeight / otherTokens.length)
    otherTokens.forEach(t => {
      newWeights[t] = equalShare
    })
  }

  // Normaliser pour garantir somme = 1
  return normalizeWeights(newWeights)
}

/**
 * Normalise les poids pour que la somme = 1
 * @param {Object} weights - Poids à normaliser
 * @returns {Object} Poids normalisés
 */
export function normalizeWeights(weights) {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)
  
  if (totalWeight === 0) return weights

  const normalized = {}
  Object.keys(weights).forEach(token => {
    normalized[token] = weights[token] / totalWeight
  })

  return normalized
}

/**
 * Calcule les métriques complètes du portfolio
 * @param {number} capital - Capital initial en $
 * @param {Object} weights - Poids par token
 * @param {Object} apyMap - APY par token en décimal
 * @returns {Object} { apyMoyen, apyMoyenPct, valeurFinale, profit, rendementPct }
 */
export function calculatePortfolioMetrics(capital, weights, apyMap) {
  // Guard si pas de données
  if (!capital || !weights || !apyMap) {
    return {
      apyMoyen: 0,
      apyMoyenPct: 0,
      valeurFinale: capital || 0,
      profit: 0,
      rendementPct: 0
    }
  }

  // APY moyen pondéré
  const apyMoyen = calculateWeightedAPY(weights, apyMap)

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
 * Initialise les poids équitablement pour une liste de tokens
 * @param {Array<string>} tokenSymbols - Liste des symboles
 * @returns {Object} Poids initiaux { BTC: 0.5, ETH: 0.5 }
 */
export function initializeEqualWeights(tokenSymbols) {
  if (!Array.isArray(tokenSymbols) || tokenSymbols.length === 0) {
    return {}
  }

  const equalWeight = 1 / tokenSymbols.length
  
  return tokenSymbols.reduce((acc, symbol) => {
    acc[symbol] = equalWeight
    return acc
  }, {})
}

/**
 * Vérifie si les poids sont valides (somme = 1, min 1%)
 * @param {Object} weights - Poids à valider
 * @returns {boolean}
 */
export function validateWeights(weights) {
  if (!weights || typeof weights !== 'object') return false

  const values = Object.values(weights)
  if (values.length === 0) return false

  // Vérifier minimum 1%
  const hasInvalidWeight = values.some(w => w < MIN_WEIGHT - 0.0001)
  if (hasInvalidWeight) return false

  // Vérifier somme = 1 (avec tolérance)
  const sum = values.reduce((acc, w) => acc + w, 0)
  return Math.abs(sum - 1) < 0.001
}
