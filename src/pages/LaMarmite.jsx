/**
 * La Marmite - Page de vote communautaire
 * Épargne collective avec décisions votées quotidiennement
 * Nécessite authentification pour voter
 */

import { useState, useEffect } from 'react'
import { ChefHat, LogIn, CheckCircle2, Award, TrendingUp } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useAuth } from '../hooks/useAuth'
import { saveUserVote, getUserVote } from '../lib/database/userService'
import './LaMarmite.css'

const HIGHLIGHT_PILLS = [
  { label: 'Vous ne perdez jamais', variant: 'success' },
  { label: 'La majorité a raison', variant: 'info' },
  { label: 'Chaque vote est une leçon', variant: 'warning' },
]

const WHY_POINTS = [
  {
    title: 'Votre épargne suit la majorité',
    description: 'Peu importe votre vote, votre argent reste aligné sur la stratégie gagnante décidée par la communauté.',
  },
  {
    title: 'La sagesse collective a raison',
    description: 'Statistiquement, la majorité prend de meilleures décisions que les individus isolés.',
  },
  {
    title: 'Chaque vote est une leçon',
    description: 'Vote “mal” ? aucun impact financier, mais vous apprenez. Vote “bien” ? bonus XP immédiat.',
  },
]

const HOW_STEPS = [
  {
    title: 'Déposez votre épargne',
    description: 'Alimentez la marmite avec le montant de votre choix, sans ticket d’entrée minimum.',
  },
  {
    title: 'Votez selon votre conviction',
    description: 'Chaque jour, exprimez votre opinion. Une personne = une voix. Gagnez des XP.',
  },
  {
    title: 'Profitez des rendements collectifs',
    description: 'Votre épargne suit la stratégie gagnante. Si vous votez avec la majorité, bonus XP !',
  },
]

const REWARD_RULES = [
  { label: '+50 XP', detail: 'Vote quotidien' },
  { label: '+25 XP', detail: 'Avec la majorité' },
  { label: 'x2', detail: 'Série de votes' },
]

const WHY_TAGS = ['Comme Polymarket', 'Épargne protégée']

const VAULT_PERFORMANCE = [
  { month: 'Jan', value: 10000 },
  { month: 'Fév', value: 26500 },
  { month: 'Mar', value: 38000 },
  { month: 'Avr', value: 62000 },
  { month: 'Mai', value: 87000 },
  { month: 'Juin', value: 119000 }
]

