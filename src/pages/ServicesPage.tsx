import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useTranslation } from '../i18n/useTranslation'
import { formatMoney } from '../domain/money'
import type { JawRegion, ServiceCategory } from '../domain/types'
import { Icon, ICON_LABELS, ICON_OPTIONS } from '../components/Icon'
import { Button, Card, Input, Pill, Select } from '../components/ui'

const CATEGORY_OPTIONS: { value: ServiceCategory; labelKey: string }[] = [
  { value: 'TOOTH', labelKey: 'services.toothSpecific' },
  { value: 'JAW', labelKey: 'services.jawSpecific' },
  { value: 'GENERAL', labelKey: 'services.general' },
]

export function ServicesPage() {
  const { t } = useTranslation()
  const services = useAppStore((s) => s.services)
  const upsertService = useAppStore((s) => s.upsertService)
  const removeService = useAppStore((s) => s.removeService)
  const currency = useAppStore((s) => s.settings.currency)

  const [q, setQ] = useState('')
  const [category, setCategory] = useState<ServiceCategory>('TOOTH')
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('tooth-healthy')
  const [jawRegion, setJawRegion] = useState<JawRegion>('MAXILLA')
  const [iconMenuOpen, setIconMenuOpen] = useState(false)
  const [price, setPrice] = useState('120')
  const iconMenuRef = useRef<HTMLDivElement | null>(null)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return services
    return services.filter((s) => `${s.name} ${s.category}`.toLowerCase().includes(query))
  }, [services, q])

  const grouped = useMemo(() => {
    const groups: Record<ServiceCategory, typeof filtered> = { TOOTH: [], JAW: [], GENERAL: [] }
    filtered.forEach((s) => groups[s.category].push(s))
    return groups
  }, [filtered])

  useEffect(() => {
    if (!iconMenuOpen) return
    const onClickOutside = (event: MouseEvent) => {
      if (!iconMenuRef.current) return
      if (!iconMenuRef.current.contains(event.target as Node)) setIconMenuOpen(false)
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIconMenuOpen(false)
    }
    window.addEventListener('mousedown', onClickOutside)
    window.addEventListener('keydown', onEscape)
    return () => {
      window.removeEventListener('mousedown', onClickOutside)
      window.removeEventListener('keydown', onEscape)
    }
  }, [iconMenuOpen])

  const jawLabel = (jaw?: JawRegion) => {
    if (jaw === 'MANDIBLE') return t('planner.mandible')
    if (jaw === 'BOTH') return t('planner.bothJaws')
    return t('planner.maxilla')
  }

  return (
    <div className="layout-two-col">
      <Card
        title={t('services.title')}
        subtitle={t('services.subtitle')}
        right={
          <div className="card-search-wrap">
            <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, opacity: 0.7 }} />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('services.search')}
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {CATEGORY_OPTIONS.map((cat) => (
            <div key={cat.value}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <div style={{ fontWeight: 700 }}>{t(cat.labelKey)}</div>
                <Pill>{grouped[cat.value].length}</Pill>
              </div>
              <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                {grouped[cat.value].map((s) => (
                  <div key={s.id} className="row-service">
                    <div style={styles.iconWrap} aria-hidden>
                      <Icon name={s.icon} size={24} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 650 }}>{s.name}</div>
                      <div className="muted" style={{ fontSize: 13 }}>
                        {formatMoney(s.priceCents, currency)}
                      </div>
                      {s.category === 'JAW' ? (
                        <div className="muted" style={{ fontSize: 12 }}>
                          {t('planner.jaw')}: {jawLabel(s.jawRegion)}
                        </div>
                      ) : null}
                    </div>
                    <div className="row-actions">
                      <Button
                        title={t('services.deleteService')}
                      onClick={() => {
                        if (!confirm(t('services.deleteConfirm', { name: s.name })))
                          return
                        removeService(s.id)
                      }}
                    >
                      <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                {grouped[cat.value].length === 0 && (
                  <div className="muted" style={{ fontSize: 13, padding: 'var(--space-3)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                    {t('services.noInCategory')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title={t('services.addService')} subtitle={t('services.addServiceSubtitle')}>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div>
            <div style={styles.label}>{t('services.category')}</div>
            <Select
              value={category}
              onChange={(v) => setCategory(v as ServiceCategory)}
              options={CATEGORY_OPTIONS.map((c) => ({ value: c.value, label: t(c.labelKey) }))}
            />
          </div>
          <div>
            <div style={styles.label}>{t('services.name')}</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('services.placeholderName')} />
          </div>
          {category === 'JAW' ? (
            <div>
              <div style={styles.label}>{t('planner.jawRegion')}</div>
              <Select
                value={jawRegion}
                onChange={(v) => setJawRegion(v as JawRegion)}
                options={[
                  { value: 'MAXILLA', label: t('planner.maxilla') },
                  { value: 'MANDIBLE', label: t('planner.mandible') },
                  { value: 'BOTH', label: t('planner.bothJaws') },
                ]}
              />
            </div>
          ) : null}
          <div className="add-service-row">
            <div>
              <div style={styles.label}>{t('services.icon')}</div>
              <div ref={iconMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIconMenuOpen((v) => !v)}
                  style={styles.iconPickerTrigger}
                  aria-haspopup="listbox"
                  aria-expanded={iconMenuOpen}
                >
                  <span style={styles.iconPickerLeft}>
                    <span style={styles.iconPickerMini}>
                      <Icon name={icon} size={22} />
                    </span>
                    <span>{ICON_LABELS[icon] ?? icon}</span>
                  </span>
                  <span style={{ opacity: 0.7 }}>▾</span>
                </button>

                {iconMenuOpen ? (
                  <div style={styles.iconPickerMenu} role="listbox">
                    {ICON_OPTIONS.map((opt) => {
                      const active = icon === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setIcon(opt)
                            setIconMenuOpen(false)
                          }}
                          style={{
                            ...styles.iconPickerOption,
                            ...(active ? styles.iconPickerOptionActive : null),
                          }}
                          role="option"
                          aria-selected={active}
                        >
                          <span style={styles.iconPickerMini}>
                            <Icon name={opt} size={22} />
                          </span>
                          <span>{ICON_LABELS[opt] ?? opt}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>
            <div>
              <div style={styles.label}>{t('services.price')}</div>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ ...styles.iconWrap, width: 44, height: 44 }}>
              <Icon name={icon} size={26} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 650 }}>{name.trim() || t('services.preview')}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                {formatMoney(Math.round((Number(price) || 0) * 100), currency)}
              </div>
              {category === 'JAW' ? (
                <div className="muted" style={{ fontSize: 12 }}>
                  {t('planner.jaw')}: {jawLabel(jawRegion)}
                </div>
              ) : null}
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              const n = name.trim()
              const p = Number(price)
              if (!n || !Number.isFinite(p)) return
              upsertService({
                category,
                icon,
                name: n,
                priceCents: Math.round(p * 100),
                jawRegion: category === 'JAW' ? jawRegion : undefined,
              })
              setName('')
              setPrice('120')
            }}
            style={{ display: 'inline-flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={16} />
            {t('services.addButton')}
          </Button>

          <div className="muted" style={{ fontSize: 12 }}>
            Recommended: keep names consistent (e.g. “Crown – Zirconia”, “Crown – Metal ceramic”).
          </div>
        </div>
      </Card>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: 'transparent',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--muted)',
    overflow: 'hidden',
  },
  label: {
    fontSize: 12,
    color: 'var(--text)',
    marginBottom: 'var(--space-2)',
  },
  iconPickerTrigger: {
    width: '100%',
    minHeight: 40,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'color-mix(in oklab, var(--panel2) 85%, transparent)',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    cursor: 'pointer',
    fontSize: 14,
  },
  iconPickerLeft: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  iconPickerMini: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--text)',
    flex: '0 0 auto',
    overflow: 'hidden',
  },
  iconPickerMenu: {
    position: 'absolute',
    zIndex: 40,
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    maxHeight: 320,
    overflowY: 'auto',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--panel)',
    boxShadow: 'var(--shadow)',
    padding: 6,
    display: 'grid',
    gap: 4,
  },
  iconPickerOption: {
    borderRadius: 10,
    border: '1px solid transparent',
    background: 'transparent',
    padding: '8px 10px',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    fontSize: 14,
  },
  iconPickerOptionActive: {
    border: '1px solid color-mix(in oklab, var(--primary) 50%, var(--border))',
    background: 'color-mix(in oklab, var(--primary) 16%, var(--panel))',
  },
}

