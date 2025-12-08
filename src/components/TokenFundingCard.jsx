import FundingChart from './FundingChart'
import { useFundingMetrics } from '../hooks/useFundingMetrics'

export default function TokenFundingCard({ baseSymbol, pairSymbol, days = 20 }) {
  const symbolLabel = baseSymbol || pairSymbol
  const { data: metrics, loading, error } = useFundingMetrics(pairSymbol || baseSymbol, days)

  return (
    <div className="rounded-2xl bg-slate-950/60 p-4 flex flex-col gap-2 border border-slate-800/60">
      <div className="flex justify-between items-baseline">
        <div>
          <div className="text-xs uppercase opacity-60">Token</div>
          <div className="text-lg font-semibold">{symbolLabel}</div>
          {pairSymbol && pairSymbol !== baseSymbol && (
            <div className="text-xs opacity-60">{pairSymbol}</div>
          )}
        </div>
        <div className="text-xs opacity-60">fenêtre {days} jours</div>
      </div>

      {loading && <div className="text-xs opacity-60">Chargement...</div>}
      {error && (
        <div className="text-xs text-red-400">
          Erreur : {String(error)}
        </div>
      )}

      {metrics && !loading && !error && (
        <>
          <div className="text-[11px] leading-4 space-y-1">
            <div>
              <span className="font-semibold">Funding moyen par intervalle : </span>
              {(metrics.meanPerInterval * 100).toFixed(4)}%
            </div>
            <div>
              <span className="font-semibold">Nombre d'intervalles / jour : </span>
              {metrics.intervalsPerDay.toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">APR projeté : </span>
              {(metrics.aprFunding * 100).toFixed(2)}%
            </div>
            <div>
              <span className="font-semibold">APY projeté : </span>
              {(metrics.apyFunding * 100).toFixed(2)}%
            </div>
          </div>

          <div className="mt-2">
            <FundingChart metrics={metrics} />
          </div>
        </>
      )}
    </div>
  )
}
