const PROD_FUNCTIONS_BASE_URL =
  "https://us-central1-cookie1-b3592.cloudfunctions.net"
const PLACE_TEST_ORDER_ENDPOINT = `${PROD_FUNCTIONS_BASE_URL}/placeTestOrder`

function normalizeOrderPayload(payload) {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Order payload manquant')
  }

  const { asset, side, size, price } = payload

  if (typeof asset !== 'number' || Number.isNaN(asset)) {
    throw new Error('Le champ "asset" doit être un nombre')
  }

  const normalizedSide = side?.toLowerCase()
  if (normalizedSide !== 'buy' && normalizedSide !== 'sell') {
    throw new Error('Le champ "side" doit être "buy" ou "sell"')
  }

  const toStringValue = (value, field) => {
    if (value == null) {
      throw new Error(`Le champ "${field}" est requis`)
    }
    const stringValue = typeof value === 'number' ? value.toString() : value
    if (stringValue.trim().length === 0) {
      throw new Error(`Le champ "${field}" ne peut pas être vide`)
    }
    return stringValue
  }

  return {
    asset,
    side: normalizedSide,
    size: toStringValue(size, 'size'),
    price: toStringValue(price, 'price')
  }
}

export async function placeHyperliquidTestOrder(payload) {
  const body = normalizeOrderPayload(payload)

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

export const DEFAULT_TEST_ORDER = {
  asset: 3,
  side: 'buy',
  size: '0.01',
  price: '85650'
}
