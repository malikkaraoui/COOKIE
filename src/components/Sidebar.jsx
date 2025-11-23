import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useResizablePanel } from '../hooks/useResizablePanel'
import { useNavigation } from '../context/NavigationContext'
import { useSelectedTokens } from '../context/SelectedTokensContext'
import { useAuth } from '../hooks/useAuth'
import { useDropZone } from '../hooks/useDropZone'
import ProfileButton from '../auth/ProfileButton'
import LogoutButton from '../auth/LogoutButton'

export default function Sidebar() {
  // gestion du redimensionnement horizontal
  const { size: width, isResizing, startResizing } = useResizablePanel({
    min: 110,
    max: 420,
    initial: 200,
    axis: 'x', // on redimensionne sur l'axe horizontal
  })

  // info de routing actuelle (/page1, /page2, /page3, etc.)
  const location = useLocation()

  // logique métier globale (si tu veux réutiliser activePage ailleurs)
  const { setActivePage } = useNavigation()

  // Auth
  const { user } = useAuth()

  // Gestion tokens sélectionnés et drop zone
  const { addToken, count } = useSelectedTokens()
  const [isShaking, setIsShaking] = useState(false)
  
  const { isActive: isDropZoneActive, dropHandlers, dropProps } = useDropZone(
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
      to: '/MarmitonCommunautaire', 
      label: 'Marmiton Communautaire',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.89-.96-7-5.44-7-10V8.3l7-3.5 7 3.5V10c0 4.56-3.11 9.04-7 10z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      )
    },
    { 
      to: '/MaCuisine', 
      label: 'Ma cuisine', 
      dropZone: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
      )
    },
    { 
      to: '/BinanceToken', 
      label: 'Binance liste token',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
        </svg>
      )
    },
  ]

  return (
    <>
      <nav className="sidebar" style={{ width }}>
        <div className="sidebar-inner">
          {links.map(({ to, label, dropZone, icon }) => {
            const active = location.pathname === to
            const isDropTarget = dropZone && isDropZoneActive
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
                  onClick={() => setActivePage(to)}
                >
                  {/* Icône */}
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    flexShrink: 0
                  }}>
                    {icon}
                  </span>
                  
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
          
          {/* Spacer pour pousser les boutons en bas */}
          <div style={{ flex: 1, minHeight: '20px' }} />
          
          {/* Boutons auth toujours en bas */}
          <ProfileButton />
          <LogoutButton />
        </div>
      </nav>

      <div
        className={`sidebar-resizer ${isResizing ? 'is-resizing' : ''}`}
        onMouseDown={startResizing}
      />
    </>
  )
}
