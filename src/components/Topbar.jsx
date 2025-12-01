import { useResizablePanel } from '../hooks/useResizablePanel'
import { useState, useEffect } from 'react'
import LoginButton from '../auth/LoginButton'

// Modifie ici les réglages par défaut de la topbar
const TOPBAR_DESKTOP_CONFIG = {
  min: 64,   // hauteur mini quand on redimensionne (desktop)
  max: 150,   // hauteur maxi
  initial: 80, // hauteur par défaut
}

const TOPBAR_MOBILE_CONFIG = {
  min: 70,
  max: 70,
  initial: 70, // hauteur fixe affichée sur mobile
}

export default function Topbar() {
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

  const { size: desktopHeight, isResizing, startResizing, handleDoubleClick } = useResizablePanel({
    axis: 'y',
    config: TOPBAR_DESKTOP_CONFIG,
  })

  const topbarHeight = isMobile
    ? TOPBAR_MOBILE_CONFIG.initial
    : desktopHeight

  return (
    <>
      <header className="topbar" style={{ height: topbarHeight }}>
        <div className="topbar-content">
          <LoginButton />
        </div>
      </header>

      {/* Resizer uniquement sur desktop */}
      {!isMobile && (
        <div
          className={`topbar-resizer ${isResizing ? 'is-resizing' : ''}`}
          onMouseDown={startResizing}
          onDoubleClick={handleDoubleClick}
          title="Double-clic pour réduire/étendre"
        />
      )}
    </>
  )
}
