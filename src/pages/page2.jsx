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
import { useMarketData } from '../context/MarketDataContext'
import { getTokenConfig } from '../config/tokenList'
import { 
  placeHyperliquidTestOrder, 
  fetchHyperliquidOpenOrders,
  closeAllHyperliquidPositions
} from '../lib/hyperliquidOrders'
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
const PRICE_INPUT_STEP = '0.00000001'
const PRICE_INPUT_MIN = '0.00000001'
const PRICE_DISPLAY_FRACTION_DIGITS = 8
const SMALL_VALUE_MAX_DECIMALS = 8

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

const getPriceStepValue = (symbol) => {
  const constraint = getPriceConstraint(symbol)
  if (constraint?.tick) {
    return constraint.tick
  }
  const decimals = getPriceDecimals(symbol)
  if (!Number.isFinite(decimals) || decimals < 0) {
    return Number(PRICE_INPUT_STEP)
  }
  const step = 1 / (10 ** Math.min(decimals, PRICE_DISPLAY_FRACTION_DIGITS))
  return step > 0 ? step : Number(PRICE_INPUT_STEP)
}

const clampDecimalsForValue = (numericValue, decimals) => {
  if (!Number.isFinite(decimals)) {
    return 0
  }
  if (!Number.isFinite(numericValue)) {
    return Math.max(0, decimals)
  }
  if (Math.abs(numericValue) >= 1) {
    return Math.max(0, Math.min(decimals, 2))
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
    return numeric.toFixed(decimals)
  }
  const { tick, decimals = PRICE_DISPLAY_FRACTION_DIGITS } = constraint
  if (!tick || tick <= 0) {
    const adjustedDecimals = clampDecimalsForValue(numeric, decimals)
    return numeric.toFixed(adjustedDecimals)
  }
  const steps = Math.round(numeric / tick)
  const quantized = steps * tick
  const defaultDecimals = decimals ?? Math.max(0, (tick.toString().split('.')[1] || '').length)
  const decimalPlaces = clampDecimalsForValue(quantized, defaultDecimals)
  return quantized.toFixed(decimalPlaces)
}

function createBlankOrder(symbol = '') {
  return {
    symbol,
    side: 'buy',
    size: toDisplayDecimalString(DEFAULT_ORDER_SIZE),
    price: '',
    autoPrice: true,
    autoSize: true
  }
}

