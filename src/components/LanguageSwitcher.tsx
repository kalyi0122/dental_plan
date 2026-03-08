import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Languages } from 'lucide-react'
import type { Locale } from '../domain/types'
import { useTranslation } from '../i18n/useTranslation'

const LOCALES: { value: Locale; labelKey: string }[] = [
  { value: 'ru', labelKey: 'lang.ru' },
  { value: 'kg', labelKey: 'lang.kg' },
  { value: 'en', labelKey: 'lang.en' },
]

export function LanguageSwitcher() {
  const { t, locale, setLocale } = useTranslation()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={wrapRef} style={styles.wrap} title="Language / Язык / Тил">
      <button
        type="button"
        style={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.language')}
      >
        <Languages size={16} style={{ opacity: 0.86 }} />
        <span style={styles.current}>{locale.toUpperCase()}</span>
        <ChevronDown
          size={14}
          style={{ opacity: 0.72, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }}
        />
      </button>

      {open ? (
        <div style={styles.menu} role="listbox" aria-label={t('common.language')}>
          {LOCALES.map(({ value, labelKey }) => {
            const active = value === locale
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setLocale(value)
                  setOpen(false)
                }}
                style={{ ...styles.option, ...(active ? styles.optionActive : null) }}
                role="option"
                aria-selected={active}
                aria-label={t(labelKey)}
              >
                <span style={styles.optionLabel}>{t(labelKey)}</span>
                {active ? <Check size={14} /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: 'relative',
  },
  trigger: {
    minHeight: 36,
    borderRadius: 999,
    border: '1px solid var(--border)',
    background: 'color-mix(in oklab, var(--panel2) 84%, transparent)',
    color: 'var(--text)',
    padding: '6px 10px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 86,
    justifyContent: 'space-between',
  },
  current: {
    letterSpacing: '0.05em',
  },
  menu: {
    position: 'absolute',
    zIndex: 40,
    top: 'calc(100% + 8px)',
    right: 0,
    width: 170,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--panel)',
    boxShadow: 'var(--shadow)',
    padding: 6,
    display: 'grid',
    gap: 4,
  },
  option: {
    minHeight: 36,
    borderRadius: 10,
    border: '1px solid transparent',
    background: 'transparent',
    color: 'var(--text)',
    cursor: 'pointer',
    padding: '7px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 13,
  },
  optionActive: {
    borderColor: 'color-mix(in oklab, var(--primary) 40%, var(--border))',
    background: 'color-mix(in oklab, var(--primary) 18%, var(--panel2))',
  },
  optionLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}
