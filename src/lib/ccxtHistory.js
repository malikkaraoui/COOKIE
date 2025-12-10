import { getFunctionsBaseUrl } from './hyperliquidOrders'

export const DEFAULT_CCXT_TIMEFRAMES = [5, 10, 15, 20]

const FUNCTIONS_BASE_URL = getFunctionsBaseUrl()
const CCXT_HISTORY_ENDPOINT = `${FUNCTIONS_BASE_URL}/ccxtHistory`

function sanitizeSymbols(symbols) {
  if (!Array.isArray(symbols)) {
    return []
  }
  return Array.from(
    new Set(
      symbols
        .map((symbol) => (typeof symbol === 'string' ? symbol : symbol?.symbol))
        .filter(Boolean)
        .map((value) => value.trim().toUpperCase())
        .filter(Boolean)
    )
  )
}

function sanitizeTimeframes(timeframes) {
  const raw = Array.isArray(timeframes) ? timeframes : DEFAULT_CCXT_TIMEFRAMES
  const seen = new Set()
  const normalized = []
  raw.forEach((value) => {
    const numeric = Number(value)
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return
    }
    const rounded = Math.round(numeric)
    if (seen.has(rounded)) {
      return
    }
    seen.add(rounded)
    normalized.push(rounded)
  })
  normalized.sort((a, b) => a - b)
  return normalized.length ? normalized : DEFAULT_CCXT_TIMEFRAMES
}

export async function fetchCcxtHistory(symbols = [], options = {}) {
  const normalizedSymbols = sanitizeSymbols(symbols)
  if (!normalizedSymbols.length) {
    return {}
  }

  const {
    quote = 'USDT',
    exchange = 'binance',
    timeframes = DEFAULT_CCXT_TIMEFRAMES
  } = options || {}

  const payload = {
    symbols: normalizedSymbols,
    quote,
    exchange,
    timeframes: sanitizeTimeframes(timeframes)
  }

  let response
  try {
    response = await fetch(CCXT_HISTORY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  } catch (networkError) {
    throw new Error(`Impossible de contacter ccxtHistory: ${networkError?.message || networkError}`)
  }

  const rawText = await response.text()
  let parsed
  try {
    parsed = rawText ? JSON.parse(rawText) : null
  } catch (parseError) {
    const message = parseError instanceof Error ? parseError.message : 'inconnu'
    throw new Error(`Réponse invalide de ccxtHistory: ${rawText} (${message})`)
  }

  if (!response.ok) {
    const message = parsed?.error || response.statusText || 'Erreur CCXT'
    throw new Error(message)
  }

  const symbolsPayload = parsed?.symbols && typeof parsed.symbols === 'object' ? parsed.symbols : {}
  const normalizedMap = {}
  Object.keys(symbolsPayload).forEach((key) => {
    if (!key) {
      return
    }
    const normalizedKey = key.trim().toUpperCase()
    normalizedMap[normalizedKey] = symbolsPayload[key]
  })

  return normalizedMap
}
