// Hook pour récupérer l'icône d'un token
// Centralise la logique de mapping symbole -> chemin d'image
import { getTokenConfig } from '../config/tokenList'

const TOKEN_ICON_FONT_FAMILY = 'Space Grotesk, Arial, sans-serif'

export function useTokenIcon(symbol) {
  const config = getTokenConfig(symbol)
  
  // Chemin vers l'icône dans /public/assets
  const iconPath = `/assets/${symbol.toLowerCase()}.png`
  
  // Fallback : génère une icône SVG avec le symbole si pas d'image
  const fallbackIcon = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Ccircle cx="20" cy="20" r="20" fill="${encodeURIComponent(config?.color || '#666')}"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="white" font-size="14" font-family="${TOKEN_ICON_FONT_FAMILY}" font-weight="700"%3E${symbol}%3C/text%3E%3C/svg%3E`
  
  return {
    iconPath,
    fallbackIcon,
    // Helper pour gérer l'erreur de chargement
    handleError: (e) => {
      e.target.src = fallbackIcon
      e.target.onerror = null
    }
  }
}
