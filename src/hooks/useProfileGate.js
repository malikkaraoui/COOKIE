import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { useUserProfile } from './useUserProfile'
import { useWalletIdentity } from './useWalletIdentity'
import { useReownProfile } from './useReownProfile'
import { isReownProfileComplete } from '../lib/reown/profileStore'

function isFirebaseProfileIncomplete(profile) {
  if (!profile) return true
  const hasNames = Boolean(profile.firstName?.trim() && profile.lastName?.trim())
  const hasEmail = Boolean(profile.email?.trim())

  return !(hasNames && hasEmail)
}

export function useProfileGate() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile()
  const walletIdentity = useWalletIdentity()
  const { profile: reownProfile } = useReownProfile(walletIdentity?.address)

  const hasFirebaseUser = Boolean(user)
  const requiresWalletOnlyProfile = walletIdentity.isConnected && !hasFirebaseUser

  const needsFirebaseProfile = useMemo(() => {
    if (!hasFirebaseUser) return false
    if (profileLoading) return false
    return isFirebaseProfileIncomplete(profile)
  }, [hasFirebaseUser, profile, profileLoading])

  const needsReownProfile = useMemo(() => {
    if (!requiresWalletOnlyProfile) return false
    return !isReownProfileComplete(reownProfile)
  }, [requiresWalletOnlyProfile, reownProfile])

  const needsProfileCompletion = useMemo(() => {
    if (authLoading || profileLoading) return false
    return needsFirebaseProfile || needsReownProfile
  }, [authLoading, profileLoading, needsFirebaseProfile, needsReownProfile])

  return {
    needsProfileCompletion,
    needsFirebaseProfile,
    needsReownProfile,
  }
}
