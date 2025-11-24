/**
 * Affichage des résultats de simulation portfolio
 * Capital, Valeur finale, Profit, APY moyen, Rendement
 */

export default function PortfolioResults({ results, capitalInitial }) {
  const { valeurFinale, profit, apyMoyenPct, rendementPct } = results

  const metrics = [
    {
      label: 'Capital Initial',
      value: `${capitalInitial.toFixed(2)} $`,
      color: '#94a3b8',
      icon: '💰'
    },
    {
      label: 'Valeur Finale',
      value: `${valeurFinale.toFixed(2)} $`,
      color: '#3b82f6',
      icon: '📊'
    },
    {
      label: 'Profit',
      value: `${profit >= 0 ? '+' : ''}${profit.toFixed(2)} $`,
      color: profit >= 0 ? '#22c55e' : '#ef4444',
      icon: profit >= 0 ? '📈' : '📉'
    },
    {
      label: 'APY Moyen',
      value: `${apyMoyenPct >= 0 ? '+' : ''}${apyMoyenPct.toFixed(2)}%`,
      color: apyMoyenPct >= 0 ? '#22c55e' : '#ef4444',
      icon: '⚡'
    },
    {
      label: 'Rendement Total',
      value: `${rendementPct >= 0 ? '+' : ''}${rendementPct.toFixed(2)}%`,
      color: rendementPct >= 0 ? '#22c55e' : '#ef4444',
      icon: '🎯'
    }
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginBottom: '32px'
    }}>
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #334155',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>
            {metric.icon}
          </div>
          <div style={{ 
            color: '#94a3b8', 
            fontSize: '12px', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            {metric.label}
          </div>
          <div style={{ 
            color: metric.color, 
            fontSize: '24px', 
            fontWeight: 'bold' 
          }}>
            {metric.value}
          </div>
        </div>
      ))}
    </div>
  )
}
