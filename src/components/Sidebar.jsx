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
import LogoutButton from '../auth/LogoutButton'
import LoginSidebarButton from '../auth/LoginSidebarButton'
import { ShoppingBasket, ChefHat, Soup, Menu, X, CreditCard } from 'lucide-react'

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
      if (topbar && resizer) {
        const topbarHeight = topbar.offsetHeight
        const resizerHeight = resizer.offsetHeight
        setSidebarHeight(`calc(100vh - ${topbarHeight + resizerHeight}px)`)
      }
    }
    
    // Observer les changements de taille de la topbar
    const observer = new ResizeObserver(updateHeight)
    const topbar = document.querySelector('.topbar')
    if (topbar) observer.observe(topbar)
    
    updateHeight()
    return () => observer.disconnect()
  }, [])

  // info de routing actuelle (/page1, /page2, /page3, etc.)
  const location = useLocation()

  // logique métier globale (si tu veux réutiliser activePage ailleurs)
  const { setActivePage } = useNavigation()

  // Auth
  const { user, signInWithGoogle } = useAuth()
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const [authModalLoading, setAuthModalLoading] = useState(false)
  const [authModalError, setAuthModalError] = useState('')

  const openAuthModal = () => {
    setAuthModalError('')
    setAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    if (authModalLoading) return
    setAuthModalOpen(false)
    setAuthModalError('')
  }

  const handleAuthModalLogin = async () => {
    try {
      setAuthModalLoading(true)
      setAuthModalError('')
      await signInWithGoogle()
      setAuthModalOpen(false)
    } catch (err) {
      setAuthModalError(err?.message || 'Impossible de vous connecter pour le moment.')
    } finally {
      setAuthModalLoading(false)
    }
  }

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
      to: '/ÉpicerieFine', 
      label: 'Épicerie fine',
      icon: ShoppingBasket
    },
    { 
      to: '/MaCuisine', 
      label: 'Ma cuisine', 
      dropZone: true,
      icon: ChefHat
    },
    { 
      to: '/LaMarmite', 
      label: 'La Marmite',
      icon: Soup
    },
    // Lien Stripe visible uniquement pour les utilisateurs connectés
    ...(user ? [{
      to: '/Stripe',
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
                        background: '#22c55e',
                        borderRadius: '50%',
                        border: '2px solid #e7cfcf'
                      }} />
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
          
          {/* Footer fixe en bas avec les boutons auth */}
          <div className="sidebar-footer">
            {user ? (
              <>
                <ProfileButton isCompact={isCompact} />
                <LogoutButton isCompact={isCompact} />
              </>
            ) : (
              <LoginSidebarButton
                isCompact={isCompact}
                onClick={openAuthModal}
              />
            )}
          </div>
        </div>
      </nav>

      {isAuthModalOpen && (
        <div
          className="auth-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          onClick={closeAuthModal}
        >
          <div
            className="auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="auth-modal-close"
              type="button"
              aria-label="Fermer la fenêtre de connexion"
              onClick={closeAuthModal}
              disabled={authModalLoading}
            >
              ×
            </button>

            <div className="auth-modal-content">
              <h3 id="auth-modal-title">Connecte-toi pour cuisiner</h3>
              <p>
                Retrouve ta cuisine personnalisée, synchronise tes ingrédients et débloque toutes les fonctionnalités premium.
              </p>

              {authModalError && (
                <div className="auth-modal-error">
                  {authModalError}
                </div>
              )}

              <button
                type="button"
                className="auth-modal-primary"
                onClick={handleAuthModalLogin}
                disabled={authModalLoading}
              >
                {authModalLoading ? 'Connexion en cours…' : 'Se connecter avec Google'}
              </button>

              <button
                type="button"
                className="auth-modal-secondary"
                onClick={closeAuthModal}
                disabled={authModalLoading}
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}

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
