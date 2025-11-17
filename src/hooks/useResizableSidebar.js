// On importe les hooks React dont on a besoin
import { useState, useEffect } from 'react'

export function useResizableSidebar({
  min = 200,
  max = 420,
  initial = 260,
} = {}) {
  const [width, setWidth] = useState(initial)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    function handleMouseMove(e) {
      if (!isResizing) return

      const newWidth = Math.min(max, Math.max(min, e.clientX))
      setWidth(newWidth)
    }

    function handleMouseUp() {
      if (isResizing) setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, min, max])

  const startResizing = () => setIsResizing(true)

  return {
    width,
    isResizing,
    startResizing,
  }
}
