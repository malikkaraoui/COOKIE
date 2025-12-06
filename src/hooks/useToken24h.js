// Hook générique pour récupérer les données d'un token (prix + variation 24h)
// Consomme MarketDataContext
import { useMarketData } from '../providers/MarketDataProvider'

export default function useToken24h(symbol) {
  const { getToken } = useMarketData()
  const token = getToken(symbol, 'hyperliquid')
  return {
    price: token?.price ?? null,
    prevDayPx: token?.prevDayPx ?? null,
    deltaAbs: token?.deltaAbs ?? null,
    deltaPct: token?.deltaPct ?? null,
    status: token?.status ?? 'loading',
    source: token?.source ?? 'cache',
    error: token?.error ?? null,
    updatedAt: token?.updatedAt ?? null
  }
}
