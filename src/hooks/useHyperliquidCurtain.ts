import { useState, useCallback } from 'react'
import { closeAllHyperliquidPositions } from '../lib/hyperliquidOrders'
import { clearActiveFundingSignal } from '../lib/database/xpService'
import { toast } from 'sonner'
import { useAuth } from './useAuth'
import { useTradeNotifications } from './useTradeNotifications'

interface CurtainStatus {
  state: 'idle' | 'loading' | 'success' | 'error'
  message: string
  payload: unknown
}

const INITIAL_STATUS: CurtainStatus = {
  state: 'idle',
  message: '',
  payload: null
}

const extractOrderIdFromStatus = (status: unknown, index: number) => {
  if (!status || typeof status !== 'object') {
    return null
  }
  const candidateKeys = [
    'restingOrderId',
    'resting_order_id',
    'orderId',
    'order_id',
    'oid',
    'id'
  ] as const
  for (const key of candidateKeys) {
    const value = (status as Record<string, unknown>)[key]
    if (value != null && value !== '') {
      return String(value)
    }
  }
  return `hl-close-${Date.now()}-${index}`
}

export function useHyperliquidCurtain() {
  const [status, setStatus] = useState<CurtainStatus>(INITIAL_STATUS)
  const { user } = useAuth()
  const { notifyOrderClosedByWatcher } = useTradeNotifications()

  const notifyHyperliquidClosures = useCallback((result: any) => {
    const statuses = Array.isArray(result?.statuses)
      ? result.statuses
      : Array.isArray(result?.data?.statuses)
        ? result.data.statuses
        : []
    if (!statuses.length) {
      return
    }
    const timestamp = Date.now()
    statuses.forEach((entry: any, index: number) => {
      const id = extractOrderIdFromStatus(entry, index) || `hl-close-${timestamp}-${index}`
      const symbol = typeof entry?.coin === 'string' ? entry.coin : 'Hyperliquid'
      let side: 'buy' | 'sell' | undefined
      if (typeof entry?.side === 'string') {
        side = entry.side.toLowerCase() === 'sell' ? 'sell' : 'buy'
      }
      notifyOrderClosedByWatcher({ id, symbol, side })
    })
  }, [notifyOrderClosedByWatcher])

  const pullCurtain = useCallback(async () => {
    setStatus({ state: 'loading', message: 'On baisse le rideau…', payload: null })
    try {
      const response = await closeAllHyperliquidPositions()
      const canceled = response.canceledOrders ?? 0
      const closed = response.closeOrdersPlaced ?? 0
      const summary = `Rideau tiré : ${closed} positions neutralisées, ${canceled} ordres annulés.`
      setStatus({ state: 'success', message: summary, payload: response })

      toast.success('Rideau baissé', {
        description: `${summary} Ta cuisine Hyperliquid est maintenant à plat.`,
        style: {
          backgroundColor: '#041b12',
          color: '#dcfce7',
          border: '1px solid #22c55e',
          boxShadow: '0 18px 40px rgba(34,197,94,0.35)'
        }
      })

      notifyHyperliquidClosures(response?.closeResult)
      notifyHyperliquidClosures(response?.cancelResult)

      if (user?.uid) {
        clearActiveFundingSignal(user.uid).catch((error) => {
          console.warn('Impossible de désactiver le signal XP du bouillon:', error)
        })
      }
    } catch (error: any) {
      const rawMessage = error?.message || 'Erreur inconnue côté Cloud Function'
      const friendlyMessage = /post-only/i.test(rawMessage)
        ? 'Hyperliquid redémarre : seuls les ordres post-only passent durant ~60s. Réessaie dans un instant.'
        : rawMessage
      setStatus({ state: 'error', message: friendlyMessage, payload: null })
    }
  }, [notifyHyperliquidClosures, user?.uid])

  return { status, pullCurtain }
}
