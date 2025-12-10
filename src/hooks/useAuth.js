// Hook personnalisé pour la logique d'authentification
// Similaire à useResizablePanel : toute la logique métier est isolée ici
import { useState } from 'react'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import { markWalletOffline } from '../lib/database/xpService'
import { useAuthContext } from '../auth/AuthContext'

const WALLET_UID_PREFIX = 'wallet:'

const markCurrentUserOffline = async ({ reason = 'unspecified', onlyWallet = false } = {}) => {
  const currentUid = auth.currentUser?.uid
  if (!currentUid) {
    return false
  }
  if (onlyWallet && !currentUid.startsWith(WALLET_UID_PREFIX)) {
    return false
  }
  try {
    await markWalletOffline(currentUid)
    return true
  } catch (error) {
    console.warn('[Auth] Impossible de marquer le profil offline avant changement de session', {
      reason,
      uid: currentUid,
      error,
    })
    return false
  }
}

export function useAuth() {
  // On récupère l'état global depuis le contexte
  const { user, loading } = useAuthContext()
  
  // État local pour les erreurs
  const [error, setError] = useState(null)

  // Déconnexion
  const signOut = async () => {
    try {
      setError(null)
      await markCurrentUserOffline({ reason: 'manual-signout' })
      await firebaseSignOut(auth)
    } catch (err) {
      setError(err.message)
      console.error('Erreur de déconnexion:', err)
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    signOut,
  }
}
