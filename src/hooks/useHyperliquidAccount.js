import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { INFO_URL } from '../lib/hlEndpoints'
import { useWalletIdentity } from './useWalletIdentity'

const DEFAULT_STATE = {
  status: 'idle',
  error: null,
  lastUpdated: null,
  perp: null,
  spot: null,
  totals: null
}

const DEFAULT_OPTIONS = {
  pollIntervalMs: 30000
}

const SAFE_NUMBER = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  if (value == null) {
    return 0
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

async function postInfo(body, signal) {
  const response = await fetch(INFO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `Hyperliquid info error ${response.status}`)
  }

  return response.json()
}

function parsePerpAccount(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      accountValue: 0,
      withdrawable: 0,
      marginUsed: 0,
      totalNotional: 0,
      positions: [],
      raw
    }
  }

  const marginSummary = raw.marginSummary || {}
  const accountValue = SAFE_NUMBER(marginSummary.accountValue)
  const marginUsed = SAFE_NUMBER(marginSummary.totalMarginUsed)
  const totalNotional = SAFE_NUMBER(marginSummary.totalNtlPos)
  const withdrawable = SAFE_NUMBER(raw.withdrawable)
  const positions = Array.isArray(raw.assetPositions) ? raw.assetPositions : []

  return {
    accountValue,
    withdrawable,
    marginUsed,
    totalNotional,
    positions,
    raw
  }
}

function parseSpotAccount(raw) {
  const balances = Array.isArray(raw?.balances) ? raw.balances : []

  const summary = balances.reduce(
    (acc, entry) => {
      const total = SAFE_NUMBER(entry.total)
      const hold = SAFE_NUMBER(entry.hold)
      const available = Math.max(0, total - hold)
      acc.total += total
      acc.hold += hold
      acc.available += available
      acc.items.push({
        coin: entry.coin || '—',
        token: entry.token,
        total,
        hold,
        available
      })
      return acc
    },
    { total: 0, hold: 0, available: 0, items: [] }
  )

  return {
    totalUsd: summary.total,
    holdUsd: summary.hold,
    availableUsd: summary.available,
    balances: summary.items,
    raw
  }
}

export function useHyperliquidAccount(options = {}) {
  const { pollIntervalMs } = { ...DEFAULT_OPTIONS, ...options }
  const wallet = useWalletIdentity()
  const walletAddress = wallet?.address?.toLowerCase() ?? null
  const [state, setState] = useState(DEFAULT_STATE)
  const abortRef = useRef(null)

  const setSafeState = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return next
    })
  }, [])

  const resetState = useCallback(() => {
    setSafeState({ ...DEFAULT_STATE })
  }, [setSafeState])

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
        abortRef.current = null
      }
    }
  }, [])

  const fetchAccount = useCallback(async () => {
    if (!walletAddress) {
      resetState()
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setSafeState((prev) => ({
      ...prev,
      status: prev.status === 'success' ? 'refreshing' : 'loading',
      error: null
    }))

    try {
      const [perpRaw, spotRaw] = await Promise.all([
        postInfo({ type: 'clearinghouseState', user: walletAddress }, controller.signal),
        postInfo({ type: 'spotClearinghouseState', user: walletAddress }, controller.signal)
      ])

      const perp = parsePerpAccount(perpRaw)
      const spot = parseSpotAccount(spotRaw)
      const totals = {
        globalUsd: perp.accountValue + spot.totalUsd,
        availableUsd: perp.withdrawable + spot.availableUsd,
        spotHoldUsd: spot.holdUsd
      }

      setSafeState({
        status: 'success',
        error: null,
        lastUpdated: Date.now(),
        perp,
        spot,
        totals
      })
    } catch (error) {
      if (error?.name === 'AbortError') {
        return
      }
      setSafeState((prev) => ({
        ...prev,
        status: 'error',
        error: error?.message || 'Impossible de récupérer le compte Hyperliquid'
      }))
    } finally {
      abortRef.current = null
    }
  }, [walletAddress, resetState, setSafeState])

  useEffect(() => {
    if (!walletAddress) {
      abortRef.current?.abort()
      abortRef.current = null
      resetState()
      return
    }

    fetchAccount()

    if (!pollIntervalMs || pollIntervalMs <= 0) {
      return () => {
        abortRef.current?.abort()
        abortRef.current = null
      }
    }

    const intervalId = setInterval(() => {
      fetchAccount()
    }, pollIntervalMs)

    return () => {
      clearInterval(intervalId)
      abortRef.current?.abort()
      abortRef.current = null
    }
  }, [walletAddress, pollIntervalMs, fetchAccount, resetState])

  const derived = useMemo(() => {
    return {
      status: state.status,
      error: state.error,
      lastUpdated: state.lastUpdated,
      perp: state.perp,
      spot: state.spot,
      totals: state.totals,
      walletAddress,
      hasWallet: Boolean(walletAddress)
    }
  }, [state, walletAddress])

  return {
    ...derived,
    refetch: fetchAccount
  }
}
