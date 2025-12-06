import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelectedTokens } from '../context/SelectedTokensContext'

const BasketIcon = ({ isActive }) => (
  <svg
    className="floating-basket__icon"
    width="28"
    height="28"
    viewBox="0 0 32 32"
    aria-hidden="true"
  >
    <path
      d="M6 12h20l-2 14H8L6 12z"
      fill={isActive ? 'url(#basketGradient)' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 12l4-6 4 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 18h0.01M20 18h0.01"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="basketGradient" x1="6" y1="12" x2="26" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f472b6" />
        <stop offset="0.45" stopColor="#facc15" />
        <stop offset="1" stopColor="#34d399" />
      </linearGradient>
    </defs>
  </svg>
)

export default function FloatingKitchenCart() {
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedTokens, count, maxTokens } = useSelectedTokens()

  const previewTokens = useMemo(() => {
    if (!selectedTokens?.length) {
      return null
    }
    return selectedTokens
      .slice(0, 3)
      .map(entry => entry.split(':')[0])
      .join(' • ')
  }, [selectedTokens])

  const handleClick = () => {
    if (location.pathname === '/ma-cuisine') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    navigate('/ma-cuisine')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        'floating-basket',
        count === 0 ? 'floating-basket--empty' : 'floating-basket--filled',
      ].join(' ')}
      aria-live="polite"
      aria-label={`Ouvrir Ma cuisine (${count} / ${maxTokens})`}
      title={
        count > 0
          ? `Ma cuisine contient ${count} ingrédient${count > 1 ? 's' : ''}`
          : 'Ajoute des ingrédients depuis Épicerie fine'
      }
    >
      <BasketIcon isActive={count > 0} />

      <div className="floating-basket__meta">
        <span className="floating-basket__label">Ma cuisine</span>
        <span className="floating-basket__preview">
          {previewTokens ?? 'Ajoute tes ingrédients depuis Épicerie fine'}
        </span>
      </div>

      <div className="floating-basket__counter" aria-hidden="true">
        <span className="floating-basket__badge">{count}</span>
        <span className="floating-basket__capacity">/{maxTokens}</span>
      </div>
    </button>
  )
}
