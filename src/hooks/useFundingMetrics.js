import { useEffect, useState } from 'react'
import { fetchFundingMetrics } from '../lib/funding'

export function useFundingMetrics(symbol, days = 20) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!symbol) {
      return undefined
    }

    const controller = new AbortController()

    async function fetchMetrics() {
      try {
        setLoading(true)
        setError(null)
        const payload = await fetchFundingMetrics(symbol, days, controller.signal)
        setData(payload)
      } catch (err) {
        if (err.name === 'AbortError') {
          return
        }
        setError(err.message ?? 'Erreur inconnue')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()

    return () => {
      controller.abort()
    }
  }, [symbol, days])

  return { data, loading, error }
}
