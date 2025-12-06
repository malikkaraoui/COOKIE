/**
 * Ma Cuisine - Simulateur de Portfolio Crypto
 * Ajustez vos allocations et visualisez les performances
 */

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import TokenTile from '../elements/TokenTile'
import TokenWeightSlider from '../elements/TokenWeightSlider'
import TokenWeightRow from '../elements/TokenWeightRow'
import PortfolioResults from '../elements/PortfolioResults'
import PortfolioChart from '../elements/PortfolioChart'
import { usePortfolioSimulation } from '../hooks/usePortfolioSimulation'
import { useSelectedTokens } from '../context/SelectedTokensContext'
import { useAuth } from '../hooks/useAuth'
import { useMarketData } from '../providers/MarketDataProvider'
import { buildMarketDataKey } from '../lib/marketDataKeys'
import { getTokenConfig } from '../config/tokenList'
import { BINANCE_DEFAULT_TOKENS } from '../config/binanceTrackedTokens.js'
import { 
  placeHyperliquidTestOrder, 
  fetchHyperliquidOpenOrders,
  closeAllHyperliquidPositions
} from '../lib/hyperliquidOrders'
import {
  placeBinanceOrder,
  placeBinancePresetOrder,
  placeBinanceLargePresetOrder,
  fetchBinanceOpenOrders,
  cancelAllBinanceOrders,
  closeAndDustBinancePositions,
  BINANCE_PRESET_ORDER
} from '../services/trading/binanceApi'
import { 
  getInitialCapital, 
  saveInitialCapital, 
  subscribeInitialCapital 
} from '../lib/database/userService'

// Composant interne pour bouton de suppression (adapté mobile)
function DeleteButton({ symbol, onRemove, isMobile }) {
  const size = isMobile ? 40 : 24
  const fontSize = isMobile ? 24 : 14
  const offset = isMobile ? -12 : -8

  return (
    <button
      onClick={onRemove}
      style={{
        position: 'absolute',
        top: offset,
        right: offset,
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#ef4444',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: fontSize,
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        zIndex: 10
      }}
      title={`Retirer ${symbol}`}
    >
      ×
    </button>
  )
}

const MAX_ORDER_FORMS = 10
const DEFAULT_ORDER_SIZE = '0.01'
const MIN_ORDER_NOTIONAL_USDC = 15
const TOKEN_SIZE_DECIMALS = {
  BTC: 5,
  ETH: 4,
  SOL: 2,
  BNB: 3,
  POL: 1,
  kPEPE: 0,
  AVAX: 2,
  ATOM: 2,
  APT: 2,
  ARB: 1
}
const DEFAULT_SIZE_DECIMALS = 4
const TOKEN_MIN_SIZE_UNITS = {
  BTC: 0.001,
  ETH: 0.01
}
const TOKEN_PRICE_CONSTRAINTS = {
  BTC: { tick: 1, decimals: 0 },
  ETH: { tick: 0.1, decimals: 1 }
}
const DEFAULT_PRICE_DECIMALS = 4
// Supporter les tokens Hyperliquid avec des prix < 1e-8 (ex: kPEPE)
const PRICE_DISPLAY_FRACTION_DIGITS = 12
const SMALL_VALUE_MAX_DECIMALS = 12
const PRICE_NUDGE_DECIMALS = 6
const PRICE_NUDGE_STEP = 1 / (10 ** PRICE_NUDGE_DECIMALS)
const BINANCE_MAX_ORDER_FORMS = 10
const BINANCE_TARGET_NOTIONAL_USDT = 25
const BINANCE_DEFAULT_TIME_IN_FORCE = 'GTC'
const BINANCE_PRICE_FILTER_ENDPOINT = 'https://api.binance.com/api/v3/exchangeInfo'

const BINANCE_TOKEN_LOOKUP = BINANCE_DEFAULT_TOKENS.reduce((acc, token) => {
  acc[token.id.toUpperCase()] = token
  return acc
}, {})

const getBinancePairSymbol = (symbol) => {
  if (!symbol) {
    return ''
  }
  const normalized = normalizeSymbol(symbol)
  if (!normalized) {
    return ''
  }
  const tokenEntry = BINANCE_TOKEN_LOOKUP[normalized]
  if (tokenEntry?.symbol) {
    return tokenEntry.symbol
  }
  return `${normalized}USDT`
}

const trimTrailingZeros = (value) => {
  if (value == null) {
    return ''
  }
  const stringValue = String(value)
  if (!stringValue.includes('.')) {
    return stringValue
  }
  const trimmed = stringValue
    .replace(/(\.\d*?[1-9])0+$/u, '$1')
    .replace(/\.0+$/u, '')
  if (trimmed === '' || trimmed === '-') {
    return '0'
  }
  return trimmed
}

const countDecimalPlaces = (value) => {
  if (value == null || value === '') {
    return 0
  }
  const normalized = toCanonicalDecimalString(value)
  const parts = normalized.split('.')
  if (parts.length !== 2) {
    return 0
  }
  return parts[1].length
}

const derivePricePrecision = (value, fallback = PRICE_NUDGE_DECIMALS) => {
  const decimals = countDecimalPlaces(value)
  if (decimals > 0) {
    return Math.min(decimals, PRICE_DISPLAY_FRACTION_DIGITS)
  }
  return fallback
}

const normalizeSymbol = (value) => (typeof value === 'string' ? value.trim().toUpperCase() : '')

const DECIMAL_INPUT_REGEX = /^\d*(?:[,.]\d*)?$/u

const normalizeDecimalInput = (value) => {
  if (value == null) {
    return ''
  }
  return String(value).replace(/\s+/g, '')
}

const isValidDecimalInput = (value) => {
  if (value === '') {
    return true
  }
  return DECIMAL_INPUT_REGEX.test(value)
}

const toCanonicalDecimalString = (value) => {
  if (value == null) {
    return ''
  }
  return String(value).replace(',', '.')
}

const toDisplayDecimalString = (value) => {
  if (value == null || value === '') {
    return ''
  }
  return String(value).replace('.', ',')
}

const parseDecimalValue = (value) => {
  if (value == null || value === '') {
    return NaN
  }
  const normalized = toCanonicalDecimalString(value)
  return Number(normalized)
}

const getSizeDecimals = (symbol) => {
  if (!symbol) {
    return DEFAULT_SIZE_DECIMALS
  }
  return TOKEN_SIZE_DECIMALS[symbol] ?? DEFAULT_SIZE_DECIMALS
}

const quantizeSize = (symbol, value, strategy = 'round') => {
  const decimals = getSizeDecimals(symbol)
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return ''
  }
  const factor = 10 ** decimals
  let scaled = numeric * factor
  if (strategy === 'ceil') {
    scaled = Math.ceil(scaled)
  } else if (strategy === 'floor') {
    scaled = Math.floor(scaled)
  } else {
    scaled = Math.round(scaled)
  }
  const safeScaled = Math.max(1, scaled)
  const quantized = safeScaled / factor
  return quantized.toFixed(decimals)
}

const applyMinSizeUnits = (symbol, sizeValue) => {
  const minUnits = TOKEN_MIN_SIZE_UNITS[symbol]
  const numericSize = Number(sizeValue)
  if (!minUnits || !Number.isFinite(numericSize)) {
    return sizeValue
  }
  if (numericSize >= minUnits) {
    return sizeValue
  }
  const decimals = getSizeDecimals(symbol)
  return minUnits.toFixed(decimals)
}

const getPriceConstraint = (symbol) => {
  if (!symbol) {
    return null
  }
  return TOKEN_PRICE_CONSTRAINTS[symbol] || null
}

const getPriceDecimals = (symbol) => {
  const constraint = getPriceConstraint(symbol)
  if (constraint?.decimals != null) {
    return constraint.decimals
  }
  return PRICE_DISPLAY_FRACTION_DIGITS
}

const getPriceStepValue = (symbol, currentValue, precisionHint) => {
  const constraint = getPriceConstraint(symbol)
  if (constraint?.tick) {
    return constraint.tick
  }
  const decimalsFromValue = countDecimalPlaces(currentValue)
  if ((precisionHint ?? 0) > decimalsFromValue && precisionHint != null) {
    const safeDecimals = Math.min(precisionHint, PRICE_DISPLAY_FRACTION_DIGITS)
    return 1 / (10 ** safeDecimals)
  }
  if (decimalsFromValue > 0) {
    const safeDecimals = Math.min(decimalsFromValue, PRICE_DISPLAY_FRACTION_DIGITS)
    return 1 / (10 ** safeDecimals)
  }
  const numericValue = Number(toCanonicalDecimalString(currentValue))
  if (Number.isFinite(numericValue) && numericValue > 0) {
    return 1
  }
  return PRICE_NUDGE_STEP
}

const clampDecimalsForValue = (numericValue, decimals) => {
  if (!Number.isFinite(decimals)) {
    return 0
  }
  if (!Number.isFinite(numericValue)) {
    return Math.max(0, decimals)
  }
  if (Math.abs(numericValue) >= 1) {
    const maxDecimals = Math.max(PRICE_NUDGE_DECIMALS, 2)
    return Math.max(0, Math.min(decimals, maxDecimals))
  }
  return Math.max(0, decimals)
}

const quantizePrice = (symbol, value) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return ''
  }
  const constraint = getPriceConstraint(symbol)
  if (!constraint) {
    const decimals = clampDecimalsForValue(numeric, PRICE_DISPLAY_FRACTION_DIGITS)
    return trimTrailingZeros(numeric.toFixed(decimals))
  }
  const { tick, decimals = PRICE_DISPLAY_FRACTION_DIGITS } = constraint
  if (!tick || tick <= 0) {
    const adjustedDecimals = clampDecimalsForValue(numeric, decimals)
    return trimTrailingZeros(numeric.toFixed(adjustedDecimals))
  }
  const steps = Math.round(numeric / tick)
  const quantized = steps * tick
  const defaultDecimals = decimals ?? Math.max(0, (tick.toString().split('.')[1] || '').length)
  const decimalPlaces = clampDecimalsForValue(quantized, defaultDecimals)
  return trimTrailingZeros(quantized.toFixed(decimalPlaces))
}

function createBlankOrder(symbol = '') {
  return {
    symbol,
    side: 'buy',
    size: toDisplayDecimalString(DEFAULT_ORDER_SIZE),
    price: '',
    autoPrice: true,
    autoSize: true,
    pricePrecision: PRICE_NUDGE_DECIMALS
  }
}

function createBlankBinanceOrder(symbol = '') {
  return {
    symbol,
    side: 'buy',
    size: toDisplayDecimalString(DEFAULT_ORDER_SIZE),
    price: '',
    autoPrice: true,
    autoSize: true,
    pricePrecision: PRICE_NUDGE_DECIMALS,
    timeInForce: BINANCE_DEFAULT_TIME_IN_FORCE
  }
}

const parseBinanceFilters = (symbolInfo) => {
  if (!symbolInfo?.filters) {
    return null
  }
  const constraints = {}
  symbolInfo.filters.forEach((filter) => {
    if (!filter?.filterType) return
    if (filter.filterType === 'LOT_SIZE') {
      constraints.stepSize = Number(filter.stepSize)
      constraints.minQty = Number(filter.minQty)
      constraints.maxQty = Number(filter.maxQty)
    }
    if (filter.filterType === 'PRICE_FILTER') {
      constraints.tickSize = Number(filter.tickSize)
      constraints.minPrice = Number(filter.minPrice)
      constraints.maxPrice = Number(filter.maxPrice)
    }
    if (filter.filterType === 'MIN_NOTIONAL' || filter.filterType === 'NOTIONAL') {
      constraints.minNotional = Number(filter.minNotional)
    }
  })
  return constraints
}

const quantizeWithStep = (value, step) => {
  if (!Number.isFinite(value) || value <= 0) {
    return NaN
  }
  if (!Number.isFinite(step) || !step || step <= 0) {
    return value
  }
  const steps = Math.floor(value / step + 1e-12)
  return steps * step
}

const getStepDecimals = (step) => {
  if (!Number.isFinite(step) || step <= 0) {
    return 8
  }
  const asString = step.toString()
  if (asString.includes('e-')) {
    const exponent = Number(asString.split('e-')[1])
    return Number.isFinite(exponent) ? Math.min(Math.max(exponent, 0), 12) : 8
  }
  const [, decimals] = asString.split('.')
  return Math.min(decimals ? decimals.length : 0, 12)
}

const formatWithStepPrecision = (value, step) => {
  if (!Number.isFinite(value)) {
    return ''
  }
  const decimals = getStepDecimals(step)
  return trimTrailingZeros(value.toFixed(decimals || 8))
}

