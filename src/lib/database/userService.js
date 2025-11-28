// Service Realtime Database pour la gestion des utilisateurs
// Architecture simple avec Firebase Auth UID comme clé unique
import { ref, get, set, update, onValue } from 'firebase/database'
import { db } from '../../config/firebase'

/**
 * Extrait le prénom depuis le displayName de Google
 * Gère les cas : "Malik Karaoui" → "Malik", "Jean-Pierre Dupont" → "Jean-Pierre"
 */
export function extractFirstName(displayName) {
  if (!displayName) return ''
  const parts = displayName.trim().split(' ')
  return parts[0] || ''
}

/**
 * Extrait le nom de famille depuis le displayName de Google
 * Gère les cas : "Malik Karaoui" → "Karaoui", "Jean-Pierre Dupont" → "Dupont"
 */
export function extractLastName(displayName) {
  if (!displayName) return ''
  const parts = displayName.trim().split(' ')
  return parts.slice(1).join(' ') || ''
}

/**
 * Crée ou met à jour le profil utilisateur dans Realtime Database
 * Appelé automatiquement lors de la première connexion Google
 * 
 * @param {Object} user - Objet user de Firebase Auth
 * @returns {Promise<void>}
 */
export async function createOrUpdateUserProfile(user) {
  if (!user || !user.uid) {
    throw new Error('User object is required with uid')
  }

  const userRef = ref(db, `users/${user.uid}`)
  
  try {
    // Vérifier si le profil existe déjà
    const snapshot = await get(userRef)
    const now = Date.now()
    
    if (snapshot.exists()) {
      // Mise à jour : lastLoginAt, photoURL ET nom/prénom (au cas où changés sur Google)
      await update(userRef, {
        firstName: extractFirstName(user.displayName),
        lastName: extractLastName(user.displayName),
        photoURL: user.photoURL || null,
        lastLoginAt: now,
        updatedAt: now,
      })
    } else {
      // Création : nouveau profil avec toutes les données de base
      await set(userRef, {
        email: user.email || '',
        firstName: extractFirstName(user.displayName),
        lastName: extractLastName(user.displayName),
        photoURL: user.photoURL || null,
        birthDate: null, // À renseigner par l'utilisateur
        authProvider: 'google',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        isActive: true,
      })
    }
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du profil:', error)
    throw error
  }
}

/**
 * Récupère le profil utilisateur depuis Realtime Database
 * 
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<Object|null>} - Données du profil ou null si non trouvé
 */
export async function getUserProfile(uid) {
  if (!uid) {
    throw new Error('UID is required')
  }

  const userRef = ref(db, `users/${uid}`)
  
  try {
    const snapshot = await get(userRef)
    
    if (snapshot.exists()) {
      return {
        uid,
        ...snapshot.val(),
      }
    }
    
    return null
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    throw error
  }
}

/**
 * Met à jour les informations du profil utilisateur
 * 
 * @param {string} uid - Firebase Auth UID
 * @param {Object} data - Données à mettre à jour (firstName, lastName, birthDate, etc.)
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, data) {
  if (!uid) {
    throw new Error('UID is required')
  }

  const userRef = ref(db, `users/${uid}`)
  
  try {
    // Convertir Date en timestamp si présent
    const processedData = { ...data }
    if (processedData.birthDate instanceof Date) {
      processedData.birthDate = processedData.birthDate.toISOString()
    }
    
    // Ajouter automatiquement le timestamp de mise à jour
    await update(userRef, {
      ...processedData,
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    throw error
  }
}

/**
 * Calcule l'âge depuis une date de naissance
 * 
 * @param {Date|string} birthDate - Date de naissance (format ISO ou objet Date)
 * @returns {number|null} - Âge en années ou null si invalide
 */
export function calculateAge(birthDate) {
  if (!birthDate) return null
  
  const birth = new Date(birthDate)
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  // Ajuster si l'anniversaire n'est pas encore passé cette année
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age >= 0 ? age : null
}

/**
 * Sauvegarde les tokens sélectionnés (Ma cuisine) pour un utilisateur
 * Structure: /users/{uid}/selectedTokens: ["BTC", "ETH", ...]
 * 
 * @param {string} uid - User ID Firebase Auth
 * @param {Array<string>} tokens - Liste des symboles de tokens (max 4)
 * @returns {Promise<void>}
 */
export async function saveSelectedTokens(uid, tokens) {
  if (!uid) throw new Error('UID requis')
  if (!Array.isArray(tokens)) throw new Error('tokens doit être un tableau')
  
  const tokensRef = ref(db, `users/${uid}/selectedTokens`)
  const cleanTokens = tokens.slice(0, 4).filter(Boolean) // Max 4 tokens, filtrer null
  
  // Si array vide, écrire null pour éviter objet {}
  await set(tokensRef, cleanTokens.length > 0 ? cleanTokens : null)
}

/**
 * Récupère les tokens sélectionnés pour un utilisateur
 * 
 * @param {string} uid - User ID Firebase Auth
 * @returns {Promise<Array<string>>} - Liste des symboles de tokens
 */
