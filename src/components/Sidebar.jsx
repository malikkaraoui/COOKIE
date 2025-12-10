import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, createElement } from 'react'
import { useResizablePanel } from '../hooks/useResizablePanel'
import { useNavigation } from '../context/NavigationContext'
import { useSelectedTokens } from '../context/SelectedTokensContext'
import { useAuth } from '../hooks/useAuth'
import { useDropZone } from '../hooks/useDropZone'
import { isActivePath } from '../lib/pathUtils'
import { getHoverLabelProps } from '../lib/ui/hoverLabels'
import ProfileButton from '../auth/ProfileButton'
import { ReownLogoutButton } from './auth/ReownLogoutButton'
import { ShoppingBasket, ChefHat, Soup, Menu, X, CreditCard, Sprout } from 'lucide-react'

// Styles Sidebar COMPACT, ce réglage permet le redimensionnement
const SIDEBAR_COMPACT_WIDTH = 170

export default function Sidebar() {
  // État mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fermer menu mobile quand on clique sur un lien
  const closeMobileMenu = () => {
    if (isMobile) setIsMobileMenuOpen(false)
  }

  // gestion du redimensionnement horizontal (desktop seulement)
  const { size: width, isResizing, startResizing, handleDoubleClick } = useResizablePanel({
    min: 100,
    max: 235,
    initial: 210,
    axis: 'x', // on redimensionne sur l'axe horizontal
  })

  // Calculer la hauteur disponible (100vh - topbar - topbar-resizer)
  // Topbar par défaut = 150px, resizer = 6px
  const [sidebarHeight, setSidebarHeight] = useState('calc(100vh - 156px)')

  // Observer la hauteur de la topbar
  useEffect(() => {
    const updateHeight = () => {
      const topbar = document.querySelector('.topbar')
      const resizer = document.querySelector('.topbar-resizer')

      const topbarHeight = topbar?.offsetHeight ?? 0
      const resizerHeight = resizer?.offsetHeight ?? 0

      setSidebarHeight(`calc(100vh - ${topbarHeight + resizerHeight}px)`)
    }

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateHeight)
      : null

    const observed = [
      document.querySelector('.topbar'),
      document.querySelector('.topbar-resizer')
    ].filter(Boolean)

    observed.forEach((el) => observer?.observe(el))
    updateHeight()

    return () => observer?.disconnect()
  }, [])

  // info de routing actuelle (/page1, /page2, /page3, etc.)
  const location = useLocation()

  // logique métier globale (si tu veux réutiliser activePage ailleurs)
  const { setActivePage } = useNavigation()

  // Auth
  const { user } = useAuth()

  // Gestion tokens sélectionnés et drop zone
  const { addToken, count } = useSelectedTokens()
  const [isShaking, setIsShaking] = useState(false)
  
  const { dropHandlers, isActive: isDropZoneActive } = useDropZone(
    (symbol) => {
      // Vérifier si l'utilisateur est connecté
      if (!user) {
        alert('Veuillez vous connecter pour ajouter des tokens à votre cuisine')
        return
      }
      addToken(symbol)
    },
    {
      enabled: true,
      onEnter: () => setIsShaking(true),
      onLeave: () => setIsShaking(false)
    }
  )

  const links = [
    { 
      to: '/epicerie-fine', 
      label: 'Épicerie fine',
      icon: ShoppingBasket
    },
    { 
      to: '/ma-cuisine', 
      label: 'Ma cuisine', 
      dropZone: true,
      icon: ChefHat
    },
    { 
      to: '/la-marmite', 
      label: 'La Marmite',
      icon: Soup
    },
    {
      to: '/bouillon-de-legumes',
      label: 'Bouillon de légumes',
      icon: Sprout
    },
    // Lien Stripe visible uniquement pour les utilisateurs connectés
    ...(user ? [{
      to: '/epicerie-premium',
      label: 'Acheter Premium',
      icon: CreditCard
    }] : []),
  ]

  // Déterminer si on est en mode compact
  const appliedWidth = isMobile ? 280 : width
  const isCompact = appliedWidth <= SIDEBAR_COMPACT_WIDTH

  return (
    <>
      {/* Bouton hamburger (mobile uniquement) */}
      {isMobile && (
        <button
          className="mobile-menu-toggle"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Hamburger clicked, current state:', isMobileMenuOpen)
            setIsMobileMenuOpen(!isMobileMenuOpen)
          }}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 10000,
            background: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          {isMobileMenuOpen ? (
            <X size={24} color="white" />
          ) : (
            <Menu size={24} color="white" />
          )}
        </button>
      )}

      {/* Backdrop (mobile uniquement) */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      <nav 
        className={`sidebar ${isMobile ? 'mobile' : ''} ${isMobileMenuOpen ? 'open' : ''} ${isCompact ? 'sidebar--compact' : ''}`}
        style={{ 
          width: isMobile ? '280px' : width, 
          height: sidebarHeight,
          transform: isMobile && !isMobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: isMobile ? 'transform 0.3s ease-out' : 'none',
          position: isMobile ? 'fixed' : 'relative',
          zIndex: isMobile ? 1000 : 'auto',
          left: isMobile ? 0 : 'auto'
        }}
      >
        <div className="sidebar-inner">
          {/* Zone scrollable des liens */}
          <div className="scrollable-links">
            {links.map(({ to, label, dropZone, icon: IconComponent }) => {
              const active = isActivePath(location.pathname, to)
              const hoverLabelProps = getHoverLabelProps(label)

              return (
                <div
                  key={to}
                  className={`nav-link-wrapper${dropZone ? ' nav-link-wrapper--dropzone' : ''}${dropZone && isDropZoneActive ? ' nav-link-wrapper--dropzone-active' : ''}`}
                  {...(dropZone ? dropHandlers : {})}
                >
                  <Link
                    to={to}
                    className={`nav-link ${active ? 'active' : ''} ${isCompact ? 'nav-link--compact' : ''}`}
                    style={{
                      animation: isShaking && dropZone ? 'shake 0.5s infinite' : 'none'
                    }}
                    {...hoverLabelProps}
                    onClick={() => {
                      setActivePage(to)
                      closeMobileMenu()
                    }}
                  >
                    {/* Icône Lucide */}
                    <span className="nav-link-icon">
                      {createElement(IconComponent, { size: 20, strokeWidth: 2 })}
                    </span>
                    
                    {/* Texte (masqué en mode compact) */}
                    {!isCompact && (
                      <span className="nav-link-label">
                        {label}
                      </span>
                    )}
                    
                    {/* Badge count */}
                    {dropZone && count > 0 && !isCompact && (
                      <span className="nav-link-extra">
                        {count}/{4}
                      </span>
                    )}
                    
                    {/* Badge count compact */}
                    {dropZone && count > 0 && isCompact && (
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '8px',
                        height: '8px',
                        background: '#ffb347',
                        borderRadius: '50%',
                        border: '2px solid #fff3da'
                      }} />
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
          
          {/* Footer fixe en bas avec les boutons auth */}
          <div className="sidebar-footer">
            <div className="sidebar-footer__stack">
              {user && (
                <>
                  <ProfileButton isCompact={isCompact} />
                </>
              )}
              <ReownLogoutButton isCompact={isCompact} />
            </div>
          </div>
        </div>
      </nav>

      {/* Resizer (desktop uniquement) */}
      {!isMobile && (
        <div
          className={`sidebar-resizer ${isResizing ? 'is-resizing' : ''}`}
          onMouseDown={startResizing}
          onDoubleClick={handleDoubleClick}
          title="Double-clic pour réduire/étendre"
        />
      )}
    </>
  )
}
