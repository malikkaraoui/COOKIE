import { INFO_URL } from './hlEndpoints'

const DAY_IN_MS = 24 * 60 * 60 * 1000
const DEFAULT_INTERVAL = '1d'
export const DEFAULT_HISTORY_TIMEFRAMES = [5, 10, 15, 20]

const jsonHeaders = {
  'Content-Type': 'application/json'
}

async function postInfo(body) {
  const response = await fetch(INFO_URL, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = response.statusText
    try {
      errorMessage = await response.text()
    } catch {
      // noop
    }
    throw new Error(`Hyperliquid info ${body?.type || 'request'} failed: ${errorMessage}`)
  }

  return response.json()
}

export async function fetchHyperliquidCandles(coin, {
  interval = DEFAULT_INTERVAL,
  startTime,
  endTime
} = {}) {
  const normalized = (coin || '').trim().toUpperCase()
  if (!normalized) {
    throw new Error('coin requis pour fetchHyperliquidCandles')
  }

  const now = Date.now()
  const safeEndTime = Number.isFinite(endTime) ? endTime : now
  const safeStartTime = Number.isFinite(startTime) ? startTime : safeEndTime - (30 * DAY_IN_MS)

  const payload = {
    type: 'candleSnapshot',
    req: {
      coin: normalized,
      interval,
      startTime: Math.floor(safeStartTime),
      endTime: Math.floor(safeEndTime)
    }
  }

  const data = await postInfo(payload)
  if (!Array.isArray(data)) {
    throw new Error('Réponse candleSnapshot inattendue')
  }
  return data
}

function sanitizeTimeframes(timeframes) {
  const candidates = Array.isArray(timeframes) ? timeframes : DEFAULT_HISTORY_TIMEFRAMES
  return Array.from(new Set(
    candidates
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .map((value) => Math.round(value))
  )).sort((a, b) => a - b)
}

export async function fetchHyperliquidReturns(coin, timeframes = DEFAULT_HISTORY_TIMEFRAMES) {
  const normalized = (coin || '').trim().toUpperCase()
  if (!normalized) {
    throw new Error('coin requis pour fetchHyperliquidReturns')
  }

  const sanitized = sanitizeTimeframes(timeframes)
  if (!sanitized.length) {
    return {
      symbol: normalized,
      returns: {},
      lastClose: null,
      lastTimestamp: null,
      sampleSize: 0
    }
  }

  const maxDays = sanitized[sanitized.length - 1]
  const endTime = Date.now()
  const startTime = endTime - (maxDays + 2) * DAY_IN_MS

  const candles = await fetchHyperliquidCandles(normalized, {
    interval: DEFAULT_INTERVAL,
    startTime,
    endTime
  })

  const sorted = candles
    .filter((candle) => candle && typeof candle === 'object')
    .sort((a, b) => (Number(a?.t) || 0) - (Number(b?.t) || 0))

  if (!sorted.length) {
    throw new Error(`Aucune donnée historique pour ${normalized}`)
  }

  const lastCandle = sorted[sorted.length - 1]
  const lastClose = Number(lastCandle?.c)
  if (!Number.isFinite(lastClose) || lastClose <= 0) {
    throw new Error(`Clôture invalide pour ${normalized}`)
  }

  const returns = {}
  sanitized.forEach((days) => {
    const index = sorted.length - 1 - days
    if (index < 0) {
      returns[days] = null
      return
    }
    const referenceClose = Number(sorted[index]?.c)
    if (!Number.isFinite(referenceClose) || referenceClose <= 0) {
      returns[days] = null
      return
    }
    returns[days] = ((lastClose - referenceClose) / referenceClose) * 100
  })

  const series = sorted
    .map((candle) => ({
      time: Number(candle?.T ?? candle?.t) || null,
      close: Number(candle?.c)
    }))
    .filter((entry) => Number.isFinite(entry.time) && Number.isFinite(entry.close) && entry.close > 0)

  return {
    symbol: normalized,
    returns,
    lastClose,
    lastTimestamp: Number(lastCandle?.T ?? lastCandle?.t) || null,
    sampleSize: sorted.length,
    series
  }
}