export default function Page2() {
  const [isMobile, setIsMobile] = useState(false)
  const [orderStatus, setOrderStatus] = useState({ state: 'idle', message: '', payload: null })
  const [openOrdersStatus, setOpenOrdersStatus] = useState({ state: 'idle', message: '', payload: null })
  const [closeAllStatus, setCloseAllStatus] = useState({ state: 'idle', message: '', payload: null })
  const [orderForms, setOrderForms] = useState(() => ([createBlankOrder()]))

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
  
  // Créer tokensData à partir des tokens sélectionnés via service
  const tokensData = useMemo(() => {
    // Pour chaque token, on doit récupérer ses données selon sa source
    const data = selectedTokens.map(symbolWithSource => {
      const [symbol, source] = symbolWithSource.includes(':')
        ? symbolWithSource.split(':')
        : [symbolWithSource, 'hyperliquid']
      
      // Récupérer données de marché depuis MarketDataContext
      // (qui contient maintenant Hyperliquid ET Binance)
      // Utiliser directement l'état 'tokens' pour que le useMemo réagisse
      const marketData = (tokens && tokens[symbol]) || getToken(symbol)
      
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
        marketDataSource: marketData?.source
      })
      
      return tokenData
    })
    
    return data
  }, [selectedTokens, getToken, tokens])

  const tokenPriceMap = useMemo(() => {
    return tokensData.reduce((acc, token) => {
      const numericPrice = Number(token.price)
      if (Number.isFinite(numericPrice)) {
        acc[token.symbol] = numericPrice
      }
      return acc
    }, {})
  }, [tokensData])

  const computeAutoLimitPrice = useCallback((symbol) => {
    if (!symbol) return ''
    const lastPrice = tokenPriceMap?.[symbol]
    if (!Number.isFinite(lastPrice) || lastPrice <= 0) {
      return ''
    }
    return quantizePrice(symbol, lastPrice)
  }, [tokenPriceMap])

  const computeAutoSize = useCallback((symbol) => {
    if (!symbol) return DEFAULT_ORDER_SIZE
    const lastPrice = tokenPriceMap?.[symbol]
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

  const visibleOrderForms = useMemo(() => {
    return orderForms.map((order) => {
      if (!order.symbol) {
        return order
      }
      return isSymbolAllowed(order.symbol) ? order : { ...order, symbol: '' }
    })
  }, [orderForms, isSymbolAllowed])

  
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
    }
  }, [])

  useEffect(() => {
    const handlePointerRelease = () => {
      if (priceNudgeIntervalRef.current) {
        clearInterval(priceNudgeIntervalRef.current)
        priceNudgeIntervalRef.current = null
      }
    }
    window.addEventListener('mouseup', handlePointerRelease)
    window.addEventListener('touchend', handlePointerRelease)
    window.addEventListener('touchcancel', handlePointerRelease)
    return () => {
      window.removeEventListener('mouseup', handlePointerRelease)
      window.removeEventListener('touchend', handlePointerRelease)
      window.removeEventListener('touchcancel', handlePointerRelease)
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
              autoPrice: true,
              size: DEFAULT_ORDER_SIZE,
              autoSize: true
            }
          }
          return {
            ...order,
            symbol: canonical,
            price: computeAutoLimitPrice(canonical) || '',
            autoPrice: true,
            size: toDisplayDecimalString(computeAutoSize(canonical)),
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
          const processedPrice = quantizePrice(order.symbol, value) || value
          return {
            ...order,
            price: processedPrice,
            autoPrice: false
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
      return [
        ...prev,
        {
          ...createBlankOrder(fallbackSymbol),
          symbol: fallbackSymbol,
          price: computeAutoLimitPrice(fallbackSymbol) || '',
          size: toDisplayDecimalString(computeAutoSize(fallbackSymbol)),
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

  const resetOrderForms = () => {
    if (!hasOrderableTokens) {
      setOrderForms([createBlankOrder()])
      return
    }
    const defaults = orderableSymbols.slice(0, 2).map((symbol) => ({
      ...createBlankOrder(symbol),
      symbol,
      price: computeAutoLimitPrice(symbol) || '',
      size: toDisplayDecimalString(computeAutoSize(symbol)),
      autoPrice: true,
      autoSize: true
    }))
    if (defaults.length === 0) {
      setOrderForms([createBlankOrder(orderableSymbols[0])])
      return
    }
    setOrderForms(defaults)
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

  const stopContinuousNudge = useCallback(() => {
    if (priceNudgeIntervalRef.current) {
      clearInterval(priceNudgeIntervalRef.current)
      priceNudgeIntervalRef.current = null
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
        const step = getPriceStepValue(canonical)
        const currentValue = order.autoPrice
          ? computeAutoLimitPrice(canonical)
          : order.price
        const numeric = Number(currentValue)
        const base = Number.isFinite(numeric) && numeric > 0 ? numeric : step
        const next = base + step * (direction > 0 ? 1 : -1)
        const safeNext = next > 0 ? next : step
        const quantized = quantizePrice(canonical, safeNext) || safeNext.toString()
        return {
          ...order,
          symbol: canonical,
          price: quantized,
          autoPrice: false
        }
      })
    )
  }, [findCanonicalSymbol, computeAutoLimitPrice])

  const startContinuousNudge = useCallback((index, direction) => {
    if (!direction) return
    nudgeOrderPrice(index, direction)
    stopContinuousNudge()
    priceNudgeIntervalRef.current = setInterval(() => {
      nudgeOrderPrice(index, direction)
    }, 200)
  }, [nudgeOrderPrice, stopContinuousNudge])

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
          autoPrice: true
        }
      })
    )
  }, [findCanonicalSymbol, computeAutoLimitPrice])

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

  const statusColorMap = {
    idle: '#94a3b8',
    loading: '#fbbf24',
    success: '#22c55e',
    error: '#f87171'
  }

  const orderStatusColor = statusColorMap[orderStatus.state]
  const openOrdersStatusColor = statusColorMap[openOrdersStatus.state]
  const closeAllStatusColor = statusColorMap[closeAllStatus.state]
  const openOrdersList = openOrdersStatus.payload?.openOrders ?? []
  const openPositionsList = openOrdersStatus.payload?.openPositions ?? []

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

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
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
            const priceNumber = displayedPrice === '' ? NaN : Number(displayedPrice)
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="number"
                        min={PRICE_INPUT_MIN}
                        step={PRICE_INPUT_STEP}
                        value={displayedPrice}
                        onChange={(e) => updateOrderField(index, 'price', e.target.value)}
                        placeholder="87000"
                        style={{
                          width: '100%',
                          borderRadius: '10px',
                          padding: '10px',
                          background: '#0f172a',
                          color: '#e5e7eb',
                          border: '1px solid #1e293b',
                          fontVariantNumeric: 'tabular-nums'
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #1e293b',
                            background: '#1d293b',
                            color: '#e5e7eb',
                            fontWeight: 700,
                            fontSize: '16px',
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
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #1e293b',
                            background: '#1d293b',
                            color: '#e5e7eb',
                            fontWeight: 700,
                            fontSize: '16px',
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
