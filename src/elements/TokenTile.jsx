// Composant générique TokenTile - affiche prix, variation et statut d'un token
// Utilise le hook useToken (Hyperliquid) ou useBinanceToken (Binance)
// Supporte drag & drop (desktop) et clic (mobile)
import { useState, useEffect } from 'react'
import { useToken } from '../hooks/useToken'
import { useBinanceToken } from '../hooks/useBinanceToken'
import { useTokenIcon } from '../hooks/useTokenIcon'
import { useDraggable } from '../hooks/useDraggable'
import Toast from '../components/Toast'

function narrowSpaces(str) { return str.replace(/\u00A0/g, "\u202F") }
function fmtUSD(n, decimals = null) {
  // Si pas de decimals spécifié, adapter selon le prix
  let maxDecimals = decimals
  if (maxDecimals === null) {
    if (n < 0.01) maxDecimals = 6       // Très petit prix (ex: kPEPE)
    else if (n < 1) maxDecimals = 4     // Petit prix
    else if (n < 100) maxDecimals = 2   // Prix moyen
    else maxDecimals = 0                // Grand prix
  }
  return narrowSpaces(n.toLocaleString('fr-FR', { style: 'currency', currency: 'USD', minimumFractionDigits: maxDecimals, maximumFractionDigits: maxDecimals }))
}
function fmtSignedAbs(n, d = 0) {
  const s = n >= 0 ? '' : '-'
  const a = Math.abs(n)
  return `${s}${a.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })}`
}

