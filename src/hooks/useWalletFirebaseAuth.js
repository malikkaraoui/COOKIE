import { useCallback, useEffect, useRef, useState } from 'react'
import { signInWithCustomToken, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import { useWalletIdentity } from './useWalletIdentity'
import { useAuth } from './useAuth'
import { requestWalletCustomToken } from '../lib/walletCustomToken'
import { CONTACT_INFO_POLICY, updateUserProfile } from '../lib/database/userService'
import { getReownProfile } from '../lib/reown/profileStore'
import { markWalletOffline } from '../lib/database/xpService'

const WALLET_UID_PREFIX = 'wallet:'

const logInfo = (...args) => console.info('[WalletAuth]', ...args)
const logWarn = (...args) => console.warn('[WalletAuth]', ...args)
const logError = (...args) => console.error('[WalletAuth]', ...args)

const hasBasicContactInfo = (profileLike = {}) => {
  const firstName = typeof profileLike.firstName === 'string' ? profileLike.firstName.trim() : ''
  const lastName = typeof profileLike.lastName === 'string' ? profileLike.lastName.trim() : ''
  const email = typeof profileLike.email === 'string' ? profileLike.email.trim() : ''
  return Boolean(firstName && lastName && email)
}

export function useWalletFirebaseAuth() {
  const walletIdentity = useWalletIdentity()
  const { user, loading: authLoading } = useAuth()
  const [status, setStatus] = useState('idle')
  const inflightRef = useRef(false)
  const [retryToken, setRetryToken] = useState(0)
  const syncedWalletRef = useRef(null)

  const markWalletSessionOffline = useCallback(async (uid, context) => {
    if (!uid?.startsWith(WALLET_UID_PREFIX)) {
      return
    }
    try {
      await markWalletOffline(uid)
      logInfo('Wallet marqué hors-ligne', { uid, context })
    } catch (error) {
      logWarn('Impossible de marquer le wallet hors-ligne', { uid, context, error })
    }
  }, [])

  const signOutWalletSession = useCallback(
    async (context, uidHint = null) => {
      const targetUid = uidHint ?? auth.currentUser?.uid ?? null
      if (targetUid) {
        await markWalletSessionOffline(targetUid, context)
      }
      return firebaseSignOut(auth)
    },
    [markWalletSessionOffline],
  )

  const syncWalletProfileToRealtimeDb = useCallback(async (walletAddress) => {
    const currentUser = auth.currentUser
    if (!walletAddress || !currentUser || !currentUser.uid?.startsWith(WALLET_UID_PREFIX)) {
      logWarn('Sync ignorée : contexte invalide', {
        hasWalletAddress: Boolean(walletAddress),
        uid: currentUser?.uid,
      })
      return
    }

    const normalizedAddress = walletAddress.toLowerCase()
    if (syncedWalletRef.current === normalizedAddress) {
      logInfo('Sync déjà effectuée pour ce wallet, on saute', { walletAddress: normalizedAddress })
      return
    }

    const localProfile = getReownProfile(normalizedAddress)

    const payload = {
      walletAddress: normalizedAddress,
      authProvider: 'wallet',
      contactInfoPolicyVersion: CONTACT_INFO_POLICY.MANDATORY_V1,
    }

    if (localProfile) {
      if (localProfile.firstName?.trim()) {
        payload.firstName = localProfile.firstName.trim()
      }
      if (localProfile.lastName?.trim()) {
        payload.lastName = localProfile.lastName.trim()
      }
      if (localProfile.email?.trim()) {
        payload.email = localProfile.email.trim()
      }
      if (localProfile.birthDate) {
        payload.birthDate = localProfile.birthDate
      }

      const contactInfoCompleted =
        localProfile.contactInfoCompleted ?? hasBasicContactInfo(localProfile)
      payload.contactInfoCompleted = contactInfoCompleted
    }

    try {
      logInfo('Sync profil Reown → Realtime DB', {
        uid: currentUser.uid,
        walletAddress: normalizedAddress,
        hasLocalProfile: Boolean(localProfile),
      })
      await updateUserProfile(currentUser.uid, payload)
      syncedWalletRef.current = normalizedAddress
      logInfo('Sync profil terminée', { uid: currentUser.uid })
    } catch (error) {
      logWarn('Impossible de synchroniser le profil wallet vers Firebase', error)
    }
  }, [])

  useEffect(() => {
    if (!walletIdentity.isConnected) {
      syncedWalletRef.current = null
    }
  }, [walletIdentity.isConnected])

  useEffect(() => {
    const walletAddress = walletIdentity.address?.toLowerCase() || null
    const walletUid = walletAddress ? `${WALLET_UID_PREFIX}${walletAddress}` : null

    logInfo('Changement état wallet', {
      isConnected: walletIdentity.isConnected,
      walletAddress,
      firebaseUid: user?.uid,
      authLoading,
    })

    if (!walletIdentity.isConnected || !walletUid) {
      if (!authLoading && user?.uid?.startsWith(WALLET_UID_PREFIX)) {
        signOutWalletSession('wallet-disconnected', user.uid).catch((error) => {
          logWarn('Impossible de déconnecter Firebase après déconnexion wallet', error)
        })
      }
      logInfo('Wallet déconnecté : retour à idle')
      setStatus('idle')
      return
    }

    if (authLoading) {
      logInfo('Auth Firebase encore en chargement, on attend')
      return
    }

    if (user) {
      if (user.uid === walletUid) {
        logInfo('Utilisateur Firebase déjà lié à ce wallet', { uid: user.uid })
        setStatus('linked')
        return
      }

      if (!user.uid.startsWith(WALLET_UID_PREFIX)) {
        logInfo('Utilisateur Firebase courant non-wallet, on ne relie pas automatiquement', { uid: user.uid })
        setStatus('skipped')
        return
      }

      if (!inflightRef.current) {
        inflightRef.current = true
        logInfo('Déconnexion Firebase pour re-lier le wallet', { currentUid: user.uid, targetUid: walletUid })
        signOutWalletSession('relink-wallet', user.uid)
          .catch((error) => {
            logWarn('Erreur lors du signOut Firebase pour re-lier un wallet', error)
          })
          .finally(() => {
            inflightRef.current = false
          })
      }
      return
    }

    if (inflightRef.current) {
      return
    }

    inflightRef.current = true

    ;(async () => {
      try {
        logInfo('Début liaison wallet → Firebase', { walletUid })
        setStatus('request-token')
        const targetAddress = walletAddress || walletIdentity.address
        logInfo('Demande du custom token Firebase', { walletAddress: targetAddress })
        const { token } = await requestWalletCustomToken(targetAddress)
        logInfo('Custom token reçu', { hasToken: Boolean(token) })

        setStatus('firebase-signin')
        await signInWithCustomToken(auth, token)
        logInfo('Connexion Firebase via custom token réussie', { uid: auth.currentUser?.uid })
        await syncWalletProfileToRealtimeDb(targetAddress)
        setStatus('linked')
        logInfo('Liaison wallet terminée', { uid: auth.currentUser?.uid })
      } catch (error) {
        logError('Liaison échouée', error)
        setStatus(`error:${error.code || error.message || 'unknown'}`)
        setTimeout(() => setRetryToken((value) => value + 1), 1500)
      } finally {
        inflightRef.current = false
      }
    })()
  }, [walletIdentity.isConnected, walletIdentity.address, user, authLoading, retryToken, syncWalletProfileToRealtimeDb, signOutWalletSession])

  return { status }
}
