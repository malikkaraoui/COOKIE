export function buildMarketDataKey(symbol, source = 'hyperliquid') {
  const normalizedSymbol = typeof symbol === 'string' ? symbol.trim().toUpperCase() : ''
  if (!normalizedSymbol) {
    return ''
  }
  const normalizedSource = (source || 'hyperliquid').trim().toLowerCase()
  return normalizedSource === 'hyperliquid'
    ? normalizedSymbol
    : `${normalizedSymbol}:${normalizedSource}`
}
