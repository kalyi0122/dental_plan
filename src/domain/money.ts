import type { CurrencyCode } from './types'

export function formatMoney(cents: number, currency: CurrencyCode) {
  const value = cents / 100
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

