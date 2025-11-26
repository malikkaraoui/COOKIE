import { useResizablePanel } from '../hooks/useResizablePanel'
import { useState, useEffect } from 'react'
import LoginButton from '../auth/LoginButton'

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

  const { size: height, isResizing, startResizing, handleDoubleClick } = useResizablePanel({
    min: 60,
    max: 250,
    initial: 150,
    axis: 'y', // on redimensionne sur l'axe vertical
  })

  // Hauteur fixe sur mobile, variable sur desktop
  const topbarHeight = isMobile ? 60 : height

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
