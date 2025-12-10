import { useState, useEffect, useMemo } from 'react'
import { PiggyBank, TrendingUp, ChefHat, Star, Gift } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import cookieLogo from '/logo.png'
import { useResizablePanel } from '../hooks/useResizablePanel'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { useXpProgress } from '../hooks/useXpProgress'
import { useWalletIdentity } from '../hooks/useWalletIdentity'
import { openReownModal } from '../lib/reown/appkitConfig'
import { useHyperliquidCurtain } from '../hooks/useHyperliquidCurtain'
import { useHyperliquidExposure } from '../hooks/useHyperliquidExposure'

// Modifie ici les réglages par défaut de la topbar
const TOPBAR_DESKTOP_CONFIG = {
  min: 56,   // hauteur mini quand on redimensionne (desktop)
  max: 130,   // hauteur maxi
  initial: 68, // hauteur par défaut
}

const TOPBAR_MOBILE_CONFIG = {
  min: 60,
  max: 60,
  initial: 60, // hauteur fixe affichée sur mobile
}

const TOTAL_SAVINGS_PLACEHOLDER = 28500
const PERFORMANCE_PLACEHOLDER = 8.7
const PROGRESS_TOOLTIP_MESSAGE = 'Gagnez des XP en votant quotidiennement, en créant des recettes, et en participant à la communauté !'
const LEVEL_TITLES = [
  'Chef Novice',
  'Chef Apprenti',
  'Chef Confirmé',
  'Chef Expert',
  'Chef Maestro',
  'Chef Visionnaire',
  'Chef Suprême',
  'Chef Légende',
  'Chef Mythique',
  'Grand Chef',
]

