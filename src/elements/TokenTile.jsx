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

  const cardClassNames = [
    'token-card',
    token.error && 'token-card--error',
    isSelected && 'token-card--selected',
  ].filter(Boolean).join(' ')

  const dragStyle = draggable && !isMobile ? dragProps : {}
  const dragAttributes = draggable && !isMobile
    ? {
        ...dragHandlers,
        onDragStart: (e) => dragHandlers.onDragStart(e, selectionKey),
      }
    : {}

  return (
    <>
      <div
        className={cardClassNames}
        style={{
          cursor: draggable ? (isMobile ? 'pointer' : 'grab') : 'default',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          animation: isAnimating ? 'pulseSuccess 0.6s ease-out' : 'none',
          ...dragStyle,
        }}
        {...dragAttributes}
        onClick={isMobile && draggable ? handleClick : undefined}
      >
        <div className="token-card__icon">
          <img src={iconPath} alt={symbol} onError={handleError} />
        </div>

        <div className="token-card__body">
          <div className="token-card__header">
            <span className="token-card__symbol">{symbol}</span>
            <div className="token-card__name" title={token.name}>{token.name}</div>
            <span className="token-card__source">{sourceLabel}</span>
          </div>

          <div className="token-card__metrics">
            <span className="token-card__price">{token.price != null ? fmtUSD(token.price) : '—'}</span>
            <span className="token-card__delta" style={{ color }}>
              {hasDelta ? `${fmtSignedAbs(token.deltaPct, 2)}%` : '…'}
            </span>
          </div>

          <div className="token-card__meta">
            {token.error ? (
              <span style={{ color: '#b91c1c' }}>⛔ {token.error}</span>
            ) : (
              <>
                <span style={{ color: token.status === 'live' ? '#22c55e' : '#94a3b8' }}>{statusLabel}</span>
                <span>
                  Δ {hasDelta ? fmtSignedAbs(token.deltaAbs, token.price < 0.01 ? 6 : token.price < 1 ? 4 : 2) : '…'}
                </span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          className={['token-card__action', isSelected && 'token-card__action--remove'].filter(Boolean).join(' ')}
          onClick={handleActionClick}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          disabled={!isSelected && disableAdd}
        >
          {isSelected ? 'Retirer' : 'Ajouter'}
        </button>
      </div>

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
