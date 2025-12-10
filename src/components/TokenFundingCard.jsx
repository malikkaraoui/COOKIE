import { useMemo } from 'react'
import { useFundingMetrics } from '../hooks/useFundingMetrics'

const formatPercent = (value = 0) => `${value.toFixed(2)}%`

export default function TokenFundingCard({ baseSymbol, pairSymbol, days = 20 }) {
  const token = (baseSymbol || pairSymbol || '').toUpperCase()
  const { data: metrics, loading, error } = useFundingMetrics(pairSymbol || baseSymbol, days)

  const { projectedApy, latestApy } = useMemo(() => {
    if (!metrics) {
      return { projectedApy: null, latestApy: null }
    }
    const intervalsPerDay = metrics.intervalsPerDay || 3
    const intervalsPerYear = Math.max(1, intervalsPerDay * 365)
    const latestPoint = metrics.points?.[metrics.points.length - 1]
    const latestAnnualized = latestPoint
      ? (Math.pow(1 + latestPoint.rate, intervalsPerYear) - 1) * 100
      : null

    return {
      projectedApy: metrics.apyFunding * 100,
      latestApy: Number.isFinite(latestAnnualized) ? latestAnnualized : null
    }
  }, [metrics])

  return (
    <div className="module-card">
      <div className="module-card__head">
        <div>
          <p className="section-eyebrow" style={{ letterSpacing: '0.3em' }}>Funding</p>
          <p className="module-card__title">{token}</p>
        </div>
        {Number.isFinite(projectedApy) && (
          <span className="module-card__badge">{formatPercent(projectedApy)}</span>
        )}
      </div>

      {loading && <div className="module-card__loading">Chargement…</div>}

      {error && (
        <div className="module-card__error">Erreur&nbsp;: {String(error)}</div>
      )}

      {metrics && !loading && !error && (
        <div className="module-card__body">
          {Number.isFinite(projectedApy) && (
            <div className="module-card__stat">
              <span>APY projeté ({days} j)</span>
              <strong>{formatPercent(projectedApy)}</strong>
            </div>
          )}
          {Number.isFinite(latestApy) && (
            <div className="module-card__stat">
              <span>Dernier funding annualisé</span>
              <strong>{formatPercent(latestApy)}</strong>
            </div>
          )}
          <div className="module-card__foot">
            Intervalles / jour&nbsp;: {metrics.intervalsPerDay?.toFixed(1) ?? '—'}
          </div>
        </div>
      )}

      {!loading && !error && metrics?.points?.length === 0 && (
        <div className="module-card__foot">Aucune donnée Binance disponible pour cette période.</div>
      )}
    </div>
  )
}
