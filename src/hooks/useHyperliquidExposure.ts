import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchHyperliquidOpenOrders } from '../lib/hyperliquidOrders'

type ExposureStatus = 'idle' | 'loading' | 'refreshing' | 'success' | 'error'

interface ExposureCounts {
  orders: number
  positions: number
}

interface ExposureState {
  status: ExposureStatus
  error: string | null
  lastUpdated: number | null
  counts: ExposureCounts
  payload: unknown
}

const DEFAULT_STATE: ExposureState = {
  status: 'idle',
  error: null,
  lastUpdated: null,
  counts: { orders: 0, positions: 0 },
  payload: null
}

const DEFAULT_OPTIONS = {
  pollIntervalMs: 40000
}

export function useHyperliquidExposure(options: { pollIntervalMs?: number } = {}) {
  const { pollIntervalMs } = { ...DEFAULT_OPTIONS, ...options }
  const [state, setState] = useState<ExposureState>(DEFAULT_STATE)
  const mountedRef = useRef(true)

  const safeSetState = useCallback((updater: (prev: ExposureState) => ExposureState) => {
    if (!mountedRef.current) {
      return
    }
    setState((prev) => updater(prev))
  }, [])

  const refresh = useCallback(async () => {
    safeSetState((prev) => ({
      ...prev,
      status: prev.status === 'success' ? 'refreshing' : 'loading',
      error: null
    }))
    try {
      const response = await fetchHyperliquidOpenOrders()
      const orders = Array.isArray(response?.openOrders)
        ? response.openOrders.length
        : Number(response?.counts?.orders) || 0
      const positions = Array.isArray(response?.openPositions)
        ? response.openPositions.length
        : Number(response?.counts?.positions) || 0

      safeSetState(() => ({
        status: 'success',
        error: null,
        lastUpdated: Date.now(),
        counts: { orders, positions },
        payload: response
      }))
    } catch (error: any) {
      const message = error?.message || 'Impossible de récupérer les expositions Hyperliquid'
      safeSetState((prev) => ({
        ...prev,
        status: 'error',
        error: message
      }))
    }
  }, [safeSetState])

  useEffect(() => {
    mountedRef.current = true
    refresh()
    if (!pollIntervalMs || pollIntervalMs <= 0) {
      return () => {
        mountedRef.current = false
      }
    }
    const intervalId = setInterval(refresh, pollIntervalMs)
    return () => {
      mountedRef.current = false
      clearInterval(intervalId)
    }
  }, [pollIntervalMs, refresh])

  const hasExposure = useMemo(() => {
    return (state.counts.orders + state.counts.positions) > 0
  }, [state.counts.orders, state.counts.positions])

  return {
    ...state,
    hasExposure,
    refresh
  }
}
