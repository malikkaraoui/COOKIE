import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useResizablePanel } from '../hooks/useResizablePanel'
import { useNavigation } from '../context/NavigationContext'
import { useSelectedTokens } from '../context/SelectedTokensContext'
import { useAuth } from '../hooks/useAuth'
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

  // Gestion tokens sélectionnés
  const { addToken, count, isFull } = useSelectedTokens()
  const [isDropZoneActive, setIsDropZoneActive] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const links = [
    { to: '/page1', label: 'Marmiton Communautaire' },
    { to: '/page2', label: 'Ma cuisine', dropZone: true },
  ]

  // Handlers drop zone
  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (!isDropZoneActive) {
      setIsDropZoneActive(true)
      setIsShaking(true)
    }
  }

  const handleDragLeave = () => {
    setIsDropZoneActive(false)
    setIsShaking(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      alert('Veuillez vous connecter pour ajouter des tokens à votre cuisine')
      setIsDropZoneActive(false)
      setIsShaking(false)
      return
    }

    const symbol = e.dataTransfer.getData('text/plain')
    if (symbol) {
      addToken(symbol)
    }
    setIsDropZoneActive(false)
    setIsShaking(false)
  }

  return (
    <>
      <nav className="sidebar" style={{ width }}>
        <div className="sidebar-inner">
          {links.map(({ to, label, dropZone }) => {
            const active = location.pathname === to
            const isDropTarget = dropZone && isDropZoneActive

            return (
              <div
                key={to}
                style={{
                  position: 'relative',
                  padding: dropZone ? '8px' : '0',
                  borderRadius: dropZone ? '8px' : '0',
                  background: isDropTarget ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                  border: isDropTarget ? '2px dashed #22c55e' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                onDragOver={dropZone ? handleDragOver : undefined}
                onDragLeave={dropZone ? handleDragLeave : undefined}
                onDrop={dropZone ? handleDrop : undefined}
              >
                <Link
                  to={to}
                  className={`nav-link ${active ? 'active' : ''}`}
                  style={{
                    animation: isShaking && dropZone ? 'shake 0.5s infinite' : 'none'
                  }}
                  onClick={() => setActivePage(to)}
                >
                  {label}
                  {dropZone && count > 0 && (
                    <span style={{
                      marginLeft: '8px',
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
                </Link>
              </div>
            )
          })}
          
          <div className="sidebar-spacer" />
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
