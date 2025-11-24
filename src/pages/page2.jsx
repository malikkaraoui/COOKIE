/**
 * Ma Cuisine - Simulateur de Portfolio Crypto
 * Ajustez vos allocations et visualisez les performances
 * Utilise les tokens sélectionnés avec leurs variations 24h comme APY
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBasket } from 'lucide-react'
import TokenTile from '../elements/TokenTile'
import TokenWeightSlider from '../elements/TokenWeightSlider'
import PortfolioResults from '../elements/PortfolioResults'
import { usePortfolioSimulation } from '../hooks/usePortfolioSimulation'
import { useSelectedTokens } from '../context/SelectedTokensContext'
import { useAuth } from '../hooks/useAuth'
import { useMarketData } from '../context/MarketDataContext'
import { useBinancePrices } from '../hooks/useBinancePrices'

// Couleurs par token
const TOKEN_COLORS = {
  BTC: '#f7931a',
  ETH: '#627eea',
  SOL: '#14f195',
  BNB: '#f3ba2f',
  DOGE: '#c2a633',
  MATIC: '#8247e5',
  kPEPE: '#4caf50',
  AVAX: '#e84142',
  ATOM: '#2e3148',
  APT: '#00bfff'
}

export default function Page2() {
  const { selectedTokens, removeToken, count } = useSelectedTokens()
  const { user } = useAuth()
  const { getToken } = useMarketData()
  const binancePrices = useBinancePrices()
  
  // Récupérer les données des tokens sélectionnés avec deltaPct
  const tokensData = useMemo(() => {
    return selectedTokens.map(symbolWithSource => {
      const [symbol, source] = symbolWithSource.includes(':') 
        ? symbolWithSource.split(':') 
        : [symbolWithSource, 'hyperliquid']
      
      // Récupérer deltaPct selon la source
      let tokenData
      if (source === 'binance') {
        tokenData = binancePrices[symbol] || { deltaPct: 0 }
      } else {
        tokenData = getToken(symbol)
      }
      
      return {
        symbol,
        source,
        deltaPct: tokenData.deltaPct || 0,
        color: TOKEN_COLORS[symbol] || '#666'
      }
    })
  }, [selectedTokens, binancePrices, getToken])
  
  // Simulateur de portfolio avec tokens dynamiques
  const {
    capitalInitial,
    setCapitalInitial,
    weights,
    setWeight,
    resetWeights,
    results
  } = usePortfolioSimulation(1000, tokensData)

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#e5e7eb', 
          fontSize: '32px', 
          fontWeight: 'bold',
          margin: 0,
          marginBottom: '8px'
        }}>
          Ma Cuisine 👨🏼‍🍳
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
          Simulateur de portfolio • Optimisez vos allocations
        </p>
      </div>

      {/* Message si aucun token */}
      {tokensData.length === 0 ? (
        <div style={{
          padding: '60px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '24px',
          border: '2px dashed #334155'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
          <h2 style={{ color: '#e5e7eb', fontSize: '24px', marginBottom: '12px' }}>
            Aucun token dans votre cuisine
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '24px' }}>
            Ajoutez des tokens depuis l'Épicerie fine pour commencer à simuler votre portfolio
          </p>
          <Link
            to="/ÉpicerieFine"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <ShoppingBasket size={20} />
            Aller à l'Épicerie fine
          </Link>
        </div>
      ) : (
        <>
      {/* Capital Initial Slider */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #334155'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <label style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '600' }}>
            💰 Capital Initial
          </label>
          <span style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>
            ${capitalInitial.toFixed(0)}
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="10000"
          step="10"
          value={capitalInitial}
          onChange={(e) => setCapitalInitial(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '10px',
            borderRadius: '5px',
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((capitalInitial - 10) / 9990) * 100}%, #334155 ${((capitalInitial - 10) / 9990) * 100}%, #334155 100%)`,
            outline: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '8px',
          color: '#64748b',
          fontSize: '12px'
        }}>
          <span>$10</span>
          <span>$10,000</span>
        </div>
      </div>

      {/* Résultats */}
      <PortfolioResults results={results} />

      {/* Faders de poids */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #334155'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            🎚️ Répartition Portfolio
          </h3>
          <button
            onClick={resetWeights}
            style={{
              padding: '8px 16px',
              background: '#334155',
              color: '#e5e7eb',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
          >
            Réinitialiser
          </button>
        </div>

        {/* Sliders dynamiques */}
        {tokensData.map(token => (
          <TokenWeightSlider
            key={token.symbol}
            symbol={token.symbol}
            weight={weights[token.symbol] || 0}
            onChange={(newWeight) => setWeight(token.symbol, newWeight)}
            color={token.color}
          />
        ))}

        {/* Total */}
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
            Total Allocation
          </span>
          <span style={{ 
            color: '#22c55e', 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            100.0% ✓
          </span>
        </div>
      </div>

      {/* Graphique circulaire (Pie Chart) */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid #334155'
      }}>
        <h3 style={{ 
          color: '#e5e7eb', 
          fontSize: '18px', 
          fontWeight: 'bold', 
          margin: 0,
          marginBottom: '24px'
        }}>
          📊 Visualisation Portfolio
        </h3>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '40px',
          flexWrap: 'wrap'
        }}>
          {/* Pie Chart */}
          <svg width="240" height="240" viewBox="0 0 240 240">
            <PieChart weights={weights} tokensData={tokensData} />
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
      </div>

      {/* Tokens sélectionnés (ancien affichage) */}
      {selectedTokens.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: 'center',
          color: '#64748b',
          background: '#1e293b',
          borderRadius: 12,
          border: '2px dashed #334155'
        }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Aucun token sélectionné</p>
          <p style={{ fontSize: 14 }}>
            {user
              ? 'Glissez des tokens depuis "Épicerie fine" pour les suivre ici'
              : 'Connectez-vous pour commencer à cuisiner'
            }
          </p>
        </div>
      ) : (
        <div>
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            🔖 Mes Tokens Suivis ({count}/4)
          </h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {selectedTokens.map(symbolWithSource => {
              const [symbol, source] = symbolWithSource.includes(':') 
                ? symbolWithSource.split(':') 
                : [symbolWithSource, 'hyperliquid']
              
              return (
                <div key={symbolWithSource} style={{ position: 'relative' }}>
                  <TokenTile symbol={symbol} source={source} />
                  <button
                    onClick={() => removeToken(symbolWithSource)}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                    title={`Retirer ${symbol}`}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}

// Composant Pie Chart SVG
function PieChart({ weights, tokensData }) {
  let currentAngle = -90 // Commencer en haut

  return (
    <g>
      {/* Cercle de fond */}
      <circle cx="120" cy="120" r="100" fill="#0f172a" />
      
      {/* Slices */}
      {tokensData.map(token => {
        const weight = weights[token.symbol] || 0
        const angle = weight * 360
        
        if (weight === 0) return null

        // Si 100%, dessiner un cercle complet au lieu d'un arc
        if (weight >= 0.9999) {
          return (
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
        }

        // Calcul des coordonnées de l'arc
        const startAngle = currentAngle
        const endAngle = currentAngle + angle
        currentAngle = endAngle

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

        return (
          <path
            key={token.symbol}
            d={pathData}
            fill={token.color}
            stroke="#0f172a"
            strokeWidth="2"
          />
        )
      })}

      {/* Cercle central */}
      <circle cx="120" cy="120" r="40" fill="#1e293b" />
    </g>
  )
}