const EURO_FORMATTER = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export default function Topbar() {
  const [isMobile, setIsMobile] = useState(false)
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile()
  const xp = useXpProgress()
  const walletIdentity = useWalletIdentity()
  const navigate = useNavigate()
  const { status: curtainStatus, pullCurtain } = useHyperliquidCurtain()
  const {
    hasExposure,
    status: exposureStatus,
    counts: exposureCounts,
    error: exposureError,
    refresh: refreshExposure
  } = useHyperliquidExposure({ pollIntervalMs: 15000 })

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const { size: desktopHeight, isResizing, startResizing, handleDoubleClick } = useResizablePanel({
    axis: 'y',
    config: TOPBAR_DESKTOP_CONFIG,
  })

  const topbarHeight = isMobile
    ? TOPBAR_MOBILE_CONFIG.initial
    : desktopHeight

  const levelIndex = xp?.currentLevel?.index ?? 0
  const nextLevelIndex = xp?.nextLevel?.index ?? Math.min(levelIndex + 1, LEVEL_TITLES.length - 1)
  const currentLevelTitle = LEVEL_TITLES[levelIndex] ?? xp?.currentLevel?.label ?? 'Chef Apprenti'
  const nextLevelTitle = LEVEL_TITLES[nextLevelIndex] ?? xp?.nextLevel?.label ?? 'Chef Confirmé'
  const progressValue = Number.isFinite(xp?.progressPercent) ? Math.min(Math.max(xp.progressPercent, 0), 100) : 0
  const totalSavingsLabel = EURO_FORMATTER.format(TOTAL_SAVINGS_PLACEHOLDER)
  const performanceLabel = `${PERFORMANCE_PLACEHOLDER >= 0 ? '+' : ''}${PERFORMANCE_PLACEHOLDER.toFixed(1)}%`

    const neutralizeStatCardClick = (event) => {
      event.preventDefault()
      event.stopPropagation()
    }

  const displayName = useMemo(() => {
    if (profile?.firstName || profile?.lastName) {
      return [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
    }
    if (profile?.displayName) {
      return profile.displayName
    }
    if (user?.displayName) {
      return user.displayName
    }
    return 'Chef invité'
  }, [profile?.displayName, profile?.firstName, profile?.lastName, user?.displayName])

  const recipeCount = profile?.recipesCount ?? profile?.stats?.recipes ?? 12
  const avatarUrl = profile?.photoURL ?? user?.photoURL ?? null
  const avatarInitials = useMemo(() => {
    return displayName
      .split(' ')
      .map((word) => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'C'
  }, [displayName])

  const hasIdentity = Boolean(user || walletIdentity.isConnected)

  const handleProfileNavigation = () => {
    if (hasIdentity) {
      navigate('/profile')
      return
    }

    openReownModal()
  }

  const profileSubtitle = hasIdentity
    ? `${recipeCount} recettes`
    : profileLoading
      ? 'Chargement…'
      : 'Connecte ton wallet'

  useEffect(() => {
    if (curtainStatus.state === 'success') {
      refreshExposure()
    }
  }, [curtainStatus.state, refreshExposure])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined
    }

    const handleVisibilityRefresh = () => {
      if (!document.hidden) {
        refreshExposure()
      }
    }

    window.addEventListener('focus', handleVisibilityRefresh)
    document.addEventListener('visibilitychange', handleVisibilityRefresh)

    return () => {
      window.removeEventListener('focus', handleVisibilityRefresh)
      document.removeEventListener('visibilitychange', handleVisibilityRefresh)
    }
  }, [refreshExposure])

  const curtainLabel = useMemo(() => {
    if (curtainStatus.state === 'loading') {
      return 'On baisse le rideau…'
    }
    if (!hasExposure) {
      if (exposureStatus === 'loading' || exposureStatus === 'refreshing') {
        return 'Inventaire de la cuisine…'
      }
      if (exposureStatus === 'error') {
        return 'Statut indisponible'
      }
      return 'Cuisine à plat'
    }
    if (curtainStatus.state === 'success') {
      return 'Rideau baissé ✅'
    }
    if (curtainStatus.state === 'error') {
      return 'Réessayer'
    }
    return 'On baisse le rideau'
  }, [curtainStatus.state, exposureStatus, hasExposure])

  const curtainMetaLabel = useMemo(() => {
    if (!hasExposure) {
      return exposureStatus === 'error' ? 'Impossible de lire les positions' : null
    }
    const { positions, orders } = exposureCounts
    const segments = []
    if (positions > 0) {
      segments.push(`${positions} pos`)
    }
    if (orders > 0) {
      segments.push(`${orders} ordre${orders > 1 ? 's' : ''}`)
    }
    return segments.join(' • ') || null
  }, [hasExposure, exposureCounts, exposureStatus])

  const curtainTooltip = useMemo(() => {
    if (curtainStatus.message) {
      return curtainStatus.message
    }
    if (curtainStatus.state === 'error') {
      return 'Hyperliquid a rejeté la fermeture. Réessaie dans quelques secondes.'
    }
    if (exposureStatus === 'loading' || exposureStatus === 'refreshing') {
      return 'Lecture des ordres et positions Hyperliquid…'
    }
    if (exposureStatus === 'error') {
      return exposureError || 'Impossible de vérifier les positions Hyperliquid'
    }
    if (!hasExposure) {
      return 'Aucun ordre ni position Hyperliquid ouverts.'
    }
    const parts = []
    if (exposureCounts.positions > 0) {
      parts.push(`${exposureCounts.positions} position${exposureCounts.positions > 1 ? 's' : ''}`)
    }
    if (exposureCounts.orders > 0) {
      parts.push(`${exposureCounts.orders} ordre${exposureCounts.orders > 1 ? 's' : ''} au carnet`)
    }
    return parts.length ? `Encore ${parts.join(' • ')}` : 'Fermer toutes les positions Hyperliquid'
  }, [curtainStatus.message, curtainStatus.state, exposureStatus, exposureError, hasExposure, exposureCounts])

  const curtainDisabled =
    curtainStatus.state === 'loading' ||
    exposureStatus === 'loading' ||
    exposureStatus === 'refreshing' ||
    (!hasExposure && exposureStatus !== 'error')

  return (
    <>
      <header className="topbar" style={{ minHeight: topbarHeight }}>
        <div className="topbar-content">
          <div className="tapbar-shell">
            <div className="tapbar-main">
              <div className="tapbar-brand">
                <div className="tapbar-logo" aria-hidden>
                  <img src={cookieLogo} alt="Logo COOKIE" />
                </div>
                <div className="tapbar-brand-copy">
                  <p className="tapbar-brand-title">$COOKIE</p>
                  <p className="tapbar-brand-subtitle">Votre épargne communautaire</p>
                </div>
              </div>

              <div className="tapbar-stats" aria-live="polite">
                <div
                  className="tapbar-stat-card tapbar-stat-card--savings"
                  role="presentation"
                  onClick={neutralizeStatCardClick}
                  onMouseDown={neutralizeStatCardClick}
                >
                  <div className="tapbar-stat-icon">
                    <PiggyBank size={18} />
                  </div>
                  <div>
                    <span>Total épargné</span>
                    <strong>{totalSavingsLabel}</strong>
                  </div>
                </div>
                <div
                  className="tapbar-stat-card tapbar-stat-card--performance"
                  role="presentation"
                  onClick={neutralizeStatCardClick}
                  onMouseDown={neutralizeStatCardClick}
                >
                  <div className="tapbar-stat-icon">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <span>Performance</span>
                    <strong>{performanceLabel}</strong>
                  </div>
                </div>
              </div>

              <div className="tapbar-profile">
                <button
                  type="button"
                  className="tapbar-curtain"
                  aria-label="On baisse le rideau"
                  onClick={pullCurtain}
                  data-state={curtainStatus.state}
                  data-exposure={hasExposure ? 'open' : 'flat'}
                  disabled={curtainDisabled}
                  title={curtainTooltip}
                >
                  <ChefHat size={16} />
                  <span className="tapbar-curtain-copy">
                    <span className="tapbar-curtain-label">{curtainLabel}</span>
                    {curtainMetaLabel && (
                      <span className="tapbar-curtain-meta">{curtainMetaLabel}</span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  className="tapbar-profile-info"
                  onClick={handleProfileNavigation}
                  aria-label="Voir mon profil"
                >
                  <div className="tapbar-avatar" aria-hidden>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} />
                    ) : (
                      <span>{avatarInitials}</span>
                    )}
                  </div>
                  <div>
                    <strong>{displayName}</strong>
                    <span>{profileSubtitle}</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="tapbar-progress" role="group" aria-label="Progression community">
              <div className="tapbar-progress-bar">
                <span className="tapbar-level-pill">
                  <Star size={14} /> {currentLevelTitle}
                </span>
                <div
                  className="tapbar-progress-track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressValue}
                  aria-valuetext={`Progression ${Math.round(progressValue)}% vers ${nextLevelTitle}`}
                  aria-label="Progression vers le prochain niveau"
                  tabIndex={0}
                >
                  <div className="tapbar-progress-fill" style={{ width: `${progressValue}%` }} />
                  <span className="tapbar-progress-dot" style={{ left: `${progressValue}%` }} />
                  <div className="tapbar-progress-tooltip" aria-live="polite">
                    <span className="tapbar-progress-tooltip-arrow" aria-hidden="true" />
                    <span className="tapbar-progress-tooltip-content">{PROGRESS_TOOLTIP_MESSAGE}</span>
                  </div>
                </div>
                <span className="tapbar-level-pill tapbar-level-pill--next">
                  {nextLevelTitle} <Gift size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Resizer uniquement sur desktop */}
      {!isMobile && (
        <div
          className={`topbar-resizer ${isResizing ? 'is-resizing' : ''}`}
          onMouseDown={startResizing}
          onDoubleClick={handleDoubleClick}
          title="Double-clic pour réduire/étendre"
        />
      )}
    </>
  )
}
