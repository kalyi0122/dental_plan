import { useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useTranslation } from '../i18n/useTranslation'
import { Button, Card, Divider, Select, Textarea } from '../components/ui'
import type { CurrencyCode, ThemeMode } from '../domain/types'
import toothFormulaFdi from '../assets/image2.png'
import toothFormulaUniversal from '../assets/image.png'

const CURRENCY_OPTIONS: { value: CurrencyCode; label: string }[] = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'AZN', label: 'AZN (Азербайджанский манат)' },
  { value: 'ARS', label: 'ARS (Аргентинское песо)' },
  { value: 'AMD', label: 'AMD (Армянский драм)' },
  { value: 'BYN', label: 'BYN (Белорусский рубль)' },
  { value: 'BRL', label: 'BRL (Бразильский реал)' },
  { value: 'GEL', label: 'GEL (Грузинский лари)' },
  { value: 'AED', label: 'AED (Дирхам ОАЭ)' },
  { value: 'KZT', label: 'KZT (Казахстанский тенге)' },
  { value: 'KHR', label: 'KHR (Камбоджийский риель)' },
  { value: 'CAD', label: 'CAD (Канадский доллар)' },
  { value: 'QAR', label: 'QAR (Катарский риал)' },
  { value: 'KGS', label: 'KGS (Киргизский сом)' },
  { value: 'MXN', label: 'MXN (Мексиканское песо)' },
  { value: 'MDL', label: 'MDL (Молдавский лей)' },
  { value: 'PLN', label: 'PLN (Польский злотый)' },
  { value: 'RUB', label: 'RUB (Российский рубль)' },
  { value: 'TJS', label: 'TJS (Таджикский сомони)' },
  { value: 'TMT', label: 'TMT (Туркменский манат)' },
  { value: 'UZS', label: 'UZS (Узбекский сум)' },
  { value: 'UAH', label: 'UAH (Украинская гривна)' },
  { value: 'ZAR', label: 'ZAR (Южноафриканский рэнд)' },
]

export function SettingsPage() {
  const { t } = useTranslation()
  const settings = useAppStore((s) => s.settings)
  const setNumberingSystem = useAppStore((s) => s.setNumberingSystem)
  const setCurrency = useAppStore((s) => s.setCurrency)
  const setTheme = useAppStore((s) => s.setTheme)
  const setQuoteText = useAppStore((s) => s.setQuoteText)
  const resetDemoData = useAppStore((s) => s.resetDemoData)
  const [isToothModalOpen, setIsToothModalOpen] = useState(false)

  const numberingOptions = useMemo(
    () => [
      { value: 'FDI' as const, label: t('settings.fdi') },
      { value: 'UNIVERSAL' as const, label: t('settings.universal') },
    ],
    [t],
  )

  const fdiReferenceImage = toothFormulaFdi
  const universalReferenceImage = toothFormulaUniversal

  useEffect(() => {
    if (!isToothModalOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsToothModalOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isToothModalOpen])

  return (
    <div className="settings-page">
      <Card title={t('settings.title')} subtitle={t('settings.subtitle')}>
        <div className="settings-grid-3">
          <div>
            <div style={styles.label}>{t('settings.toothNumbering')}</div>
            <button
              type="button"
              className="tooth-numbering-trigger"
              onClick={() => setIsToothModalOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isToothModalOpen}
            >
              {numberingOptions.find((option) => option.value === settings.numberingSystem)?.label ?? t('settings.fdi')}
            </button>
          </div>
          <div>
            <div style={styles.label}>{t('settings.currency')}</div>
            <Select
              value={settings.currency}
              onChange={(v) => setCurrency(v as CurrencyCode)}
              options={CURRENCY_OPTIONS}
            />
          </div>
          <div>
            <div style={styles.label}>{t('settings.theme')}</div>
            <Select
              value={settings.theme}
              onChange={(v) => setTheme(v as ThemeMode)}
              options={[
                { value: 'system', label: t('settings.system') },
                { value: 'light', label: t('settings.light') },
                { value: 'dark', label: t('settings.dark') },
              ]}
            />
          </div>
        </div>

        <Divider />

        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div style={{ fontWeight: 700 }}>{t('settings.pdfBlocks')}</div>
          <div className="muted" style={{ fontSize: 13 }}>
            {t('settings.placeholderHint').split('{patientName}').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 ? <span className="kbd">{'{patientName}'}</span> : null}
              </span>
            ))}
          </div>

          <div className="settings-grid-2">
            <div>
              <div style={styles.label}>{t('settings.greeting')}</div>
              <Textarea
                value={settings.quoteText.greeting}
                onChange={(e) => setQuoteText({ greeting: e.target.value })}
              />
            </div>
            <div>
              <div style={styles.label}>{t('settings.terms')}</div>
              <Textarea value={settings.quoteText.terms} onChange={(e) => setQuoteText({ terms: e.target.value })} />
            </div>
          </div>

          <div>
            <div style={styles.label}>{t('settings.footer')}</div>
            <Textarea value={settings.quoteText.footer} onChange={(e) => setQuoteText({ footer: e.target.value })} />
          </div>
        </div>
      </Card>

      <Card title={t('settings.maintenance')} subtitle={t('settings.maintenanceSubtitle')}>
        <Button
          variant="danger"
          onClick={() => {
            if (!confirm(t('settings.resetConfirm'))) return
            resetDemoData()
          }}
          style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}
        >
          <RotateCcw size={16} />
          {t('settings.resetDemo')}
        </Button>
      </Card>

      {isToothModalOpen ? (
        <div
          className="tooth-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t('settings.toothNumbering')}
          onClick={() => setIsToothModalOpen(false)}
        >
          <div className="tooth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tooth-modal-title">{t('settings.chooseToothFormula')}</div>
            <div className="tooth-modal-grid">
              <button
                type="button"
                className={`tooth-option-card ${settings.numberingSystem === 'FDI' ? 'active' : ''}`}
                onClick={() => {
                  setNumberingSystem('FDI')
                  setIsToothModalOpen(false)
                }}
              >
                <div className="tooth-option-preview" aria-hidden="true">
                  <img className="tooth-option-image" src={fdiReferenceImage} alt="" />
                  <div className="tooth-option-image-mask" />
                </div>
                <div className="tooth-option-label">{t('settings.fdiShort')}</div>
              </button>

              <button
                type="button"
                className={`tooth-option-card ${settings.numberingSystem === 'UNIVERSAL' ? 'active' : ''}`}
                onClick={() => {
                  setNumberingSystem('UNIVERSAL')
                  setIsToothModalOpen(false)
                }}
              >
                <div className="tooth-option-preview" aria-hidden="true">
                  <img className="tooth-option-image" src={universalReferenceImage} alt="" />
                  <div className="tooth-option-image-mask" />
                </div>
                <div className="tooth-option-label">{t('settings.universalShort')}</div>
              </button>
            </div>
            <div className="tooth-modal-actions">
              <Button onClick={() => setIsToothModalOpen(false)}>{t('common.cancel')}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    fontSize: 12,
    color: 'var(--muted)',
    marginBottom: 'var(--space-2)',
  },
}

