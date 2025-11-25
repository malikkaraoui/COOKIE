// Contexte pour gérer les tokens sélectionnés (max 4)
// Utilisé pour le drag & drop de Marmiton Communautaire vers Ma cuisine
// Synchronisation Firebase pour utilisateurs authentifiés, localStorage sinon
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { saveSelectedTokens, getSelectedTokens, savePortfolioWeights } from '../lib/database/userService'
import { migrateSelectedTokens } from '../lib/database/migrateSelectedTokens'

const SelectedTokensContext = createContext(null)

const MAX_TOKENS = 4
const LS_KEY = 'selectedTokens_v1'

export function SelectedTokensProvider({ children }) {
  const { user } = useAuth()
  const [userTokens, setUserTokens] = useState([])

  // Charger depuis Firebase quand l'utilisateur se connecte
  useEffect(() => {
    if (!user?.uid) {
      // Pas d'utilisateur : pas de tokens à charger
      localStorage.removeItem(LS_KEY)
      return
    }

    // Migration one-time (convertir objet Firebase en array)
    migrateSelectedTokens(user.uid)

    // Utilisateur connecté : charger depuis Firebase
    getSelectedTokens(user.uid)
      .then(tokens => {
        setUserTokens(tokens && tokens.length > 0 ? tokens : [])
      })
      .catch(err => {
        console.error('Erreur chargement tokens Firebase:', err)
        setUserTokens([])
      })
  }, [user?.uid])

  // Les tokens affichés : vide si pas connecté, sinon userTokens
  const selectedTokens = user ? userTokens : []

  // Sauvegarder vers Firebase ET localStorage à chaque modification
  useEffect(() => {
    if (!user?.uid) return

    // localStorage (synchrone)
    try {
      if (userTokens.length > 0) {
        localStorage.setItem(LS_KEY, JSON.stringify(userTokens))
      } else {
        localStorage.removeItem(LS_KEY)
      }
    } catch (e) {
      console.warn('Erreur écriture selectedTokens localStorage:', e)
    }

    // Firebase (asynchrone) - TOUJOURS sauvegarder, même si vide
    saveSelectedTokens(user.uid, userTokens)
      .catch(err => console.error('Erreur sauvegarde tokens Firebase:', err))
  }, [userTokens, user?.uid])

  // Ajouter un token
  const addToken = (symbolWithSource) => {
    if (!user) {
      console.warn('Utilisateur non connecté')
      return { success: false, reason: 'not_logged_in' }
    }
    
    // Extraire le symbole (avant le ':')
    const symbol = symbolWithSource.split(':')[0]
    
    // Vérifier si le symbole existe déjà (peu importe la source)
    const symbolExists = userTokens.some(token => token.split(':')[0] === symbol)
    if (symbolExists) {
      console.warn(`Le token ${symbol} est déjà dans votre cuisine`)
      return { success: false, reason: 'already_exists', symbol }
    }
    
    // Éviter doublons exacts (même symbol:source)
    if (userTokens.includes(symbolWithSource)) {
      return { success: false, reason: 'already_exists', symbol }
    }
    
    // Max 4 tokens
    if (userTokens.length >= MAX_TOKENS) {
      console.warn(`Maximum ${MAX_TOKENS} tokens`)
      return { success: false, reason: 'max_reached', maxTokens: MAX_TOKENS }
    }
    
    // Ajouter le token
    setUserTokens(prev => [...prev, symbolWithSource])
    return { success: true, symbol }
  }

  // Retirer un token
  const removeToken = async (symbolWithSource) => {
    if (!user) return // Sécurité : pas de retrait si non connecté
    
    const newTokens = userTokens.filter(s => s !== symbolWithSource)
    setUserTokens(newTokens)
    
    // Nettoyer aussi portfolioWeights pour ce token
    if (user?.uid) {
      try {
        // Récupérer les poids actuels depuis Firebase
        const { getPortfolioWeights } = await import('../lib/database/userService')
        const currentWeights = await getPortfolioWeights(user.uid)
        
        if (currentWeights) {
          // Extraire le symbole du token supprimé
          const removedSymbol = symbolWithSource.split(':')[0]
          
          // Créer nouveau objet sans le token supprimé
          const updatedWeights = { ...currentWeights }
          delete updatedWeights[removedSymbol]
          
          // Sauvegarder si des poids restent
          if (Object.keys(updatedWeights).length > 0) {
            await savePortfolioWeights(user.uid, updatedWeights)
            console.log('🗑️ Poids supprimés pour', removedSymbol)
          } else {
            // Aucun token restant → supprimer portfolioWeights complètement
            await savePortfolioWeights(user.uid, null)
            console.log('🗑️ Tous les poids supprimés')
          }
        }
      } catch (error) {
        console.error('❌ Erreur nettoyage portfolioWeights:', error)
      }
    }
  }

  // Vider la sélection
  const clearTokens = async () => {
    if (!user) return // Sécurité
    setUserTokens([])
    
    // Supprimer aussi tous les poids
    if (user?.uid) {
      try {
        await savePortfolioWeights(user.uid, null)
        console.log('🗑️ Tous les poids supprimés')
      } catch (error) {
        console.error('❌ Erreur nettoyage portfolioWeights:', error)
      }
    }
  }

  const value = {
    selectedTokens,
    addToken,
    removeToken,
    clearTokens,
    isFull: selectedTokens.length >= MAX_TOKENS,
    count: selectedTokens.length,
    maxTokens: MAX_TOKENS
  }

  return (
    <SelectedTokensContext.Provider value={value}>
      {children}
    </SelectedTokensContext.Provider>
  )
}

export function useSelectedTokens() {
  const ctx = useContext(SelectedTokensContext)
  if (!ctx) throw new Error('useSelectedTokens doit être dans SelectedTokensProvider')
  return ctx
}
