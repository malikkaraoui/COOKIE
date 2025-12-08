const DEFAULT_FUNDING_URL =
  'https://europe-west1-cookie1-b3592.cloudfunctions.net/fundingMetrics'

export const FUNDING_URL =
  (import.meta.env?.VITE_FUNDING_METRICS_URL as string | undefined) ?? DEFAULT_FUNDING_URL

export async function fetchFundingMetrics(symbol: string, days = 20, signal?: AbortSignal) {
  const url = new URL(FUNDING_URL)
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('days', String(days))

  const res = await fetch(url.toString(), { signal })
  if (!res.ok) throw new Error(`Funding HTTP ${res.status}`)
  return res.json()
}
