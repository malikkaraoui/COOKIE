// Contexte pour gérer les tokens sélectionnés (max 4)
// Utilisé pour le drag & drop de Marmiton Communautaire vers Ma cuisine
// Synchronisation Firebase pour utilisateurs authentifiés, localStorage sinon
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { saveSelectedTokens, getSelectedTokens } from '../lib/database/userService'

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
    if (!user?.uid || userTokens.length === 0) return

    // localStorage (synchrone)
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(userTokens))
    } catch (e) {
      console.warn('Erreur écriture selectedTokens localStorage:', e)
    }

    // Firebase (asynchrone)
    saveSelectedTokens(user.uid, userTokens)
      .catch(err => console.error('Erreur sauvegarde tokens Firebase:', err))
  }, [userTokens, user?.uid])

  // Ajouter un token
  const addToken = (symbol) => {
    if (!user) return // Sécurité : pas d'ajout si non connecté
    
    setUserTokens(prev => {
      // Éviter doublons
      if (prev.includes(symbol)) return prev
      // Max 4 tokens
      if (prev.length >= MAX_TOKENS) {
        console.warn(`Maximum ${MAX_TOKENS} tokens`)
        return prev
      }
      return [...prev, symbol]
    })
  }

  // Retirer un token
  const removeToken = (symbol) => {
    if (!user) return // Sécurité : pas de retrait si non connecté
    setUserTokens(prev => prev.filter(s => s !== symbol))
  }

  // Vider la sélection
  const clearTokens = () => {
    if (!user) return // Sécurité
    setUserTokens([])
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
