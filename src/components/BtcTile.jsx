import { useTokenIcon } from '../hooks/useTokenIcon'
import { formatUSD, formatSigned } from '../lib/formatters'

export default function BtcTile({ price, deltaAbs, deltaPct, status, source, error }) {
  const { iconPath, handleError } = useTokenIcon('BTC')
  const hasDelta = deltaAbs != null && deltaPct != null
  const color = !hasDelta ? '#94a3b8' : deltaAbs >= 0 ? '#22c55e' : '#ef4444'
  const formattedDeltaAbs = hasDelta ? formatSigned(deltaAbs, 0) : null
  const formattedDeltaPct = hasDelta ? formatSigned(deltaPct, 2) : null

  let statusLabel = 'Chargement…'
  if (error) statusLabel = 'Erreur'
  else if (status === 'live') statusLabel = 'Live'
  else if (status === 'cached') statusLabel = 'Cache'
  else if (status === 'loading') statusLabel = 'Initialisation'

  const sourceLabel = source === 'hyperliquid'
    ? 'Hyperliquid'
    : (source === 'binance' ? 'Binance' : 'Navigateur')

  return (
    <div className="stats-card">
      <div className="token-card__icon" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <img src={iconPath} alt="BTC" onError={handleError} />
      </div>
      <div>
        <div className="stats-card__delta" style={{ color }}>
          {hasDelta ? `(${formattedDeltaAbs} / ${formattedDeltaPct}%)` : 'Variation...'}
        </div>
        <div className="stats-card__price">{price != null ? formatUSD(price) : '—'}</div>
        <div className="stats-card__meta">
          {error ? (
            <span style={{ color: '#fecaca' }}>⛔ {error}</span>
          ) : (
            <>
              <span style={{ color: status === 'live' ? '#4ade80' : '#cbd5f5' }}>{statusLabel}</span>
              {' • '}
              <span>{sourceLabel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
