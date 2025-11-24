// Hook pour gérer les effets hover sur les éléments interactifs
// Retourne isHovered (état) + hoverHandlers (événements à spread)

import { useState } from 'react'

export function useHover() {
  const [isHovered, setIsHovered] = useState(false)

  const hoverHandlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  }

  return {
    isHovered,
    hoverHandlers,
  }
}

// Hook avec styles pré-configurés pour boutons
export function useButtonHover({
  baseColor = '#6f5a72',
  hoverColor = '#8b7490',
  baseBackground = 'transparent',
  hoverBackground = 'rgba(111, 90, 114, 0.1)',
  transition = 'all 0.2s ease',
} = {}) {
  const { isHovered, hoverHandlers } = useHover()

  const buttonStyle = {
    color: isHovered ? hoverColor : baseColor,
    background: isHovered ? hoverBackground : baseBackground,
    transition,
    cursor: 'pointer',
  }

  return {
    isHovered,
    hoverHandlers,
    buttonStyle,
  }
}
