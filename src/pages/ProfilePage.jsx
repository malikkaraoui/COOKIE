// Page Profil utilisateur
// Affiche les informations du profil et permet de saisir la date de naissance
import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppKitAccount } from '@reown/appkit/react'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { useAvatar } from '../hooks/useAvatar'
import { calculateAge, extractFirstName, extractLastName } from '../lib/database/userService'
import { useWalletIdentity } from '../hooks/useWalletIdentity'
import { useReownProfile } from '../hooks/useReownProfile'
import { AppKitConnectButton } from '../components/auth/AppKitConnectButton'
import './ProfilePage.css'
import XpProgressBar from '../components/XpProgressBar'

const profileLogInfo = (...args) => console.info('[ProfilePage]', ...args)
const profileLogWarn = (...args) => console.warn('[ProfilePage]', ...args)
const profileLogError = (...args) => console.error('[ProfilePage]', ...args)

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, updateProfile } = useUserProfile()
  const { avatarURL, handleImageError } = useAvatar()
  const walletIdentity = useWalletIdentity()
  const { profile: reownProfile, updateProfile: updateReownProfile } = useReownProfile(walletIdentity.address)
  const appKitAccount = useAppKitAccount({ namespace: 'eip155' })
  const location = useLocation()
  const navigate = useNavigate()

  const forcedSetup = useMemo(() => new URLSearchParams(location.search).get('setup') === '1', [location.search])

  const baseProfile = user ? profile : reownProfile
  const baseFirstName = useMemo(() => {
    if (baseProfile?.firstName) return baseProfile.firstName
    if (user?.displayName) return extractFirstName(user.displayName)
    const username = appKitAccount?.embeddedWalletInfo?.user?.username
    if (username) return username.split(' ')[0]
    return ''
  }, [baseProfile?.firstName, user?.displayName, appKitAccount?.embeddedWalletInfo?.user?.username])

  const baseLastName = useMemo(() => {
    if (baseProfile?.lastName) return baseProfile.lastName
    if (user?.displayName) return extractLastName(user.displayName)
    return ''
  }, [baseProfile?.lastName, user?.displayName])

  const baseEmail = useMemo(() => {
    return (
      baseProfile?.email ||
      user?.email ||
      appKitAccount?.embeddedWalletInfo?.user?.email ||
      ''
    )
  }, [baseProfile?.email, user?.email, appKitAccount?.embeddedWalletInfo?.user?.email])

  const baseBirthDate = useMemo(() => {
    if (!baseProfile?.birthDate) return ''
    try {
      return new Date(baseProfile.birthDate).toISOString().split('T')[0]
    } catch {
      return ''
    }
  }, [baseProfile?.birthDate])

  const [firstName, setFirstName] = useState(baseFirstName)
  const [lastName, setLastName] = useState(baseLastName)
  const [email, setEmail] = useState(baseEmail)
  const [birthDate, setBirthDate] = useState(baseBirthDate)
  const [message, setMessage] = useState('')
  const [updating, setUpdating] = useState(false)
  const isProfileComplete = Boolean(firstName?.trim() && lastName?.trim() && email?.trim())

  useEffect(() => {
    if (forcedSetup && isProfileComplete) {
      navigate('/profile', { replace: true })
    }
  }, [forcedSetup, isProfileComplete, navigate])

  useEffect(() => {
    setFirstName(baseFirstName)
  }, [baseFirstName])

  useEffect(() => {
    setLastName(baseLastName)
  }, [baseLastName])

  useEffect(() => {
    setEmail(baseEmail)
  }, [baseEmail])

  useEffect(() => {
    setBirthDate(baseBirthDate)
  }, [baseBirthDate])

  const handleSave = async (e) => {
    e.preventDefault()

    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    const trimmedEmail = email.trim()

    profileLogInfo('Tentative de sauvegarde du profil', {
      hasFirebaseUser: Boolean(user),
      walletConnected: walletIdentity.isConnected,
      forcedSetup,
    })

    if (!trimmedFirst || !trimmedLast || !trimmedEmail) {
      setMessage('❌ Nom, prénom et email sont obligatoires')
      profileLogWarn('Échec validation profil : champs requis manquants')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setMessage('❌ Email invalide, merci de vérifier le format')
      profileLogWarn('Échec validation profil : email invalide', { emailSample: trimmedEmail.slice(0, 3) + '***' })
      return
    }

    setUpdating(true)
    try {
      const firebasePayload = {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        contactInfoCompleted: true,
        ...(birthDate ? { birthDate: new Date(birthDate) } : {}),
      }

      const reownPayload = {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        contactInfoCompleted: true,
        birthDate: birthDate || undefined,
      }

      const promises = []
      profileLogInfo('Envoi des mises à jour profil', {
        pushToFirebase: Boolean(user),
        pushToReown: walletIdentity.isConnected,
      })
      if (user) {
        promises.push(updateProfile(firebasePayload))
      }
      if (walletIdentity.isConnected) {
        promises.push(updateReownProfile(reownPayload))
      }

      await Promise.all(promises)
      profileLogInfo('Profil enregistré avec succès')

      setMessage('✓ Profil mis à jour !')
      if (forcedSetup) {
        profileLogInfo('Fin du setup forcé, redirection vers /profile')
        navigate('/profile', { replace: true })
      }
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      profileLogError('Erreur mise à jour profil', err)
      setMessage(`❌ Erreur: ${err.code || err.message}`)
    } finally {
      profileLogInfo('Fin du traitement de sauvegarde profil')
      setUpdating(false)
    }
  }

  const isLoading = authLoading || profileLoading
  const hasIdentity = Boolean(user || walletIdentity.isConnected)

  useEffect(() => {
    if (isLoading) return
    if (hasIdentity) return

    profileLogInfo('Aucune identité active sur la page profil, redirection vers /epicerie-fine')
    navigate('/epicerie-fine', { replace: true, state: { redirectReason: 'profile-no-identity' } })
  }, [hasIdentity, isLoading, navigate])

  if (isLoading && !walletIdentity.isConnected) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Chargement du profil...</div>
      </div>
    )
  }

  if (!hasIdentity) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          Connecte-toi via Reown pour accéder à ton profil.
        </div>
      </div>
    )
  }

  const hasBirthDate = Boolean(baseProfile?.birthDate)
  const age = hasBirthDate ? calculateAge(new Date(baseProfile.birthDate)) : null
  const isPremium = Boolean(profile?.membership?.active && profile?.membership?.tier === 'premium')

  const showCompletionBanner = !isProfileComplete

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
                aria-label="Mode Chef actif"
                title="Mode Chef actif"
              >
                ★
              </span>
            )}
          </div>
          <h2 className="profile-name">{firstName || 'Ton profil'} {lastName}</h2>
          
          {/* Si date de naissance existe : afficher l'âge */}
          {hasBirthDate && age !== null && (
            <p className="profile-age">{age} ans</p>
          )}
          <div className="profile-reown-module">
            <AppKitConnectButton
              label={walletIdentity.isConnected ? 'Gérer mon wallet' : 'Connecter mon wallet'}
            />
            <p className="profile-reown-hint">
              {walletIdentity.isConnected
                ? 'Tu peux changer de wallet ou gérer Reown ici.'
                : 'Connecte ton wallet Reown pour débloquer toutes les fonctionnalités.'}
            </p>
          </div>
        </div>

        {showCompletionBanner && (
          <div className="profile-banner" role="status">
            <strong>🎯 Complète ton profil</strong>
            <p>Nous avons besoin de ton nom, prénom et email quel que soit ton mode de connexion.</p>
          </div>
        )}

        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-form-grid">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">Prénom <span className="form-required">*</span></label>
              <input
                id="firstName"
                type="text"
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Nom <span className="form-required">*</span></label>
              <input
                id="lastName"
                type="text"
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email <span className="form-required">*</span></label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="form-hint">Cette adresse reste confidentielle et sert aux notifications Cookie.</span>
          </div>

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
            />
            <span className="form-hint">Cette information reste privée et nous aide à personnaliser ton expérience.</span>
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

        <div className="profile-xp-section">
          <h3>Progression COOKIE</h3>
          <p>Retrouve ici ta jauge personnalisée et les missions du jour.</p>
          <XpProgressBar variant="embedded" />
        </div>
      </div>
    </div>
  )
}
