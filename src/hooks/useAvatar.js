// Hook pour gérer l'avatar utilisateur avec fallback
// Utilise un cache local pour éviter de frapper l'URL Google à chaque rendu
import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import { useUserProfile } from './useUserProfile'
import { useAuth } from './useAuth'

const AVATAR_CACHE_PREFIX = 'avatar-cache-'

const getCacheKey = (uid) => `${AVATAR_CACHE_PREFIX}${uid}`

const readCachedAvatar = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeCachedAvatar = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignorer quota/localStorage désactivé
  }
}

const removeCachedAvatar = (key) => {
  try {
    localStorage.removeItem(key)
  } catch {
    // noop
  }
}

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onloadend = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(blob)
})

export function useAvatar() {
  const { user } = useAuth()
  const { profile } = useUserProfile()
  const membership = profile?.membership
  const isPremium = Boolean(membership?.active && membership?.tier === 'premium')
  const [inlineAvatar, setInlineAvatar] = useState(null)

  const firstName = useMemo(() => {
    return profile?.firstName || user?.displayName?.split(' ')[0] || 'Utilisateur'
  }, [profile?.firstName, user?.displayName])

  // Générer un avatar SVG avec l'initiale du prénom
  const generateFallbackAvatar = useCallback((size = 40) => {
    const initial = firstName.charAt(0).toUpperCase()
    const fontSize = Math.floor(size * 0.4)
    
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"%3E%3Ccircle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="%23666"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="white" font-size="${fontSize}" font-family="Arial"%3E${initial}%3C/text%3E%3C/svg%3E`
  }, [firstName])

  const updateInlineAvatar = useCallback((value) => {
    startTransition(() => {
      setInlineAvatar(value)
    })
  }, [])

  useEffect(() => {
    if (!user?.uid) {
      updateInlineAvatar(null)
      return
    }

    const cacheKey = getCacheKey(user.uid)
    const cached = readCachedAvatar(cacheKey)
    if (cached) {
      updateInlineAvatar(cached)
      return
    }

    if (!user.photoURL) {
      updateInlineAvatar(null)
      return
    }

    let cancelled = false

    fetch(user.photoURL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return res.blob()
      })
      .then(blobToDataUrl)
      .then((dataUrl) => {
        if (cancelled) return
        updateInlineAvatar(dataUrl)
        writeCachedAvatar(cacheKey, dataUrl)
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('Avatar distant indisponible, fallback appliqué:', err?.message || err)
        removeCachedAvatar(cacheKey)
        updateInlineAvatar(null)
      })

    return () => {
      cancelled = true
    }
  }, [updateInlineAvatar, user?.uid, user?.photoURL])

  const fallbackAvatar = useMemo(() => generateFallbackAvatar(), [generateFallbackAvatar])
  const avatarURL = inlineAvatar || fallbackAvatar

  // Gestionnaire d'erreur : bascule sur avatar SVG si la data URL échoue (très rare)
  const handleImageError = (e, size = 40) => {
    e.target.src = generateFallbackAvatar(size)
    e.target.onerror = null // Éviter les boucles infinies
  }

  return {
    avatarURL,
    generateFallbackAvatar,
    handleImageError,
    firstName,
    isPremium,
  }
}