export async function getSelectedTokens(uid) {
  if (!uid) return []
  
  const tokensRef = ref(db, `users/${uid}/selectedTokens`)
  const snapshot = await get(tokensRef)
  
  if (snapshot.exists()) {
    const data = snapshot.val()
    
    // Firebase peut retourner un objet {0: "BTC", 1: "ETH"} au lieu d'un array
    if (Array.isArray(data)) {
      return data.filter(Boolean) // Filtrer les valeurs null/undefined
    }
    
    // Convertir objet en array si nécessaire
    if (typeof data === 'object' && data !== null) {
      return Object.values(data).filter(Boolean)
    }
  }
  
  return []
}

/**
 * Enregistre le vote d'un utilisateur pour une question quotidienne
 * Structure: /users/{uid}/votes/{questionId}: { choice, votedAt }
 * 
 * @param {string} uid - User ID Firebase Auth
 * @param {string} questionId - ID unique de la question (ex: "Q-2025-11-24")
 * @param {string} choice - Choix de l'utilisateur ("prudent" ou "risque")
 * @returns {Promise<void>}
 */
export async function saveUserVote(uid, questionId, choice) {
  if (!uid) throw new Error('UID requis')
  if (!questionId) throw new Error('questionId requis')
  if (!choice) throw new Error('choice requis')
  
  const voteRef = ref(db, `users/${uid}/votes/${questionId}`)
  
  await set(voteRef, {
    choice,
    votedAt: Date.now()
  })
}

/**
 * Récupère le vote d'un utilisateur pour une question spécifique
 * 
 * @param {string} uid - User ID Firebase Auth
 * @param {string} questionId - ID unique de la question
 * @returns {Promise<Object|null>} - { choice, votedAt } ou null si pas de vote
 */
export async function getUserVote(uid, questionId) {
  if (!uid || !questionId) return null
  
  const voteRef = ref(db, `users/${uid}/votes/${questionId}`)
  const snapshot = await get(voteRef)
  
  return snapshot.exists() ? snapshot.val() : null
}

/**
 * Sauvegarde les poids personnalisés du portfolio utilisateur
 * Structure: /users/{uid}/portfolioWeights: { BTC: 0.5, ETH: 0.3, SOL: 0.2 }
 * 
 * @param {string} uid - User ID Firebase Auth
 * @param {Object} weights - Poids par token { BTC: 0.5, ETH: 0.5 }
 * @returns {Promise<void>}
 */
export async function savePortfolioWeights(uid, weights) {
  if (!uid) throw new Error('UID requis')
  if (!weights || typeof weights !== 'object') throw new Error('weights doit être un objet')
  
  const weightsRef = ref(db, `users/${uid}/portfolioWeights`)
  
  await set(weightsRef, weights)
}

/**
 * Récupère les poids personnalisés du portfolio utilisateur
 * 
 * @param {string} uid - User ID Firebase Auth
 * @returns {Promise<Object|null>} - { BTC: 0.5, ETH: 0.5 } ou null si non défini
 */
export async function getPortfolioWeights(uid) {
  if (!uid) return null
  
  const weightsRef = ref(db, `users/${uid}/portfolioWeights`)
  const snapshot = await get(weightsRef)
  
  return snapshot.exists() ? snapshot.val() : null
}

/**
 * Récupère le capital initial du simulateur (« Ma Cuisine »)
 * Valeur par défaut : 1000
 *
 * @param {string} uid
 * @returns {Promise<number>} - Capital initial en dollars
 */
export async function getInitialCapital(uid) {
  if (!uid) return 1000

  const capitalRef = ref(db, `users/${uid}/portfolioSettings/capitalInitial`)
  const snapshot = await get(capitalRef)

  if (snapshot.exists()) {
    const value = snapshot.val()
    const numericValue = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(numericValue) ? numericValue : 1000
  }

  return 1000
}

/**
 * Sauvegarde le capital initial du simulateur
 * Stocke également un timestamp pour debugging
 *
 * @param {string} uid
 * @param {number} capital
 */
export async function saveInitialCapital(uid, capital) {
  if (!uid) throw new Error('UID is required')

  const capitalRef = ref(db, `users/${uid}/portfolioSettings`)
  const numericValue = Number(capital)

  if (!Number.isFinite(numericValue)) {
    throw new Error('capital must be a valid number')
  }

  await update(capitalRef, {
    capitalInitial: numericValue,
    capitalUpdatedAt: Date.now(),
  })
}

/**
 * Écoute en temps réel le capital initial depuis Firebase.
 * Retourne une fonction pour se désabonner.
 *
 * @param {string} uid
 * @param {(value: number|null) => void} callback
 * @returns {() => void}
 */
export function subscribeInitialCapital(uid, callback) {
  if (!uid) {
    return () => {}
  }

  const capitalRef = ref(db, `users/${uid}/portfolioSettings/capitalInitial`)
  const unsubscribe = onValue(capitalRef, (snapshot) => {
    if (!callback) return
    if (snapshot.exists()) {
      callback(snapshot.val())
    } else {
      callback(null)
    }
  })

  return () => unsubscribe()
}
