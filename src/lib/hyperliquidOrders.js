const PROD_FUNCTIONS_BASE_URL =
  "https://us-central1-cookie1-b3592.cloudfunctions.net"
const PLACE_TEST_ORDER_ENDPOINT = `${PROD_FUNCTIONS_BASE_URL}/placeTestOrder`
const LIST_OPEN_ORDERS_ENDPOINT = `${PROD_FUNCTIONS_BASE_URL}/listOpenOrders`
const CLOSE_ALL_POSITIONS_ENDPOINT = `${PROD_FUNCTIONS_BASE_URL}/closeAllPositions`

const ALLOWED_SIDES = ['buy', 'sell']

function toStringValue(value, field) {
  if (value == null) {
    throw new Error(`Le champ "${field}" est requis`)
  }
  const stringValue = typeof value === 'number' ? value.toString() : String(value)
  if (stringValue.trim().length === 0) {
    throw new Error(`Le champ "${field}" ne peut pas être vide`)
  }
  return stringValue
}

function normalizeSingleOrder(order, index) {
  if (!order || typeof order !== 'object') {
    throw new Error(`Ordre #${index + 1}: données manquantes`)
  }

  const normalizedSide = order.side?.toLowerCase()
  if (!ALLOWED_SIDES.includes(normalizedSide)) {
    throw new Error(`Ordre #${index + 1}: 'side' doit être 'buy' ou 'sell'`)
  }

  const normalizedOrder = {
    symbol: order.symbol ? String(order.symbol).toUpperCase().trim() : undefined,
    asset:
      typeof order.asset === 'number' && Number.isFinite(order.asset)
        ? order.asset
        : undefined,
    side: normalizedSide,
    size: toStringValue(order.size, 'size'),
    price: toStringValue(order.price, 'price'),
    tif: order.tif,
    reduceOnly: Boolean(order.reduceOnly)
  }

  if (!normalizedOrder.symbol && normalizedOrder.asset == null) {
    throw new Error(`Ordre #${index + 1}: renseigne 'symbol' ou 'asset'`)
  }

  return normalizedOrder
}

function normalizeOrdersPayload(payload) {
  const ordersArray = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.orders)
      ? payload.orders
      : payload
        ? [payload]
        : []

  if (!ordersArray.length) {
    throw new Error('Fournis au moins un ordre à envoyer')
  }

  if (ordersArray.length > 10) {
    throw new Error('Maximum 10 ordres simultanés côté UI')
  }

  return {
    orders: ordersArray.map((order, index) => normalizeSingleOrder(order, index))
  }
}

export async function placeHyperliquidTestOrder(payload) {
  const body = normalizeOrdersPayload(payload)

  let response
  try {
    response = await fetch(PLACE_TEST_ORDER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  } catch (networkError) {
    throw new Error(
      `Impossible de contacter placeTestOrder (${PLACE_TEST_ORDER_ENDPOINT}). ` +
        'Assure-toi que le Functions Emulator tourne (npm run serve dans functions/) ' +
        'ou configure VITE_FUNCTIONS_BASE_URL / VITE_USE_FUNCTIONS_EMULATOR selon le besoin. ' +
        `Détails: ${networkError.message}`
    )
  }

  const rawText = await response.text()
  let parsed

  try {
    parsed = rawText ? JSON.parse(rawText) : null
  } catch (error) {
    throw new Error(`Réponse invalide de placeTestOrder: ${rawText} (${error.message})`)
  }

  if (!response.ok) {
    const message = parsed?.error || parsed?.message || response.statusText
    throw new Error(`Erreur backend (${response.status}): ${message}`)
  }

  return parsed
}

export async function fetchHyperliquidOpenOrders() {
  let response
  try {
    response = await fetch(LIST_OPEN_ORDERS_ENDPOINT)
  } catch (networkError) {
    throw new Error(
      `Impossible de contacter listOpenOrders (${LIST_OPEN_ORDERS_ENDPOINT}). ` +
        'Assure-toi que la nouvelle fonction Firebase est déployée ou que l’URL est accessible. ' +
        `Détails: ${networkError.message}`
    )
  }

  const rawText = await response.text()
  let parsed

  try {
    parsed = rawText ? JSON.parse(rawText) : null
  } catch (error) {
    throw new Error(`Réponse invalide de listOpenOrders: ${rawText} (${error.message})`)
  }

  if (!response.ok) {
    const message = parsed?.error || parsed?.message || response.statusText
    throw new Error(`Erreur backend (${response.status}): ${message}`)
  }

  const ordersArray = Array.isArray(parsed?.openOrders) ? parsed.openOrders : null
  const positionsArray = Array.isArray(parsed?.openPositions) ? parsed.openPositions : null

  if (!ordersArray) {
    throw new Error('Réponse inattendue: openOrders manquant')
  }

  if (!positionsArray) {
    throw new Error('Réponse inattendue: openPositions manquant')
  }

  return {
    ...parsed,
    openOrders: ordersArray,
    openPositions: positionsArray
  }
}

export async function closeAllHyperliquidPositions() {
  let response
  try {
    response = await fetch(CLOSE_ALL_POSITIONS_ENDPOINT, {
      method: 'POST'
    })
  } catch (networkError) {
    throw new Error(
      `Impossible de contacter closeAllPositions (${CLOSE_ALL_POSITIONS_ENDPOINT}). ` +
        'Vérifie que la nouvelle fonction Firebase est bien déployée et joignable. ' +
        `Détails: ${networkError.message}`
    )
  }

  const rawText = await response.text()
  let parsed

  try {
    parsed = rawText ? JSON.parse(rawText) : null
  } catch (error) {
    throw new Error(`Réponse invalide de closeAllPositions: ${rawText} (${error.message})`)
  }

  if (!response.ok) {
    const message = parsed?.error || parsed?.message || response.statusText
    throw new Error(`Erreur backend (${response.status}): ${message}`)
  }

  if (!parsed?.ok) {
    throw new Error('Réponse inattendue: drapeau ok manquant')
  }

  return parsed
}

export const DEFAULT_TEST_ORDERS = [
  {
    symbol: 'BTC',
    side: 'buy',
    size: '0.01',
    price: '87300'
  },
  {
    symbol: 'ETH',
    side: 'buy',
    size: '0.05',
    price: '2790'
  }
]
