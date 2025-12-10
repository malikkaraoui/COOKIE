/**
 * Affichage des résultats de simulation portfolio
 * Valeur finale, Profit, Rendement Total
 */

export default function PortfolioResults({ results }) {
  const { valeurFinale = 0, profit = 0, rendementPct = 0 } = results || {}

  const metrics = [
    {
      label: 'Valeur finale',
      value: `${valeurFinale.toFixed(2)} $`,
      trend: 'neutral',
      icon: '📊'
    },
    {
      label: 'Profit',
      value: `${profit >= 0 ? '+' : ''}${profit.toFixed(2)} $`,
      trend: profit >= 0 ? 'positive' : 'negative',
      icon: profit >= 0 ? '📈' : '📉'
    },
    {
      label: 'Rendement total',
      value: `${rendementPct >= 0 ? '+' : ''}${rendementPct.toFixed(2)}%`,
      trend: rendementPct >= 0 ? 'positive' : 'negative',
      icon: '🎯'
    }
  ]

  return (
    <div className="k-results-grid">
      {metrics.map((metric) => (
        <div key={metric.label} className={`k-results-metric k-results-metric--${metric.trend}`}>
          <span className="k-results-label">
            <span className="k-results-icon" aria-hidden="true">{metric.icon}</span>
            {metric.label}
          </span>
          <strong className="k-results-value">{metric.value}</strong>
        </div>
      ))}
    </div>
  )
}
