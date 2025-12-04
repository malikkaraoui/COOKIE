// Hook personnalisé pour la logique d'authentification
// Similaire à useResizablePanel : toute la logique métier est isolée ici
import { useState } from 'react'
import { signInWithPopup, signInWithRedirect, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { useAuthContext } from '../auth/AuthContext'

export function useAuth() {
  // On récupère l'état global depuis le contexte
  const { user, loading } = useAuthContext()
  
  // État local pour les erreurs
  const [error, setError] = useState(null)

  const shouldFallbackToRedirect = (code) => {
    return [
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
      'auth/web-storage-unsupported',
      'auth/network-request-failed'
    ].includes(code)
  }

  // Connexion avec Google via popup (fallback redirect si popup impossible)
  const signInWithGoogle = async () => {
    try {
      setError(null)
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (err) {
      setError(err.message)
      console.error('Erreur de connexion Google (popup):', err)

      if (err?.code && shouldFallbackToRedirect(err.code)) {
        try {
          console.info('Fallback Google Sign-In via redirect à cause du code:', err.code)
          await signInWithRedirect(auth, googleProvider)
          return null
        } catch (redirectError) {
          setError(redirectError.message)
          console.error('Erreur lors du fallback redirect:', redirectError)
          throw redirectError
        }
      }

      throw err
    }
  }

  // Déconnexion
  const signOut = async () => {
    try {
      setError(null)
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
    signInWithGoogle,
    signOut,
  }
}
