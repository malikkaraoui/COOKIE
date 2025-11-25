import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useResizablePanel } from '../hooks/useResizablePanel'
import { useNavigation } from '../context/NavigationContext'
import { useSelectedTokens } from '../context/SelectedTokensContext'
import { useAuth } from '../hooks/useAuth'
import { useDropZone } from '../hooks/useDropZone'
import ProfileButton from '../auth/ProfileButton'
import LogoutButton from '../auth/LogoutButton'
import { ShoppingBasket, ChefHat, Soup, Menu, X } from 'lucide-react'

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
    min: 110,
    max: 420,
    initial: 200,
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
  const { user } = useAuth()

  // Gestion tokens sélectionnés et drop zone
  const { addToken, count } = useSelectedTokens()
  const [isShaking, setIsShaking] = useState(false)
  
  const { dropHandlers, dropProps } = useDropZone(
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
  ]

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
        className={`sidebar ${isMobile ? 'mobile' : ''} ${isMobileMenuOpen ? 'open' : ''}`}
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
            {links.map(({ to, label, dropZone, icon: Icon }) => {
              const active = location.pathname === to
              const isCompact = width < 160 // Mode compact si largeur < 160px

              return (
                <div
                  key={to}
                  style={{
                    position: 'relative',
                    padding: dropZone ? '8px' : '0',
                    borderRadius: dropZone ? '8px' : '0',
                    ...(dropZone ? dropProps : {})
                  }}
                  {...(dropZone ? dropHandlers : {})}
                >
                  <Link
                    to={to}
                    className={`nav-link ${active ? 'active' : ''}`}
                    style={{
                      animation: isShaking && dropZone ? 'shake 0.5s infinite' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      justifyContent: isCompact ? 'center' : 'flex-start'
                    }}
                    onClick={() => {
                      setActivePage(to)
                      closeMobileMenu()
                    }}
                  >
                    {/* Icône Lucide */}
                    <Icon size={20} strokeWidth={2} />
                    
                    {/* Texte (masqué en mode compact) */}
                    {!isCompact && (
                      <span style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1
                      }}>
                        {label}
                      </span>
                    )}
                    
                    {/* Badge count */}
                    {dropZone && count > 0 && !isCompact && (
                      <span style={{
                        padding: '2px 8px',
                        background: '#22c55e',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
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
            <ProfileButton />
            <LogoutButton />
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
