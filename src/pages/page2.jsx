/**
 * Ma Cuisine - Simulateur de Portfolio Crypto
 * Ajustez vos allocations et visualisez les performances
 */

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import TokenTile from '../elements/TokenTile'
import TokenWeightRow from '../elements/TokenWeightRow'
import PortfolioResults from '../elements/PortfolioResults'
import PortfolioChart from '../elements/PortfolioChart'
import KitchenPerformanceChart from '../elements/KitchenPerformanceChart'
import { usePortfolioSimulation } from '../hooks/usePortfolioSimulation'
import { useTradeNotifications } from '../hooks/useTradeNotifications'
import { useSelectedTokens } from '../context/SelectedTokensContext'
import { useAuth } from '../hooks/useAuth'
import { useHyperliquidAccount } from '../hooks/useHyperliquidAccount'
import { useHyperliquidHistory } from '../hooks/useHyperliquidHistory'
import { useMarketData } from '../providers/MarketDataProvider'
import { buildMarketDataKey } from '../lib/marketDataKeys'
import { getTokenConfig } from '../config/tokenList'
import { BINANCE_DEFAULT_TOKENS } from '../config/binanceTrackedTokens.js'
import {
  placeHyperliquidTestOrder,
  fetchHyperliquidOpenOrders
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
import './MaCuisine.css'

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
const PRICE_DISPLAY_FRACTION_DIGITS = 12
const SMALL_VALUE_MAX_DECIMALS = 12
const PRICE_NUDGE_DECIMALS = 6
const PRICE_NUDGE_STEP = 1 / (10 ** PRICE_NUDGE_DECIMALS)
const BINANCE_MAX_ORDER_FORMS = 10
const BINANCE_TARGET_NOTIONAL_USDT = 25
const BINANCE_DEFAULT_TIME_IN_FORCE = 'GTC'
const BINANCE_PRICE_FILTER_ENDPOINT = 'https://api.binance.com/api/v3/exchangeInfo'
const BUDGET_MODES = {
  WALLET: 'wallet',
  CUSTOM: 'custom'
}
const BUDGET_MODE_STORAGE_KEY = 'kitchenBudgetMode'
const BUDGET_RATIO_STORAGE_KEY = 'kitchenWalletRatio'
const AUTO_BUDGET_DEFAULT_RATIO = 0.25
const AUTO_BUDGET_MIN_RATIO = 0.05

const clampBudgetRatio = (value) => {
  if (!Number.isFinite(value)) {
    return AUTO_BUDGET_DEFAULT_RATIO
  }
  if (value < AUTO_BUDGET_MIN_RATIO) {
    return AUTO_BUDGET_MIN_RATIO
  }
  if (value > 1) {
    return 1
  }
  return value
}

const readBudgetModeFromStorage = () => {
  if (typeof window === 'undefined') {
    return BUDGET_MODES.WALLET
  }
  const stored = window.localStorage.getItem(BUDGET_MODE_STORAGE_KEY)
  return stored === BUDGET_MODES.CUSTOM ? BUDGET_MODES.CUSTOM : BUDGET_MODES.WALLET
}

const readBudgetRatioFromStorage = () => {
  if (typeof window === 'undefined') {
    return AUTO_BUDGET_DEFAULT_RATIO
  }
  const raw = window.localStorage.getItem(BUDGET_RATIO_STORAGE_KEY)
  const numeric = Number(raw)
  return clampBudgetRatio(numeric)
}

const BINANCE_TOKEN_LOOKUP = BINANCE_DEFAULT_TOKENS.reduce((acc, token) => {
  acc[token.id.toUpperCase()] = token
  return acc
}, {})

const normalizeSymbol = (value) => (typeof value === 'string' ? value.trim().toUpperCase() : '')

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

const toCanonicalDecimalString = (value) => {
  if (value == null) {
    return ''
  }
  return String(value).replace(',', '.')
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
  const [budgetMode, setBudgetMode] = useState(() => readBudgetModeFromStorage())
  const [walletBudgetRatio, setWalletBudgetRatio] = useState(() => readBudgetRatioFromStorage())
  const [manualBudgetInput, setManualBudgetInput] = useState('1000')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem(BUDGET_MODE_STORAGE_KEY, budgetMode)
    } catch {
      // Ignorer stockage indisponible (mode privé)
    }
  }, [budgetMode])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem(BUDGET_RATIO_STORAGE_KEY, String(walletBudgetRatio))
    } catch {
      // Ignorer stockage indisponible (mode privé)
    }
  }, [walletBudgetRatio])

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
  const {
    notifyOrderExecuted,
    notifyOrderClosedByWatcher,
    notifyOrderInOrderBook
  } = useTradeNotifications()

  const {
    status: hlStatus,
    error: hlError,
    lastUpdated: hlUpdatedAt,
    totals: hlTotals,
    spot: hlSpot,
    perp: hlPerp,
    hasWallet: hlHasWallet
  } = useHyperliquidAccount({ pollIntervalMs: 25000 })

  const hyperliquidSummary = useMemo(() => {
    const spot = hlSpot || { totalUsd: 0, availableUsd: 0, holdUsd: 0 }
    const perp = hlPerp || { accountValue: 0, withdrawable: 0 }
    const totals = hlTotals || null

    const fallbackGlobal = (perp.accountValue ?? 0) + (spot.totalUsd ?? 0)
    const fallbackAvailable = (perp.withdrawable ?? 0) + (spot.availableUsd ?? 0)

    return {
      spotTotal: spot.totalUsd ?? 0,
      spotAvailable: spot.availableUsd ?? 0,
      spotHold: spot.holdUsd ?? 0,
      perpAccountValue: perp.accountValue ?? 0,
      perpWithdrawable: perp.withdrawable ?? 0,
      globalTotal: totals?.globalUsd ?? fallbackGlobal,
      globalAvailable: totals?.availableUsd ?? fallbackAvailable
    }
  }, [hlSpot, hlPerp, hlTotals])

  const hyperliquidWalletAvailableUsd = useMemo(() => {
    const candidates = [
      hlPerp?.withdrawable,
      hlTotals?.availableUsd,
      hlSpot?.availableUsd
    ]
    for (const raw of candidates) {
      const numeric = typeof raw === 'string' ? Number(raw) : raw
      if (Number.isFinite(numeric) && numeric >= 0) {
        return numeric
      }
    }
    return null
  }, [hlPerp?.withdrawable, hlTotals?.availableUsd, hlSpot?.availableUsd])

  const hyperliquidSelectedEntries = useMemo(() => {
    return selectedTokens.filter((entry) => {
      if (!entry) {
        return false
      }
      return !entry.toLowerCase().includes(':binance')
    })
  }, [selectedTokens])

  const selectedSymbols = useMemo(() => {
    return hyperliquidSelectedEntries.map(symbolWithSource => {
      const [symbol] = symbolWithSource.includes(':') 
        ? symbolWithSource.split(':') 
        : [symbolWithSource]
      return symbol
    })
  }, [hyperliquidSelectedEntries])

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
      
      return tokenData
    })
    
    return data
  }, [selectedTokens, getToken, tokens])

  const portfolioTokensData = useMemo(() => {
    return tokensData.filter((token) => token.source !== 'binance')
  }, [tokensData])

  const hyperliquidSymbols = useMemo(() => {
    return portfolioTokensData.map((token) => token.symbol)
  }, [portfolioTokensData])

  const {
    data: historicalReturns,
    loading: historicalLoading,
    error: historicalError,
    lastUpdated: historicalUpdatedAt
  } = useHyperliquidHistory(hyperliquidSymbols, {
    timeframes: [5, 10, 15, 20],
    enabled: portfolioTokensData.length > 0
  })

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

  const {
    capitalInitial,
    setCapitalInitial,
    weights,
    setWeight,
    resetWeights,
    results
  } = usePortfolioSimulation(1000, portfolioTokensData, selectedSymbols)

  const resolvedPortfolioBudgetUsd = useMemo(() => {
    const numericCapital = Number(capitalInitial)
    if (Number.isFinite(numericCapital) && numericCapital > 0) {
      return numericCapital
    }
    if (Number.isFinite(hyperliquidWalletAvailableUsd)) {
      return hyperliquidWalletAvailableUsd
    }
    return 0
  }, [capitalInitial, hyperliquidWalletAvailableUsd])

  const projectionCapital = useMemo(() => {
    const numericResolved = Number(resolvedPortfolioBudgetUsd)
    if (Number.isFinite(numericResolved) && numericResolved > 0) {
      return numericResolved
    }
    const numericInitial = Number(capitalInitial)
    if (Number.isFinite(numericInitial) && numericInitial > 0) {
      return numericInitial
    }
    return 1000
  }, [capitalInitial, resolvedPortfolioBudgetUsd])

  const canUsePortfolioAutoOrder = hasOrderableTokens && resolvedPortfolioBudgetUsd >= MIN_ORDER_NOTIONAL_USDC

  const heroBudgetLabel = formatNumericString(resolvedPortfolioBudgetUsd ?? 0, {
    maximumFractionDigits: 0,
    limitHighValues: true
  })
  const heroWalletLabel = Number.isFinite(hyperliquidWalletAvailableUsd)
    ? formatNumericString(hyperliquidWalletAvailableUsd, {
      maximumFractionDigits: 0,
      limitHighValues: true
    })
    : '—'
  const heroLastSyncLabel = hlUpdatedAt ? formatTimestamp(hlUpdatedAt) : '—'
  const totalWeightPercent = useMemo(() => {
    if (!weights) {
      return 0
    }
    return Object.values(weights).reduce((sum, value) => sum + (Number(value) || 0), 0)
  }, [weights])
  const totalWeightDisplay = useMemo(() => {
    return `${formatNumericString(totalWeightPercent * 100, {
      maximumFractionDigits: 1,
      limitHighValues: true
    })}%`
  }, [totalWeightPercent])
  const isAllocationBalanced = Math.abs(totalWeightPercent - 1) < 0.001

  useEffect(() => {
    if (budgetMode !== BUDGET_MODES.CUSTOM) {
      return
    }
    if (manualBudgetEditingRef.current) {
      return
    }
    if (!Number.isFinite(capitalInitial)) {
      setManualBudgetInput('')
      return
    }
    setManualBudgetInput(trimTrailingZeros(capitalInitial))
  }, [budgetMode, capitalInitial])

  const handleBudgetModeChange = (mode) => {
    if (mode === budgetMode) {
      return
    }
    setBudgetMode(mode)
    manualBudgetEditingRef.current = false
    if (mode === BUDGET_MODES.CUSTOM) {
      if (Number.isFinite(capitalInitial)) {
        setManualBudgetInput(trimTrailingZeros(capitalInitial))
      } else {
        setManualBudgetInput('')
      }
      if (manualBudgetSaveTimerRef.current) {
        clearTimeout(manualBudgetSaveTimerRef.current)
        manualBudgetSaveTimerRef.current = null
      }
    } else if (manualBudgetSaveTimerRef.current) {
      clearTimeout(manualBudgetSaveTimerRef.current)
      manualBudgetSaveTimerRef.current = null
    }
  }

  const handleWalletRatioChange = (event) => {
    const percentValue = Number(event?.target?.value)
    if (!Number.isFinite(percentValue)) {
      return
    }
    const nextRatio = clampBudgetRatio(percentValue / 100)
    setWalletBudgetRatio(nextRatio)
  }

  const handleManualBudgetInputFocus = () => {
    manualBudgetEditingRef.current = true
  }

  const handleManualBudgetInputBlur = () => {
    manualBudgetEditingRef.current = false
    if (budgetMode !== BUDGET_MODES.CUSTOM) {
      return
    }
    if (!Number.isFinite(capitalInitial)) {
      setManualBudgetInput('')
      return
    }
    setManualBudgetInput(trimTrailingZeros(capitalInitial))
  }

  const handleManualBudgetInputChange = (event) => {
    if (budgetMode !== BUDGET_MODES.CUSTOM) {
      return
    }
    const rawValue = normalizeDecimalInput(event.target.value)
    if (!isValidDecimalInput(rawValue)) {
      return
    }
    setManualBudgetInput(rawValue)
    const canonical = toCanonicalDecimalString(rawValue)
    if (!canonical || canonical === '.' || canonical === ',' || canonical === '-') {
      return
    }
    const numericValue = Number(canonical)
    if (!Number.isFinite(numericValue)) {
      return
    }
    const roundedValue = Math.max(0, Math.round(numericValue * 100) / 100)
    setCapitalInitial(roundedValue)
    queueManualBudgetSave(roundedValue)
  }

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
  const lastSyncedCapitalRef = useRef(null)
  const priceNudgeIntervalRef = useRef(null)
  const binancePriceNudgeIntervalRef = useRef(null)
  const binanceRecentNotifiedRef = useRef(new Set())
  const manualBudgetEditingRef = useRef(false)
  const manualBudgetSaveTimerRef = useRef(null)

  const queueManualBudgetSave = useCallback((value) => {
    if (!user?.uid) {
      return
    }
    lastSyncedCapitalRef.current = value
    if (manualBudgetSaveTimerRef.current) {
      clearTimeout(manualBudgetSaveTimerRef.current)
    }
    manualBudgetSaveTimerRef.current = setTimeout(() => {
      saveInitialCapital(user.uid, value).catch((error) => {
        console.error('Erreur sauvegarde budget manuel:', error)
      })
    }, 500)
  }, [user?.uid])

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
      if (!isMounted) return
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
      if (priceNudgeIntervalRef.current) {
        clearInterval(priceNudgeIntervalRef.current)
        priceNudgeIntervalRef.current = null
      }
      if (binancePriceNudgeIntervalRef.current) {
        clearInterval(binancePriceNudgeIntervalRef.current)
        binancePriceNudgeIntervalRef.current = null
      }
      if (manualBudgetSaveTimerRef.current) {
        clearTimeout(manualBudgetSaveTimerRef.current)
        manualBudgetSaveTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!Number.isFinite(hyperliquidWalletAvailableUsd)) {
      return
    }
    if (budgetMode !== BUDGET_MODES.WALLET) {
      return
    }
    const safeRatio = clampBudgetRatio(walletBudgetRatio)
    const normalized = Math.max(0, Math.round(hyperliquidWalletAvailableUsd * safeRatio * 100) / 100)
    setCapitalInitial((prev) => {
      if (Math.abs((prev ?? 0) - normalized) < 0.01) {
        return prev
      }
      return normalized
    })

    if (!user?.uid) {
      return
    }

    if (lastSyncedCapitalRef.current === normalized) {
      return
    }

    lastSyncedCapitalRef.current = normalized
    saveInitialCapital(user.uid, normalized).catch((error) => {
      console.error('Erreur synchro capital Hyperliquid:', error)
    })
  }, [hyperliquidWalletAvailableUsd, user?.uid, setCapitalInitial, budgetMode, walletBudgetRatio])

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
            side: 'buy',
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
            side: 'buy',
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
          side: 'buy',
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
          side: 'buy',
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


  const extractOrderIdFromStatus = (status, index) => {
    void index
    if (!status || typeof status !== 'object') {
      return null
    }
    const candidates = [
      status.restingOrderId,
      status.resting_order_id,
      status.orderId,
      status.order_id,
      status.oid,
      status.id
    ]
    const picked = candidates.find((value) => value != null && value !== '')
    if (picked == null) {
      return null
    }
    return String(picked)
  }

  const notifyOrdersAwaitingFill = (response, orders) => {
    if (!orders?.length) {
      return
    }
    const statuses = Array.isArray(response?.result?.statuses)
      ? response.result.statuses
      : Array.isArray(response?.result?.data?.statuses)
        ? response.result.data.statuses
        : []

    const timestamp = Date.now()
    const pendingPayloads = []

    orders.forEach((order, index) => {
      const status = statuses[index]
      const id = extractOrderIdFromStatus(status, index) || `${order.symbol}-${timestamp}-${index}`
      const normalizedStatus = typeof status?.status === 'string'
        ? status.status.toLowerCase()
        : typeof status?.statusType === 'string'
          ? status.statusType.toLowerCase()
          : ''
      const payload = {
        id,
        symbol: order.symbol,
        side: 'buy'
      }
      if (normalizedStatus === 'filled' || normalizedStatus === 'done' || normalizedStatus === 'complete') {
        notifyOrderExecuted(payload)
      } else {
        pendingPayloads.push(payload)
      }
    })

    if (pendingPayloads.length === 0) {
      return
    }

    const uniqueSymbols = Array.from(
      new Set(pendingPayloads.map((entry) => (entry.symbol || '').trim()).filter(Boolean))
    )
    const readableList = uniqueSymbols.length > 0 ? uniqueSymbols.join(' + ') : 'Tes achats'
    const summaryText = uniqueSymbols.length
      ? uniqueSymbols.length === 1
        ? `Tu viens d'envoyer un achat ${uniqueSymbols[0]} au carnet Hyperliquid.`
        : `Tu viens d'envoyer ${uniqueSymbols.length} achats : ${readableList}.`
      : "Tu viens d'envoyer de nouveaux achats sur Hyperliquid."

    notifyOrderInOrderBook({
      id: `batch-${timestamp}`,
      symbol: readableList,
      side: 'buy',
      summaryText: `${summaryText} On te préviendra dès exécution.`,
      symbols: uniqueSymbols
    })
  }

  const notifyBinanceClosedPositions = (entries) => {
    if (!Array.isArray(entries) || entries.length === 0) {
      return
    }
    const timestamp = Date.now()
    entries.forEach((entry, index) => {
      if (!entry || entry.status !== 'closed') {
        return
      }
      const orderResponse = entry.orderResponse || {}
      const rawId = orderResponse.orderId
        ?? orderResponse.clientOrderId
        ?? orderResponse.origClientOrderId
        ?? entry.symbol
        ?? entry.asset
        ?? `${timestamp}-${index}`
      let side
      if (typeof orderResponse.side === 'string') {
        side = orderResponse.side.toLowerCase() === 'sell' ? 'sell' : 'buy'
      } else if (entry.quantity != null) {
        const numericQty = Number(entry.quantity)
        if (Number.isFinite(numericQty)) {
          side = numericQty < 0 ? 'sell' : 'buy'
        }
      }
      notifyOrderClosedByWatcher({
        id: String(rawId),
        symbol: entry.symbol || entry.asset || 'Binance',
        side
      })
    })
  }

  const buildPortfolioOrders = useCallback(() => {
    const issues = []
    const breakdown = []
    const plannedOrders = []

    if (!hasOrderableTokens) {
      issues.push('Ajoute des tokens Hyperliquid dans ton panier avant de lancer cet achat automatique.')
      return { plannedOrders, breakdown, issues, totalNotionalUsd: 0 }
    }

    const budgetUsd = Number(resolvedPortfolioBudgetUsd)
    if (!Number.isFinite(budgetUsd) || budgetUsd <= 0) {
      issues.push('Définis un budget Hyperliquid positif pour utiliser la répartition du portfolio.')
      return { plannedOrders, breakdown, issues, totalNotionalUsd: 0 }
    }

    const symbolsWithWeight = orderableSymbols
      .map((symbol) => ({ symbol, weight: Number(weights[symbol] ?? 0) }))
      .filter((entry) => entry.weight > 0)

    if (!symbolsWithWeight.length) {
      issues.push('La répartition actuelle attribue 0% aux tokens Hyperliquid.')
      return { plannedOrders, breakdown, issues, totalNotionalUsd: 0 }
    }

    let aggregatedUsd = 0

    symbolsWithWeight.forEach(({ symbol, weight }) => {
      const livePrice = tokenPriceMap?.[symbol]
      if (!Number.isFinite(livePrice) || livePrice <= 0) {
        issues.push(`Prix marché indisponible pour ${symbol}.`)
        return
      }

      const targetNotional = budgetUsd * weight
      if (targetNotional < MIN_ORDER_NOTIONAL_USDC) {
        issues.push(`Allocation ${symbol} trop faible (${formatNumericString(targetNotional, { maximumFractionDigits: 2, limitHighValues: true })} < ${MIN_ORDER_NOTIONAL_USDC} USDC).`)
        return
      }

      const autoPrice = computeAutoLimitPrice(symbol) || quantizePrice(symbol, livePrice) || String(livePrice)
      const priceValue = parseDecimalValue(autoPrice)
      if (!Number.isFinite(priceValue) || priceValue <= 0) {
        issues.push(`Prix limite invalide pour ${symbol}.`)
        return
      }

      const rawSize = targetNotional / priceValue
      const normalizedSize = quantizeSize(symbol, rawSize, 'round')
      if (!normalizedSize) {
        issues.push(`Impossible de calculer la taille pour ${symbol}.`)
        return
      }

      const finalSize = applyMinSizeUnits(symbol, normalizedSize)
      plannedOrders.push({
        symbol,
        side: 'buy',
        size: finalSize,
        price: autoPrice
      })

      breakdown.push({
        symbol,
        weight,
        notionalUsd: targetNotional,
        size: finalSize,
        price: priceValue
      })

      aggregatedUsd += targetNotional
    })

    return { plannedOrders, breakdown, issues, totalNotionalUsd: aggregatedUsd }
  }, [
    hasOrderableTokens,
    resolvedPortfolioBudgetUsd,
    orderableSymbols,
    weights,
    tokenPriceMap,
    computeAutoLimitPrice
  ])

  const submitHyperliquidOrders = useCallback(async (orders, context = {}) => {
    const sanitizedOrders = Array.isArray(orders)
      ? orders.filter((order) => order?.symbol && order?.size && order?.price)
      : []

    if (!sanitizedOrders.length) {
      setOrderStatus({
        state: 'error',
        message: context.emptyMessage || 'Ajoute au moins un ordre valide (token, taille, prix)',
        payload: null
      })
      return { ok: false }
    }

    const totalNotionalUsd = sanitizedOrders.reduce((sum, order) => {
      const size = Number(order.size)
      const price = Number(order.price)
      if (!Number.isFinite(size) || !Number.isFinite(price)) {
        return sum
      }
      return sum + size * price
    }, 0)

    const availableUsd = Number(hyperliquidWalletAvailableUsd)
    if (Number.isFinite(availableUsd) && totalNotionalUsd > availableUsd + 0.01) {
      const formattedTotal = `${formatNumericString(totalNotionalUsd, {
        maximumFractionDigits: 2,
        limitHighValues: true
      })} USDC`
      const formattedAvailable = `${formatNumericString(availableUsd, {
        maximumFractionDigits: 2,
        limitHighValues: true
      })} USDC`
      setOrderStatus({
        state: 'error',
        message:
          context.overBudgetMessage ||
          `Montant cumulé (${formattedTotal}) supérieur au disponible Hyperliquid (${formattedAvailable}). Réduis la taille ou attends de libérer du capital.`,
        payload: null
      })
      return { ok: false }
    }

    setOrderStatus({
      state: 'loading',
      message: context.loadingMessage || 'Envoi des ordres Hyperliquid…',
      payload: null
    })

    try {
      const response = await placeHyperliquidTestOrder({ orders: sanitizedOrders })
      setOrderStatus({
        state: 'success',
        message: context.successMessage || `${sanitizedOrders.length} ordre(s) envoyés ✅`,
        payload: response
      })
      notifyOrdersAwaitingFill(response, sanitizedOrders)
      return { ok: true, response }
    } catch (error) {
      const rawMessage = error?.message || 'Erreur inconnue lors de l’envoi vers Hyperliquid'
      const normalized = rawMessage.toLowerCase()
      const needsPerpHint = normalized.includes('insufficient margin')
      const friendlyMessage = needsPerpHint
        ? `${rawMessage} • Hyperliquid vérifie uniquement le solde "Withdrawable" du compte perp. Déplace des USDC depuis Spot ou réduis le budget engagé.`
        : rawMessage
      setOrderStatus({ state: 'error', message: friendlyMessage, payload: null })
      return { ok: false, error }
    }
  }, [hyperliquidWalletAvailableUsd, notifyOrdersAwaitingFill])

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
          side: 'buy',
          size: effectiveSize,
          price: effectivePrice
        }
      })
      .filter((order) => order.symbol && order.size && order.price)

    await submitHyperliquidOrders(sanitizedOrders)
  }

  const handlePortfolioAutoOrder = async () => {
    const { plannedOrders, breakdown, issues } = buildPortfolioOrders()

    if (issues.length) {
      setOrderStatus({
        state: 'error',
        message: issues.join(' • '),
        payload: null
      })
      return
    }

    if (!plannedOrders.length) {
      setOrderStatus({
        state: 'error',
        message: 'Impossible de générer des ordres à partir de la répartition actuelle.',
        payload: null
      })
      return
    }

    const breakdownSummary = breakdown.length
      ? breakdown
          .map((entry) => {
            const pct = (entry.weight * 100).toFixed(1)
            const notionalDisplay = formatNumericString(entry.notionalUsd, {
              maximumFractionDigits: 2,
              limitHighValues: true
            })
            return `${entry.symbol} ${pct}% (${notionalDisplay} USDC)`
          })
          .join(' • ')
      : `${plannedOrders.length} ordre(s)`

    await submitHyperliquidOrders(plannedOrders, {
      loadingMessage: 'Préparation du panier via la répartition…',
      successMessage: `Panier envoyé ✅ ${breakdownSummary}`
    })
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

      notifyBinanceClosedPositions(response?.closedPositions)

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

      notifyBinanceClosedPositions(response?.closedPositions)

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
            side: 'BUY',
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
            side: 'buy',
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

  const binanceOrderStatusColor = statusColorMap[binanceOrderStatus.state]
  const binanceLargeOrderStatusColor = statusColorMap[binanceLargeOrderStatus.state]
  const binanceFetchStatusColor = statusColorMap[binanceFetchStatus.state]
  const binanceCancelStatusColor = statusColorMap[binanceCancelStatus.state]
  const binanceDustStatusColor = statusColorMap[binanceDustStatus.state]
  const binanceBatchStatusColor = statusColorMap[binanceBatchStatus.state]
  const openOrdersList = openOrdersStatus.payload?.openOrders ?? []
  const openPositionsList = openOrdersStatus.payload?.openPositions ?? []
  const binanceOpenOrdersList = useMemo(
    () => (Array.isArray(binanceOpenOrders) ? binanceOpenOrders : []),
    [binanceOpenOrders]
  )
  const binanceRecentOrdersList = useMemo(
    () => (Array.isArray(binanceRecentOrders) ? binanceRecentOrders : []),
    [binanceRecentOrders]
  )
  useEffect(() => {
    if (!binanceRecentOrdersList.length) {
      return
    }
    const seen = binanceRecentNotifiedRef.current
    let mutated = false
    binanceRecentOrdersList.forEach((order) => {
      const rawId = order?.orderId
        ?? order?.clientOrderId
        ?? order?.origClientOrderId
        ?? order?.updateTime
        ?? order?.time
      if (rawId == null) {
        return
      }
      const id = String(rawId)
      if (seen.has(id)) {
        return
      }
      const status = typeof order?.status === 'string' ? order.status.toUpperCase() : ''
      if (!status) {
        return
      }
      const side = typeof order?.side === 'string' && order.side.toLowerCase() === 'sell' ? 'sell' : 'buy'
      const symbol = order?.symbol || 'Binance'
      if (status === 'FILLED') {
        notifyOrderExecuted({ id, symbol, side })
        seen.add(id)
        mutated = true
      } else if (status === 'CANCELED' || status === 'EXPIRED') {
        notifyOrderClosedByWatcher({ id, symbol, side })
        seen.add(id)
        mutated = true
      }
    })
    if (mutated && seen.size > 120) {
      const trimmed = Array.from(seen).slice(-80)
      binanceRecentNotifiedRef.current = new Set(trimmed)
    }
  }, [binanceRecentOrdersList, notifyOrderClosedByWatcher, notifyOrderExecuted])
  const binanceFiltersCacheRef = useRef({})

  const renderHyperliquidAccountSummary = () => {
    const isLoading = hlStatus === 'loading'
    const isRefreshing = hlStatus === 'refreshing'
    const isError = hlStatus === 'error'
    const isIdle = hlStatus === 'idle'
    const showConnectCallout = !hlHasWallet
    const hasMetrics = !showConnectCallout && Boolean(hyperliquidSummary)

    const formatUsdc = (value, digits = 2) => {
      return `${formatNumericString(value ?? 0, {
        maximumFractionDigits: digits,
        preserveTinyValues: true,
        limitHighValues: true
      })} USDC`
    }

    const normalize = (value) => {
      if (value == null) return null
      const numeric = typeof value === 'string' ? Number(value) : value
      return Number.isFinite(numeric) ? numeric : null
    }

    const maTirelireValue = (() => {
      const withdrawable = normalize(hyperliquidSummary?.perpWithdrawable)
      if (withdrawable != null) {
        return withdrawable
      }
      const perpValue = normalize(hyperliquidSummary?.perpAccountValue)
      if (perpValue != null) {
        return perpValue
      }
      return 0
    })()

    const statusLabel = showConnectCallout
      ? 'Wallet requis'
      : isRefreshing
        ? 'Actualisation…'
        : isLoading || (isIdle && hlHasWallet)
          ? 'Connexion…'
          : isError
            ? 'Erreur'
            : 'À jour'

    const statusColor = (() => {
      if (isError) return '#f87171'
      if (isRefreshing) return '#facc15'
      if (isLoading || isIdle) return '#60a5fa'
      return '#34d399'
    })()

    const statusStyle = {
      color: statusColor,
      borderColor: `${statusColor}55`,
      backgroundColor: `${statusColor}0f`
    }

    return (
      <section className="k-card k-card--accent">
        <div className="k-card__head">
          <div>
            <p className="k-tag">Hyperliquid</p>
            <h3 className="k-card__title">Solde perp</h3>
          </div>
          <span className="k-status" style={statusStyle}>
            {statusLabel}
          </span>
        </div>

        {showConnectCallout ? (
          <div className="k-empty">
            Connecte ton wallet Hyperliquid pour afficher la tirelire.
          </div>
        ) : (
          hasMetrics && (
            <>
              <div className="k-metrics">
                <div className="k-metric">
                  <span>Withdrawable</span>
                  <strong>{formatUsdc(maTirelireValue, 2)}</strong>
                </div>
                <div className="k-metric">
                  <span>Spot libre</span>
                  <strong>{formatUsdc(hyperliquidSummary?.spotAvailable ?? 0, 0)}</strong>
                </div>
                <div className="k-metric">
                  <span>Total compte</span>
                  <strong>{formatUsdc(hyperliquidSummary?.globalTotal ?? 0, 0)}</strong>
                </div>
              </div>

              {hlError && (
                <div className="k-alert k-alert--danger">{hlError}</div>
              )}

              <div className="k-card__footer">
                <span className="k-note">MAJ {hlUpdatedAt ? formatTimestamp(hlUpdatedAt) : '—'}</span>
                <span className={`k-inline-pill ${hlHasWallet ? 'green' : 'red'}`}>
                  {hlHasWallet ? 'Wallet connecté' : 'Wallet requis'}
                </span>
              </div>
            </>
          )
        )}
      </section>
    )
  }

  const renderBudgetControls = () => {
    const ratioPercent = Math.round(clampBudgetRatio(walletBudgetRatio) * 100)
    const walletAvailableNumeric = Number(hyperliquidWalletAvailableUsd)
    const walletDataReady = Number.isFinite(walletAvailableNumeric)
    const engagedBudgetValue = Number.isFinite(capitalInitial)
      ? capitalInitial
      : resolvedPortfolioBudgetUsd
    const engagedBudgetLabel = `${formatNumericString(engagedBudgetValue ?? 0, {
      maximumFractionDigits: 2,
      limitHighValues: true
    })} USDC`
    const walletAvailableLabel = walletDataReady
      ? `${formatNumericString(walletAvailableNumeric, {
        maximumFractionDigits: 2,
        limitHighValues: true
      })} USDC`
      : 'Indisponible'
    const engagedFromWallet = walletDataReady
      ? `${formatNumericString(walletAvailableNumeric * clampBudgetRatio(walletBudgetRatio), {
        maximumFractionDigits: 2,
        limitHighValues: true
      })} USDC`
      : '—'

    return (
      <section className="k-card k-card--ghost">
        <div className="k-card__head">
          <div>
            <p className="k-tag">Budget</p>
            <h3 className="k-card__title">Allocation automatique</h3>
          </div>
          <div className="k-pill-group">
            {[{
              id: BUDGET_MODES.WALLET,
              label: 'Auto wallet'
            }, {
              id: BUDGET_MODES.CUSTOM,
              label: 'Montant fixe'
            }].map((option) => (
              <button
                key={option.id}
                type="button"
                className={`k-pill ${budgetMode === option.id ? 'is-active' : ''}`}
                onClick={() => handleBudgetModeChange(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {budgetMode === BUDGET_MODES.WALLET ? (
          <div className="k-section-gap">
            <div className="k-inline-group">
              <small className="k-inline-hint">Ratio</small>
              <strong>{ratioPercent}%</strong>
              {walletDataReady && (
                <span className="k-inline-pill">{engagedFromWallet}</span>
              )}
            </div>
            <input
              className="k-range"
              type="range"
              min={Math.round(AUTO_BUDGET_MIN_RATIO * 100)}
              max={100}
              step={5}
              value={ratioPercent}
              onChange={handleWalletRatioChange}
              disabled={!walletDataReady}
            />
            {!walletDataReady && (
              <p className="k-note k-note--error">Connecte ton wallet Hyperliquid pour activer le slider.</p>
            )}
          </div>
        ) : (
          <div className="k-form-grid">
            <div className="k-field">
              <label className="k-label" htmlFor="manual-budget-input">
                Budget engagé
              </label>
              <div className="k-inline-actions">
                <input
                  id="manual-budget-input"
                  className="k-input"
                  type="text"
                  value={manualBudgetInput}
                  onChange={handleManualBudgetInputChange}
                  onFocus={handleManualBudgetInputFocus}
                  onBlur={handleManualBudgetInputBlur}
                  inputMode="decimal"
                  placeholder="1500"
                />
                <span className="k-inline-pill">USDC</span>
              </div>
              <span className="k-field__hint">Sauvegarde auto dans Firebase</span>
            </div>
          </div>
        )}

        <div className="k-metrics">
          <div className="k-metric">
            <span>Budget engagé</span>
            <strong>{engagedBudgetLabel}</strong>
            <small className="k-field__hint">Utilisé par la répartition</small>
          </div>
          <div className="k-metric">
            <span>Wallet disponible</span>
            <strong>{walletAvailableLabel}</strong>
            <small className="k-field__hint">Refresh 25&nbsp;s</small>
          </div>
        </div>
      </section>
    )
  }

  const renderBinanceSpotControls = () => {
    const quickActions = [
      {
        label: 'Ordre market BUY',
        description: 'BTC/USDT · 20 USDT',
        action: handleBinancePresetOrder,
        status: binanceOrderStatus
      },
      {
        label: 'Ordre market 100 USDT',
        description: 'BTC/USDT · 100 USDT',
        action: handleBinanceLargePresetOrder,
        status: binanceLargeOrderStatus
      },
      {
        label: 'Lister les ordres',
        description: 'Lecture carnet testnet',
        action: handleFetchBinanceOpenOrders,
        status: binanceFetchStatus
      },
      {
        label: 'Cancel all + close',
        description: 'Nettoyage rapide',
        action: handleCancelAllBinanceOrders,
        status: binanceCancelStatus
      },
      {
        label: 'Fermer + convertir BNB',
        description: 'Dust + BNB convert',
        action: handleCloseAndDustBinancePositions,
        status: binanceDustStatus
      }
    ]

    const logEntries = [
      { label: 'Envoi ordre market', status: binanceOrderStatus },
      { label: 'Ordre market 100 USDT', status: binanceLargeOrderStatus },
      { label: 'Listing des ordres', status: binanceFetchStatus },
      { label: 'Fermeture / Cancel all', status: binanceCancelStatus },
      { label: 'Fermeture + BNB', status: binanceDustStatus },
      { label: 'Batch multi-ordres', status: binanceBatchStatus }
    ]

    return (
      <>
      {/* Contrôle Binance Spot */}
      <section className="k-card">
        <div className="k-card__head">
          <div>
            <p className="k-tag">Binance testnet</p>
            <h3 className="k-card__title">🧪 Pilotage Spot</h3>
            <p className="k-paragraph-light">
              Fonctions Firebase HMAC côté serveur pour piloter BTC/USDT et nettoyer le carnet.
            </p>
          </div>
        </div>
        <div className="k-inline-actions k-inline-actions--wrap">
          <span className="k-inline-pill blue">Preset BUY 20 USDT</span>
          <span className="k-inline-pill blue">Preset BUY 100 USDT</span>
          <span className="k-inline-pill">Cloud Function + Firebase</span>
        </div>
        <div className="k-compact-grid">
          <div className="k-compact-card">
            <h4>Accès API interne</h4>
            <p>Cloud Function Node 22 signée HMAC, flux Firebase pour suivre les statuts et préfixes :binance.</p>
          </div>
          {quickActions.map((item) => (
            <div key={item.label} className="k-compact-card">
              <h4>{item.label}</h4>
              <p>{item.description}</p>
              <button
                className="k-cta"
                style={{ width: '100%' }}
                onClick={item.action}
                disabled={item.status.state === 'loading'}
              >
                {item.status.state === 'loading' ? 'En cours…' : 'Exécuter'}
              </button>
              <p className="k-note">{item.status.message || 'Statut en attente.'}</p>
            </div>
          ))}
        </div>
      </section>

        <section className="k-card k-card--ghost">
          <div className="k-card__head">
            <div>
              <p className="k-tag">Binance spot</p>
              <h3 className="k-card__title">🧰 Batch multi-ordres limit</h3>
              <p className="k-paragraph-light">
                Compose jusqu’à 10 ordres limit, auto-calcul en notional et envoi séquentiel sécurisé côté Firebase.
              </p>
            </div>
            <div className="k-stack">
              <span className="k-inline-pill blue">Jusqu’à {BINANCE_MAX_ORDER_FORMS} ordres</span>
              <button
                className="k-cta"
                onClick={handleBinanceGridOrders}
                disabled={binanceBatchStatus.state === 'loading' || !hasBinanceOrderableTokens}
              >
                {binanceBatchStatus.state === 'loading'
                  ? 'Envoi des ordres…'
                  : hasBinanceOrderableTokens
                    ? `Placer ${binanceOrderForms.length} ordre(s)`
                    : 'Sélectionne un token'}
              </button>
            </div>
          </div>

          <div className="k-grid-split">
            <div className="k-stack">
              <h4 className="k-section-title">Tokens actifs ({binanceOrderForms.length})</h4>
              <p className="k-paragraph-light">
                Sélectionne tes tokens <strong>:binance</strong>, règle taille et prix (achat uniquement) puis déclenche un lot GTC d’un seul clic.
              </p>
              {!hasBinanceOrderableTokens && (
                <p className="k-note k-note--error">
                  Ajoute un token « :binance » via l’Épicerie fine pour activer ce module.
                </p>
              )}
            </div>
            <div className="k-mini-card">
              <span>Flux Firebase</span>
              <strong>Notional auto • USDT</strong>
              <p className="k-note">Prix live + recalcul instantané</p>
            </div>
          </div>

          {!hasBinanceOrderableTokens && (
            <div className="k-alert k-alert--danger">
              🧺 Ajoute un token Binance depuis l’Épicerie pour pouvoir composer ici.
            </div>
          )}

          <div className="k-order-list">

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
                <div key={`binance-order-${index}`} className="k-order-card">
                  <div className="k-order-card__head">
                    <div>
                      <p className="k-section-title">Ordre #{index + 1}</p>
                      <p className="k-token-tag">
                        {safeSymbol ? `${safeSymbol} → ${pairSymbol}` : 'Choisis un token Binance'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="k-ghost"
                      onClick={() => removeBinanceOrderForm(index)}
                      disabled={binanceOrderForms.length === 1}
                    >
                      Retirer
                    </button>
                  </div>

                  <div className="k-form-grid">
                    <div className="k-field">
                      <label className="k-label">Token</label>
                      <select
                        className="k-select"
                        value={safeSymbol}
                        onChange={(e) => updateBinanceOrderField(index, 'symbol', e.target.value)}
                        disabled={!hasBinanceOrderableTokens}
                      >
                        <option value="">Sélectionner</option>
                        {selectOptions.map((symbol) => (
                          <option key={`${symbol}-${index}`} value={symbol}>
                            {symbol} • {getTokenConfig(symbol)?.name || symbol}
                          </option>
                        ))}
                      </select>
                      <span className="k-field__hint">
                        {safeSymbol ? `Pair ${pairSymbol}` : 'Choisis un token :binance'}
                      </span>
                    </div>

                    <div className="k-field">
                      <label className="k-label">Mode</label>
                      <div className="k-pocket-card">
                        <strong>Spot Binance</strong>
                        <span>Achat uniquement</span>
                      </div>
                      <span className="k-field__hint">Le bouton Vendre est désactivé.</span>
                    </div>

                    <div className="k-field">
                      <label className="k-label">Taille (token)</label>
                      <input
                        className="k-input"
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={order.size}
                        onChange={(e) => updateBinanceOrderField(index, 'size', e.target.value)}
                        onBlur={() => finalizeBinanceManualSize(index)}
                        placeholder={DEFAULT_ORDER_SIZE}
                      />
                      <span className="k-field__hint">
                        {order.autoSize && safeSymbol
                          ? `Auto ≈ ${BINANCE_TARGET_NOTIONAL_USDT} USDT`
                          : 'Exprimé en unités de base'}
                      </span>
                    </div>

                    <div className="k-field">
                      <label className="k-label">Prix limite (USDT)</label>
                      <div className="k-price-row">
                        <div className="k-price-row__input">
                          <input
                            className="k-input"
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[.,]?[0-9]*"
                            value={displayedPrice}
                            onChange={(e) => updateBinanceOrderField(index, 'price', e.target.value)}
                            onBlur={() => finalizeBinanceManualPrice(index)}
                            placeholder="Prix marché"
                          />
                        </div>
                        <div className="k-price-row__nudge">
                          <button
                            type="button"
                            className="k-nudge"
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
                            disabled={!safeSymbol}
                            aria-label="Augmenter le prix"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="k-nudge"
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
                            disabled={!safeSymbol}
                            aria-label="Réduire le prix"
                          >
                            −
                          </button>
                        </div>
                      </div>
                      <span className="k-field__hint">
                        {safeSymbol
                          ? livePriceDisplay
                            ? (
                                <>
                                  Prix marché :{' '}
                                  <button type="button" className="k-subtle-button" onClick={() => applyBinanceLivePrice(index)}>
                                    {livePriceDisplay}
                                  </button>
                                </>
                              )
                            : 'Prix Binance live (chargement…)'
                          : 'Choisis un token pour voir le marché'}
                      </span>
                    </div>

                    <div className="k-field">
                      <label className="k-label">Notional (USDT)</label>
                      <input
                        className="k-input"
                        type="text"
                        value={notionalDisplay}
                        readOnly
                        placeholder="—"
                        style={{ opacity: notionalUsd != null ? 1 : 0.5 }}
                      />
                      <span className="k-field__hint">Calcul: taille × prix limite</span>
                    </div>

                    <div className="k-field">
                      <label className="k-label">Time in Force</label>
                      <select
                        className="k-select"
                        value={(order.timeInForce || BINANCE_DEFAULT_TIME_IN_FORCE).toUpperCase()}
                        onChange={(e) => updateBinanceOrderField(index, 'timeInForce', e.target.value)}
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

            <div className="k-inline-actions k-inline-actions--wrap">
              <button
                type="button"
                onClick={addBinanceOrderForm}
                disabled={!hasBinanceOrderableTokens || binanceOrderForms.length >= BINANCE_MAX_ORDER_FORMS}
              >
                + Ajouter un ordre
              </button>
              <button
                type="button"
                onClick={resetBinanceOrderForms}
                disabled={!hasBinanceOrderableTokens}
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {binanceBatchStatus.state !== 'idle' && (
            <div className="k-log-card" style={{ marginTop: '16px' }}>
              <p className="k-panel-title" style={{ color: binanceBatchStatusColor }}>
                {binanceBatchStatus.message}
              </p>
              {binanceBatchStatus.payload && (
                <pre>{formatJsonPayload(binanceBatchStatus.payload)}</pre>
              )}
            </div>
          )}
        <div className="k-section k-section--tight k-section--spaced">
          <div className="k-status-grid">
            {[
              { label: 'Dernier envoi', status: binanceOrderStatus, color: binanceOrderStatusColor },
              { label: 'Ordre 100 USDT', status: binanceLargeOrderStatus, color: binanceLargeOrderStatusColor },
              { label: 'Lecture du carnet', status: binanceFetchStatus, color: binanceFetchStatusColor },
              { label: 'Cancel all', status: binanceCancelStatus, color: binanceCancelStatusColor },
              { label: 'Fermer + BNB', status: binanceDustStatus, color: binanceDustStatusColor },
              { label: 'Batch multi-ordres', status: binanceBatchStatus, color: binanceBatchStatusColor }
            ].map((item) => (
              <div key={item.label} className="k-status-card">
                <div className="k-status-card__label">
                  <span className="k-status-dot" style={{ background: item.color }}></span>
                  <p>{item.label}</p>
                </div>
                <strong>{item.status.message || 'En attente de commande.'}</strong>
              </div>
            ))}
          </div>

          <div className="k-section">
            <div className="k-section__actions">
              <div>
                <p className="k-panel-title">Réponses API Binance (brut)</p>
                <p className="k-panel-text">Analyse les payloads Firebase uniquement quand tu en as besoin.</p>
              </div>
              <button className="k-toggle-logs" onClick={() => setShowBinanceLogs((prev) => !prev)}>
                {showBinanceLogs ? 'Masquer les logs' : 'Afficher les logs'}
              </button>
            </div>

            {showBinanceLogs && (
              <div className="k-log-grid">
                {logEntries.map((item) => (
                  <div key={item.label} className="k-log-card">
                    <div>
                      <p className="k-panel-title">{item.label}</p>
                      <p className="k-context-line">{item.status.message || 'Aucune requête envoyée.'}</p>
                    </div>
                    <pre>{formatJsonPayload(item.status.payload)}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        </section>

        <section className="k-card k-card--ghost">
          <div className="k-card__head">
            <div>
              <p className="k-tag">Binance</p>
              <h3 className="k-card__title">Ordres ouverts</h3>
              <p className="k-paragraph-light">
                {binanceFetchStatus.message || 'Clique sur “Lister” pour rafraîchir.'}
              </p>
            </div>
            <span className="k-inline-pill blue">{binanceOpenOrdersList.length} ordre(s)</span>
          </div>

          {binanceOpenOrdersList.length > 0 ? (
            <div className="k-order-list">
              {binanceOpenOrdersList.map((order) => {
                const sideColor = order?.side === 'SELL' ? 'red' : 'green'
                const orderKey = `${order?.symbol}-${order?.orderId || order?.clientOrderId || order?.time}`
                return (
                  <div key={orderKey} className="k-order-card">
                    <div className="k-order-card__head">
                      <div>
                        <p className="k-section-title">{order?.symbol || '—'}</p>
                        <p className="k-token-tag">{order?.type || '—'} • {order?.status || 'NOUVEAU'}</p>
                      </div>
                      <span className={`k-inline-pill ${sideColor}`}>{order?.side || '—'}</span>
                    </div>
                    <div className="k-mini-grid">
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
                        <div key={`${orderKey}-${field.label}`} className="k-mini-card">
                          <span>{field.label}</span>
                          <strong>{field.value}</strong>
                        </div>
                      ))}
                    </div>
                    <p className="k-note">Dernière MAJ : {formatTimestamp(order?.updateTime ?? order?.time ?? null)}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="k-empty">Aucun ordre ouvert sur ce testnet.</div>
          )}
        </section>

        <section className="k-card k-card--ghost">
          <div className="k-card__head">
            <div>
              <p className="k-tag">Historique Binance</p>
              <h3 className="k-card__title">
                Ordres récents ({binanceFetchStatus.payload?.historySymbol || BINANCE_PRESET_ORDER.symbol})
              </h3>
              <p className="k-paragraph-light">
                {binanceRecentOrdersList.length || 0} derniers ordres exécutés / clôturés.
              </p>
            </div>
            <span className="k-inline-pill">{binanceRecentOrdersList.length} entrée(s)</span>
          </div>

          {binanceRecentOrdersList.length > 0 ? (
            <div className="k-order-list">
              {binanceRecentOrdersList.map((order) => {
                const statusColor = order?.status === 'FILLED' ? 'green' : 'blue'
                const orderKey = `${order?.symbol}-${order?.orderId}-${order?.updateTime}`
                return (
                  <div key={orderKey} className="k-order-card">
                    <div className="k-order-card__head">
                      <div>
                        <p className="k-section-title">{order?.symbol || '—'}</p>
                        <p className="k-token-tag">{order?.type || '—'} • ID #{order?.orderId ?? '—'}</p>
                      </div>
                      <span className={`k-inline-pill ${statusColor}`}>{order?.status || '—'}</span>
                    </div>
                    <div className="k-mini-grid">
                      {[
                        { label: 'Côté', value: order?.side || '—' },
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
                        <div key={`${orderKey}-${field.label}`} className="k-mini-card">
                          <span>{field.label}</span>
                          <strong>{field.value}</strong>
                        </div>
                      ))}
                    </div>
                    <p className="k-note">MAJ : {formatTimestamp(order?.updateTime ?? order?.time ?? null)}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="k-empty">
              Aucun ordre exécuté trouvé pour cette paire récemment.
            </div>
          )}
        </section>
      </>
    )
  }

  return (
    <div className="kitchen-page">
      {/* Header */}
      <header className="kitchen-hero">
        <div>
          <p className="kitchen-eyebrow">Ma cuisine</p>
          <h1>
            Tableau de bord minimal <span role="img" aria-label="chef">👨🏼‍🍳</span>
          </h1>
          <p className="k-paragraph-light">Hyperliquid &amp; Binance en un seul espace.</p>
        </div>
        <div className="kitchen-hero__meta">
          <span className="kitchen-chip">Tokens {count}/4</span>
          <span className="kitchen-chip">Budget {heroBudgetLabel} USDC</span>
          <span className="kitchen-chip">Wallet {heroWalletLabel} USDC</span>
          <span className="kitchen-chip">MAJ {heroLastSyncLabel}</span>
        </div>
      </header>

      {renderHyperliquidAccountSummary()}
  {renderBudgetControls()}

      {/* Contrôle Binance Spot – rendu via renderBinanceSpotControls() en bas de page */}

      <section className="k-card">
        <div className="k-card__head">
          <div>
            <p className="k-tag">Hyperliquid</p>
            <h3 className="k-card__title">Batch ordres limite</h3>
            <p className="k-paragraph-light">Compose jusqu’à 10 ordres simples, prêts pour le carnet.</p>
          </div>
          <div className="k-card__actions">
            <button
              className="k-cta"
              onClick={handlePortfolioAutoOrder}
              disabled={orderStatus.state === 'loading' || !canUsePortfolioAutoOrder}
              title={canUsePortfolioAutoOrder ? 'Répartition automatique' : 'Ajoute un budget ≥ 15 USDC par token'}
            >
              {orderStatus.state === 'loading' ? 'Préparation…' : 'Auto-répartition'}
            </button>
            <button
              className="k-ghost"
              onClick={sendTestOrder}
              disabled={orderStatus.state === 'loading' || !hasOrderableTokens}
            >
              {orderStatus.state === 'loading'
                ? 'Envoi…'
                : hasOrderableTokens
                  ? `Envoyer ${orderForms.length}`
                  : 'Ajoute des tokens'}
            </button>
          </div>
        </div>

        <div className="k-inline-actions k-inline-actions--wrap">
          <span className="k-inline-pill">{orderableSymbols.length} token(s)</span>
          <span className="k-inline-pill">Budget {formatNumericString(resolvedPortfolioBudgetUsd, { maximumFractionDigits: 0, limitHighValues: true })} USDC</span>
        </div>

        {!hasOrderableTokens ? (
          <div className="k-empty">Ajoute des tokens depuis l’Épicerie fine pour activer cette section.</div>
        ) : (
          <div className="k-order-list">
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
                <div key={`order-form-${index}`} className="k-order-card">
                  <div className="k-order-card__head">
                    <div>
                      <p className="k-section-title">Ordre #{index + 1}</p>
                      <p className="k-token-tag">{tokenConfig ? tokenConfig.name : 'Sélectionne un token'}</p>
                    </div>
                    <button
                      className="k-ghost"
                      onClick={() => removeOrderForm(index)}
                      disabled={orderForms.length === 1}
                    >
                      Retirer
                    </button>
                  </div>

                  <div className="k-form-grid">
                    <div className="k-field">
                      <label className="k-label">Token</label>
                      <select
                        className="k-select"
                        value={safeSymbol}
                        onChange={(e) => updateOrderField(index, 'symbol', e.target.value)}
                        disabled={!hasOrderableTokens}
                      >
                        <option value="">Sélectionner</option>
                        {selectOptions.map((symbol) => (
                          <option key={`${symbol}-${index}`} value={symbol}>
                            {symbol} • {getTokenConfig(symbol)?.name || 'Hyperliquid'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="k-field">
                      <label className="k-label">Taille</label>
                      <input
                        className="k-input"
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={order.size}
                        onChange={(e) => updateOrderField(index, 'size', e.target.value)}
                        onBlur={() => finalizeManualSize(index)}
                        placeholder={DEFAULT_ORDER_SIZE}
                      />
                      <span className="k-field__hint">
                        {order.autoSize && safeSymbol
                          ? `Auto ≈ ${MIN_ORDER_NOTIONAL_USDC} USDC`
                          : 'Unités du token'}
                      </span>
                    </div>
                    <div className="k-field">
                      <label className="k-label">Prix limite</label>
                      <div className="k-inline-actions">
                        <input
                          className="k-input"
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]*"
                          value={displayedPrice}
                          onChange={(e) => updateOrderField(index, 'price', e.target.value)}
                          onBlur={() => finalizeManualPrice(index)}
                          placeholder="0,00"
                        />
                        <div className="k-inline-actions">
                          <button
                            type="button"
                            className="k-nudge"
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
                            disabled={!safeSymbol}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="k-nudge"
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
                            disabled={!safeSymbol}
                          >
                            −
                          </button>
                        </div>
                      </div>
                      <span className="k-field__hint">
                        {safeSymbol && livePriceDisplay
                          ? (
                              <button type="button" className="k-subtle-button" onClick={() => applyLivePrice(index)}>
                                Revenir au marché ({livePriceDisplay})
                              </button>
                            )
                          : 'Prix marché en cours'}
                      </span>
                    </div>
                    <div className="k-field">
                      <label className="k-label">Valeur</label>
                      <input className="k-input" type="text" value={notionalDisplay} readOnly placeholder="—" />
                      <span className="k-field__hint">Taille × prix</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="k-card__actions">
          <button
            className="k-ghost"
            onClick={addOrderForm}
            disabled={!hasOrderableTokens || orderForms.length >= MAX_ORDER_FORMS}
          >
            + Ajouter un ordre
          </button>
          <button
            className="k-ghost"
            onClick={resetOrderForms}
            disabled={!hasOrderableTokens}
          >
            Réinitialiser
          </button>
        </div>

        {orderStatus.state !== 'idle' && (
          <div className={`k-alert ${orderStatus.state === 'error' ? 'k-alert--danger' : ''}`}>
            {orderStatus.message}
          </div>
        )}

        {orderStatus.payload && (
          <div className="k-log-card">
            <pre>{JSON.stringify(orderStatus.payload, null, 2)}</pre>
          </div>
        )}
      </section>

      {/* Liste des ordres ouverts Hyperliquid */}
      <section className="k-card k-card--ghost">
        <div className="k-card__head">
          <div>
            <p className="k-tag">Hyperliquid</p>
            <h3 className="k-card__title">Ordres & positions</h3>
            <p className="k-paragraph-light">Vue carnet + perp, rafraîchie à la demande.</p>
          </div>
          <button
            className="k-cta"
            onClick={loadOpenOrders}
            disabled={openOrdersStatus.state === 'loading'}
          >
            {openOrdersStatus.state === 'loading' ? 'Chargement…' : 'Rafraîchir'}
          </button>
        </div>

        {openOrdersStatus.state !== 'idle' && (
          <div className={`k-alert ${openOrdersStatus.state === 'error' ? 'k-alert--danger' : ''}`}>
            {openOrdersStatus.message}
          </div>
        )}

        <div className="k-grid-split">
          <div className="k-stack">
            <p className="k-section-title">Ordres en carnet</p>
            {openOrdersList.length > 0 ? (
              <div className="k-stack">
                {openOrdersList.map((order) => (
                  <div key={order.oid} className="k-order-card">
                    <div className="k-order-card__head">
                      <div>
                        <p className="k-section-title">{order.coin}</p>
                        <p className="k-token-tag">OID #{order.oid}</p>
                      </div>
                      <span className={`k-inline-pill ${order.side === 'buy' ? 'green' : 'red'}`}>
                        {order.side === 'buy' ? 'Long' : 'Short'}
                      </span>
                    </div>
                    <div className="k-mini-grid">
                      <div className="k-mini-card">
                        <span>Prix limite</span>
                        <strong>{formatNumericString(order.limitPx, { maximumFractionDigits: 4, preserveTinyValues: true, limitHighValues: true })} USDC</strong>
                      </div>
                      <div className="k-mini-card">
                        <span>Restant</span>
                        <strong>{formatNumericString(order.size, { maximumFractionDigits: 5, preserveTinyValues: true })}</strong>
                      </div>
                      <div className="k-mini-card">
                        <span>Initial</span>
                        <strong>{formatNumericString(order.origSz, { maximumFractionDigits: 5, preserveTinyValues: true })}</strong>
                      </div>
                      <div className="k-mini-card">
                        <span>Horodatage</span>
                        <strong>{formatTimestamp(order.timestamp)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="k-empty">Aucun ordre ouvert.</div>
            )}
          </div>

          <div className="k-stack">
            <p className="k-section-title">Positions actives</p>
            {openPositionsList.length > 0 ? (
              <div className="k-stack">
                {openPositionsList.map((position, index) => (
                  <div key={`${position.coin}-${position.entryTime || index}`} className="k-order-card">
                    <div className="k-order-card__head">
                      <div>
                        <p className="k-section-title">{position.coin}</p>
                        {position.entryTime && <p className="k-token-tag">Entrée {formatTimestamp(position.entryTime)}</p>}
                      </div>
                      <span className={`k-inline-pill ${position.side === 'long' ? 'green' : 'red'}`}>
                        {position.side === 'long' ? 'Long' : 'Short'}
                      </span>
                    </div>
                    <div className="k-mini-grid">
                      <div className="k-mini-card">
                        <span>Taille</span>
                        <strong>{formatNumericString(position.size, { maximumFractionDigits: 5, preserveTinyValues: true })}</strong>
                      </div>
                      <div className="k-mini-card">
                        <span>Entrée</span>
                        <strong>{formatNumericString(position.entryPx, { maximumFractionDigits: 4, preserveTinyValues: true, limitHighValues: true }) || '—'} USDC</strong>
                      </div>
                      <div className="k-mini-card">
                        <span>Mark</span>
                        <strong>{formatNumericString(position.markPx, { maximumFractionDigits: 4, preserveTinyValues: true, limitHighValues: true }) || '—'} USDC</strong>
                      </div>
                      <div className="k-mini-card">
                        <span>Liquidation</span>
                        <strong>{formatNumericString(position.liqPx, { maximumFractionDigits: 4, preserveTinyValues: true, limitHighValues: true }) || '—'} USDC</strong>
                      </div>
                      <div className="k-mini-card">
                        <span>Levier</span>
                        <strong>{position.leverage ? `${position.leverage}x` : '—'}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="k-empty">Aucune position ouverte.</div>
            )}
          </div>
        </div>
      </section>

      <section className="k-card k-card--ghost">
        <div className="k-card__head">
          <div>
            <p className="k-tag">Backtests</p>
            <h3 className="k-card__title">Résultats express</h3>
          </div>
        </div>
        <PortfolioResults results={results} />
      </section>

      <section className="k-card k-card--accent">
        <div className="k-card__head">
          <div>
            <p className="k-tag">Vision 5 / 10 / 15 / 20 jours</p>
            <h3 className="k-card__title">📈 Historique multi-jours Hyperliquid</h3>
            <p className="k-paragraph-light">
              Compare la trajectoire réelle de chaque token à ton portefeuille pondéré.
            </p>
          </div>
        </div>
        <div className="k-metrics">
          <div className="k-metric">
            <span>Budget simulé</span>
            <strong>
              {formatNumericString(projectionCapital, {
                maximumFractionDigits: 0,
                limitHighValues: true
              })} USDC
            </strong>
          </div>
          <div className="k-metric">
            <span>Tokens suivis</span>
            <strong>{selectedSymbols.length || 0}</strong>
          </div>
          <div className="k-metric">
            <span>Mise à jour</span>
            <strong>{historicalUpdatedAt ? formatTimestamp(historicalUpdatedAt) : '—'}</strong>
          </div>
        </div>
        {historicalLoading && <p className="k-note">⏳ Synchronisation Hyperliquid…</p>}
        {!historicalLoading && historicalError && (
          <p className="k-note k-note--error">{historicalError.message || 'Historique indisponible'}</p>
        )}
        <KitchenPerformanceChart
          tokensData={portfolioTokensData}
          weights={weights}
          capital={projectionCapital}
          historyData={historicalReturns}
        />
      </section>

      <section className="k-card">
        <div className="k-card__head">
          <div>
            <p className="k-tag">Répartition</p>
            <h3 className="k-card__title">🎚️ Poids du portfolio</h3>
          </div>
          <button className="k-ghost" onClick={resetWeights}>
            Réinitialiser
          </button>
        </div>

        {portfolioTokensData.length ? (
          <div className="k-stack">
            {portfolioTokensData.map((token) => (
              <TokenWeightRow
                key={token.symbol}
                symbol={token.symbol}
                source={token.source}
                weight={weights[token.symbol] || 0}
                onChange={(newWeight) => setWeight(token.symbol, newWeight)}
                color={token.color}
              />
            ))}
          </div>
        ) : (
          <div className="k-empty">Ajoute un token pour régler les sliders.</div>
        )}

        <div className="k-card__footer">
          <span>Total allocation</span>
          <span className={`k-inline-pill ${isAllocationBalanced ? 'green' : 'red'}`}>
            {totalWeightDisplay}
          </span>
        </div>
      </section>

      <section className="k-card k-card--ghost">
        <div className="k-card__head">
          <div>
            <p className="k-tag">Visuel</p>
            <h3 className="k-card__title">📊 Vue d’ensemble</h3>
            <p className="k-paragraph-light">La part de chaque token selon la pondération actuelle.</p>
          </div>
        </div>
        <PortfolioChart weights={weights} tokensData={portfolioTokensData} />
      </section>

      <section className="k-card k-card--ghost">
        <div className="k-card__head">
          <div>
            <p className="k-tag">Tokens suivis</p>
            <h3 className="k-card__title">🔖 Mes tokens ({count}/4)</h3>
          </div>
        </div>
        {selectedTokens.length === 0 ? (
          <div className="k-empty">
            {user
              ? 'Glisse des tokens depuis “Épicerie fine” pour les suivre ici.'
              : 'Connecte-toi pour commencer à cuisiner.'}
          </div>
        ) : (
          <div className="k-token-grid">
            {selectedTokens.map((symbolWithSource) => {
              const [symbol, source] = symbolWithSource.includes(':')
                ? symbolWithSource.split(':')
                : [symbolWithSource, 'hyperliquid']

              return (
                <div key={symbolWithSource} className="k-token-wrapper">
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
        )}
      </section>

      {renderBinanceSpotControls()}
    </div>
  )
}