export default function LaMarmite() {
  const { user } = useAuth()

  // ID unique de la question du jour (format: Q-YYYY-MM-DD)
  const questionId = `Q-${new Date().toISOString().split('T')[0]}`

  // Calculer le temps restant jusqu'à 19h Paris
  const calculateTimeLeft = () => {
    const now = new Date()

    // Convertir en heure de Paris (UTC+1 ou UTC+2 selon DST)
    const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }))

    // Définir 19h00 aujourd'hui
    const deadline = new Date(parisTime)
    deadline.setHours(19, 0, 0, 0)

    // Si on est déjà après 19h, le vote est terminé
    if (parisTime >= deadline) {
      return 0
    }

    // Calculer la différence en secondes
    const diff = Math.floor((deadline - parisTime) / 1000)
    return Math.max(0, diff)
  }

  // Vérifier si on est dans la plage horaire de vote (8h-19h Paris)
  const isVotingTime = () => {
    const now = new Date()
    const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
    const hour = parisTime.getHours()

    return hour >= 8 && hour < 19
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  const [canVote, setCanVote] = useState(isVotingTime())
  const [selectedVote, setSelectedVote] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // Charger le vote existant de l'utilisateur au montage
  useEffect(() => {
    if (user) {
      getUserVote(user.uid, questionId)
        .then((vote) => {
          if (vote) {
            setSelectedVote(vote.choice)
            setHasVoted(true)
          }
        })
        .catch((err) => {
          console.error('Erreur chargement vote:', err)
        })
    }
  }, [user, questionId])

  // Décompte du temps
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      const newCanVote = isVotingTime()

      setTimeLeft(newTimeLeft)
      setCanVote(newCanVote)

      // Si le temps est écoulé ou hors plage horaire, on arrête le timer
      if (newTimeLeft === 0 || !newCanVote) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}h ${m}m ${s}s`
  }

  const handleSelectVote = (choice) => {
    // Permettre de changer de sélection tant qu'on n'a pas validé
    if (!hasVoted) {
      setSelectedVote(choice)
      setShowLoginPrompt(false)
    }
  }

  const handleConfirmVote = async () => {
    // Vérifier si on est dans la plage horaire
    if (!canVote) {
      alert('Les votes sont possibles uniquement entre 8h et 19h (heure de Paris)')
      return
    }

    // Vérifier si l'utilisateur est connecté
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    // Vérifier qu'un choix est sélectionné
    if (!selectedVote) {
      return
    }

    setIsLoading(true)

    try {
      // Sauvegarder le vote dans Firebase
      await saveUserVote(user.uid, questionId, selectedVote)

      setHasVoted(true)
      setShowLoginPrompt(false)
    } catch (error) {
      console.error('Erreur lors du vote:', error)
      alert("Erreur lors de l'enregistrement du vote. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const timerLabel = !canVote ? 'Vote fermé' : `Expire dans ${formatTime(timeLeft)}`
  const timerStatus = !canVote ? 'danger' : timeLeft < 3600 ? 'warning' : 'success'

  const baseChoiceClasses = (key) => {
    const classes = ['marmite-choice', `marmite-choice--${key}`]
    if (selectedVote === key) classes.push('is-selected')
    if (hasVoted || !canVote) classes.push('is-disabled')
    return classes.join(' ')
  }

  const renderVaultTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
      return null
    }

    const [{ value }] = payload
    return (
      <div className="marmite-performance-tooltip">
        <strong>{label}</strong>
        <span>Pot commun : {value.toLocaleString('fr-FR')} €</span>
      </div>
    )
  }

  return (
    <div className="marmite-page">
      <section className="marmite-hero">
        <div className="marmite-hero__eyebrow">L’épargne collective qui vous rapporte</div>
        <h1>
          La <span>Marmite</span> Communautaire
        </h1>
        <p>
          Le mix parfait entre <strong>Polymarket</strong> et l’épargne communautaire. Votez votre conviction, mais votre épargne suit toujours la majorité.
        </p>
        <div className="marmite-hero__pills">
          {HIGHLIGHT_PILLS.map((pill) => (
            <span key={pill.label} className={`marmite-pill marmite-pill--${pill.variant}`}>
              {pill.label}
            </span>
          ))}
        </div>
      </section>

      <section className="marmite-vote-section">
        <div className="marmite-vote-card">
          <header className="marmite-card__header">
            <div>
              <p className="marmite-card__eyebrow">Question du Chef</p>
              <h2>Quelle stratégie pour la marmite aujourd’hui&nbsp;?</h2>
              <div className="marmite-card__meta">
                <span>Vote quotidien (8h-19h)</span>
                <span aria-hidden="true">•</span>
                <span className={`marmite-chip marmite-chip--${timerStatus}`}>{timerLabel}</span>
              </div>
            </div>
            <div className="marmite-card__icon" aria-hidden="true">
              <ChefHat size={32} strokeWidth={2} />
            </div>
          </header>

          <div className="marmite-card__question">
            Votez selon votre conviction pour guider la gestion quotidienne de l’épargne.
          </div>

          <div className="marmite-choice-group">
            {!canVote && !hasVoted && (
              <div className="marmite-alert marmite-alert--schedule">
                ⏰ Les votes sont ouverts de 8h00 à 19h00 (heure de Paris)
              </div>
            )}

            {showLoginPrompt && !user && (
              <div className="marmite-alert marmite-alert--login">
                <LogIn size={20} />
                <div>
                  <strong>Connexion requise</strong>
                  <span>Identifiez-vous pour enregistrer votre vote et suivre son impact.</span>
                </div>
              </div>
            )}

            <button
              type="button"
              className={baseChoiceClasses('prudent')}
              onClick={() => handleSelectVote('prudent')}
              disabled={hasVoted || !canVote}
            >
              <div className="marmite-choice__title">🛡️ Version mijotée (Douce)</div>
              <div className="marmite-choice__description">
                On reste prudent et on laisse la marmite sur feu doux. Stratégie défensive avec plus de cash et d’obligations.
              </div>
            </button>

            <button
              type="button"
              className={baseChoiceClasses('risque')}
              onClick={() => handleSelectVote('risque')}
              disabled={hasVoted || !canVote}
            >
              <div className="marmite-choice__title">🌶️ Version relevée (Piment)</div>
              <div className="marmite-choice__description">
                On ajoute une pincée de piment pour intensifier la stratégie et chercher davantage de rendement côté crypto et actions tech.
              </div>
            </button>
          </div>

          {!hasVoted && canVote && (
            <button
              type="button"
              className={`marmite-cta ${!selectedVote || isLoading ? 'is-disabled' : ''}`}
              onClick={handleConfirmVote}
              disabled={!selectedVote || isLoading}
            >
              {isLoading ? '⏳ Enregistrement…' : '✅ Valider mon vote'}
            </button>
          )}

          {hasVoted && user && <div className="marmite-confirmation">✅ Vote enregistré ! Merci !</div>}
        </div>
      </section>

      <section className="marmite-performance-card">
        <div className="marmite-performance-card__header">
          <div>
            <p className="marmite-card__eyebrow">Pot commun</p>
            <h3>Performance des 6 derniers mois</h3>
            <p className="marmite-performance-subtitle">
              + de contributeurs ⇒ + d’épargne ⇒ rendement positif car la communauté choisit toujours la meilleure direction.
            </p>
          </div>
          <span className="marmite-performance-chip">
            <TrendingUp size={16} /> +8,7%
          </span>
        </div>
        <div className="marmite-performance-chart">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={VAULT_PERFORMANCE} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="vaultGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.4)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                label={{ value: 'Mois', position: 'insideBottom', offset: -8, fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value / 1000}k`}
                tick={{ fill: '#64748b', fontSize: 12 }}
                domain={[10000, 120000]}
                label={{ value: 'Épargne (k€)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip content={renderVaultTooltip} cursor={{ stroke: 'rgba(34,197,94,0.4)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#16a34a"
                strokeWidth={3}
                fill="url(#vaultGradient)"
                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#16a34a' }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="marmite-performance-legend">
          <span className="legend-dot" />
          <span>Épargne gérée par la communauté</span>
        </div>
      </section>

      <section className="marmite-info-grid">
        <article className="marmite-info-card">
          <div className="marmite-info-card__title">Pourquoi vous ne perdez jamais&nbsp;?</div>
          <ul className="marmite-info-list">
            {WHY_POINTS.map((point) => (
              <li key={point.title}>
                <span className="marmite-info-list__icon">
                  <CheckCircle2 size={18} />
                </span>
                <div>
                  <strong>{point.title}</strong>
                  <p>{point.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="marmite-info-card__tags">
            {WHY_TAGS.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </article>

        <article className="marmite-info-card marmite-info-card--steps">
          <div className="marmite-info-card__title">Comment ça marche&nbsp;?</div>
          <ol className="marmite-how-steps">
            {HOW_STEPS.map((step, index) => (
              <li key={step.title}>
                <div className="marmite-how-step__index">{index + 1}</div>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="marmite-reward-card">
            <div className="marmite-reward-card__title">
              <Award size={18} /> Système de récompenses
            </div>
            <ul>
              {REWARD_RULES.map((rule) => (
                <li key={rule.detail}>
                  <strong>{rule.label}</strong>
                  <span>{rule.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>
    </div>
  )
}
