// Context d'authentification - gère l'état global de l'utilisateur connecté
// Pattern identique à NavigationContext : créer le context, le provider et le hook d'accès
import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'
import { createOrUpdateUserProfile } from '../lib/database/userService'
import { markWalletHeartbeat, markWalletOffline } from '../lib/database/xpService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Écoute les changements d'état d'authentification Firebase
  // S'exécute une seule fois au montage du composant
  useEffect(() => {
    let previousUid = null

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          await createOrUpdateUserProfile(currentUser)
        } catch (error) {
          console.error('Erreur lors de la sync du profil:', error)
        }

        try {
          await markWalletHeartbeat(currentUser.uid, {
            provider: currentUser.providerData?.[0]?.providerId || 'google'
          })
        } catch (error) {
          console.warn('Impossible de marquer le wallet comme actif:', error)
        }
      } else if (previousUid) {
        try {
          await markWalletOffline(previousUid)
        } catch (error) {
          console.warn('Impossible de marquer le wallet comme hors-ligne:', error)
        }
      }

      previousUid = currentUser?.uid || null
      setUser(currentUser)
      setLoading(false)
    })

    return () => {
      unsubscribe()
      if (previousUid) {
        markWalletOffline(previousUid).catch(() => {})
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook d'accès au contexte (comme useNavigation)
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext doit être utilisé dans un AuthProvider')
  }
  return context
}