export default function TokenTile({
  symbol,
  source = 'hyperliquid',
  draggable = false,
  onAddToken,
  onRemoveToken,
  isSelected = false,
  selectionKey: externalSelectionKey,
  disableAdd = false,
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [toast, setToast] = useState(null)

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Utiliser le bon hook selon la source
  const tokenHyper = useToken(symbol)
  const tokenBinance = useBinanceToken(symbol)
  const token = source === 'binance' ? tokenBinance : tokenHyper
  
  const { iconPath, handleError } = useTokenIcon(symbol)
  const { dragHandlers, dragProps } = useDraggable(draggable)
  
  const hasDelta = token.deltaAbs != null && token.deltaPct != null
  const color = !hasDelta ? '#94a3b8' : token.deltaAbs >= 0 ? '#22c55e' : '#ef4444'
  const selectionKey = externalSelectionKey || `${symbol}:${source}`

  // Statut lisible
  let statusLabel = 'Chargement…'
  if (token.error) statusLabel = 'Erreur'
  else if (token.status === 'live') statusLabel = 'Live'
  else if (token.status === 'cached') statusLabel = 'Cache'
  else if (token.status === 'loading') statusLabel = 'Initialisation'

  // Source lisible (priorité au prop `source` passé par l'appelant)
  const resolvedSource = source || token.source
  let sourceLabel = 'Navigateur'
  if (resolvedSource === 'hyperliquid') sourceLabel = 'Hyperliquid'
  else if (resolvedSource === 'binance') sourceLabel = 'Binance'

  // Gestion clic mobile
  const attemptAddToken = () => {
    if (!onAddToken) {
      return null
    }
    const result = onAddToken(selectionKey)
    if (result?.success) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
      setToast({ message: `${symbol} ajouté !`, type: 'success' })
      console.log('✅', symbol, 'ajouté !')
    } else if (result?.reason === 'already_exists') {
      setToast({ message: `${symbol} déjà ajouté`, type: 'warning' })
      console.warn('⚠️', symbol, 'déjà ajouté')
    } else if (result?.reason === 'max_reached') {
      setToast({ message: 'Maximum 4 tokens atteint', type: 'warning' })
      console.warn('⚠️ Maximum 4 tokens')
    } else if (result?.reason === 'not_logged_in') {
      setToast({ message: 'Connecte-toi pour ajouter un token', type: 'warning' })
    }
    return result
  }

  const handleClick = (e) => {
    if (isMobile && draggable) {
      e.preventDefault()
      if (isSelected) {
        handleRemove()
      } else if (!disableAdd) {
        attemptAddToken()
      } else {
        setToast({ message: 'Maximum 4 tokens atteint', type: 'warning' })
      }
    }
  }

  const handleRemove = () => {
    if (!onRemoveToken || !isSelected || !selectionKey) {
      return
    }
    Promise.resolve(onRemoveToken(selectionKey))
      .then(() => {
        setToast({ message: `${symbol} retiré`, type: 'info' })
      })
      .catch((error) => {
        console.warn('Impossible de retirer le token:', error)
        setToast({ message: 'Erreur lors du retrait', type: 'warning' })
      })
  }

  const handleActionClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSelected) {
      handleRemove()
      return
    }
    if (disableAdd) {
      setToast({ message: 'Maximum 4 tokens atteint', type: 'warning' })
      return
    }
    attemptAddToken()
  }

  return (
    <>
    <div 
      style={{ 
        ...styles.card, 
        ...(draggable && !isMobile ? dragProps : {}),
        cursor: draggable ? (isMobile ? 'pointer' : 'grab') : 'default',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        animation: isAnimating ? 'pulseSuccess 0.6s ease-out' : 'none'
      }}
      {...(draggable && !isMobile ? dragHandlers : {})}
      onClick={isMobile && draggable ? handleClick : undefined}
      onDragStart={draggable && !isMobile ? (e) => dragHandlers.onDragStart(e, selectionKey) : undefined}
    >
      <img 
        src={iconPath} 
        alt={symbol} 
        width={36} 
        height={36} 
        style={styles.icon}
        onError={handleError}
      />
      <div style={styles.content}>
        <div style={styles.headerRow}>
          <div style={styles.name}>{token.name}</div>
          <span style={styles.sourceBadge}>{sourceLabel}</span>
        </div>
        <div style={{ ...styles.priceRow }}>
          <span style={styles.price}>{token.price != null ? fmtUSD(token.price) : '—'}</span>
          <span style={{ ...styles.delta, color }}>
            {hasDelta ? `${fmtSignedAbs(token.deltaPct, 2)}%` : '…'}
          </span>
        </div>
        <div style={styles.metaRow}>
          {token.error && <span style={{ color: '#ef4444' }}>⛔ {token.error}</span>}
          {!token.error && (
            <span>
              <span style={{ color: token.status === 'live' ? '#22c55e' : '#94a3b8' }}>{statusLabel}</span>
              {' • '}
              <span style={{ color: '#64748b' }}>Δ {hasDelta ? fmtSignedAbs(token.deltaAbs, token.price < 0.01 ? 6 : token.price < 1 ? 4 : 2) : '…'}</span>
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        style={{
          ...styles.actionButton,
          background: isSelected ? '#7f1d1d' : '#064e3b',
          borderColor: isSelected ? '#f87171' : '#34d399',
          color: isSelected ? '#fecaca' : '#bbf7d0',
          opacity: !isSelected && disableAdd ? 0.4 : 1,
          cursor: !isSelected && disableAdd ? 'not-allowed' : 'pointer',
        }}
        onClick={handleActionClick}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        disabled={!isSelected && disableAdd}
      >
        {isSelected ? 'Retirer' : 'Ajouter'}
      </button>
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

const styles = {
  card: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    padding: '8px 10px',
    background: '#0b1220',
    color: '#e5e7eb',
    borderRadius: 10,
    border: '1px solid #1f2a3b',
    width: '100%',
    gap: 12,
    minWidth: 0,
  },
  icon: { borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 8px rgba(15,23,42,0.6)', width: 32, height: 32 },
  content: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  headerRow: { display: 'flex', justifyContent: 'space-between', gap: 6, alignItems: 'center' },
  name: { fontSize: 10, color: '#cbd5f5', textTransform: 'uppercase', letterSpacing: 0.4, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  sourceBadge: { fontSize: 9, padding: '1px 5px', borderRadius: 999, background: '#1d2537', color: '#94a3b8', border: '1px solid #2b354a' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 },
  price: { fontSize: 16, fontWeight: 700, lineHeight: 1.1 },
  delta: { fontSize: 11 },
  metaRow: { fontSize: 10, color: '#94a3b8', minHeight: 12 },
  actionButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: '4px 8px',
    fontSize: 11,
    fontWeight: 600,
    transition: 'transform 0.15s ease, opacity 0.2s ease',
    minWidth: 68,
  },
}