export default function Page2() {
  const [isMobile, setIsMobile] = useState(false)
  const [orderStatus, setOrderStatus] = useState({ state: 'idle', message: '', payload: null })
  const [openOrdersStatus, setOpenOrdersStatus] = useState({ state: 'idle', message: '', payload: null })
  const [closeAllStatus, setCloseAllStatus] = useState({ state: 'idle', message: '', payload: null })
  const [binanceOrderStatus, setBinanceOrderStatus] = useState({ state: 'idle', message: '', payload: null })
  const [binanceLargeOrderStatus, setBinanceLargeOrderStatus] = useState({ state: 'idle', message: '', payload: null })
  const [binanceFetchStatus, setBinanceFetchStatus] = useState({ state: 'idle', message: '', payload: null })
  const [binanceCancelStatus, setBinanceCancelStatus] = useState({ state: 'idle', message: '', payload: null })
  const [binanceDustStatus, setBinanceDustStatus] = useState({ state: 'idle', message: '', payload: null })
  const [binanceBatchStatus, setBinanceBatchStatus] = useState({ state: 'idle', message: '', payload: null })
  const [binanceSymbolFiltersState, setBinanceSymbolFiltersState] = useState({})
  const [showBinanceLogs, setShowBinanceLogs] = useState(false)
  const [binanceOpenOrders, setBinanceOpenOrders] = useState([])
  const [binanceRecentOrders, setBinanceRecentOrders] = useState([])
  const [orderForms, setOrderForms] = useState(() => ([createBlankOrder()]))
  const [binanceOrderForms, setBinanceOrderForms] = useState(() => ([createBlankBinanceOrder()]))

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const { selectedTokens, removeToken, count } = useSelectedTokens()
  const { user } = useAuth()
  // Récupérer aussi 'tokens' pour re-mémoïser quand les prix/variations changent
  const { getToken, tokens } = useMarketData()

  const selectedSymbols = useMemo(() => {
    return selectedTokens.map(symbolWithSource => {
      const [symbol] = symbolWithSource.includes(':') 
        ? symbolWithSource.split(':') 
        : [symbolWithSource]
      return symbol
    })
  }, [selectedTokens])

  const orderableSymbols = selectedSymbols
  const hasOrderableTokens = orderableSymbols.length > 0

  const binanceSelectedEntries = useMemo(() => {
    return selectedTokens.filter((entry) => entry?.toLowerCase().includes(':binance'))
  }, [selectedTokens])

  const binanceOrderableSymbols = useMemo(() => {
    const unique = new Set()
    binanceSelectedEntries.forEach((entry) => {
      const [symbol] = entry.split(':')
      if (symbol) {
        unique.add(symbol.toUpperCase())
      }
    })
    return Array.from(unique)
  }, [binanceSelectedEntries])

  const hasBinanceOrderableTokens = binanceOrderableSymbols.length > 0

  const findCanonicalSymbol = useCallback((value) => {
    const normalized = normalizeSymbol(value)
    if (!normalized) {
      return ''
    }
    const match = orderableSymbols.find((symbol) => normalizeSymbol(symbol) === normalized)
    return match || ''
  }, [orderableSymbols])

  const isSymbolAllowed = useCallback(
    (value) => Boolean(findCanonicalSymbol(value)),
    [findCanonicalSymbol]
  )

  const findBinanceSymbol = useCallback((value) => {
    const normalized = normalizeSymbol(value)
    if (!normalized) {
      return ''
    }
    const match = binanceOrderableSymbols.find((symbol) => normalizeSymbol(symbol) === normalized)
    return match || ''
  }, [binanceOrderableSymbols])

  const isBinanceSymbolAllowed = useCallback(
    (value) => Boolean(findBinanceSymbol(value)),
    [findBinanceSymbol]
  )
  
  // Créer tokensData à partir des tokens sélectionnés via service
  const tokensData = useMemo(() => {
    // Pour chaque token, on doit récupérer ses données selon sa source
    const data = selectedTokens.map(symbolWithSource => {
      const [symbol, rawSource] = symbolWithSource.includes(':')
        ? symbolWithSource.split(':')
        : [symbolWithSource, 'hyperliquid']
      const source = (rawSource || 'hyperliquid').toLowerCase()
      
      // Récupérer données de marché depuis MarketDataContext
      // (qui contient maintenant Hyperliquid ET Binance)
      // Utiliser directement l'état 'tokens' pour que le useMemo réagisse
      const marketKey = buildMarketDataKey(symbol, source)
      const marketData = (tokens && tokens[marketKey]) || getToken(symbol, source)
      
      // Récupérer config statique
      const config = getTokenConfig(symbol)
      
      // S'assurer que deltaPct est bien numérique (Firebase peut renvoyer une string)
      let rawDeltaPct = marketData && marketData.deltaPct != null ? marketData.deltaPct : 0
      const numericDeltaPct = typeof rawDeltaPct === 'string' ? parseFloat(rawDeltaPct) : rawDeltaPct

      // Filet de sécurité : recalcul si deltaPct demeure 0 mais price & prevDayPx présents
      let finalDeltaPct = numericDeltaPct
      if ((finalDeltaPct === 0 || isNaN(finalDeltaPct)) && marketData?.price != null && marketData?.prevDayPx != null && marketData.prevDayPx !== 0) {
        finalDeltaPct = ((marketData.price / marketData.prevDayPx - 1) * 100)
      }

      const tokenData = {
        symbol,
        source,
        deltaPct: finalDeltaPct || 0,
        color: config?.color || '#666',
        name: config?.name || symbol,
        price: marketData?.price || null,
        status: marketData?.status || 'loading'
      }
      
      // Log pour debug
      console.log(`🔍 Page2 tokensData ${symbol}:`, {
        source,
        rawDeltaPct,
        numericDeltaPct,
        finalDeltaPct: tokenData.deltaPct,
        price: tokenData.price,
        prevDayPx: marketData?.prevDayPx,
        marketDataKey: marketKey,
        marketDataSource: marketData?.source
      })
      
      return tokenData
    })
    
    return data
  }, [selectedTokens, getToken, tokens])

  const tokenPriceMap = useMemo(() => {
    return tokensData.reduce((acc, token) => {
      const numericPrice = Number(token.price)
      if (!Number.isFinite(numericPrice)) {
        return acc
      }
      const key = buildMarketDataKey(token.symbol, token.source)
      if (key) {
        acc[key] = numericPrice
      }
      if (token.source !== 'binance' || acc[token.symbol] == null) {
        acc[token.symbol] = numericPrice
      }
      return acc
    }, {})
  }, [tokensData])

  const computeAutoLimitPrice = useCallback((symbol, source = 'hyperliquid') => {
    if (!symbol) return ''
    const key = buildMarketDataKey(symbol, source)
    const fallbackKey = source === 'hyperliquid' ? symbol : null
    const lastPrice = tokenPriceMap?.[key] ?? (fallbackKey ? tokenPriceMap?.[fallbackKey] : tokenPriceMap?.[symbol])
    if (!Number.isFinite(lastPrice) || lastPrice <= 0) {
      return ''
    }
    return quantizePrice(symbol, lastPrice)
  }, [tokenPriceMap])

  const computeAutoSize = useCallback((symbol, source = 'hyperliquid') => {
    if (!symbol) return DEFAULT_ORDER_SIZE
    const key = buildMarketDataKey(symbol, source)
    const fallbackKey = source === 'hyperliquid' ? symbol : null
    const lastPrice = tokenPriceMap?.[key] ?? (fallbackKey ? tokenPriceMap?.[fallbackKey] : tokenPriceMap?.[symbol])
    if (!Number.isFinite(lastPrice) || lastPrice <= 0) {
      return DEFAULT_ORDER_SIZE
    }
    const rawSize = MIN_ORDER_NOTIONAL_USDC / lastPrice
    if (!Number.isFinite(rawSize) || rawSize <= 0) {
      return DEFAULT_ORDER_SIZE
    }
    const quantized = quantizeSize(symbol, rawSize, 'ceil')
    if (!quantized) {
      return DEFAULT_ORDER_SIZE
    }
    return applyMinSizeUnits(symbol, quantized)
  }, [tokenPriceMap])

  const computeBinanceAutoSize = useCallback((symbol) => {
    if (!symbol) return DEFAULT_ORDER_SIZE
    const key = buildMarketDataKey(symbol, 'binance')
    const lastPrice = tokenPriceMap?.[key] ?? tokenPriceMap?.[symbol]
    if (!Number.isFinite(lastPrice) || lastPrice <= 0) {
      return DEFAULT_ORDER_SIZE
    }
    const rawSize = BINANCE_TARGET_NOTIONAL_USDT / lastPrice
    if (!Number.isFinite(rawSize) || rawSize <= 0) {
      return DEFAULT_ORDER_SIZE
    }
    const quantized = quantizeSize(symbol, rawSize, 'ceil')
    if (!quantized) {
      return DEFAULT_ORDER_SIZE
    }
    return applyMinSizeUnits(symbol, quantized)
  }, [tokenPriceMap])

  const fetchBinanceSymbolFilters = useCallback(async (pairSymbol) => {
    const normalized = typeof pairSymbol === 'string' ? pairSymbol.trim().toUpperCase() : ''
    if (!normalized) {
      return null
    }
    if (binanceFiltersCacheRef.current[normalized]) {
      return binanceFiltersCacheRef.current[normalized]
    }
    try {
      const response = await fetch(`${BINANCE_PRICE_FILTER_ENDPOINT}?symbol=${normalized}`)
      if (!response.ok) {
        throw new Error(`Impossible de récupérer les filtres Binance pour ${normalized}`)
      }
      const payload = await response.json()
      const info = Array.isArray(payload?.symbols) ? payload.symbols[0] : null
      const constraints = parseBinanceFilters(info)
      if (constraints) {
        binanceFiltersCacheRef.current[normalized] = constraints
        setBinanceSymbolFiltersState((prev) => ({ ...prev, [normalized]: constraints }))
        return constraints
      }
    } catch (error) {
      console.warn('⚠️ Impossible de charger les filtres Binance', {
        symbol: normalized,
        message: error instanceof Error ? error.message : String(error)
      })
    }
    binanceFiltersCacheRef.current[normalized] = null
    return null
  }, [])

  const visibleOrderForms = useMemo(() => {
    return orderForms.map((order) => {
      if (!order.symbol) {
        return order
      }
      return isSymbolAllowed(order.symbol) ? order : { ...order, symbol: '' }
    })
  }, [orderForms, isSymbolAllowed])

  const visibleBinanceOrderForms = useMemo(() => {
    return binanceOrderForms.map((order) => {
      if (!order.symbol) {
        return order
      }
      return isBinanceSymbolAllowed(order.symbol) ? order : { ...order, symbol: '' }
    })
  }, [binanceOrderForms, isBinanceSymbolAllowed])

  useEffect(() => {
    const uniquePairs = new Set()
    visibleBinanceOrderForms.forEach((order) => {
      const canonical = findBinanceSymbol(order.symbol)
      if (!canonical) return
      const pairSymbol = getBinancePairSymbol(canonical)
      if (pairSymbol) {
        uniquePairs.add(pairSymbol)
      }
    })
    if (uniquePairs.size === 0) {
      return
    }
    uniquePairs.forEach((symbol) => {
      fetchBinanceSymbolFilters(symbol)
    })
  }, [visibleBinanceOrderForms, fetchBinanceSymbolFilters, findBinanceSymbol])

  
  // Simulateur de portfolio avec les tokens dynamiques
  const {
    capitalInitial,
    setCapitalInitial,
    weights,
    setWeight,
    resetWeights,
    results
  } = usePortfolioSimulation(1000, tokensData, selectedSymbols)

  const capitalDebounceRef = useRef(null)
  const isEditingCapitalRef = useRef(false)
  const lastSyncedCapitalRef = useRef(null)
  const priceNudgeIntervalRef = useRef(null)
  const binancePriceNudgeIntervalRef = useRef(null)

  // Synchronise le capital initial avec Firebase quand l'utilisateur est connecté
  useEffect(() => {
    if (!user?.uid) {
      lastSyncedCapitalRef.current = null
      return
    }

    let isMounted = true
    let unsubscribe = null

    async function bootstrapCapital() {
      try {
        const remoteValue = await getInitialCapital(user.uid)
        if (!isMounted) return
        lastSyncedCapitalRef.current = remoteValue
        setCapitalInitial(remoteValue)
      } catch (error) {
        console.error('Erreur chargement capital initial:', error)
      }
    }

    bootstrapCapital()

    unsubscribe = subscribeInitialCapital(user.uid, (value) => {
      if (!isMounted || isEditingCapitalRef.current) return
      if (value == null) return
      const numericValue = typeof value === 'number' ? value : Number(value)
      if (!Number.isFinite(numericValue)) return
      if (lastSyncedCapitalRef.current === numericValue) return
      lastSyncedCapitalRef.current = numericValue
      setCapitalInitial(numericValue)
    })

    return () => {
      isMounted = false
      if (unsubscribe) unsubscribe()
    }
  }, [user?.uid, setCapitalInitial])

  useEffect(() => {
    return () => {
      if (capitalDebounceRef.current) {
        clearTimeout(capitalDebounceRef.current)
      }
      if (priceNudgeIntervalRef.current) {
        clearInterval(priceNudgeIntervalRef.current)
        priceNudgeIntervalRef.current = null
      }
      if (binancePriceNudgeIntervalRef.current) {
        clearInterval(binancePriceNudgeIntervalRef.current)
        binancePriceNudgeIntervalRef.current = null
      }
    }
  }, [])


  const persistCapital = async (value) => {
    if (!user?.uid) return
    try {
      await saveInitialCapital(user.uid, value)
      lastSyncedCapitalRef.current = value
    } catch (error) {
      console.error('Erreur sauvegarde capital initial:', error)
    }
  }

  const updateOrderField = (index, field, value) => {
    setOrderForms((prev) =>
      prev.map((order, currentIndex) => {
        if (currentIndex !== index) {
          return order
        }
        if (field === 'symbol') {
          const canonical = findCanonicalSymbol(value)
          if (!canonical) {
            return {
              ...order,
              symbol: '',
              price: '',
              pricePrecision: PRICE_NUDGE_DECIMALS,
              autoPrice: true,
              size: DEFAULT_ORDER_SIZE,
              autoSize: true
            }
          }
          const autoPrice = computeAutoLimitPrice(canonical) || ''
          const autoSize = toDisplayDecimalString(computeAutoSize(canonical))
          return {
            ...order,
            symbol: canonical,
            price: autoPrice,
            pricePrecision: derivePricePrecision(autoPrice),
            autoPrice: true,
            size: autoSize,
            autoSize: true
          }
        }
        if (field === 'size') {
          const normalized = normalizeDecimalInput(value)
          if (!isValidDecimalInput(normalized)) {
            return order
          }
          return {
            ...order,
            size: normalized,
            autoSize: false
          }
        }
        if (field === 'price') {
          const normalized = normalizeDecimalInput(value)
          if (!isValidDecimalInput(normalized)) {
            return order
          }
          const nextPrecision = normalized
            ? Math.max(derivePricePrecision(normalized), order.pricePrecision ?? PRICE_NUDGE_DECIMALS)
            : order.pricePrecision ?? PRICE_NUDGE_DECIMALS
          return {
            ...order,
            price: normalized,
            autoPrice: false,
            pricePrecision: nextPrecision
          }
        }
        return { ...order, [field]: value }
      })
    )
  }

  const updateBinanceOrderField = (index, field, value) => {
    setBinanceOrderForms((prev) =>
      prev.map((order, currentIndex) => {
        if (currentIndex !== index) {
          return order
        }
        if (field === 'symbol') {
          const canonical = findBinanceSymbol(value)
          if (!canonical) {
            return {
              ...order,
              symbol: '',
              price: '',
              pricePrecision: PRICE_NUDGE_DECIMALS,
              autoPrice: true,
              size: toDisplayDecimalString(DEFAULT_ORDER_SIZE),
              autoSize: true
            }
          }
          const autoPrice = computeAutoLimitPrice(canonical, 'binance') || ''
          const autoSize = toDisplayDecimalString(computeBinanceAutoSize(canonical))
          return {
            ...order,
            symbol: canonical,
            price: autoPrice,
            pricePrecision: derivePricePrecision(autoPrice),
            autoPrice: true,
            size: autoSize,
            autoSize: true
          }
        }
        if (field === 'size') {
          const normalized = normalizeDecimalInput(value)
          if (!isValidDecimalInput(normalized)) {
            return order
          }
          return {
            ...order,
            size: normalized,
            autoSize: false
          }
        }
        if (field === 'price') {
          const normalized = normalizeDecimalInput(value)
          if (!isValidDecimalInput(normalized)) {
            return order
          }
          const nextPrecision = normalized
            ? Math.max(derivePricePrecision(normalized), order.pricePrecision ?? PRICE_NUDGE_DECIMALS)
            : order.pricePrecision ?? PRICE_NUDGE_DECIMALS
          return {
            ...order,
            price: normalized,
            autoPrice: false,
            pricePrecision: nextPrecision
          }
        }
        return { ...order, [field]: value }
      })
    )
  }

  const addOrderForm = () => {
    if (!hasOrderableTokens) {
      return
    }
    setOrderForms((prev) => {
      if (prev.length >= MAX_ORDER_FORMS) {
        return prev
      }
      const fallbackSymbol = orderableSymbols[(prev.length) % orderableSymbols.length] || orderableSymbols[0]
      const autoPrice = computeAutoLimitPrice(fallbackSymbol) || ''
      const autoSize = toDisplayDecimalString(computeAutoSize(fallbackSymbol))
      return [
        ...prev,
        {
          ...createBlankOrder(fallbackSymbol),
          symbol: fallbackSymbol,
          price: autoPrice,
          pricePrecision: derivePricePrecision(autoPrice),
          size: autoSize,
          autoPrice: true,
          autoSize: true
        }
      ]
    })
  }

  const addBinanceOrderForm = () => {
    if (!hasBinanceOrderableTokens) {
      return
    }
    setBinanceOrderForms((prev) => {
      if (prev.length >= BINANCE_MAX_ORDER_FORMS) {
        return prev
      }
        const fallbackSymbol = binanceOrderableSymbols[prev.length % binanceOrderableSymbols.length] || binanceOrderableSymbols[0]
        const autoPrice = computeAutoLimitPrice(fallbackSymbol, 'binance') || ''
      const autoSize = toDisplayDecimalString(computeBinanceAutoSize(fallbackSymbol))
      return [
        ...prev,
        {
          ...createBlankBinanceOrder(fallbackSymbol),
          symbol: fallbackSymbol,
          price: autoPrice,
          pricePrecision: derivePricePrecision(autoPrice),
          size: autoSize,
          autoPrice: true,
          autoSize: true
        }
      ]
    })
  }

  const removeOrderForm = (index) => {
    setOrderForms((prev) => {
      if (prev.length === 1) {
        return prev
      }
      return prev.filter((_, currentIndex) => currentIndex !== index)
    })
  }

  const removeBinanceOrderForm = (index) => {
    setBinanceOrderForms((prev) => {
      if (prev.length === 1) {
        return prev
      }
      return prev.filter((_, currentIndex) => currentIndex !== index)
    })
  }

  const resetOrderForms = () => {
    if (!hasOrderableTokens) {
      setOrderForms([createBlankOrder()])
      return
    }
    const defaults = orderableSymbols.slice(0, 2).map((symbol) => {
      const autoPrice = computeAutoLimitPrice(symbol) || ''
      const autoSize = toDisplayDecimalString(computeAutoSize(symbol))
      return {
        ...createBlankOrder(symbol),
        symbol,
        price: autoPrice,
        pricePrecision: derivePricePrecision(autoPrice),
        size: autoSize,
        autoPrice: true,
        autoSize: true
      }
    })
    if (defaults.length === 0) {
      setOrderForms([createBlankOrder(orderableSymbols[0])])
      return
    }
    setOrderForms(defaults)
  }

  const resetBinanceOrderForms = () => {
    if (!hasBinanceOrderableTokens) {
      setBinanceOrderForms([createBlankBinanceOrder()])
      return
    }
    const defaults = binanceOrderableSymbols.slice(0, 2).map((symbol) => {
      const autoPrice = computeAutoLimitPrice(symbol, 'binance') || ''
      const autoSize = toDisplayDecimalString(computeBinanceAutoSize(symbol))
      return {
        ...createBlankBinanceOrder(symbol),
        symbol,
        price: autoPrice,
        pricePrecision: derivePricePrecision(autoPrice),
        size: autoSize,
        autoPrice: true,
        autoSize: true
      }
    })
    if (defaults.length === 0) {
      setBinanceOrderForms([createBlankBinanceOrder(binanceOrderableSymbols[0])])
      return
    }
    setBinanceOrderForms(defaults)
  }

  const finalizeManualSize = useCallback((index) => {
    setOrderForms((prev) =>
      prev.map((order, currentIndex) => {
        if (currentIndex !== index) {
          return order
        }
        if (!order.symbol || order.autoSize) {
          return order
        }
        const canonical = findCanonicalSymbol(order.symbol)
        if (!canonical) {
          return order
        }
        const processed = quantizeSize(canonical, toCanonicalDecimalString(order.size), 'round')
        if (!processed) {
          return { ...order, size: '' }
        }
        const clamped = applyMinSizeUnits(canonical, processed)
        return { ...order, size: toDisplayDecimalString(clamped) }
      })
    )
  }, [findCanonicalSymbol])

  const finalizeBinanceManualSize = useCallback((index) => {
    setBinanceOrderForms((prev) =>
      prev.map((order, currentIndex) => {
        if (currentIndex !== index) {
          return order
        }
        if (!order.symbol || order.autoSize) {
          return order
        }
        const canonical = findBinanceSymbol(order.symbol)
        if (!canonical) {
          return order
        }
        const processed = quantizeSize(canonical, toCanonicalDecimalString(order.size), 'round')
        if (!processed) {
          return { ...order, size: '' }
        }
        const clamped = applyMinSizeUnits(canonical, processed)
        return { ...order, size: toDisplayDecimalString(clamped) }
      })
    )
  }, [findBinanceSymbol])

  const finalizeManualPrice = useCallback((index) => {
    setOrderForms((prev) =>
      prev.map((order, currentIndex) => {
        if (currentIndex !== index) {
          return order
        }
        if (order.autoPrice) {
          return order
        }
        const canonical = findCanonicalSymbol(order.symbol)
        if (!canonical) {
          return order
        }
        const numericValue = parseDecimalValue(order.price)
        if (!Number.isFinite(numericValue) || numericValue <= 0) {
          return { ...order, price: '' }
        }
        const processed = quantizePrice(canonical, numericValue)
        if (!processed) {
          return { ...order, price: '' }
        }
        const precision = Math.max(
          derivePricePrecision(processed),
          order.pricePrecision ?? PRICE_NUDGE_DECIMALS
        )
        return { ...order, price: processed, pricePrecision: precision }
      })
    )
  }, [findCanonicalSymbol])

  const finalizeBinanceManualPrice = useCallback((index) => {
    setBinanceOrderForms((prev) =>
      prev.map((order, currentIndex) => {
        if (currentIndex !== index) {
          return order
        }
        if (order.autoPrice) {
          return order
        }
        const canonical = findBinanceSymbol(order.symbol)
        if (!canonical) {
          return order
        }
        const numericValue = parseDecimalValue(order.price)
        if (!Number.isFinite(numericValue) || numericValue <= 0) {
          return { ...order, price: '' }
        }
        const processed = quantizePrice(canonical, numericValue)
        if (!processed) {
          return { ...order, price: '' }
        }
        const precision = Math.max(
          derivePricePrecision(processed),
          order.pricePrecision ?? PRICE_NUDGE_DECIMALS
        )
        return { ...order, price: processed, pricePrecision: precision }
      })
    )
  }, [findBinanceSymbol])

  const stopContinuousNudge = useCallback(() => {
    if (priceNudgeIntervalRef.current) {
      clearInterval(priceNudgeIntervalRef.current)
      priceNudgeIntervalRef.current = null
    }
  }, [])

  const stopBinanceContinuousNudge = useCallback(() => {
    if (binancePriceNudgeIntervalRef.current) {
      clearInterval(binancePriceNudgeIntervalRef.current)
      binancePriceNudgeIntervalRef.current = null
    }
  }, [])

  const nudgeOrderPrice = useCallback((index, direction) => {
    if (!direction || !Number.isFinite(direction)) {
      return
    }
    setOrderForms((prev) =>
      prev.map((order, currentIndex) => {
        if (currentIndex !== index) {
          return order
        }
        const canonical = findCanonicalSymbol(order.symbol)
        if (!canonical) {
          return order
        }
        const currentValue = order.autoPrice
          ? computeAutoLimitPrice(canonical)
          : order.price
        const step = getPriceStepValue(canonical, currentValue, order.pricePrecision)
        const numeric = Number(currentValue)
        const base = Number.isFinite(numeric) && numeric > 0 ? numeric : step
        const next = base + step * (direction > 0 ? 1 : -1)
        const safeNext = next > 0 ? next : step
        const quantized = quantizePrice(canonical, safeNext) || safeNext.toString()
        const updatedPrecision = Math.max(
          derivePricePrecision(quantized),
          order.pricePrecision ?? PRICE_NUDGE_DECIMALS
        )
        return {
          ...order,
          symbol: canonical,
          price: quantized,
          autoPrice: false,
          pricePrecision: updatedPrecision
        }
      })
    )
  }, [findCanonicalSymbol, computeAutoLimitPrice])

  const nudgeBinanceOrderPrice = useCallback((index, direction) => {
    if (!direction || !Number.isFinite(direction)) {
      return
    }
    setBinanceOrderForms((prev) =>
      prev.map((order, currentIndex) => {
        if (currentIndex !== index) {
          return order
        }
        const canonical = findBinanceSymbol(order.symbol)
        if (!canonical) {
          return order
        }
        const currentValue = order.autoPrice
          ? computeAutoLimitPrice(canonical)
          : order.price
        const step = getPriceStepValue(canonical, currentValue, order.pricePrecision)
        const numeric = Number(currentValue)
        const base = Number.isFinite(numeric) && numeric > 0 ? numeric : step
        const next = base + step * (direction > 0 ? 1 : -1)
        const safeNext = next > 0 ? next : step
        const quantized = quantizePrice(canonical, safeNext) || safeNext.toString()
        const updatedPrecision = Math.max(
          derivePricePrecision(quantized),
          order.pricePrecision ?? PRICE_NUDGE_DECIMALS
        )
        return {
          ...order,
          symbol: canonical,
          price: quantized,
          autoPrice: false,
          pricePrecision: updatedPrecision
        }
      })
    )
  }, [findBinanceSymbol, computeAutoLimitPrice])

  const startContinuousNudge = useCallback((index, direction) => {
    if (!direction) return
    nudgeOrderPrice(index, direction)
    stopContinuousNudge()
    priceNudgeIntervalRef.current = setInterval(() => {
      nudgeOrderPrice(index, direction)
    }, 200)
  }, [nudgeOrderPrice, stopContinuousNudge])

  const startBinanceContinuousNudge = useCallback((index, direction) => {
    if (!direction) return
    nudgeBinanceOrderPrice(index, direction)
    stopBinanceContinuousNudge()
    binancePriceNudgeIntervalRef.current = setInterval(() => {
      nudgeBinanceOrderPrice(index, direction)
    }, 200)
  }, [nudgeBinanceOrderPrice, stopBinanceContinuousNudge])

  useEffect(() => {
    const handlePointerRelease = () => {
      stopContinuousNudge()
      stopBinanceContinuousNudge()
    }
    window.addEventListener('mouseup', handlePointerRelease)
    window.addEventListener('touchend', handlePointerRelease)
    window.addEventListener('touchcancel', handlePointerRelease)
    return () => {
      window.removeEventListener('mouseup', handlePointerRelease)
      window.removeEventListener('touchend', handlePointerRelease)
      window.removeEventListener('touchcancel', handlePointerRelease)
    }
  }, [stopContinuousNudge, stopBinanceContinuousNudge])

  const applyLivePrice = useCallback((index) => {
    setOrderForms((prev) =>
      prev.map((order, currentIndex) => {
        if (currentIndex !== index) {
          return order
        }
        const canonical = findCanonicalSymbol(order.symbol)
        if (!canonical) {
          return order
        }
        const livePrice = computeAutoLimitPrice(canonical)
        if (!livePrice) {
          return order
        }
        return {
          ...order,
          price: livePrice,
          autoPrice: true,
          pricePrecision: derivePricePrecision(livePrice)
        }
      })
    )
  }, [findCanonicalSymbol, computeAutoLimitPrice])

  const applyBinanceLivePrice = useCallback((index) => {
    setBinanceOrderForms((prev) =>
      prev.map((order, currentIndex) => {
        if (currentIndex !== index) {
          return order
        }
        const canonical = findBinanceSymbol(order.symbol)
        if (!canonical) {
          return order
        }
        const livePrice = computeAutoLimitPrice(canonical)
        if (!livePrice) {
          return order
        }
        return {
          ...order,
          price: livePrice,
          autoPrice: true,
          pricePrecision: derivePricePrecision(livePrice)
        }
      })
    )
  }, [findBinanceSymbol, computeAutoLimitPrice])

  const handleCapitalChange = (newValue) => {
    setCapitalInitial(newValue)

    if (!user?.uid) {
      return
    }

    isEditingCapitalRef.current = true

    if (capitalDebounceRef.current) {
      clearTimeout(capitalDebounceRef.current)
    }

    capitalDebounceRef.current = setTimeout(() => {
      isEditingCapitalRef.current = false
      persistCapital(newValue)
    }, 600)
  }

  const sendTestOrder = async () => {
    if (!hasOrderableTokens) {
      setOrderStatus({
        state: 'error',
        message: 'Ajoute d’abord des tokens depuis Épicerie fine pour envoyer un ordre.',
        payload: null
      })
      return
    }

    const sanitizedOrders = orderForms
      .map((order) => {
        const canonicalSymbol = findCanonicalSymbol(order.symbol)
        const computedSize = order.autoSize
          ? computeAutoSize(canonicalSymbol)
          : quantizeSize(canonicalSymbol, toCanonicalDecimalString(order.size), 'round')
        const effectiveSize = applyMinSizeUnits(canonicalSymbol, computedSize)
        const effectivePrice = order.autoPrice
          ? computeAutoLimitPrice(canonicalSymbol)
          : quantizePrice(canonicalSymbol, order.price)
        return {
          symbol: canonicalSymbol ? canonicalSymbol.trim().toUpperCase() : '',
          side: order.side,
          size: effectiveSize,
          price: effectivePrice
        }
      })
      .filter((order) => order.symbol && order.size && order.price)

    if (sanitizedOrders.length === 0) {
      setOrderStatus({
        state: 'error',
        message: 'Ajoute au moins un ordre valide (token, taille, prix)',
        payload: null
      })
      return
    }

    setOrderStatus({ state: 'loading', message: 'Envoi des ordres Hyperliquid…', payload: null })
    try {
      const response = await placeHyperliquidTestOrder({ orders: sanitizedOrders })
      setOrderStatus({
        state: 'success',
        message: `${sanitizedOrders.length} ordre(s) envoyés ✅`,
        payload: response
      })
    } catch (error) {
      setOrderStatus({ state: 'error', message: error.message, payload: null })
    }
  }

  const loadOpenOrders = async () => {
    setOpenOrdersStatus({ state: 'loading', message: 'Récupération des ordres ouverts Hyperliquid…', payload: null })
    try {
      const response = await fetchHyperliquidOpenOrders()
      const orderCount = response.openOrders?.length ?? 0
      const positionCount = response.openPositions?.length ?? 0
      const summaryParts = []
      if (orderCount > 0) {
        summaryParts.push(`${orderCount} ordre(s) au carnet`)
      }
      if (positionCount > 0) {
        summaryParts.push(`${positionCount} position(s) ouvertes`)
      }
      const statusMessage = summaryParts.length > 0
        ? summaryParts.join(' • ')
        : 'Aucun ordre ni position ouverte.'
      setOpenOrdersStatus({
        state: 'success',
        message: statusMessage,
        payload: response
      })
    } catch (error) {
      setOpenOrdersStatus({ state: 'error', message: error.message, payload: null })
    }
  }

  const closeAllHyperliquid = async () => {
    setCloseAllStatus({ state: 'loading', message: 'Fermeture des positions Hyperliquid…', payload: null })
    try {
      const response = await closeAllHyperliquidPositions()
      const canceled = response.canceledOrders ?? 0
      const closed = response.closeOrdersPlaced ?? 0
      setCloseAllStatus({
        state: 'success',
        message: `Annulations: ${canceled}, ordres de fermeture envoyés: ${closed}`,
        payload: response
      })
    } catch (error) {
      setCloseAllStatus({ state: 'error', message: error.message, payload: null })
    }
  }

  const handleBinancePresetOrder = async () => {
    setBinanceOrderStatus({ state: 'loading', message: 'Envoi de l’ordre test Binance…', payload: null })
    try {
      const response = await placeBinancePresetOrder()
      setBinanceOrderStatus({
        state: 'success',
        message: 'Ordre market BTC/USDT envoyé sur le testnet ✅',
        payload: response
      })
    } catch (error) {
      setBinanceOrderStatus({ state: 'error', message: error.message, payload: null })
    }
  }

  const handleBinanceLargePresetOrder = async () => {
    setBinanceLargeOrderStatus({ state: 'loading', message: 'Envoi de l’ordre 100 USDT…', payload: null })
    try {
      const response = await placeBinanceLargePresetOrder()
      setBinanceLargeOrderStatus({
        state: 'success',
        message: 'Ordre market BTC/USDT 100 USDT envoyé ✅',
        payload: response
      })
    } catch (error) {
      setBinanceLargeOrderStatus({ state: 'error', message: error.message, payload: null })
    }
  }

  const handleFetchBinanceOpenOrders = async () => {
    setBinanceFetchStatus({ state: 'loading', message: 'Lecture des ordres Binance…', payload: null })
    try {
      const response = await fetchBinanceOpenOrders({
        includeClosed: true,
        historySymbol: BINANCE_PRESET_ORDER.symbol,
        limit: 20
      })
      const orders = Array.isArray(response?.openOrders) ? response.openOrders : []
      const recent = Array.isArray(response?.recentOrders) ? response.recentOrders : []
      setBinanceOpenOrders(orders)
      setBinanceRecentOrders(recent)
      const parts = []
      parts.push(orders.length ? `${orders.length} ordre(s) ouverts` : 'Aucun ordre ouvert')
      parts.push(recent.length ? `${recent.length} ordre(s) récents (exécutés / clôturés)` : 'Aucun ordre historique trouvé')
      setBinanceFetchStatus({
        state: 'success',
        message: parts.join(' • '),
        payload: response
      })
    } catch (error) {
      setBinanceFetchStatus({ state: 'error', message: error.message, payload: null })
    }
  }

  const handleCancelAllBinanceOrders = async () => {
    setBinanceCancelStatus({ state: 'loading', message: 'Annulation/Fermeture Binance en cours…', payload: null })
    try {
      const response = await cancelAllBinanceOrders({ closePositions: true })
      const symbols = Object.keys(response?.result || {})
      const closed = Array.isArray(response?.closedPositions)
        ? response.closedPositions.filter((entry) => entry.status === 'closed').length
        : 0
      const skipped = Array.isArray(response?.closedPositions)
        ? response.closedPositions.filter((entry) => entry.status === 'skipped').length
        : 0
      const errors = Array.isArray(response?.closedPositions)
        ? response.closedPositions.filter((entry) => entry.status === 'error').length
        : 0

      const summary = []
      summary.push(symbols.length ? `Nettoyé sur ${symbols.length} symbole(s)` : 'Aucun ordre à annuler')
      if (closed > 0) {
        summary.push(`${closed} position(s) fermée(s)`)
      }
      if (skipped > 0) {
        summary.push(`${skipped} ignorée(s)`)
      }
      if (errors > 0) {
        summary.push(`${errors} en erreur`)
      }

      setBinanceCancelStatus({
        state: 'success',
        message: summary.join(' • '),
        payload: response
      })

      const refreshed = await fetchBinanceOpenOrders({
        includeClosed: true,
        historySymbol: BINANCE_PRESET_ORDER.symbol,
        limit: 20
      })
      setBinanceOpenOrders(Array.isArray(refreshed?.openOrders) ? refreshed.openOrders : [])
      setBinanceRecentOrders(Array.isArray(refreshed?.recentOrders) ? refreshed.recentOrders : [])
      setBinanceFetchStatus((prev) => {
        const openMsg = Array.isArray(refreshed?.openOrders) && refreshed.openOrders.length
          ? `${refreshed.openOrders.length} ordre(s) ouverts`
          : 'Aucun ordre ouvert'
        const recentMsg = Array.isArray(refreshed?.recentOrders) && refreshed.recentOrders.length
          ? `${refreshed.recentOrders.length} ordre(s) récents`
          : 'Aucun ordre historique trouvé'
        return {
          ...prev,
          payload: refreshed,
          message: `${openMsg} • ${recentMsg}`,
          state: 'success'
        }
      })
    } catch (error) {
      setBinanceCancelStatus({ state: 'error', message: error.message, payload: null })
    }
  }

  const handleCloseAndDustBinancePositions = async () => {
    setBinanceDustStatus({ state: 'loading', message: 'Fermeture + conversion en BNB…', payload: null })
    try {
      const response = await closeAndDustBinancePositions()
      const symbols = Object.keys(response?.result || {})
      const closed = Array.isArray(response?.closedPositions)
        ? response.closedPositions.filter((entry) => entry.status === 'closed').length
        : 0
      const dustStatus = response?.dust?.status ?? 'skipped'
      const dustConverted = Array.isArray(response?.dust?.convertedAssets)
        ? response.dust.convertedAssets.length
        : 0

      const summary = []
      summary.push(symbols.length ? `Nettoyé sur ${symbols.length} symbole(s)` : 'Aucun ordre à annuler')
      if (closed > 0) {
        summary.push(`${closed} position(s) fermée(s)`)
      }
      if (dustConverted > 0) {
        summary.push(`${dustConverted} asset(s) converti(s) en BNB`)
      }
      if (dustStatus === 'skipped') {
        summary.push(response?.dust?.message || 'Pas de miettes détectées')
      }
      if (dustStatus === 'error') {
        summary.push(`Erreur conversion BNB: ${response?.dust?.error || 'inconnue'}`)
      }

      setBinanceDustStatus({
        state: dustStatus === 'error' ? 'error' : 'success',
        message: summary.join(' • '),
        payload: response
      })

      const refreshed = await fetchBinanceOpenOrders({
        includeClosed: true,
        historySymbol: BINANCE_PRESET_ORDER.symbol,
        limit: 20
      })
      setBinanceOpenOrders(Array.isArray(refreshed?.openOrders) ? refreshed.openOrders : [])
      setBinanceRecentOrders(Array.isArray(refreshed?.recentOrders) ? refreshed.recentOrders : [])
      setBinanceFetchStatus((prev) => {
        const openMsg = Array.isArray(refreshed?.openOrders) && refreshed.openOrders.length
          ? `${refreshed.openOrders.length} ordre(s) ouverts`
          : 'Aucun ordre ouvert'
        const recentMsg = Array.isArray(refreshed?.recentOrders) && refreshed.recentOrders.length
          ? `${refreshed.recentOrders.length} ordre(s) récents`
          : 'Aucun ordre historique trouvé'
        return {
          ...prev,
          payload: refreshed,
          message: `${openMsg} • ${recentMsg}`,
          state: 'success'
        }
      })
    } catch (error) {
      setBinanceDustStatus({ state: 'error', message: error.message, payload: null })
    }
  }

  const handleBinanceGridOrders = async () => {
    if (!hasBinanceOrderableTokens) {
      setBinanceBatchStatus({ state: 'error', message: 'Ajoute des tokens Binance dans ta cuisine avant de composer des ordres.', payload: null })
      return
    }

    const validationIssues = []
    const preparedOrders = await Promise.all(
      binanceOrderForms.map(async (order, index) => {
        const canonical = findBinanceSymbol(order.symbol)
        if (!canonical) {
          validationIssues.push(`Ordre #${index + 1} : sélectionne un token Binance valide.`)
          return null
        }
        const pairSymbol = getBinancePairSymbol(canonical)
        if (!pairSymbol) {
          validationIssues.push(`Ordre #${index + 1} : paire Binance introuvable.`)
          return null
        }

        const desiredSize = order.autoSize ? computeBinanceAutoSize(canonical) : order.size
        const desiredPrice = order.autoPrice ? computeAutoLimitPrice(canonical) : order.price
        const sizeValue = parseDecimalValue(toCanonicalDecimalString(desiredSize))
        const priceValue = parseDecimalValue(toCanonicalDecimalString(desiredPrice))
        if (!Number.isFinite(sizeValue) || sizeValue <= 0) {
          validationIssues.push(`Ordre #${index + 1} : taille invalide.`)
          return null
        }
        if (!Number.isFinite(priceValue) || priceValue <= 0) {
          validationIssues.push(`Ordre #${index + 1} : prix invalide.`)
          return null
        }

        const constraints = binanceSymbolFiltersState[pairSymbol] || (await fetchBinanceSymbolFilters(pairSymbol))
        let canonicalQuantity = ''
        let canonicalPrice = ''

        if (constraints) {
          let normalizedQty = quantizeWithStep(sizeValue, constraints.stepSize)
          if (!Number.isFinite(normalizedQty) || normalizedQty <= 0) {
            validationIssues.push(`Ordre #${index + 1} : quantité trop faible pour ${canonical}.`)
            return null
          }
          if (Number.isFinite(constraints.minQty) && normalizedQty < constraints.minQty) {
            validationIssues.push(`Ordre #${index + 1} : minimum ${constraints.minQty} ${canonical}.`)
            return null
          }
          canonicalQuantity = toCanonicalDecimalString(formatWithStepPrecision(normalizedQty, constraints.stepSize))

          let normalizedPrice = quantizeWithStep(priceValue, constraints.tickSize)
          if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
            validationIssues.push(`Ordre #${index + 1} : prix trop faible pour ${pairSymbol}.`)
            return null
          }
          canonicalPrice = toCanonicalDecimalString(formatWithStepPrecision(normalizedPrice, constraints.tickSize))

          const numericNotional = parseDecimalValue(canonicalQuantity) * parseDecimalValue(canonicalPrice)
          if (Number.isFinite(constraints.minNotional) && numericNotional < constraints.minNotional) {
            validationIssues.push(`Ordre #${index + 1} : notional ${numericNotional.toFixed(4)} < min ${constraints.minNotional}.`)
            return null
          }
        } else {
          const quantity = quantizeSize(canonical, toCanonicalDecimalString(desiredSize), 'round')
          const limitPrice = quantizePrice(canonical, priceValue)
          if (!quantity || !limitPrice) {
            validationIssues.push(`Ordre #${index + 1} : impossible de normaliser taille/prix.`)
            return null
          }
          canonicalQuantity = toCanonicalDecimalString(quantity)
          canonicalPrice = toCanonicalDecimalString(limitPrice)
        }

        const notional = Number((parseDecimalValue(canonicalQuantity) * parseDecimalValue(canonicalPrice)).toFixed(8))

        return {
          payload: {
            symbol: pairSymbol,
            side: order.side === 'sell' ? 'SELL' : 'BUY',
            type: 'LIMIT',
            timeInForce: (order.timeInForce || BINANCE_DEFAULT_TIME_IN_FORCE).toUpperCase(),
            quantity: canonicalQuantity,
            price: canonicalPrice
          },
          meta: {
            index,
            baseSymbol: canonical,
            pairSymbol,
            notional,
            quantity: canonicalQuantity,
            price: canonicalPrice,
            side: order.side,
            constraints: constraints || null
          }
        }
      })
    )

    if (validationIssues.length > 0) {
      setBinanceBatchStatus({
        state: 'error',
        message: validationIssues.join(' • '),
        payload: null
      })
      return
    }

    const sanitizedOrders = preparedOrders.filter(Boolean)

    if (sanitizedOrders.length === 0) {
      setBinanceBatchStatus({ state: 'error', message: 'Ajoute au moins un ordre Binance valide (token, taille, prix).', payload: null })
      return
    }

    setBinanceBatchStatus({ state: 'loading', message: 'Envoi des ordres Binance…', payload: null })

    const aggregated = []
    let successCount = 0

    for (const entry of sanitizedOrders) {
      try {
        const response = await placeBinanceOrder(entry.payload)
        aggregated.push({
          ...entry.meta,
          status: 'success',
          response
        })
        successCount += 1
      } catch (error) {
        aggregated.push({
          ...entry.meta,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    const summaryMessage = successCount === sanitizedOrders.length
      ? `${successCount} ordre(s) Binance envoyés ✅`
      : successCount === 0
        ? 'Tous les ordres Binance ont échoué.'
        : `${successCount}/${sanitizedOrders.length} ordre(s) envoyés, vérifie les erreurs.`

    setBinanceBatchStatus({
      state: successCount === sanitizedOrders.length ? 'success' : successCount === 0 ? 'error' : 'error',
      message: summaryMessage,
      payload: aggregated
    })
  }

  const statusColorMap = {
    idle: '#94a3b8',
    loading: '#fbbf24',
    success: '#22c55e',
    error: '#f87171'
  }

  const orderStatusColor = statusColorMap[orderStatus.state]
  const openOrdersStatusColor = statusColorMap[openOrdersStatus.state]
  const closeAllStatusColor = statusColorMap[closeAllStatus.state]
  const binanceOrderStatusColor = statusColorMap[binanceOrderStatus.state]
  const binanceLargeOrderStatusColor = statusColorMap[binanceLargeOrderStatus.state]
  const binanceFetchStatusColor = statusColorMap[binanceFetchStatus.state]
  const binanceCancelStatusColor = statusColorMap[binanceCancelStatus.state]
  const binanceDustStatusColor = statusColorMap[binanceDustStatus.state]
  const binanceBatchStatusColor = statusColorMap[binanceBatchStatus.state]
  const openOrdersList = openOrdersStatus.payload?.openOrders ?? []
  const openPositionsList = openOrdersStatus.payload?.openPositions ?? []
  const binanceOpenOrdersList = Array.isArray(binanceOpenOrders) ? binanceOpenOrders : []
  const binanceRecentOrdersList = Array.isArray(binanceRecentOrders) ? binanceRecentOrders : []
  const binanceFiltersCacheRef = useRef({})

  const formatNumericString = (value, options = {}) => {
    const {
      maximumFractionDigits = 4,
      preserveTinyValues = false,
      limitHighValues = false
    } = options
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return value ?? '—'
    const isTiny = preserveTinyValues && Math.abs(numeric) < 1
    const absValue = Math.abs(numeric)
    let digits = isTiny
      ? Math.max(maximumFractionDigits, SMALL_VALUE_MAX_DECIMALS)
      : maximumFractionDigits
    if (!isTiny && limitHighValues && absValue >= 1) {
      digits = Math.min(digits, 2)
    }
    return numeric.toLocaleString('fr-FR', {
      maximumFractionDigits: digits,
      minimumFractionDigits: isTiny ? Math.min(4, digits) : 0
    })
  }

  const formatTimestamp = (value) => {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return '—'
    return new Date(numeric).toLocaleString('fr-FR', { hour12: false })
  }

  const formatJsonPayload = (payload) => {
    if (payload === null || typeof payload === 'undefined') {
      return 'Aucune réponse API reçue pour le moment.'
    }
    try {
      return JSON.stringify(payload, null, 2)
    } catch {
      return String(payload)
    }
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#e5e7eb', 
          fontSize: '32px', 
          fontWeight: 'bold',
          margin: 0,
          marginBottom: '8px'
        }}>
          Ma Cuisine 👨🏼‍🍳
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
          Simulateur de portfolio • Optimisez vos allocations
        </p>
      </div>

      {/* Contrôle Binance Spot */}
      <div
        style={{
          background: 'linear-gradient(135deg, #051425 0%, #020812 100%)',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #102038',
          boxShadow: '0 10px 35px rgba(2, 8, 18, 0.65)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'stretch',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h3 style={{ color: '#f0f9ff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              🧪 Pilotage Binance Spot Testnet
            </h3>
            <p style={{ color: '#94a3b8', marginTop: '8px', marginBottom: '12px', lineHeight: 1.5 }}>
              Utilise nos fonctions Firebase pour envoyer un ordre market BTC/USDT pré-paramétré,
              interroger les ordres ouverts et nettoyer le carnet en un clic. Tout passe par le client HMAC sécurisé
              déployé dans le dossier <span style={{ fontFamily: 'monospace', color: '#bae6fd' }}>functions</span>.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #1e293b',
                background: 'rgba(15, 23, 42, 0.6)'
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  background: '#0ea5e9'
                }}
              ></div>
              <div style={{ color: '#cbd5f5', margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>Ordres preset BTCUSDT :</span>
                <span>
                  • <strong>BUY 20 USDT</strong> (test micro ordre)
                </span>
                <span>
                  • <strong>BUY 100 USDT</strong> (ordre pour seuil notional ≥ 100 USDT)
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              minWidth: '240px',
              background: '#010a16',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid #112035',
              flex: 0.9
            }}
          >
            <p style={{ color: '#cbd5f5', margin: 0, fontWeight: 600 }}>Accès API interne</p>
            <ul
              style={{
                color: '#94a3b8',
                margin: '10px 0 0 16px',
                padding: 0,
                listStyle: 'disc',
                lineHeight: 1.4
              }}
            >
              <li>POST /placeBinanceSpotOrder</li>
              <li>GET /listBinanceOpenOrders</li>
              <li>POST /cancelAllBinanceOpenOrders</li>
              <li>POST /closeAndDustBinancePositions</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '10px',
            marginTop: '16px'
          }}
        >
          <button
            onClick={handleBinancePresetOrder}
            disabled={binanceOrderStatus.state === 'loading'}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background:
                binanceOrderStatus.state === 'loading'
                  ? 'linear-gradient(135deg, #0c172c, #081022)'
                  : 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
              color: '#f8fafc',
              fontWeight: 600,
              fontSize: '14px',
              cursor: binanceOrderStatus.state === 'loading' ? 'wait' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {binanceOrderStatus.state === 'loading' ? 'Envoi en cours…' : 'Envoyer l’ordre market preset'}
          </button>

          <button
            onClick={handleBinanceLargePresetOrder}
            disabled={binanceLargeOrderStatus.state === 'loading'}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #1f2d40',
              background:
                binanceLargeOrderStatus.state === 'loading'
                  ? 'linear-gradient(135deg, #140a24, #0b0513)'
                  : 'linear-gradient(135deg, #7c3aed, #c026d3)',
              color: '#fdf4ff',
              fontWeight: 600,
              fontSize: '14px',
              cursor: binanceLargeOrderStatus.state === 'loading' ? 'wait' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {binanceLargeOrderStatus.state === 'loading' ? 'Envoi ordre 100$…' : 'Envoyer l’ordre market 100 USDT'}
          </button>

          <button
            onClick={handleFetchBinanceOpenOrders}
            disabled={binanceFetchStatus.state === 'loading'}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #1e293b',
              background: '#020a16',
              color: '#e2e8f0',
              fontWeight: 600,
              fontSize: '14px',
              cursor: binanceFetchStatus.state === 'loading' ? 'wait' : 'pointer'
            }}
          >
            {binanceFetchStatus.state === 'loading' ? 'Lecture des ordres…' : 'Lister les ordres ouverts'}
          </button>

          <button
            onClick={handleCancelAllBinanceOrders}
            disabled={binanceCancelStatus.state === 'loading'}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background:
                binanceCancelStatus.state === 'loading'
                  ? 'linear-gradient(135deg, #3f1a1f, #2d0d13)'
                  : 'linear-gradient(135deg, #be123c, #fb7185)',
              color: '#fff1f2',
              fontWeight: 700,
              fontSize: '14px',
              cursor: binanceCancelStatus.state === 'loading' ? 'wait' : 'pointer'
            }}
          >
            {binanceCancelStatus.state === 'loading' ? 'Nettoyage…' : 'Fermer toutes les positions BINANCE'}
          </button>

          <button
            onClick={handleCloseAndDustBinancePositions}
            disabled={binanceDustStatus.state === 'loading'}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background:
                binanceDustStatus.state === 'loading'
                  ? 'linear-gradient(135deg, #2b1a39, #1b1024)'
                  : 'linear-gradient(135deg, #a855f7, #ec4899)',
              color: '#fdf4ff',
              fontWeight: 700,
              fontSize: '14px',
              cursor: binanceDustStatus.state === 'loading' ? 'wait' : 'pointer'
            }}
          >
            {binanceDustStatus.state === 'loading' ? 'Fermeture + BNB…' : 'Fermer + Convertir en BNB'}
          </button>
        </div>

        {/* Compositeur multi-ordres Binance */}
        <div
          style={{
            marginTop: '28px',
            border: '1px solid #132038',
            borderRadius: '18px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(4,11,22,0.85), rgba(8,18,35,0.95))'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#f0fdfa', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                🎯 Composer des ordres Binance
              </h3>
              <p style={{ color: '#94a3b8', margin: '6px 0 0', lineHeight: 1.5 }}>
                Sélectionne tes tokens <strong>:binance</strong> dans Ma Cuisine, ajuste taille, prix limite et côté
                puis expédie jusqu’à 10 ordres limit GTC d’un seul clic. Les prix live viennent du flux Firebase et le notional est recalculé en USDT.
              </p>
              {!hasBinanceOrderableTokens && (
                <p style={{ color: '#f97316', margin: '8px 0 0', fontWeight: 500 }}>
                  Ajoute un token « :binance » via l’Épicerie fine pour activer ce module.
                </p>
              )}
            </div>
            <button
              onClick={handleBinanceGridOrders}
              disabled={binanceBatchStatus.state === 'loading' || !hasBinanceOrderableTokens}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                background:
                  binanceBatchStatus.state === 'loading'
                    ? '#1d314c'
                    : hasBinanceOrderableTokens
                      ? 'linear-gradient(135deg, #0ea5e9, #2563eb)'
                      : '#1b2636',
                color: '#e0f2fe',
                fontWeight: 700,
                fontSize: '15px',
                cursor:
                  binanceBatchStatus.state === 'loading' || !hasBinanceOrderableTokens
                    ? 'not-allowed'
                    : 'pointer',
                minWidth: '200px'
              }}
            >
              {binanceBatchStatus.state === 'loading'
                ? 'Envoi des ordres…'
                : hasBinanceOrderableTokens
                  ? `Placer ${binanceOrderForms.length} ordre(s)`
                  : 'Sélectionne un token'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '18px' }}>
            {!hasBinanceOrderableTokens && (
              <div
                style={{
                  border: '1px dashed #1e293b',
                  borderRadius: '14px',
                  padding: '16px',
                  color: '#cbd5f5',
                  background: 'rgba(2,8,16,0.6)'
                }}
              >
                🧺 Ajoute un token Binance depuis l’Épicerie pour pouvoir composer ici.
              </div>
            )}

            {visibleBinanceOrderForms.map((order, index) => {
              const selectOptions = binanceOrderableSymbols
              const safeSymbol = isBinanceSymbolAllowed(order.symbol) ? order.symbol : ''
              const pairSymbol = safeSymbol ? getBinancePairSymbol(safeSymbol) : null
              const displayedPrice = order.autoPrice && safeSymbol
                ? computeAutoLimitPrice(safeSymbol, 'binance') || ''
                : order.price
              const binancePriceKey = safeSymbol ? buildMarketDataKey(safeSymbol, 'binance') : ''
              const livePriceNumber = safeSymbol
                ? tokenPriceMap?.[binancePriceKey] ?? tokenPriceMap?.[safeSymbol]
                : null
              const livePriceDisplay = Number.isFinite(livePriceNumber)
                ? `${formatNumericString(livePriceNumber, {
                  maximumFractionDigits: getPriceDecimals(safeSymbol),
                  preserveTinyValues: true,
                  limitHighValues: true
                })} USDT`
                : null
              const sizeNumber = parseDecimalValue(order.size)
              const priceNumber = parseDecimalValue(displayedPrice)
              const notionalUsd = Number.isFinite(sizeNumber) && Number.isFinite(priceNumber)
                ? sizeNumber * priceNumber
                : null
              const notionalDisplay = notionalUsd != null
                ? formatNumericString(notionalUsd, { maximumFractionDigits: 2, preserveTinyValues: true, limitHighValues: true })
                : ''

              return (
                <div
                  key={`binance-order-${index}`}
                  style={{
                    border: '1px solid #16253a',
                    borderRadius: '16px',
                    padding: '16px',
                    background: '#010915'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <p style={{ margin: 0, color: '#f8fafc', fontWeight: 600 }}>Ordre #{index + 1}</p>
                      <small style={{ color: '#64748b' }}>
                        {safeSymbol ? `${safeSymbol} → ${pairSymbol}` : 'Choisis un token Binance'}
                      </small>
                    </div>
                    <button
                      onClick={() => removeBinanceOrderForm(index)}
                      disabled={binanceOrderForms.length === 1}
                      style={{
                        border: '1px solid #ef4444',
                        borderRadius: '10px',
                        padding: '6px 12px',
                        background: binanceOrderForms.length === 1 ? '#1e293b' : '#ef444433',
                        color: '#fecaca',
                        cursor: binanceOrderForms.length === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Retirer
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Token</label>
                      <select
                        value={safeSymbol}
                        onChange={(e) => updateBinanceOrderField(index, 'symbol', e.target.value)}
                        disabled={!hasBinanceOrderableTokens}
                        style={{
                          width: '100%',
                          marginTop: '4px',
                          borderRadius: '10px',
                          padding: '10px',
                          background: hasBinanceOrderableTokens ? '#071126' : '#1e293b',
                          color: '#e5e7eb',
                          border: '1px solid #1e293b'
                        }}
                      >
                        <option value="">Sélectionner</option>
                        {selectOptions.map((symbol) => (
                          <option key={`${symbol}-${index}`} value={symbol}>
                            {symbol} • {getTokenConfig(symbol)?.name || symbol}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Côté</label>
                      <select
                        value={order.side}
                        onChange={(e) => updateBinanceOrderField(index, 'side', e.target.value)}
                        style={{
                          width: '100%',
                          marginTop: '4px',
                          borderRadius: '10px',
                          padding: '10px',
                          background: '#071126',
                          color: '#e5e7eb',
                          border: '1px solid #1e293b'
                        }}
                      >
                        <option value="buy">Achat (BUY)</option>
                        <option value="sell">Vente (SELL)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Taille (token)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={order.size}
                        onChange={(e) => updateBinanceOrderField(index, 'size', e.target.value)}
                        onBlur={() => finalizeBinanceManualSize(index)}
                        placeholder={DEFAULT_ORDER_SIZE}
                        style={{
                          width: '100%',
                          marginTop: '4px',
                          borderRadius: '10px',
                          padding: '10px',
                          background: '#071126',
                          color: '#e5e7eb',
                          border: '1px solid #1e293b',
                          fontVariantNumeric: 'tabular-nums'
                        }}
                      />
                      <small style={{ color: '#475569' }}>
                        {order.autoSize && safeSymbol
                          ? `Auto ≈ ${BINANCE_TARGET_NOTIONAL_USDT} USDT de notional`
                          : 'Exprimé en unités de base'}
                      </small>
                    </div>

                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Prix limite (USDT)</label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', marginTop: '4px' }}>
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[.,]?[0-9]*"
                            value={displayedPrice}
                            onChange={(e) => updateBinanceOrderField(index, 'price', e.target.value)}
                            onBlur={() => finalizeBinanceManualPrice(index)}
                            placeholder="Prix marché"
                            style={{
                              width: '100%',
                              borderRadius: '12px',
                              padding: '12px 14px',
                              background: '#071126',
                              color: '#e5e7eb',
                              border: '1px solid #1e293b',
                              fontSize: '16px',
                              fontVariantNumeric: 'tabular-nums'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              if (e.detail === 0) {
                                nudgeBinanceOrderPrice(index, 1)
                              }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              startBinanceContinuousNudge(index, 1)
                            }}
                            onMouseUp={stopBinanceContinuousNudge}
                            onMouseLeave={stopBinanceContinuousNudge}
                            onTouchStart={(e) => {
                              e.preventDefault()
                              startBinanceContinuousNudge(index, 1)
                            }}
                            onTouchEnd={stopBinanceContinuousNudge}
                            onTouchCancel={stopBinanceContinuousNudge}
                            style={{
                              width: '44px',
                              height: '42px',
                              borderRadius: '10px',
                              border: '1px solid #1e293b',
                              background: '#0f172a',
                              color: '#e5e7eb',
                              fontWeight: 700,
                              fontSize: '18px',
                              cursor: safeSymbol ? 'pointer' : 'not-allowed',
                              opacity: safeSymbol ? 1 : 0.5
                            }}
                            disabled={!safeSymbol}
                            aria-label="Augmenter le prix"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              if (e.detail === 0) {
                                nudgeBinanceOrderPrice(index, -1)
                              }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              startBinanceContinuousNudge(index, -1)
                            }}
                            onMouseUp={stopBinanceContinuousNudge}
                            onMouseLeave={stopBinanceContinuousNudge}
                            onTouchStart={(e) => {
                              e.preventDefault()
                              startBinanceContinuousNudge(index, -1)
                            }}
                            onTouchEnd={stopBinanceContinuousNudge}
                            onTouchCancel={stopBinanceContinuousNudge}
                            style={{
                              width: '44px',
                              height: '42px',
                              borderRadius: '10px',
                              border: '1px solid #1e293b',
                              background: '#0f172a',
                              color: '#e5e7eb',
                              fontWeight: 700,
                              fontSize: '18px',
                              cursor: safeSymbol ? 'pointer' : 'not-allowed',
                              opacity: safeSymbol ? 1 : 0.5
                            }}
                            disabled={!safeSymbol}
                            aria-label="Réduire le prix"
                          >
                            −
                          </button>
                        </div>
                      </div>
                      <small style={{ color: '#475569' }}>
                        {safeSymbol
                          ? livePriceDisplay
                            ? (
                                <span>
                                  Prix marché :{' '}
                                  <button
                                    type="button"
                                    onClick={() => applyBinanceLivePrice(index)}
                                    style={{
                                      border: 'none',
                                      background: 'transparent',
                                      color: '#38bdf8',
                                      padding: 0,
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    {livePriceDisplay}
                                  </button>
                                </span>
                              )
                            : 'Prix Binance live (chargement…)'
                          : 'Choisis un token pour voir le marché'}
                      </small>
                    </div>

                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Notional (USDT)</label>
                      <input
                        type="text"
                        value={notionalDisplay}
                        readOnly
                        placeholder="—"
                        style={{
                          width: '100%',
                          marginTop: '4px',
                          borderRadius: '10px',
                          padding: '10px',
                          background: '#071126',
                          color: '#e5e7eb',
                          border: '1px solid #1e293b',
                          opacity: notionalUsd != null ? 1 : 0.5,
                          fontVariantNumeric: 'tabular-nums'
                        }}
                      />
                      <small style={{ color: '#475569' }}>Calcul: taille × prix limite</small>
                    </div>

                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Time in Force</label>
                      <select
                        value={(order.timeInForce || BINANCE_DEFAULT_TIME_IN_FORCE).toUpperCase()}
                        onChange={(e) => updateBinanceOrderField(index, 'timeInForce', e.target.value)}
                        style={{
                          width: '100%',
                          marginTop: '4px',
                          borderRadius: '10px',
                          padding: '10px',
                          background: '#071126',
                          color: '#e5e7eb',
                          border: '1px solid #1e293b'
                        }}
                      >
                        <option value="GTC">GTC</option>
                        <option value="IOC">IOC</option>
                        <option value="FOK">FOK</option>
                      </select>
                    </div>
                  </div>
                </div>
              )
            })}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={addBinanceOrderForm}
                disabled={!hasBinanceOrderableTokens || binanceOrderForms.length >= BINANCE_MAX_ORDER_FORMS}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1px solid #1e293b',
                  background:
                    !hasBinanceOrderableTokens || binanceOrderForms.length >= BINANCE_MAX_ORDER_FORMS
                      ? '#0f172a'
                      : '#071126',
                  color: '#e5e7eb',
                  cursor:
                    !hasBinanceOrderableTokens || binanceOrderForms.length >= BINANCE_MAX_ORDER_FORMS
                      ? 'not-allowed'
                      : 'pointer'
                }}
              >
                + Ajouter un ordre
              </button>
              <button
                onClick={resetBinanceOrderForms}
                disabled={!hasBinanceOrderableTokens}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1px solid #1e293b',
                  background: hasBinanceOrderableTokens ? '#10243a' : '#0f172a',
                  color: '#e5e7eb',
                  cursor: hasBinanceOrderableTokens ? 'pointer' : 'not-allowed'
                }}
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {binanceBatchStatus.state !== 'idle' && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: binanceBatchStatusColor, fontSize: '14px', marginBottom: '8px' }}>
                {binanceBatchStatus.message}
              </p>
              {binanceBatchStatus.payload && (
                <pre
                  style={{
                    background: '#010711',
                    color: '#e2e8f0',
                    padding: '16px',
                    borderRadius: '12px',
                    overflowX: 'auto',
                    border: '1px solid #0f172a',
                    fontSize: '12px'
                  }}
                >
                  {JSON.stringify(binanceBatchStatus.payload, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            marginTop: '18px'
          }}
        >
          {[
            { label: 'Dernier envoi', status: binanceOrderStatus, color: binanceOrderStatusColor },
            { label: 'Ordre 100 USDT', status: binanceLargeOrderStatus, color: binanceLargeOrderStatusColor },
            { label: 'Lecture du carnet', status: binanceFetchStatus, color: binanceFetchStatusColor },
            { label: 'Cancel all', status: binanceCancelStatus, color: binanceCancelStatusColor },
            { label: 'Fermer + BNB', status: binanceDustStatus, color: binanceDustStatusColor },
            { label: 'Batch multi-ordres', status: binanceBatchStatus, color: binanceBatchStatusColor }
          ].map((item) => (
            <div
              key={item.label}
              style={{
                border: '1px solid #1d2a3a',
                borderRadius: '12px',
                padding: '12px 14px',
                background: '#010814'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '999px',
                    background: item.color
                  }}
                ></span>
                <p style={{ color: '#cbd5f5', margin: 0, fontWeight: 600 }}>{item.label}</p>
              </div>
              <p style={{ color: '#94a3b8', margin: 0 }}>
                {item.status.message || 'En attente de commande.'}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <p style={{ color: '#e5e7eb', margin: 0, fontWeight: 600 }}>Réponses API Binance (brut)</p>
              <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>
                Analyse les payloads Firebase uniquement quand tu en as besoin.
              </p>
            </div>
            <button
              onClick={() => setShowBinanceLogs((prev) => !prev)}
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                border: '1px solid #1e293b',
                background: '#020a16',
                color: '#cbd5f5',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {showBinanceLogs ? 'Masquer les logs' : 'Afficher les logs'}
            </button>
          </div>

          {showBinanceLogs && (
            <div
              style={{
                marginTop: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '10px'
              }}
            >
              {[
                { label: 'Envoi ordre market', status: binanceOrderStatus },
                { label: 'Ordre market 100 USDT', status: binanceLargeOrderStatus },
                { label: 'Listing des ordres', status: binanceFetchStatus },
                { label: 'Fermeture / Cancel all', status: binanceCancelStatus },
                { label: 'Fermeture + BNB', status: binanceDustStatus },
                { label: 'Batch multi-ordres', status: binanceBatchStatus }
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    border: '1px solid #1d2a3a',
                    borderRadius: '12px',
                    padding: '12px',
                    background: '#020a16',
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ marginBottom: '6px' }}>
                    <p style={{ color: '#cbd5f5', margin: 0, fontWeight: 600, fontSize: '14px' }}>{item.label}</p>
                    <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '12px' }}>
                      {item.status.message || 'Aucune requête envoyée.'}
                    </p>
                  </div>
                  <pre
                    style={{
                      flex: 1,
                      margin: 0,
                      borderRadius: '10px',
                      background: '#010711',
                      color: '#e2e8f0',
                      padding: '10px',
                      fontSize: '11px',
                      lineHeight: 1.25,
                      overflowX: 'auto',
                      overflowY: 'auto',
                      maxHeight: '140px',
                      border: '1px solid #0f172a'
                    }}
                  >{formatJsonPayload(item.status.payload)}</pre>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '26px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <p style={{ color: '#e5e7eb', margin: 0, fontWeight: 600 }}>Ordres ouverts Binance</p>
              <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>
                {binanceFetchStatus.message || 'Clique sur « Lister » pour rafraîchir les données.'}
              </p>
            </div>
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                border: '1px solid #1f2d3f',
                color: '#bae6fd',
                fontWeight: 600
              }}
            >
              {binanceOpenOrdersList.length} ordre(s)
            </div>
          </div>

          {binanceOpenOrdersList.length > 0 ? (
            <div
              style={{
                marginTop: '18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '14px'
              }}
            >
              {binanceOpenOrdersList.map((order) => {
                const sideColor = order?.side === 'SELL' ? '#fb7185' : '#34d399'
                const orderKey = `${order?.symbol}-${order?.orderId || order?.clientOrderId || order?.time}`
                return (
                  <div
                    key={orderKey}
                    style={{
                      border: '1px solid #152337',
                      borderRadius: '16px',
                      padding: '16px',
                      background: '#010915'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <p style={{ color: '#f8fafc', margin: 0, fontWeight: 600 }}>{order?.symbol || '—'}</p>
                        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
                          {(order?.type || '—')} • {order?.status || 'NOUVEAU'}
                        </p>
                      </div>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: sideColor,
                          background: 'rgba(15, 23, 42, 0.65)',
                          border: `1px solid ${sideColor}33`
                        }}
                      >
                        {order?.side || '—'}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '12px',
                        marginTop: '14px'
                      }}
                    >
                      {[
                        {
                          label: 'Quantité',
                          value: formatNumericString(order?.origQty ?? order?.executedQty ?? '0', {
                            preserveTinyValues: true,
                            maximumFractionDigits: 6
                          })
                        },
                        {
                          label: 'Prix',
                          value: formatNumericString(order?.price ?? order?.stopPrice ?? '0', {
                            maximumFractionDigits: 2,
                            limitHighValues: true
                          })
                        },
                        {
                          label: 'Exécuté',
                          value: formatNumericString(order?.executedQty ?? '0', {
                            preserveTinyValues: true,
                            maximumFractionDigits: 6
                          })
                        },
                        {
                          label: 'Ordre ID',
                          value: order?.orderId || order?.clientOrderId || '—'
                        }
                      ].map((field) => (
                        <div key={`${orderKey}-${field.label}`}>
                          <p style={{ color: '#64748b', margin: 0, fontSize: '12px', letterSpacing: '0.03em' }}>
                            {field.label}
                          </p>
                          <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontWeight: 600 }}>{field.value}</p>
                        </div>
                      ))}
                    </div>

                    <p style={{ color: '#475569', marginTop: '14px', fontSize: '12px' }}>
                      Dernière mise à jour :{' '}
                      {formatTimestamp(order?.updateTime ?? order?.time ?? null)}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              style={{
                marginTop: '18px',
                border: '1px dashed #1d2a3a',
                borderRadius: '14px',
                padding: '20px',
                background: 'rgba(1, 10, 22, 0.6)'
              }}
            >
              <p style={{ color: '#94a3b8', margin: 0 }}>
                Aucun ordre ouvert sur le testnet Binance pour l’instant. Lance un ordre ou rafraîchis le carnet pour mettre à jour.
              </p>
            </div>
          )}
        </div>

        <div style={{ marginTop: '26px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <p style={{ color: '#e5e7eb', margin: 0, fontWeight: 600 }}>
                Historique récent ({binanceFetchStatus.payload?.historySymbol || BINANCE_PRESET_ORDER.symbol})
              </p>
              <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>
                Les {binanceRecentOrdersList.length || '0'} derniers ordres exécutés / clôturés (limite 20).
              </p>
            </div>
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                border: '1px solid #1f2d3f',
                color: '#c4b5fd',
                fontWeight: 600
              }}
            >
              {binanceRecentOrdersList.length} ordre(s)
            </div>
          </div>

          {binanceRecentOrdersList.length > 0 ? (
            <div
              style={{
                marginTop: '18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '14px'
              }}
            >
              {binanceRecentOrdersList.map((order) => {
                const statusColor = order?.status === 'FILLED' ? '#34d399' : '#fbbf24'
                const orderKey = `${order?.symbol}-${order?.orderId}-${order?.updateTime}`
                return (
                  <div
                    key={orderKey}
                    style={{
                      border: '1px solid #1f2d3f',
                      borderRadius: '16px',
                      padding: '16px',
                      background: '#040a14'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <p style={{ color: '#f8fafc', margin: 0, fontWeight: 600 }}>{order?.symbol || '—'}</p>
                        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
                          {(order?.type || '—')} • ID #{order?.orderId ?? '—'}
                        </p>
                      </div>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: statusColor,
                          background: 'rgba(37, 99, 235, 0.08)',
                          border: `1px solid ${statusColor}33`
                        }}
                      >
                        {order?.status || '—'}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '12px',
                        marginTop: '14px'
                      }}
                    >
                      {[
                        {
                          label: 'Côté',
                          value: order?.side || '—'
                        },
                        {
                          label: 'Quantité',
                          value: formatNumericString(order?.origQty ?? '0', {
                            preserveTinyValues: true,
                            maximumFractionDigits: 6
                          })
                        },
                        {
                          label: 'Exécuté',
                          value: formatNumericString(order?.executedQty ?? '0', {
                            preserveTinyValues: true,
                            maximumFractionDigits: 6
                          })
                        },
                        {
                          label: 'Prix',
                          value: formatNumericString(order?.price ?? order?.stopPrice ?? '0', {
                            maximumFractionDigits: 2,
                            limitHighValues: true
                          })
                        }
                      ].map((field) => (
                        <div key={`${orderKey}-${field.label}`}>
                          <p style={{ color: '#64748b', margin: 0, fontSize: '12px', letterSpacing: '0.03em' }}>
                            {field.label}
                          </p>
                          <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontWeight: 600 }}>{field.value}</p>
                        </div>
                      ))}
                    </div>

                    <p style={{ color: '#475569', marginTop: '14px', fontSize: '12px' }}>
                      Maj : {formatTimestamp(order?.updateTime ?? order?.time ?? null)}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              style={{
                marginTop: '18px',
                border: '1px dashed #1d2a3a',
                borderRadius: '14px',
                padding: '20px',
                background: 'rgba(4, 10, 20, 0.6)'
              }}
            >
              <p style={{ color: '#94a3b8', margin: 0 }}>
                Aucun ordre exécuté n’a été trouvé pour ce symbole sur la période interrogée. Lance un ordre ou change le symbole pour rafraîchir.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bouton Hyperliquid Testnet */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #1e293b'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#e5e7eb', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              🧪 Envoyer des ordres Hyperliquid
            </h3>
            <p style={{ color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>
              Compose jusqu’à 10 ordres limite (token, côté, taille, prix) puis envoie-les vers Hyperliquid en un clic.
            </p>
          </div>
          <button
            onClick={sendTestOrder}
            disabled={orderStatus.state === 'loading' || !hasOrderableTokens}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              background:
                orderStatus.state === 'loading'
                  ? '#475569'
                  : hasOrderableTokens
                    ? '#3b82f6'
                    : '#334155',
              color: 'white',
              fontWeight: '600',
              cursor:
                orderStatus.state === 'loading' || !hasOrderableTokens ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {orderStatus.state === 'loading'
              ? 'Envoi…'
              : hasOrderableTokens
                ? `Placer ${orderForms.length} ordre(s)`
                : 'Ajoute des tokens avant'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {!hasOrderableTokens && (
            <div
              style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '16px',
                border: '1px dashed #334155',
                color: '#cbd5f5',
                fontSize: '14px'
              }}
            >
              🧺 Ajoute des tokens dans ton panier depuis « Épicerie fine » pour pouvoir sélectionner des ordres ici.
            </div>
          )}
          {visibleOrderForms.map((order, index) => {
            const tokenConfig = order.symbol ? getTokenConfig(order.symbol) : null
            const selectOptions = orderableSymbols
            const safeSymbol = isSymbolAllowed(order.symbol) ? order.symbol : ''
            const displayedPrice = order.autoPrice && safeSymbol
              ? computeAutoLimitPrice(safeSymbol) || ''
              : order.price
            const livePriceNumber = safeSymbol ? tokenPriceMap?.[safeSymbol] : null
            const livePriceDisplay = Number.isFinite(livePriceNumber)
              ? `${formatNumericString(livePriceNumber, { maximumFractionDigits: getPriceDecimals(safeSymbol), preserveTinyValues: true, limitHighValues: true })} USDC`
              : null
            const sizeNumber = parseDecimalValue(order.size)
            const priceNumber = parseDecimalValue(displayedPrice)
            const notionalUsd = Number.isFinite(sizeNumber) && Number.isFinite(priceNumber)
              ? sizeNumber * priceNumber
              : null
            const notionalDisplay = notionalUsd != null
              ? formatNumericString(notionalUsd, { maximumFractionDigits: 2, preserveTinyValues: true, limitHighValues: true })
              : ''

            return (
              <div
                key={`order-form-${index}`}
                style={{
                  background: '#020617',
                  border: '1px solid #1e293b',
                  borderRadius: '14px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, color: '#e5e7eb', fontWeight: 600 }}>Ordre #{index + 1}</p>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                      {tokenConfig ? tokenConfig.name : 'Sélectionne un token'}
                    </span>
                  </div>
                  <button
                    onClick={() => removeOrderForm(index)}
                    disabled={orderForms.length === 1}
                    style={{
                      border: '1px solid #ef4444',
                      background: orderForms.length === 1 ? '#1e293b' : '#ef444433',
                      color: '#fca5a5',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: orderForms.length === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Retirer
                  </button>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px'
                  }}
                >
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Token</label>
                    <select
                      value={safeSymbol}
                      onChange={(e) => updateOrderField(index, 'symbol', e.target.value)}
                      disabled={!hasOrderableTokens}
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        borderRadius: '10px',
                        padding: '10px',
                        background: hasOrderableTokens ? '#0f172a' : '#1e293b',
                        color: '#e5e7eb',
                        border: '1px solid #1e293b',
                        cursor: hasOrderableTokens ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <option value="">Sélectionner</option>
                      {selectOptions.map((symbol) => (
                        <option key={`${symbol}-${index}`} value={symbol}>
                          {symbol} • {getTokenConfig(symbol)?.name || 'Hyperliquid'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Côté</label>
                    <select
                      value={order.side}
                      onChange={(e) => updateOrderField(index, 'side', e.target.value)}
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        borderRadius: '10px',
                        padding: '10px',
                        background: '#0f172a',
                        color: '#e5e7eb',
                        border: '1px solid #1e293b'
                      }}
                    >
                      <option value="buy">Achat (Long)</option>
                      <option value="sell">Vente (Short)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Taille</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      value={order.size}
                      onChange={(e) => updateOrderField(index, 'size', e.target.value)}
                      onBlur={() => finalizeManualSize(index)}
                      placeholder={DEFAULT_ORDER_SIZE}
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        borderRadius: '10px',
                        padding: '10px',
                        background: '#0f172a',
                        color: '#e5e7eb',
                        border: '1px solid #1e293b',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    />
                    <small style={{ color: '#475569' }}>
                      {order.autoSize && safeSymbol
                        ? `Auto: ~${MIN_ORDER_NOTIONAL_USDC} USDC notional`
                        : 'Exprimé en unités de token'}
                    </small>
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Prix limite (USDC)</label>
                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'stretch',
                        marginTop: '4px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]*"
                          value={displayedPrice}
                          onChange={(e) => updateOrderField(index, 'price', e.target.value)}
                          onBlur={() => finalizeManualPrice(index)}
                          placeholder="0,0046"
                          style={{
                            width: '100%',
                            borderRadius: '12px',
                            padding: '12px 14px',
                            background: '#0f172a',
                            color: '#e5e7eb',
                            border: '1px solid #1e293b',
                            fontSize: '16px',
                            fontVariantNumeric: 'tabular-nums'
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            if (e.detail === 0) {
                              nudgeOrderPrice(index, 1)
                            }
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            startContinuousNudge(index, 1)
                          }}
                          onMouseUp={stopContinuousNudge}
                          onMouseLeave={stopContinuousNudge}
                          onTouchStart={(e) => {
                            e.preventDefault()
                            startContinuousNudge(index, 1)
                          }}
                          onTouchEnd={stopContinuousNudge}
                          onTouchCancel={stopContinuousNudge}
                          style={{
                            width: '48px',
                            height: '42px',
                            borderRadius: '10px',
                            border: '1px solid #1e293b',
                            background: '#1d293b',
                            color: '#e5e7eb',
                            fontWeight: 700,
                            fontSize: '18px',
                            cursor: safeSymbol ? 'pointer' : 'not-allowed',
                            opacity: safeSymbol ? 1 : 0.5
                          }}
                          disabled={!safeSymbol}
                          aria-label="Augmenter le prix"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            if (e.detail === 0) {
                              nudgeOrderPrice(index, -1)
                            }
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            startContinuousNudge(index, -1)
                          }}
                          onMouseUp={stopContinuousNudge}
                          onMouseLeave={stopContinuousNudge}
                          onTouchStart={(e) => {
                            e.preventDefault()
                            startContinuousNudge(index, -1)
                          }}
                          onTouchEnd={stopContinuousNudge}
                          onTouchCancel={stopContinuousNudge}
                          style={{
                            width: '48px',
                            height: '42px',
                            borderRadius: '10px',
                            border: '1px solid #1e293b',
                            background: '#1d293b',
                            color: '#e5e7eb',
                            fontWeight: 700,
                            fontSize: '18px',
                            cursor: safeSymbol ? 'pointer' : 'not-allowed',
                            opacity: safeSymbol ? 1 : 0.5
                          }}
                          disabled={!safeSymbol}
                          aria-label="Diminuer le prix"
                        >
                          −
                        </button>
                      </div>
                    </div>
                    <small style={{ color: '#475569' }}>
                      {safeSymbol
                        ? livePriceDisplay
                          ? (
                              <span>
                                Prix marché :{' '}
                                <button
                                  type="button"
                                  onClick={() => applyLivePrice(index)}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#f87171',
                                    padding: 0,
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    textDecoration: 'underline'
                                  }}
                                >
                                  {livePriceDisplay}
                                </button>
                                {' '}• clic = revenir au marché (auto)
                              </span>
                            )
                          : 'Prix Hyperliquid live (chargement…)'
                        : 'Sélectionne un token pour voir le prix marché'}
                    </small>
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Valeur position (USDC)</label>
                    <input
                      type="text"
                      value={notionalDisplay}
                      readOnly
                      placeholder="—"
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        borderRadius: '10px',
                        padding: '10px',
                        background: '#0f172a',
                        color: '#e5e7eb',
                        border: '1px solid #1e293b',
                        opacity: notionalUsd != null ? 1 : 0.5,
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    />
                    <small style={{ color: '#475569' }}>
                      Calcul: taille × prix limite
                    </small>
                  </div>
                </div>
              </div>
            )
          })}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Boutons d'ajout / reset */}
            <button
              onClick={addOrderForm}
              disabled={!hasOrderableTokens || orderForms.length >= MAX_ORDER_FORMS}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid #334155',
                background:
                  !hasOrderableTokens || orderForms.length >= MAX_ORDER_FORMS ? '#1e293b' : '#0f172a',
                color: '#e5e7eb',
                cursor:
                  !hasOrderableTokens || orderForms.length >= MAX_ORDER_FORMS ? 'not-allowed' : 'pointer'
              }}
            >
              + Ajouter un ordre
            </button>
            <button
              onClick={resetOrderForms}
              disabled={!hasOrderableTokens}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid #1e293b',
                background: !hasOrderableTokens ? '#0f172a' : '#1e293b',
                color: '#e5e7eb'
              }}
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {orderStatus.state !== 'idle' && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: orderStatusColor, fontSize: '14px', marginBottom: '8px' }}>
              {orderStatus.message}
            </p>
            {orderStatus.payload && (
              <pre
                style={{
                  background: '#020617',
                  color: '#e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  overflowX: 'auto',
                  border: '1px solid #1e293b',
                  fontSize: '12px'
                }}
              >
                {JSON.stringify(orderStatus.payload, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Liste des ordres ouverts Hyperliquid */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #1e293b'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#e5e7eb', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              📋 Lister mes ordres ouverts
            </h3>
            <p style={{ color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>
              Vérifie en direct les ordres encore en carnet ET les positions actives sur Hyperliquid.
            </p>
          </div>
          <button
            onClick={loadOpenOrders}
            disabled={openOrdersStatus.state === 'loading'}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              background: openOrdersStatus.state === 'loading' ? '#475569' : '#6366f1',
              color: 'white',
              fontWeight: '600',
              cursor: openOrdersStatus.state === 'loading' ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {openOrdersStatus.state === 'loading' ? 'Chargement…' : 'Lister ordres & positions'}
          </button>
        </div>

        {openOrdersStatus.state !== 'idle' && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: openOrdersStatusColor, fontSize: '14px', marginBottom: '8px' }}>
              {openOrdersStatus.message}
            </p>
            {openOrdersStatus.payload && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h4 style={{ color: '#e5e7eb', margin: '0 0 8px', fontSize: '15px' }}>Ordres en carnet</h4>
                  {openOrdersList.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {openOrdersList.map((order) => (
                        <div
                          key={order.oid}
                          style={{
                            background: '#020617',
                            border: '1px solid #1e293b',
                            borderRadius: '12px',
                            padding: '16px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#f8fafc', fontWeight: '600' }}>{order.coin}</span>
                            <span
                              style={{
                                color: order.side === 'buy' ? '#22c55e' : '#f87171',
                                fontWeight: '600'
                              }}
                            >
                              {order.side === 'buy' ? 'Long (achat)' : 'Short (vente)'}
                            </span>
                          </div>
                          <div style={{ color: '#cbd5f5', fontSize: '13px', lineHeight: 1.6 }}>
                            <div>
                              Prix limite : <strong>{formatNumericString(order.limitPx, { maximumFractionDigits: 4, preserveTinyValues: true, limitHighValues: true })} USDC</strong>
                            </div>
                            <div>
                              Taille restante : <strong>{formatNumericString(order.size, { maximumFractionDigits: 5, preserveTinyValues: true })}</strong> (initiale {formatNumericString(order.origSz, { maximumFractionDigits: 5, preserveTinyValues: true })})
                            </div>
                            <div>
                              Timestamp : <strong>{formatTimestamp(order.timestamp)}</strong>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                              OID #{order.oid} {order.reduceOnly ? '• Reduce only' : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        background: '#020617',
                        border: '1px dashed #1e293b',
                        borderRadius: '12px',
                        padding: '16px',
                        color: '#cbd5f5',
                        fontSize: '13px'
                      }}
                    >
                      Aucun ordre ouvert sur ce compte Hyperliquid.
                    </div>
                  )}
                </div>
                <div>
                  <h4 style={{ color: '#e5e7eb', margin: '0 0 8px', fontSize: '15px' }}>Positions actives</h4>
                  {openPositionsList.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {openPositionsList.map((position, index) => (
                        <div
                          key={`${position.coin}-${position.entryTime || index}`}
                          style={{
                            background: '#020617',
                            border: '1px solid #1e293b',
                            borderRadius: '12px',
                            padding: '16px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#f8fafc', fontWeight: '600' }}>{position.coin}</span>
                            <span
                              style={{
                                color: position.side === 'long' ? '#22c55e' : '#f87171',
                                fontWeight: '600'
                              }}
                            >
                              {position.side === 'long' ? 'Long (achat)' : 'Short (vente)'}
                            </span>
                          </div>
                          <div style={{ color: '#cbd5f5', fontSize: '13px', lineHeight: 1.6 }}>
                            <div>
                              Taille : <strong>{formatNumericString(position.size, { maximumFractionDigits: 5, preserveTinyValues: true })}</strong> token(s)
                            </div>
                            <div>
                              Prix d'entrée : <strong>{formatNumericString(position.entryPx, { maximumFractionDigits: 4, preserveTinyValues: true, limitHighValues: true }) || '—'} USDC</strong>
                            </div>
                            <div>
                              Mark actuel : <strong>{formatNumericString(position.markPx, { maximumFractionDigits: 4, preserveTinyValues: true, limitHighValues: true }) || '—'} USDC</strong>
                            </div>
                            <div>
                              Liquidation : <strong>{formatNumericString(position.liqPx, { maximumFractionDigits: 4, preserveTinyValues: true, limitHighValues: true }) || '—'} USDC</strong>
                            </div>
                            <div>
                              Levier estimé : <strong>{position.leverage ? `${position.leverage}x` : '—'}</strong>
                            </div>
                            {position.entryTime && (
                              <div>
                                Entrée le : <strong>{formatTimestamp(position.entryTime)}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        background: '#020617',
                        border: '1px dashed #1e293b',
                        borderRadius: '12px',
                        padding: '16px',
                        color: '#cbd5f5',
                        fontSize: '13px'
                      }}
                    >
                      Aucune position ouverte pour le moment.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fermer toutes les positions Hyperliquid */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #1e293b'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#e5e7eb', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              🔒 Fermer toutes les positions
            </h3>
            <p style={{ color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>
              Annule les ordres encore au carnet et envoie des ordres IOC inverses pour neutraliser la position.
            </p>
          </div>
          <button
            onClick={closeAllHyperliquid}
            disabled={closeAllStatus.state === 'loading'}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              background: closeAllStatus.state === 'loading' ? '#475569' : '#f97316',
              color: 'white',
              fontWeight: '600',
              cursor: closeAllStatus.state === 'loading' ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {closeAllStatus.state === 'loading' ? 'Fermeture…' : 'Fermer toutes les positions'}
          </button>
        </div>

        {closeAllStatus.state !== 'idle' && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: closeAllStatusColor, fontSize: '14px', marginBottom: '8px' }}>
              {closeAllStatus.message}
            </p>
            {closeAllStatus.payload && (
              <pre
                style={{
                  background: '#020617',
                  color: '#e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  overflowX: 'auto',
                  border: '1px solid #1e293b',
                  fontSize: '12px'
                }}
              >
                {JSON.stringify(closeAllStatus.payload, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Capital Initial Slider */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #334155'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <label style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '600' }}>
            💰 Capital Initial
          </label>
          <span style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>
            ${capitalInitial.toFixed(0)}
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="10000"
          step="10"
          value={capitalInitial}
          onChange={(e) => handleCapitalChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '10px',
            borderRadius: '5px',
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((capitalInitial - 10) / 9990) * 100}%, #334155 ${((capitalInitial - 10) / 9990) * 100}%, #334155 100%)`,
            outline: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '8px',
          color: '#64748b',
          fontSize: '12px'
        }}>
          <span>$10</span>
          <span>$10,000</span>
        </div>
      </div>

      {/* Résultats */}
      <PortfolioResults results={results} />

      {/* Faders de poids */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #334155'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            🎚️ Répartition Portfolio
          </h3>
          <button
            onClick={resetWeights}
            style={{
              padding: '8px 16px',
              background: '#334155',
              color: '#e5e7eb',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
          >
            Réinitialiser
          </button>
        </div>

        {/* Sliders dynamiques (branchés sur la bonne source par symbole) */}
        {tokensData.map(token => (
          <TokenWeightRow
            key={token.symbol}
            symbol={token.symbol}
            source={token.source}
            weight={weights[token.symbol] || 0}
            onChange={(newWeight) => setWeight(token.symbol, newWeight)}
            color={token.color}
          />
        ))}

        {/* Total */}
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
            Total Allocation
          </span>
          <span style={{ 
            color: '#22c55e', 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            100.0% ✓
          </span>
        </div>
      </div>

      {/* Graphique circulaire (Pie Chart) */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid #334155'
      }}>
        <h3 style={{ 
          color: '#e5e7eb', 
          fontSize: '18px', 
          fontWeight: 'bold', 
          margin: 0,
          marginBottom: '24px'
        }}>
          📊 Visualisation Portfolio
        </h3>
        
        <PortfolioChart weights={weights} tokensData={tokensData} />
      </div>

      {/* Tokens sélectionnés (ancien affichage) */}
      {selectedTokens.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: 'center',
          color: '#64748b',
          background: '#1e293b',
          borderRadius: 12,
          border: '2px dashed #334155'
        }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Aucun token sélectionné</p>
          <p style={{ fontSize: 14 }}>
            {user
              ? 'Glissez des tokens depuis "Épicerie fine" pour les suivre ici'
              : 'Connectez-vous pour commencer à cuisiner'
            }
          </p>
        </div>
      ) : (
        <div>
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            🔖 Mes Tokens Suivis ({count}/4)
          </h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {selectedTokens.map(symbolWithSource => {
              const [symbol, source] = symbolWithSource.includes(':') 
                ? symbolWithSource.split(':') 
                : [symbolWithSource, 'hyperliquid']
              
              return (
                <div key={symbolWithSource} style={{ position: 'relative' }}>
                  <TokenTile symbol={symbol} source={source} />
                  <DeleteButton 
                    symbol={symbol}
                    onRemove={() => removeToken(symbolWithSource)}
                    isMobile={isMobile}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
