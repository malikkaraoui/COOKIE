/**
 * Page Binance - Liste des tokens depuis Binance Spot API
 * Affiche tous les tokens de la whitelist (30 tokens) avec prix et variation 24h
 * Support drag & drop (desktop) et clic (mobile)
 * 
 * Utilise src/config/binanceTrackedTokens.js comme source
 */

import { useState, useEffect } from 'react'
import { useBinanceToken } from '../hooks/useBinanceToken'
import { useDraggable } from '../hooks/useDraggable'
import { BINANCE_DEFAULT_TOKENS } from '../config/binanceTrackedTokens.js'
import { useSelectedTokens } from '../context/SelectedTokensContext'
import Toast from '../components/Toast'

function BinanceTokenCard({ tokenId, isMobile, onAddToken }) {
  const { price, deltaPct, loading, error } = useBinanceToken(tokenId)
  const { dragHandlers, dragProps } = useDraggable(!isMobile)
  const [isAnimating, setIsAnimating] = useState(false)
  const [toast, setToast] = useState(null)

  // Couleurs par token (palette étendue pour 30 tokens)
  const tokenColors = {
    // Top 3
    BTC: '#F7931A', ETH: '#627EEA', BNB: '#F3BA2F',
    // Majors L1
    SOL: '#14F195', XRP: '#23292F', ADA: '#0033AD', 
    TON: '#0088CC', TRX: '#FF0013', AVAX: '#E84142',
    // Memes
    DOGE: '#C3A634', SHIB: '#FFA409', PEPE: '#3D9970',
    // DeFi
    LINK: '#2A5ADA', DOT: '#E6007A', MATIC: '#8247E5',
    UNI: '#FF007A', RUNE: '#00CCAB', INJ: '#00F2FE', ATOM: '#2E3148',
    // L1/L2 récents
    SUI: '#4DA2FF', APT: '#00D4AA', ARB: '#28A0F0',
    OP: '#FF0420', SEI: '#B91C1C', TIA: '#7B2BF9',
    // Old school
    LTC: '#345D9D', BCH: '#8DC351',
    // Narrative
    ORDI: '#FF6B00', JUP: '#FFA500',
    // DeFi BSC
    CAKE: '#D1884F'
  }

  const color = tokenColors[tokenId] || '#888'

  // Gestion clic mobile
  const handleClick = (e) => {
    if (isMobile && onAddToken) {
      e.preventDefault()
      const result = onAddToken(`${tokenId}:binance`)
      if (result?.success) {
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 600)
        setToast({ message: `${tokenId} ajouté !`, type: 'success' })
        console.log('✅', tokenId, 'ajouté !')
      } else if (result?.reason === 'already_exists') {
        setToast({ message: `${tokenId} déjà ajouté`, type: 'warning' })
        console.warn('⚠️', tokenId, 'déjà ajouté')
      } else if (result?.reason === 'max_reached') {
        setToast({ message: 'Maximum 4 tokens atteint', type: 'warning' })
        console.warn('⚠️ Maximum 4 tokens')
      }
    }
  }

  return (
    <>
    <div 
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        border: `1px solid ${color}33`,
        cursor: isMobile ? 'pointer' : 'grab',
        transition: 'transform 0.2s ease',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        animation: isAnimating ? 'pulseSuccess 0.6s ease-out' : 'none',
        ...(isMobile ? {} : dragProps)
      }}
      {...(isMobile ? {} : dragHandlers)}
      onClick={isMobile ? handleClick : undefined}
      onDragStart={isMobile ? undefined : (e) => dragHandlers.onDragStart(e, `${tokenId}:binance`)}
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
        {tokenId}
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
    
    {/* Toast notification */}
    {toast && (
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(null)} 
      />
    )}
  </>
  )
}

export default function Page4() {
  const { addToken } = useSelectedTokens()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div style={{ padding: '40px', width: '100%', overflowY: 'auto' }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        marginBottom: '12px',
        color: '#fff'
      }}>
        Binance liste token ({BINANCE_DEFAULT_TOKENS.length} tokens)
      </h1>

      <p style={{ color: '#888', marginBottom: '40px', fontSize: '16px' }}>
        Glissez jusqu'à 4 Inggrédients vers "Ma cuisine" à cuisiner !! 👨🏼‍🍳
      </p>

      {/* Grid de tokens */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '1400px'
      }}>
        {BINANCE_DEFAULT_TOKENS.map(token => (
          <BinanceTokenCard 
            key={token.id} 
            tokenId={token.id}
            isMobile={isMobile}
            onAddToken={addToken}
          />
        ))}
      </div>
    </div>
  )
}
