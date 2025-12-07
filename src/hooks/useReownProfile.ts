import { useCallback, useEffect, useMemo, useState } from 'react'
import { getReownProfile, saveReownProfile, isReownProfileComplete } from '../lib/reown/profileStore'

export function useReownProfile(address?: string | null) {
  const normalizedAddress = useMemo(() => address?.toLowerCase() || null, [address])
  const [profile, setProfile] = useState(() => (normalizedAddress ? getReownProfile(normalizedAddress) : null))

  useEffect(() => {
    if (!normalizedAddress) {
      setProfile(null)
      return
    }
    setProfile(getReownProfile(normalizedAddress))
  }, [normalizedAddress])

  const updateProfile = useCallback(
    async (data: Record<string, unknown>) => {
      if (!normalizedAddress) return null
      const next = saveReownProfile(normalizedAddress, data)
      setProfile(next)
      return next
    },
    [normalizedAddress],
  )

  return {
    profile,
    updateProfile,
    isComplete: isReownProfileComplete(profile),
  }
}
