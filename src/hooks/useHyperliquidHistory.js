import { useEffect, useMemo, useState, useCallback } from 'react'
import { DEFAULT_HISTORY_TIMEFRAMES, fetchHyperliquidReturns } from '../lib/hyperliquidHistory'

const DEFAULT_OPTIONS = {
  timeframes: DEFAULT_HISTORY_TIMEFRAMES,
  enabled: true
}

const DEFAULT_TIMEFRAMES_KEY = DEFAULT_HISTORY_TIMEFRAMES.join('-')

const buildTokensKey = (tokensInput) => {
  if (!Array.isArray(tokensInput) || tokensInput.length === 0) {
    return ''
  }
  const normalized = new Set()
  tokensInput.forEach((token) => {
    if (!token) {
      return
    }
    if (typeof token === 'string') {
      const normalizedValue = token.trim().toUpperCase()
      if (normalizedValue) {
        normalized.add(normalizedValue)
      }
      return
    }
    if (typeof token?.symbol === 'string') {
      const normalizedValue = token.symbol.trim().toUpperCase()
      if (normalizedValue) {
        normalized.add(normalizedValue)
      }
    }
  })
  return Array.from(normalized).sort().join(',')
}

const parseTokensKey = (key) => {
  if (!key) {
    return []
  }
  return key.split(',').filter(Boolean)
}

const buildTimeframesKey = (timeframesInput) => {
  if (!Array.isArray(timeframesInput) || timeframesInput.length === 0) {
    return DEFAULT_TIMEFRAMES_KEY
  }
  const normalized = Array.from(
    new Set(
      timeframesInput
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

const parseTimeframesKey = (key) => {
  const source = key || DEFAULT_TIMEFRAMES_KEY
  const parsed = source
    .split('-')
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)

  return parsed.length ? parsed : DEFAULT_HISTORY_TIMEFRAMES
}

export function useHyperliquidHistory(tokens = [], options = DEFAULT_OPTIONS) {
  const { timeframes = DEFAULT_HISTORY_TIMEFRAMES, enabled = true } = options || DEFAULT_OPTIONS
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const tokensKey = useMemo(() => buildTokensKey(tokens), [tokens])
  const normalizedTokens = useMemo(() => parseTokensKey(tokensKey), [tokensKey])

  const timeframesKey = useMemo(() => buildTimeframesKey(timeframes), [timeframes])
  const normalizedTimeframes = useMemo(() => parseTimeframesKey(timeframesKey), [timeframesKey])

  const load = useCallback(async () => {
    if (!enabled || !normalizedTokens.length) {
      setData({})
      setLoading(false)
      setError(null)
      setLastUpdated(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.all(
        normalizedTokens.map((symbol) => fetchHyperliquidReturns(symbol, normalizedTimeframes))
      )
      const nextData = results.reduce((acc, entry) => {
        if (entry?.symbol) {
          acc[entry.symbol] = entry
        }
        return acc
      }, {})
      setData(nextData)
      setLastUpdated(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Historique Hyperliquid indisponible'))
    } finally {
      setLoading(false)
    }
  }, [enabled, normalizedTokens, normalizedTimeframes])

  useEffect(() => {
    load()
  }, [load])

  const refresh = useCallback(() => {
    return load()
  }, [load])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    hasData: Object.keys(data).length > 0 && !loading && !error
  }
}
