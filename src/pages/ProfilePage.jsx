// Page Profil utilisateur
// Affiche les informations du profil et permet de saisir la date de naissance
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { useAvatar } from '../hooks/useAvatar'
import { calculateAge } from '../lib/database/userService'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, loading, updateProfile } = useUserProfile()
  const { avatarURL, handleImageError } = useAvatar()
  
  const [birthDate, setBirthDate] = useState('')
  const [message, setMessage] = useState('')
  const [updating, setUpdating] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!birthDate) {
      setMessage('❌ Veuillez sélectionner une date de naissance')
      return
    }

    setUpdating(true)
    try {
      await updateProfile({
        birthDate: new Date(birthDate),
      })
      setMessage('✓ Date de naissance enregistrée !')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Erreur mise à jour profil:', err)
      setMessage(`❌ Erreur: ${err.code || err.message}`)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Chargement du profil...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          Vous devez être connecté pour accéder à votre profil.
        </div>
      </div>
    )
  }

  const hasBirthDate = profile?.birthDate
  const age = hasBirthDate ? calculateAge(new Date(profile.birthDate)) : null
  const isPremium = Boolean(profile?.membership?.active && profile?.membership?.tier === 'premium')

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Photo de profil + Nom/Prénom centrés */}
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            <img 
              src={avatarURL} 
              alt={profile?.firstName || 'Profil'} 
              className="profile-avatar-large"
              onError={(e) => handleImageError(e, 120)}
            />
            {isPremium && (
              <span 
                className="premium-badge premium-badge--lg"
                aria-label="Utilisateur premium"
                title="COOKIE Premium actif"
              >
                ★
              </span>
            )}
          </div>
          <h2 className="profile-name">{profile?.firstName} {profile?.lastName}</h2>
          
          {/* Si date de naissance existe : afficher l'âge */}
          {hasBirthDate && age !== null && (
            <p className="profile-age">{age} ans</p>
          )}
        </div>

        {/* Si PAS de date de naissance : afficher le formulaire */}
        {!hasBirthDate && (
          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="birthDate" className="form-label">
                Date de naissance
              </label>
              <input 
                id="birthDate"
                type="date" 
                className="form-input" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              <span className="form-hint">Cette information reste privée</span>
            </div>

            {message && (
              <div className={`form-message ${message.includes('✓') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className="form-button" 
              disabled={updating}
            >
              {updating ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
