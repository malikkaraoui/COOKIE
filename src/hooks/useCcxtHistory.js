import { useState, useMemo, useEffect, useCallback } from 'react'
import { fetchCcxtHistory, DEFAULT_CCXT_TIMEFRAMES } from '../lib/ccxtHistory'

const DEFAULT_OPTIONS = {
  quote: 'USDT',
  exchange: 'binance',
  timeframes: DEFAULT_CCXT_TIMEFRAMES,
  enabled: true
}

const DEFAULT_SYMBOLS_KEY = ''
const DEFAULT_TIMEFRAMES_KEY = DEFAULT_CCXT_TIMEFRAMES.join('-')

function buildSymbolsKey(symbols) {
  if (!Array.isArray(symbols) || symbols.length === 0) {
    return DEFAULT_SYMBOLS_KEY
  }
  const normalized = Array.from(
    new Set(
      symbols
        .map((symbol) => (typeof symbol === 'string' ? symbol : symbol?.symbol))
        .filter(Boolean)
        .map((value) => value.trim().toUpperCase())
        .filter(Boolean)
    )
  )
  if (!normalized.length) {
    return DEFAULT_SYMBOLS_KEY
  }
  return normalized.sort().join(',')
}

function parseSymbolsKey(key) {
  if (!key) {
    return []
  }
  return key.split(',').filter(Boolean)
}

function buildTimeframesKey(timeframes) {
  if (!Array.isArray(timeframes) || !timeframes.length) {
    return DEFAULT_TIMEFRAMES_KEY
  }
  const normalized = Array.from(
    new Set(
      timeframes
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
        .map((value) => Math.round(value))
    )
  )
    .sort((a, b) => a - b)

  if (!normalized.length) {
    return DEFAULT_TIMEFRAMES_KEY
  }
  return normalized.join('-')
}

function parseTimeframesKey(key) {
  const source = key || DEFAULT_TIMEFRAMES_KEY
  const parsed = source
    .split('-')
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)

  return parsed.length ? parsed : DEFAULT_CCXT_TIMEFRAMES
}

export function useCcxtHistory(symbols = [], options = DEFAULT_OPTIONS) {
  const {
    quote = DEFAULT_OPTIONS.quote,
    exchange = DEFAULT_OPTIONS.exchange,
    timeframes = DEFAULT_OPTIONS.timeframes,
    enabled = DEFAULT_OPTIONS.enabled
  } = options || DEFAULT_OPTIONS

  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const symbolsKey = useMemo(() => buildSymbolsKey(symbols), [symbols])
  const normalizedSymbols = useMemo(() => parseSymbolsKey(symbolsKey), [symbolsKey])

  const timeframesKey = useMemo(() => buildTimeframesKey(timeframes), [timeframes])
  const normalizedTimeframes = useMemo(() => parseTimeframesKey(timeframesKey), [timeframesKey])

  const load = useCallback(async () => {
    if (!enabled || !normalizedSymbols.length) {
      setData({})
      setLoading(false)
      setError(null)
      setLastUpdated(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await fetchCcxtHistory(normalizedSymbols, {
        quote,
        exchange,
        timeframes: normalizedTimeframes
      })
      setData(result)
      setLastUpdated(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Historique CCXT indisponible'))
    } finally {
      setLoading(false)
    }
  }, [enabled, normalizedSymbols, normalizedTimeframes, quote, exchange])

  useEffect(() => {
    load()
  }, [load])

  const refresh = useCallback(() => load(), [load])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    hasData: Object.keys(data).length > 0 && !loading && !error
  }
}
