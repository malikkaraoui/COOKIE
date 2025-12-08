import { useEffect, useState } from 'react'
import { fetchFundingMetrics } from '../lib/funding'

const REFRESH_INTERVAL_MS = 60_000

export function useFundingMetrics(symbol, days = 20) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!symbol) {
      setData(null)
      setError(null)
      return undefined
    }

    let currentController = new AbortController()
    let disposed = false

    const run = async (showLoader = true) => {
      if (currentController) {
        currentController.abort()
      }
      currentController = new AbortController()

      try {
        if (showLoader) {
          setLoading(true)
          setError(null)
        }
        const payload = await fetchFundingMetrics(symbol, days, currentController.signal)
        if (!disposed) {
          setData(payload)
          setError(null)
        }
      } catch (err) {
        if (err?.name === 'AbortError' || disposed) {
          return
        }
        setError(err?.message ?? 'Erreur inconnue')
        setData(null)
      } finally {
        if (!disposed) {
          setLoading(false)
        }
      }
    }

    run()
    const intervalId = setInterval(() => run(false), REFRESH_INTERVAL_MS)

    return () => {
      disposed = true
      if (currentController) {
        currentController.abort()
      }
      clearInterval(intervalId)
    }
  }, [symbol, days])

  return { data, loading, error }
}
