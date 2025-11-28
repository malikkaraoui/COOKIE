import { useMemo } from 'react'
import { useToken } from '../hooks/useToken'
import { useBinanceToken } from '../hooks/useBinanceToken'
import TokenWeightSlider from './TokenWeightSlider'

/**
 * TokenWeightRow
 * Fournit un APY fiable au slider en s'abonnant directement à la bonne source:
 * - source === 'binance' -> useBinanceToken(symbol)
 * - sinon -> useToken(symbol) (Hyperliquid)
 */
export default function TokenWeightRow({ symbol, source = 'hyperliquid', color, weight, onChange }) {
  const hyperliquidData = useToken(symbol)
  const binanceData = useBinanceToken(symbol)
  const marketData = source === 'binance' ? binanceData : hyperliquidData

  // APY: priorite au deltaPct fourni; sinon calcul via price/prevDayPx
  const apy = useMemo(() => {
    let raw = marketData && marketData.deltaPct != null ? marketData.deltaPct : 0
    const numeric = typeof raw === 'string' ? parseFloat(raw) : raw

    if ((numeric === 0 || isNaN(numeric)) && marketData?.price != null && marketData?.prevDayPx != null && marketData.prevDayPx !== 0) {
      return ((marketData.price / marketData.prevDayPx - 1) * 100)
    }
    return numeric || 0
  }, [marketData])

  return (
    <TokenWeightSlider 
      symbol={symbol}
      weight={weight}
      onChange={onChange}
      color={color}
      apy={apy}
    />
  )
}
