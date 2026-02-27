import { useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { t as translate } from './translations'

export function useTranslation() {
  const locale = useAppStore((s) => s.settings.locale)
  const setLocale = useAppStore((s) => s.setLocale)

  const t = useCallback(
    (key: string, params?: Record<string, string>) => translate(locale, key, params),
    [locale],
  )

  return { t, locale, setLocale }
}
