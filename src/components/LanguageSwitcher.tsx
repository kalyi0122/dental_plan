import { Languages } from 'lucide-react'
import type { Locale } from '../domain/types'
import { useTranslation } from '../i18n/useTranslation'

const LOCALES: { value: Locale; labelKey: string }[] = [
  { value: 'ru', labelKey: 'lang.ru' },
  { value: 'kg', labelKey: 'lang.kg' },
  { value: 'en', labelKey: 'lang.en' },
]

export function LanguageSwitcher() {
  const { t, locale, setLocale } = useTranslation()

  return (
    <div style={styles.wrap} title="Language / Язык / Тил">
      <Languages size={18} style={{ opacity: 0.8 }} />
      <div style={styles.buttons}>
        {LOCALES.map(({ value, labelKey }) => (
          <button
            key={value}
            type="button"
            onClick={() => setLocale(value)}
            style={{
              ...styles.btn,
              ...(locale === value ? styles.btnActive : {}),
            }}
            aria-pressed={locale === value}
            aria-label={t(labelKey)}
          >
            {value.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: '4px 8px',
    borderRadius: 'var(--radius-md)',
    background: 'color-mix(in oklab, var(--panel2) 80%, transparent)',
    border: '1px solid var(--border)',
  },
  buttons: {
    display: 'flex',
    gap: 2,
  },
  btn: {
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid transparent',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--muted)',
    cursor: 'pointer',
    transition: 'background 0.15s ease, color 0.15s ease',
  },
  btnActive: {
    background: 'color-mix(in oklab, var(--primary) 20%, var(--panel))',
    color: 'var(--text)',
    borderColor: 'color-mix(in oklab, var(--primary) 40%, var(--border))',
  },
}
