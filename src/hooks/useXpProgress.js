import { useEffect, useMemo, useRef, useState } from 'react'
import { onValue, ref } from 'firebase/database'
import { db } from '../config/firebase'
import { useAuth } from './useAuth'

const XP_PER_LEVEL = 300
const LEVELS = Array.from({ length: 10 }).map((_, index) => ({
  id: `level-${index + 1}`,
  label: `Niveau ${index + 1}`,
  threshold: index * XP_PER_LEVEL,
  index,
}))

const XP_TASKS = [
  {
    id: 'wallet_online',
    label: 'Wallet allumé',
    description: 'Active ton wallet COOKIE (connexion Google).',
    points: 100,
    accessor: (state) => Boolean(state.wallet?.connected),
  },
  {
    id: 'premium_unlock',
    label: 'Mode Chef actif',
    description: 'Active COOKIE Premium via Stripe pour débloquer les recettes avancées.',
    points: 200,
    accessor: (state) => Boolean(state.membership?.active && state.membership?.tier === 'premium'),
  },
  {
    id: 'community_vote',
    label: 'Question journalière',
    description: 'Réponds au débat quotidien de la Marmite.',
    points: 25,
    accessor: (state) => Boolean(state.vote?.choice),
  },
  {
    id: 'active_funding',
    label: 'Bouillon actif',
    description: 'Garde un combo funding ouvert depuis COOKIE.',
    points: 50,
    accessor: (state) => Boolean(state.hasActiveFunding),
  },
  {
    id: 'ma_cuisine_full',
    label: 'Recette complète',
    description: 'Compose Ma Cuisine avec 4 ingrédients.',
    points: 50,
    accessor: (state) => state.selectedTokensCount >= 4,
  },
]

const DEFAULT_STATE = {
  vote: null,
  wallet: { connected: false },
  selectedTokensCount: 0,
  activeFundingCoins: [],
  xpSignalFunding: null,
  membership: null,
}

const getDayKey = () => new Date().toISOString().split('T')[0]
const buildQuestionId = (dayKey) => `Q-${dayKey}`
const scheduleStateUpdate = (cb) => {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(cb)
    return
  }
  setTimeout(cb, 0)
}

