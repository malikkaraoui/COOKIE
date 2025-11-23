/**
 * Page Binance - Liste des tokens depuis Binance Spot API
 * Affiche tous les tokens configurés avec prix et variation 24h
 * Support drag & drop vers "Ma cuisine"
 */

import { useBinanceToken } from '../hooks/useBinanceToken'
import { useDraggable } from '../hooks/useDraggable'
import { BINANCE_SYMBOLS } from '../config/binanceConfig'

function BinanceTokenCard({ symbol }) {
  const { price, deltaPct, loading, error } = useBinanceToken(symbol)
  const { dragHandlers, dragProps } = useDraggable(true)

  // Couleurs par token
  const tokenColors = {
    BNB: '#F3BA2F',
    BTC: '#F7931A',
    ETH: '#627EEA',
    POL: '#8247E5',
    DOT: '#E6007A',
    ATOM: '#2E3148',
    DOGE: '#C3A634',
    SHIB: '#FFA409'
  }

  const color = tokenColors[symbol] || '#888'

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        border: `1px solid ${color}33`,
        cursor: 'grab',
        transition: 'transform 0.2s ease',
        ...dragProps
      }}
      {...dragHandlers}
      onDragStart={(e) => dragHandlers.onDragStart(e, `${symbol}:binance`)}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Nom du token */}
      <h3 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: color,
        marginBottom: '16px'
      }}>
        {symbol}
      </h3>

      {/* Prix et variation */}
      {loading || !price ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Chargement...</div>
      ) : error ? (
        <div style={{ color: '#ff4444', fontSize: '14px' }}>Erreur</div>
      ) : (
        <>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '8px'
          }}>
            ${price > 1 ? price.toFixed(2) : price.toFixed(8)}
          </div>

          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: deltaPct >= 0 ? '#00ff88' : '#ff4444'
          }}>
            {deltaPct >= 0 ? '+' : ''}{deltaPct?.toFixed(2)}%
          </div>
        </>
      )}

      {/* Source */}
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        color: '#888',
        fontSize: '12px'
      }}>
        Live • Binance
      </div>
    </div>
  )
}

export default function Page4() {
  const tokens = Object.keys(BINANCE_SYMBOLS)

  return (
    <div style={{ padding: '40px', width: '100%', overflowY: 'auto' }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        marginBottom: '12px',
        color: '#fff'
      }}>
        Binance liste token
      </h1>

      <p style={{ color: '#888', marginBottom: '40px', fontSize: '16px' }}>
        Glissez jusqu'à 4 tokens vers "Ma cuisine" pour les suivre
      </p>

      {/* Grid de tokens */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '1400px'
      }}>
        {tokens.map(symbol => (
          <BinanceTokenCard key={symbol} symbol={symbol} />
        ))}
      </div>
    </div>
  )
}
