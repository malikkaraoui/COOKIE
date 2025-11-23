// Hook pour panels redimensionnables
// axis: 'x' → largeur (sidebar, utilise clientX)
// axis: 'y' → hauteur (topbar, utilise clientY)

import { useState, useEffect, useCallback } from 'react'

export function useResizablePanel({
  min = 80,
  max = 200,
  initial = 100,
  axis = 'y', // 'x' = largeur, 'y' = hauteur
} = {}) {
  const [size, setSize] = useState(initial)
  const [isResizing, setIsResizing] = useState(false)

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return

    // Pour l'axe X (sidebar): clientX donne directement la largeur depuis la gauche
    // Pour l'axe Y (topbar): clientY donne directement la hauteur depuis le haut
    const position = axis === 'x' ? e.clientX : e.clientY

    const newSize = Math.min(max, Math.max(min, position))
    setSize(newSize)
  }, [isResizing, min, max, axis])

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false)
    }
  }, [isResizing])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const startResizing = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  return {
    size,
    isResizing,
    startResizing,
  }
}
