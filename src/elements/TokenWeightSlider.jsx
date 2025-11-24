/**
 * Slider de poids pour un token individuel
 * Affiche le symbole, APY, et slider horizontal 0-100%
 */

import { getTokenAPY } from '../hooks/usePortfolioSimulation'

export default function TokenWeightSlider({ symbol, weight, onChange, disabled = false, color }) {
  const apy = getTokenAPY(symbol)
  const weightPct = (weight * 100).toFixed(1)

  const handleChange = (e) => {
    const newWeightPct = parseFloat(e.target.value)
    onChange(newWeightPct / 100)
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 0',
      borderBottom: '1px solid #334155'
    }}>
      {/* Symbole + APY */}
      <div style={{ minWidth: '100px' }}>
        <div style={{ 
          color: color || '#e5e7eb', 
          fontSize: '16px', 
          fontWeight: 'bold',
          marginBottom: '4px'
        }}>
          {symbol}
        </div>
        <div style={{ 
          color: apy >= 0 ? '#22c55e' : '#ef4444', 
          fontSize: '12px',
          fontWeight: '600'
        }}>
          APY: {apy >= 0 ? '+' : ''}{(apy * 100).toFixed(0)}%
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={weight * 100}
        onChange={handleChange}
        disabled={disabled}
        style={{
          flex: 1,
          height: '8px',
          borderRadius: '4px',
          background: `linear-gradient(to right, ${color || '#3b82f6'} 0%, ${color || '#3b82f6'} ${weightPct}%, #334155 ${weightPct}%, #334155 100%)`,
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1
        }}
      />

      {/* Pourcentage */}
      <div style={{
        minWidth: '60px',
        textAlign: 'right',
        color: '#e5e7eb',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        {weightPct}%
      </div>
    </div>
  )
}
