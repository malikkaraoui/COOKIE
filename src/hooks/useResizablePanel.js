// Hook pour panels redimensionnables
// axis: 'x' → largeur (sidebar, utilise clientX)
// axis: 'y' → hauteur (topbar, utilise clientY)

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// Réglages par défaut par axe
const AXIS_DEFAULTS = {
  x: { min: 140, max: 420, initial: 220 },
  y: { min: 80, max: 220, initial: 140 }
}

/**
 * Hook générique de redimensionnement avec configuration ultra-simple :
 * pour chaque axe (x/y), tu peux définir min / max / default.
 *
 * Exemple :
 * const sidebar = useResizablePanel({ axis: 'x', config: { min: 160, max: 360, initial: 240 } })
 * const topbar  = useResizablePanel({ axis: 'y', config: { min: 90,  max: 260, initial: 150 } })
 */
export function useResizablePanel({
  axis = 'y',
  config,
  // compatibilité : accepte toujours min/max/initial à la racine
  min,
  max,
  initial,
} = {}) {
  const baseConfig = AXIS_DEFAULTS[axis] || AXIS_DEFAULTS.y

  const resolvedConfig = useMemo(() => ({
    ...baseConfig,
    ...(config || {}),
    ...(min !== undefined ? { min } : {}),
    ...(max !== undefined ? { max } : {}),
    ...(initial !== undefined ? { initial } : {}),
  }), [baseConfig, config, min, max, initial])

  const configRef = useRef(resolvedConfig)
  const [size, setSize] = useState(() =>
    clamp(resolvedConfig.initial, resolvedConfig.min, resolvedConfig.max)
  )
  const [isResizing, setIsResizing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    configRef.current = resolvedConfig
  }, [resolvedConfig])

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return

    const position = axis === 'x' ? e.clientX : e.clientY
    const { min: activeMin, max: activeMax } = configRef.current
    setSize(clamp(position, activeMin, activeMax))
  }, [isResizing, axis])

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

  const handleDoubleClick = useCallback(() => {
    const { min: activeMin, max: activeMax } = configRef.current
    if (isCollapsed) {
      setSize(activeMax)
      setIsCollapsed(false)
    } else {
      setSize(activeMin)
      setIsCollapsed(true)
    }
  }, [isCollapsed])

  return {
    size,
    isResizing,
    startResizing,
    handleDoubleClick,
  }
}
