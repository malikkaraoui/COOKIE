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
    <div className="rounded-2xl bg-slate-950/70 p-4 flex flex-col gap-3 border border-slate-800/70">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-semibold text-white drop-shadow-sm">{token}</p>
        {Number.isFinite(projectedApy) && (
          <span className="text-sm font-semibold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full">
            {formatPercent(projectedApy)}
          </span>
        )}
      </div>

      {loading && <div className="text-xs text-slate-400">Chargement…</div>}
      {error && (
        <div className="text-xs text-red-400">Erreur&nbsp;: {String(error)}</div>
      )}

      {metrics && !loading && !error && (
        <div className="space-y-1 text-sm text-slate-300">
          {Number.isFinite(projectedApy) && (
            <p>
              APY projeté ({days} j)&nbsp;:
              <span className="text-emerald-300 font-semibold ml-1">
                {formatPercent(projectedApy)}
              </span>
            </p>
          )}
          {Number.isFinite(latestApy) && (
            <p>
              Dernier funding annualisé&nbsp;:
              <span className="ml-1 font-medium text-slate-100">
                {formatPercent(latestApy)}
              </span>
            </p>
          )}
          <p className="text-xs text-slate-500">
            Intervalles / jour&nbsp;: {metrics.intervalsPerDay?.toFixed(1) ?? '—'}
          </p>
        </div>
      )}

      {!loading && !error && metrics?.points?.length === 0 && (
        <p className="text-xs text-slate-400">Aucune donnée Binance disponible pour cette période.</p>
      )}
    </div>
  )
}
