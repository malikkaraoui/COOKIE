import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { getFundingMarketsSnapshot } from '../services/hyperliquidFunding'
import { openFundingTrade, FUNDING_POSITIVE_THRESHOLD, FUNDING_NEGATIVE_THRESHOLD } from '../strategies/openFundingTrade'
import { listFundingTrades } from '../lib/trading/fundingTradeStore'
import { getHyperliquidTokenSymbols } from '../config/tokenList'
import { useHyperliquidAccount } from '../hooks/useHyperliquidAccount'

const SUPPORTED_COINS = getHyperliquidTokenSymbols()
const CAPITAL_MIN = 100
const CAPITAL_MAX = 20000
const CAPITAL_STEP = 50
const THRESHOLD_MIN = 0.00005
const FIXED_FUNDING_THRESHOLD = THRESHOLD_MIN
const DEFAULT_LEVERAGE = 1

export default function BouillonDeLegumes() {
  const { user, signInWithGoogle } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile()
  const hyperliquidAccount = useHyperliquidAccount({ pollIntervalMs: 25000 })
  const [capitalUsd, setCapitalUsd] = useState(500)
  const minFundingThreshold = FIXED_FUNDING_THRESHOLD
  const [status, setStatus] = useState(null)
  const [submittingCoin, setSubmittingCoin] = useState(null)
  const [recentTrades, setRecentTrades] = useState(() => (typeof window === 'undefined' ? [] : listFundingTrades(5)))
  const [marketSnapshot, setMarketSnapshot] = useState([])
  const [marketLoading, setMarketLoading] = useState(false)
  const [marketError, setMarketError] = useState(null)
  const [snapshotRefreshToken, setSnapshotRefreshToken] = useState(0)
  const orderedMarketSnapshot = useMemo(() => {
    if (!Array.isArray(marketSnapshot)) {
      return []
    }
    return [...marketSnapshot].sort((a, b) => {
      const aRate = Number.isFinite(a?.fundingRate) ? a.fundingRate : 0
      const bRate = Number.isFinite(b?.fundingRate) ? b.fundingRate : 0
      return aRate - bRate
    })
  }, [marketSnapshot])

  const {
    status: hyperliquidStatus,
    perp: hyperliquidPerp,
    totals: hyperliquidTotals,
    refetch: refetchHyperliquidAccount
  } = hyperliquidAccount

  const hyperliquidPerpAvailableUsd = useMemo(() => {
    const candidates = [
      hyperliquidPerp?.withdrawable,
      hyperliquidTotals?.availableUsd,
      hyperliquidTotals?.globalUsd
    ]
    for (const raw of candidates) {
      const numeric = typeof raw === 'string' ? Number(raw) : raw
      if (Number.isFinite(numeric) && numeric >= 0) {
        return numeric
      }
    }
    return null
  }, [hyperliquidPerp?.withdrawable, hyperliquidTotals?.availableUsd, hyperliquidTotals?.globalUsd])

  const capitalSliderMax = useMemo(() => {
    if (Number.isFinite(hyperliquidPerpAvailableUsd)) {
      return Math.max(0, hyperliquidPerpAvailableUsd)
    }
    return CAPITAL_MAX
  }, [hyperliquidPerpAvailableUsd])

  const capitalSliderMin = useMemo(() => {
    if (capitalSliderMax <= 0) {
      return 0
    }
    return Math.min(CAPITAL_MIN, capitalSliderMax)
  }, [capitalSliderMax])

  const capitalSliderStep = useMemo(() => {
    if (capitalSliderMax <= 500) {
      return Math.max(5, CAPITAL_STEP / 5)
    }
    if (capitalSliderMax <= 2000) {
      return Math.max(10, CAPITAL_STEP / 2)
    }
    return CAPITAL_STEP
  }, [capitalSliderMax])

  useEffect(() => {
    if (capitalSliderMax <= 0) {
      setCapitalUsd(0)
      return
    }
    setCapitalUsd((prev) => {
      if (prev < capitalSliderMin) {
        return capitalSliderMin
      }
      if (prev > capitalSliderMax) {
        return capitalSliderMax
      }
      return prev
    })
  }, [capitalSliderMax, capitalSliderMin])

  const isPremium = useMemo(() => {
    const membership = profile?.membership
    return Boolean(membership?.active && membership?.tier === 'premium')
  }, [profile])

  useEffect(() => {
    setRecentTrades(typeof window === 'undefined' ? [] : listFundingTrades(5))
  }, [status])

  useEffect(() => {
    let cancelled = false
    setMarketError(null)
    setMarketLoading(true)

    if (!SUPPORTED_COINS.length) {
      setMarketSnapshot([])
      setMarketError('Aucun actif Hyperliquid n’est encore configuré dans COOKIE.')
      setMarketLoading(false)
      return
    }

    getFundingMarketsSnapshot(SUPPORTED_COINS)
      .then((snapshot) => {
        if (cancelled) return
        setMarketSnapshot(snapshot)
      })
      .catch((error) => {
        if (cancelled) return
        setMarketError(error.message || 'Impossible de récupérer les marchés Hyperliquid')
      })
      .finally(() => {
        if (cancelled) return
        setMarketLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [snapshotRefreshToken])

  const refreshSnapshot = () => {
    setSnapshotRefreshToken((token) => token + 1)
  }

  const handleCapitalChange = (value) => {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) {
      return
    }
    setStatus(null)
    const clamped = Math.max(capitalSliderMin, Math.min(capitalSliderMax, numeric))
    setCapitalUsd(clamped)
  }

  const handleOpenFunding = async (coin) => {
    if (!user) {
      setStatus({ type: 'error', message: 'Connecte-toi avant d’envoyer un GO.' })
      return
    }
    if (!isPremium) {
      setStatus({ type: 'error', message: 'Bouillon Funding est réservé aux membres COOKIE Premium.' })
      return
    }

    if (Number.isFinite(hyperliquidPerpAvailableUsd) && capitalUsd > hyperliquidPerpAvailableUsd) {
      setStatus({
        type: 'error',
        message: `Montant sélectionné (${capitalUsd.toLocaleString('fr-FR')} $) > disponible sur Hyperliquid (${hyperliquidPerpAvailableUsd.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} $). Réduis la jauge ou rafraîchis ton solde.`,
      })
      return
    }

    const market = marketSnapshot.find((entry) => entry.coin === coin)
    const fundingRate = market?.fundingRate ?? 0
    const eligible = Math.abs(fundingRate) >= minFundingThreshold
    if (!eligible) {
      setStatus({
        type: 'error',
        message: `Funding insuffisant sur ${coin}. Attends que |taux| dépasse ${(minFundingThreshold * 100).toFixed(3)}%.`,
      })
      return
    }

    try {
      setSubmittingCoin(coin)
      const result = await openFundingTrade({
        coin,
        notionalUsd: capitalUsd,
        minFundingRate: minFundingThreshold,
      })
      setStatus({ type: 'success', result, coin })
    } catch (error) {
      console.error('openFundingTrade error', error)
      setStatus({ type: 'error', message: error.message || 'Impossible d’exécuter ce GO.' })
    } finally {
      setSubmittingCoin(null)
    }
  }

  const renderStatus = () => {
    if (!status) return null
    if (status.type === 'error') {
      return (
        <div className="bouillon-alert bouillon-alert--error">
          {status.message}
        </div>
      )
    }
    const { result } = status
    if (!result) return null
    const directionLabel = result.direction === 'collect_short'
      ? 'Funding positif → short perp + achat spot'
      : 'Funding négatif → long perp pour encaisser'

    return (
      <div className="bouillon-alert bouillon-alert--success">
        <div>
          <strong>Plan :</strong> {directionLabel}
        </div>
        <div>
          <strong>Funding:</strong> {(result.funding.fundingRate * 100).toFixed(4)}% • Premium {(result.funding.premium * 100).toFixed(4)}%
        </div>
        <div>
          <strong>IDs Hyperliquid:</strong> spot #{result.spotOrderId ?? '—'} / perp #{result.perpOrderId ?? '—'}
        </div>
        <div>
          <strong>Trade ID interne:</strong> {result.tradeId}
        </div>
      </div>
    )
  }
 
  const minFundingThresholdPct = (minFundingThreshold * 100).toFixed(3)

  const directionDescriptor = (fundingRate) => {
    if (fundingRate >= minFundingThreshold) {
      return {
        label: 'Funding paye les shorts',
        plan: 'Short perp financé + achat spot pour se couvrir.',
        tone: 'short',
      }
    }
    if (fundingRate <= -minFundingThreshold) {
      return {
        label: 'Funding paye les longs',
        plan: 'Long perp pour encaisser le versement. Pas de spot en face.',
        tone: 'long',
      }
    }
    return {
      label: `Funding < ${minFundingThresholdPct}%`,
      plan: 'Patiente : le seuil COOKIE n’est pas atteint.',
      tone: 'flat',
    }
  }

  const renderTokenTiles = () => {
    if (marketLoading) {
      return (
        <div className="bouillon-market-empty">
          <Loader2 className="bouillon-spinner" size={18} />
          <span>Chargement des funding Hyperliquid…</span>
        </div>
      )
    }

    if (marketError) {
      return <div className="bouillon-alert bouillon-alert--error">{marketError}</div>
    }

    if (!orderedMarketSnapshot.length) {
      return <p className="bouillon-market-empty">Aucun marché disponible pour le moment.</p>
    }

    return (
      <div className="bouillon-token-grid">
        {orderedMarketSnapshot.map((market) => {
          const descriptor = directionDescriptor(market.fundingRate)
          const fundingPct = (market.fundingRate * 100).toFixed(4)
          const eligible = descriptor.tone !== 'flat'
          const isLoadingCoin = submittingCoin === market.coin
          const disabled = !eligible || isLoadingCoin || !user || !isPremium || profileLoading

          return (
            <article
              key={market.coin}
              className={`bouillon-token-card bouillon-token-card--${descriptor.tone}`}
            >
              <div className="bouillon-token-card-head">
                <div>
                  <h3>{market.coin}</h3>
                  <p className="bouillon-token-price">{formatUsd(market.markPrice)}</p>
                </div>
                <span className="bouillon-token-label">{descriptor.label}</span>
              </div>
              <div className="bouillon-token-metric">
                <span>Funding actuel</span>
                <strong>{fundingPct}% / h</strong>
              </div>
              <p className="bouillon-token-plan">{descriptor.plan}</p>
              <button
                type="button"
                className={`bouillon-token-go ${descriptor.tone === 'short' ? 'bouillon-token-go--short' : ''}`}
                onClick={() => handleOpenFunding(market.coin)}
                disabled={disabled}
              >
                {isLoadingCoin ? (
                  <>
                    <Loader2 className="bouillon-spinner" size={16} /> Envoi…
                  </>
                ) : (
                  'GO'
                )}
              </button>
            </article>
          )
        })}
      </div>
    )
  }

  return (
    <div className="bouillon-page">
      <section className="bouillon-intro">
        <div>
          <p className="bouillon-eyebrow">Funding Hyperliquid</p>
          <h1>Bouillon de légumes</h1>
          <p className="bouillon-intro-text">
            Ici, tu testes et ajustes manuellement ta prise de funding. Le watcher COOKIE n’ouvre jamais de position : il surveille uniquement les GO que tu envoies et les ferme si le financement n’est plus intéressant ou si la cible est atteinte.
          </p>
          <div className="bouillon-intro-tags">
            <span><ShieldCheck size={16} /> Premium requis</span>
            <span>Watcher = surveillance & sorties automatiques</span>
          </div>
        </div>
      </section>

      <section className="bouillon-card bouillon-control-panel">
        <div className="bouillon-control-grid">
          <label className="bouillon-control">
            <span>Somme engagée</span>
            <div className="bouillon-amount-value">{capitalUsd.toLocaleString('fr-FR')} $</div>
            <input
              type="range"
              min={capitalSliderMin}
              max={capitalSliderMax}
              step={capitalSliderStep}
              value={capitalSliderMax > 0 ? capitalUsd : 0}
              disabled={capitalSliderMax <= 0}
              onChange={(e) => handleCapitalChange(e.target.value)}
            />
            <small
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
                color: '#b0b8d0'
              }}
            >
              {Number.isFinite(hyperliquidPerpAvailableUsd) ? (
                <>
                  Disponible sur Hyperliquid (perp) :{' '}
                  <strong>{Math.max(0, hyperliquidPerpAvailableUsd).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} $</strong>
                  {hyperliquidStatus === 'loading' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Loader2 className="bouillon-spinner" size={14} />
                      sync…
                    </span>
                  )}
                  <button
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: 'none',
                      background: 'transparent',
                      color: 'inherit',
                      cursor: 'pointer'
                    }}
                    onClick={() => refetchHyperliquidAccount?.()}
                    aria-label="Rafraîchir le solde Hyperliquid"
                  >
                    <RefreshCw size={14} />
                  </button>
                </>
              ) : (
                'Connecte ton wallet Hyperliquid sur “Ma cuisine” pour synchroniser le solde disponible.'
              )}
            </small>
          </label>
          <label className="bouillon-control">
            <span>Seuil funding minimum</span>
            <div className="bouillon-amount-value">{minFundingThresholdPct} %</div>
            <small>
              Seuil verrouillé sur la valeur minimale autorisée par COOKIE. En dessous, le bouton GO reste grisé. Le watcher n’ouvre jamais de trade : il surveille seulement tes positions et les ferme si le funding repasse sous cette barre.
            </small>
          </label>
        </div>
        <p className="bouillon-card-sub bouillon-fixed-leverage-note">
          Levier Hyperliquid verrouillé à {DEFAULT_LEVERAGE}× en cross. Pas de multiplicateur : la taille affichée est celle réellement envoyée.
        </p>

        {renderStatus()}

        {(!user || profileLoading) && (
          <div className="bouillon-alert bouillon-alert--info">
            Connecte-toi avec Google pour envoyer un GO.
          </div>
        )}
        {user && !isPremium && !profileLoading && (
          <div className="bouillon-alert bouillon-alert--info">
            Cette fonctionnalité nécessite COOKIE Premium. <Link to="/stripe">Activer mon abonnement</Link>
          </div>
        )}

        {!user && (
          <button type="button" className="bouillon-secondary" onClick={signInWithGoogle}>
            Se connecter avec Google
          </button>
        )}
      </section>

      <section className="bouillon-token-section">
        <div className="bouillon-token-head">
          <div>
            <h2>Tokens Hyperliquid suivis</h2>
            <p className="bouillon-card-sub">Retrouve la même liste que dans “Ma cuisine”. Funding suffisant ? Clique sur GO.</p>
          </div>
          <button
            type="button"
            className="bouillon-market-refresh"
            onClick={refreshSnapshot}
            disabled={marketLoading}
            aria-label="Actualiser les funding Hyperliquid"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        {renderTokenTiles()}
      </section>

      <section className="bouillon-card">
        <h2>Historique local</h2>
        <p className="bouillon-card-sub">Chaque GO est mémorisé en local pour suivre les identifiants Hyperliquid.</p>

        {recentTrades.length === 0 ? (
          <p className="bouillon-empty">Aucune entrée pour l’instant.</p>
        ) : (
          <ul className="bouillon-trades">
            {recentTrades.map((trade) => (
              <li key={trade.tradeId}>
                <div className="bouillon-trade-header">
                  <strong>{trade.coin}</strong>
                  <span className={`bouillon-direction bouillon-direction--${trade.direction}`}>
                    {trade.direction === 'collect_short' ? 'Funding positif' : 'Funding négatif'}
                  </span>
                </div>
                <div className="bouillon-trade-details">
                  <span>{trade.notionalUsd.toLocaleString('fr-FR')} $ engagés</span>
                  <span>spot {trade.spotQty.toFixed(4)}</span>
                  <span>perp {trade.perpQty.toFixed(4)}</span>
                </div>
                <div className="bouillon-trade-meta">
                  <span>ID spot: {trade.spotOrderId ?? '—'}</span>
                  <span>ID perp: {trade.perpOrderId ?? '—'}</span>
                  <span>{new Date(trade.createdAt).toLocaleString('fr-FR')}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
 
function formatUsd(value) {
  if (!Number.isFinite(value)) {
    return '—'
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 100 ? 2 : 4,
  }).format(value)
}
