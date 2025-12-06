// Hook pour accéder aux données d'un token spécifique
// Utilise MarketDataContext pour récupérer prix, variation, statut
import { useMarketData } from '../providers/MarketDataProvider'
import { getTokenConfig } from '../config/tokenList'

export function useToken(symbol) {
  const { getToken } = useMarketData()
  const data = getToken(symbol, 'hyperliquid')
  const config = getTokenConfig(symbol)

  return {
    // Données live
    price: data?.price ?? null,
    prevDayPx: data?.prevDayPx ?? null,
    deltaAbs: data?.deltaAbs ?? null,
    deltaPct: data?.deltaPct ?? null,
    status: data?.status ?? 'loading',
    source: data?.source ?? 'cache',
    updatedAt: data?.updatedAt ?? null,
    
    // Config statique
    name: config?.name ?? symbol,
    color: config?.color ?? '#666',
    decimals: config?.decimals ?? 2,
    
    // Helper
    isLive: data?.status === 'live',
    hasError: data?.status === 'error',
    error: data?.error ?? null
  }
}
