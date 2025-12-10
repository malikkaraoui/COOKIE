import { useEffect, useState } from 'react'
import { CheckCircle2, ChevronDown, Circle, Loader2, Sparkles } from 'lucide-react'
import { useXpProgress } from '../hooks/useXpProgress'

export default function XpProgressBar({ variant = 'default' }) {
  const {
    tasks,
    earnedXp,
    progressPercent,
    currentLevel,
    nextLevel,
    missingXp,
    loading,
    error,
    isAuthenticated,
    xpPerLevel,
  } = useXpProgress()

  const [forceCardsVisible, setForceCardsVisible] = useState(false)
  const [isCardsOpen, setIsCardsOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }
    const media = window.matchMedia('(hover: none)')
    const syncMedia = () => setForceCardsVisible(media.matches)
    syncMedia()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', syncMedia)
      return () => media.removeEventListener('change', syncMedia)
    }
    media.addListener?.(syncMedia)
    return () => media.removeListener?.(syncMedia)
  }, [])

  const cardsVisible = variant === 'embedded' ? true : (forceCardsVisible || isCardsOpen)

  const handleBlur = (event) => {
    if (forceCardsVisible || variant === 'embedded') return
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsCardsOpen(false)
    }
  }

  const levelNumber = currentLevel?.index !== undefined ? currentLevel.index + 1 : 1
  const totalLevels = 10
  const progressMessage = !isAuthenticated
    ? 'Connecte-toi pour débloquer les missions quotidiennes.'
    : loading
      ? 'Sync automatique en cours…'
      : missingXp <= 0
        ? 'Tu as atteint le dernier palier de la saison.'
        : `Encore ${missingXp} XP avant ${nextLevel.label}.`

  const interactionHint = isAuthenticated
    ? 'Survole ou clique pour afficher les missions.'
    : 'Missions verrouillées tant que tu es déconnecté.'

  const pointerPosition = Number.isFinite(progressPercent)
    ? Math.min(Math.max(progressPercent, 0), 100)
    : 0

  const bannerClassName = ['xp-banner']
  if (variant === 'embedded') {
    bannerClassName.push('xp-banner--embedded')
  }

  return (
    <div
      className={bannerClassName.join(' ')}
      role="region"
      aria-label="Progression des missions COOKIE"
      aria-busy={loading}
      aria-expanded={cardsVisible}
      tabIndex={0}
      onMouseEnter={() => variant !== 'embedded' && setIsCardsOpen(true)}
      onMouseLeave={() => variant !== 'embedded' && setIsCardsOpen(false)}
      onFocus={() => variant !== 'embedded' && setIsCardsOpen(true)}
      onBlur={handleBlur}
    >
      <div className="xp-banner-head">
        <div className="xp-banner-title">
          <Sparkles size={18} />
          <div>
            <p>Niveau {levelNumber} / {totalLevels}</p>
            <strong>{earnedXp} XP cumulés</strong>
          </div>
        </div>
        <div className="xp-banner-meta">
          <span className="xp-banner-pill">{xpPerLevel} XP / palier</span>
          {loading && (
            <span className="xp-banner-sync">
              <Loader2 size={14} className="xp-spin" /> Sync auto
            </span>
          )}
        </div>
      </div>

      <div className="xp-banner-progress">
        <div
          className="xp-banner-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          aria-label="Progression vers le prochain niveau"
        >
          <div className="xp-banner-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div
          className="xp-banner-pointer"
          style={{ left: `${pointerPosition}%` }}
          aria-live="polite"
        >
          <span className="xp-banner-pointer-icon" aria-hidden="true" />
          <span className="xp-banner-pointer-text">{progressMessage}</span>
        </div>
      </div>

      <ul
        className={`xp-banner-tasklist ${cardsVisible ? 'is-visible' : ''}`}
        aria-hidden={!cardsVisible && !forceCardsVisible}
      >
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'is-complete' : ''}>
            <span className="xp-task-icon">
              {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            </span>
            <div className="xp-task-copy">
              <strong>{task.label}</strong>
              <small>{task.description}</small>
            </div>
            <span className="xp-task-xp">+{task.points} XP</span>
          </li>
        ))}
      </ul>

      {isAuthenticated && (
        <div className="xp-banner-disclosure" aria-hidden={!isAuthenticated}>
          <ChevronDown size={16} />
          <span>{interactionHint}</span>
        </div>
      )}

      {error && <p className="xp-banner-error">{error}</p>}
    </div>
  )
}
