// Hook personnalisé pour gérer le profil utilisateur Realtime Database
// Synchronise automatiquement le profil à la connexion et permet les mises à jour
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import {
  getUserProfile,
  updateUserProfile,
  createOrUpdateUserProfile,
} from '../lib/database/userService'

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  // Synchronise le profil depuis la base de données quand l'utilisateur se connecte
  useEffect(() => {
    let isMounted = true

    async function syncProfile() {
      if (authLoading) return
      
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        setError(null)
        
        // OPTIMISATION : Récupérer uniquement le profil depuis la base
        // La création/mise à jour se fait automatiquement lors du login via AuthContext
        let userProfile = await getUserProfile(user.uid)

        // Filet de sécurité : si le profil n'existe pas encore (latence auth → DB),
        // on force une resynchronisation côté base puis on retente la lecture.
        if (!userProfile) {
          await createOrUpdateUserProfile(user)
          userProfile = await getUserProfile(user.uid)
        }

        if (isMounted) {
          setProfile(userProfile)
          setLoading(false)
        }
      } catch (err) {
        console.error('Erreur de synchronisation du profil:', err)
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    syncProfile()

    return () => {
      isMounted = false
    }
  }, [user, authLoading])

  // Fonction pour mettre à jour le profil utilisateur
  const updateProfile = async (data) => {
    if (!user) {
      throw new Error('Utilisateur non connecté')
    }

    try {
      setUpdating(true)
      setError(null)
      
      // Mise à jour dans la base de données
      await updateUserProfile(user.uid, data)
      
      // Recharger le profil pour refléter les changements
      const updatedProfile = await getUserProfile(user.uid)
      setProfile(updatedProfile)
      
      setUpdating(false)
      return updatedProfile
    } catch (err) {
      console.error('Erreur de mise à jour du profil:', err)
      setError(err.message)
      setUpdating(false)
      throw err
    }
  }

  // Fonction pour rafraîchir manuellement le profil
  const refreshProfile = async () => {
    if (!user) return

    try {
      setError(null)
      const freshProfile = await getUserProfile(user.uid)
      setProfile(freshProfile)
      return freshProfile
    } catch (err) {
      console.error('Erreur de rafraîchissement du profil:', err)
      setError(err.message)
      throw err
    }
  }

  return {
    profile,           // Profil complet depuis la base de données
    loading,           // Chargement initial du profil
    error,             // Erreur éventuelle
    updating,          // Mise à jour en cours
    updateProfile,     // Fonction pour mettre à jour le profil
    refreshProfile,    // Fonction pour rafraîchir manuellement
  }
}
