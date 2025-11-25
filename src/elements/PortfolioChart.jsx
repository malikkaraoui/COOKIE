/**
 * Graphique circulaire (Pie Chart) SVG pour visualisation portfolio
 * Composant réutilisable avec légende
 */

export default function PortfolioChart({ weights, tokensData }) {
  if (!tokensData || tokensData.length === 0) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: '#64748b' 
      }}>
        Aucune donnée à afficher
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '40px',
      flexWrap: 'wrap'
    }}>
      {/* Pie Chart SVG */}
      <svg width="240" height="240" viewBox="0 0 240 240">
        <PieChartSlices weights={weights} tokensData={tokensData} />
      </svg>

      {/* Légende */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tokensData.map(token => (
          <div key={token.symbol} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: token.color
            }} />
            <span style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: '600' }}>
              {token.symbol}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>
              {((weights[token.symbol] || 0) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Sous-composant : Slices du pie chart
 */
function PieChartSlices({ weights, tokensData }) {
  const slices = []
  let currentAngle = -90 // Commencer en haut

  tokensData.forEach(token => {
    const weight = weights[token.symbol] || 0
    const angle = weight * 360
    
    if (weight === 0) return

    // Si 100%, dessiner un cercle complet au lieu d'un arc
    if (weight >= 0.9999) {
      slices.push(
        <circle
          key={token.symbol}
          cx="120"
          cy="120"
          r="100"
          fill={token.color}
          stroke="#0f172a"
          strokeWidth="2"
        />
      )
      return
    }

    // Calcul des coordonnées de l'arc
    const startAngle = currentAngle
    const endAngle = currentAngle + angle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = 120 + 100 * Math.cos(startRad)
    const y1 = 120 + 100 * Math.sin(startRad)
    const x2 = 120 + 100 * Math.cos(endRad)
    const y2 = 120 + 100 * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    const pathData = [
      `M 120 120`,
      `L ${x1} ${y1}`,
      `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ')

    slices.push(
      <path
        key={token.symbol}
        d={pathData}
        fill={token.color}
        stroke="#0f172a"
        strokeWidth="2"
      />
    )

    currentAngle = endAngle
  })

  return (
    <g>
      {/* Cercle de fond */}
      <circle cx="120" cy="120" r="100" fill="#0f172a" />
      
      {/* Slices */}
      {slices}

      {/* Cercle central */}
      <circle cx="120" cy="120" r="40" fill="#1e293b" />
    </g>
  )
}
