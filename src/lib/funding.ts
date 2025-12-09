const DEFAULT_FUNDING_URL =
  'https://europe-west1-cookie1-b3592.cloudfunctions.net/fundingMetrics'

const normalizeFundingUrl = (value?: string | null) => {
  if (!value) {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  if (trimmed.includes('cookiei-b3592')) {
    return trimmed.replace('cookiei-b3592', 'cookie1-b3592')
  }
  return trimmed
}

const envFundingUrl = normalizeFundingUrl(import.meta.env?.VITE_FUNDING_METRICS_URL as string | undefined)

export const FUNDING_URL = envFundingUrl ?? DEFAULT_FUNDING_URL

const FUNDING_URL_CANDIDATES = Array.from(new Set([FUNDING_URL, DEFAULT_FUNDING_URL]))

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchFromEndpoint(
  baseUrl: string,
  symbol: string,
  days = 20,
  signal?: AbortSignal
) {
  let url: URL
  try {
    url = new URL(baseUrl)
  } catch (err) {
    throw err instanceof Error ? err : new Error('Funding URL invalide')
  }

  url.searchParams.set('symbol', symbol)
  url.searchParams.set('days', String(days))

  const maxAttempts = 3

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const res = await fetch(url.toString(), { signal })

      if (!res.ok) {
        const bodyText = await res.text()
        let message = `Funding HTTP ${res.status}`
        try {
          const payload = bodyText ? JSON.parse(bodyText) : null
          message = payload?.error?.message ?? message
        } catch (err) {
          /* ignore JSON parsing error */
        }

        const error = new Error(message)
        ;(error as any).status = res.status

        if (res.status >= 500 && attempt < maxAttempts - 1) {
          await delay(300 * (attempt + 1))
          continue
        }

        throw error
      }

      return res.json()
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw err
      }

      const status = err?.status ?? 0
      const retryable = status === 0 || status >= 500
      if (!retryable || attempt >= maxAttempts - 1) {
        throw err
      }

      await delay(300 * (attempt + 1))
    }
  }

  throw new Error('Impossible de joindre le service de funding')
}

export async function fetchFundingMetrics(symbol: string, days = 20, signal?: AbortSignal) {
  let lastError: unknown
  for (const endpoint of FUNDING_URL_CANDIDATES) {
    try {
      return await fetchFromEndpoint(endpoint, symbol, days, signal)
    } catch (error) {
      lastError = error
    }
  }

  if (lastError instanceof Error) {
    throw lastError
  }

  throw new Error('Funding metrics indisponibles')
}