export function useXpProgress() {
  const { user } = useAuth()
  const [signals, setSignals] = useState(DEFAULT_STATE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dayKey, setDayKey] = useState(getDayKey)
  const loadFlagsRef = useRef({})

  const questionId = buildQuestionId(dayKey)

  useEffect(() => {
    const interval = setInterval(() => {
      setDayKey((current) => {
        const next = getDayKey()
        return current === next ? current : next
      })
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!user?.uid) {
      return () => {}
    }

    scheduleStateUpdate(() => setLoading(true))
    scheduleStateUpdate(() => setError(null))
    loadFlagsRef.current = {
      vote: false,
      tokens: false,
      wallet: false,
      funding: false,
      xpFunding: false,
      membership: false,
    }

    const updateLoaded = (key) => {
      loadFlagsRef.current[key] = true
      const pending = Object.values(loadFlagsRef.current).some((flag) => !flag)
      if (!pending) {
        setLoading(false)
      }
    }

    const unsubscribers = []

    const voteRef = ref(db, `users/${user.uid}/votes/${questionId}`)
    unsubscribers.push(
      onValue(voteRef, (snapshot) => {
        setSignals((prev) => ({ ...prev, vote: snapshot.exists() ? snapshot.val() : null }))
        updateLoaded('vote')
      }, (err) => {
        console.warn('Vote quotidien indisponible:', err)
        setError('Synchronisation vote impossible pour le moment.')
        updateLoaded('vote')
      })
    )

    const tokensRef = ref(db, `users/${user.uid}/selectedTokens`)
    unsubscribers.push(
      onValue(tokensRef, (snapshot) => {
        const value = snapshot.val()
        let count = 0
        if (Array.isArray(value)) {
          count = value.filter(Boolean).length
        } else if (value && typeof value === 'object') {
          count = Object.values(value).filter(Boolean).length
        }
        setSignals((prev) => ({ ...prev, selectedTokensCount: count }))
        updateLoaded('tokens')
      }, (err) => {
        console.warn('Tokens Ma Cuisine indisponibles:', err)
        setError('Lecture des ingrédients impossible pour le moment.')
        updateLoaded('tokens')
      })
    )

    const walletRef = ref(db, `users/${user.uid}/xpSignals/wallet`)
    unsubscribers.push(
      onValue(walletRef, (snapshot) => {
        setSignals((prev) => ({ ...prev, wallet: snapshot.exists() ? snapshot.val() : { connected: false } }))
        updateLoaded('wallet')
      }, (err) => {
        console.warn('Wallet status indisponible:', err)
        updateLoaded('wallet')
      })
    )

    const hyperliquidRef = ref(db, 'hyperliquidFundingStrategies')
    unsubscribers.push(
      onValue(hyperliquidRef, (snapshot) => {
        const value = snapshot.val()
        const ownedCoins = Object.values(value || {})
          .filter((entry) => entry?.ownerUid === user.uid && entry?.isOpen)
          .map((entry) => entry.coin)
          .filter(Boolean)
        setSignals((prev) => ({ ...prev, activeFundingCoins: ownedCoins }))
        updateLoaded('funding')
      }, (err) => {
        console.warn('Stratégies funding indisponibles:', err)
        setError('Impossible de lire les bouillons actifs en base.')
        updateLoaded('funding')
      })
    )

    const xpFundingRef = ref(db, `users/${user.uid}/xpSignals/activeFunding`)
    unsubscribers.push(
      onValue(xpFundingRef, (snapshot) => {
        setSignals((prev) => ({ ...prev, xpSignalFunding: snapshot.exists() ? snapshot.val() : null }))
        updateLoaded('xpFunding')
      }, () => {
        updateLoaded('xpFunding')
      })
    )

    const membershipRef = ref(db, `users/${user.uid}/membership`)
    unsubscribers.push(
      onValue(membershipRef, (snapshot) => {
        setSignals((prev) => ({ ...prev, membership: snapshot.exists() ? snapshot.val() : null }))
        updateLoaded('membership')
      }, (err) => {
        console.warn('Membership premium indisponible:', err)
        updateLoaded('membership')
      })
    )

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [user?.uid, questionId])

  useEffect(() => {
    if (user?.uid) {
      return
    }
    scheduleStateUpdate(() => setSignals({ ...DEFAULT_STATE }))
    scheduleStateUpdate(() => setLoading(false))
    scheduleStateUpdate(() => setError(null))
  }, [user?.uid])

  const hasActiveFunding = useMemo(() => {
    if (!user?.uid) {
      return false
    }
    if (signals.activeFundingCoins.length > 0) {
      return true
    }
    return Boolean(signals.xpSignalFunding?.isOpen)
  }, [signals.activeFundingCoins, signals.xpSignalFunding, user?.uid])

  const enrichedSignals = useMemo(() => ({
    ...signals,
    hasActiveFunding,
  }), [signals, hasActiveFunding])

  const tasks = useMemo(() => XP_TASKS.map((task) => ({
    ...task,
    completed: task.accessor(enrichedSignals),
  })), [enrichedSignals])

  const earnedXp = useMemo(() => tasks.reduce((sum, task) => sum + (task.completed ? task.points : 0), 0), [tasks])

  const currentLevel = useMemo(() => {
    let level = LEVELS[0]
    for (const candidate of LEVELS) {
      if (earnedXp >= candidate.threshold) {
        level = candidate
      }
    }
    return level
  }, [earnedXp])

  const currentIndex = currentLevel.index
  const isMaxLevel = currentIndex === LEVELS.length - 1
  const nextLevel = isMaxLevel ? currentLevel : LEVELS[currentIndex + 1]
  const levelSpan = isMaxLevel ? XP_PER_LEVEL : Math.max(nextLevel.threshold - currentLevel.threshold, 1)
  const progressPercent = isMaxLevel
    ? 100
    : Math.min(100, Math.round(((earnedXp - currentLevel.threshold) / levelSpan) * 100))
  const missingXp = isMaxLevel ? 0 : Math.max(nextLevel.threshold - earnedXp, 0)

  return {
    tasks,
    earnedXp,
    progressPercent,
    currentLevel,
    nextLevel,
    missingXp,
    loading,
    error,
    isAuthenticated: Boolean(user),
    xpPerLevel: XP_PER_LEVEL,
    levelGoal: isMaxLevel ? currentLevel.threshold + XP_PER_LEVEL : nextLevel.threshold,
  }
}
