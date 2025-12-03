const NBSP = /\u00A0/g
const NNBSP = '\u202F'

export function narrowSpaces(value: string): string {
  if (!value) return ''
  return value.replace(NBSP, NNBSP)
}

export function formatUSD(value: number | null | undefined, options?: { decimals?: number }): string {
  if (value == null || !Number.isFinite(value)) {
    return '--'
  }
  const decimals = options?.decimals ?? 2
  const formatted = value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  return narrowSpaces(formatted)
}

export function formatSigned(value: number | null | undefined, digits = 0): string {
  if (value == null || !Number.isFinite(value)) {
    return '--'
  }
  const sign = value >= 0 ? '' : '-'
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
  return `${sign}${formatted}`
}
