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
const LIST_TABS: ServiceCategory[] = ['TOOTH', 'JAW', 'GENERAL']
const JAW_ICON_OPTIONS = ['tooth-blue-block', 'tooth-bridge-x6', 'tooth-bridge-x7']
const GENERAL_ICON_OPTIONS = ['consultation', 'photos', 'xray', 'planning']
const TOOTH_ICON_OPTIONS = ICON_OPTIONS.filter((opt) => !JAW_ICON_OPTIONS.includes(opt))
const GENERAL_DEFAULT_ICON = 'consultation'
const JAW_DEFAULT_SERVICES: { icon: string; name: string; jawRegion: JawRegion }[] = [
  { icon: 'tooth-blue-block', name: 'Брекеты', jawRegion: 'BOTH' },
  { icon: 'tooth-bridge-x6', name: 'Винир x6', jawRegion: 'BOTH' },
  { icon: 'tooth-bridge-x7', name: 'Винир x7', jawRegion: 'BOTH' },
]

const ICON_LABELS_EN: Record<string, string> = {
  'tooth-pin': 'Inlay',
  implant: 'Implant',
  'tooth-crown': 'Crown',
  'tooth-inlay': 'Sinus lift',
  'tooth-filling': 'Filling',
  'tooth-extraction': 'Extraction',
  'tooth-root-canal': 'Root canal',
  'tooth-veneer': 'Bone graft',
  'tooth-blue-block': 'Braces',
  'tooth-blue-square': 'Gum former',
  'tooth-blue-cap': 'Crown',
  'tooth-purple-cap': 'Crown',
  'tooth-blue-green-cap': 'Veneer',
  'tooth-bridge-x6': 'Veneer x6',
  'tooth-bridge-x7': 'Veneer x7',
}
export function ServicesPage() {
  const { t, locale } = useTranslation()
  const services = useAppStore((s) => s.services)
  const upsertService = useAppStore((s) => s.upsertService)
  const removeService = useAppStore((s) => s.removeService)
  const currency = useAppStore((s) => s.settings.currency)

  const [q, setQ] = useState('')
  const [listCategory, setListCategory] = useState<ServiceCategory>('TOOTH')
  const [category, setCategory] = useState<ServiceCategory>('TOOTH')
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('tooth-pin')
  const [jawRegion, setJawRegion] = useState<JawRegion>('MAXILLA')
  const [iconMenuOpen, setIconMenuOpen] = useState(false)
  const [price, setPrice] = useState('120')
  const iconMenuRef = useRef<HTMLDivElement | null>(null)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return services
    return services.filter((s) => `${s.name} ${s.category}`.toLowerCase().includes(query))
  }, [services, q])

  const visibleServices = useMemo(() => filtered.filter((s) => s.category === listCategory), [filtered, listCategory])
  const iconOptions = useMemo(() => {
    if (listCategory === 'JAW') return JAW_ICON_OPTIONS
    if (listCategory === 'GENERAL') return GENERAL_ICON_OPTIONS
    return TOOTH_ICON_OPTIONS
  }, [listCategory])

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

  useEffect(() => {
    if (!iconOptions.includes(icon)) setIcon(iconOptions[0] ?? 'tooth-pin')
  }, [category, icon, iconOptions])

  useEffect(() => {
    const hasJawServices = services.some((s) => s.category === 'JAW')
    if (hasJawServices) return
    JAW_DEFAULT_SERVICES.forEach((item) => {
      upsertService({
        category: 'JAW',
        icon: item.icon,
        name: item.name,
        priceCents: 12000,
        jawRegion: item.jawRegion,
      })
    })
  }, [services, upsertService])

  const jawLabel = (jaw?: JawRegion) => {
    if (jaw === 'MANDIBLE') return t('planner.mandible')
    if (jaw === 'BOTH') return t('planner.bothJaws')
    return t('planner.maxilla')
  }

  const iconLabel = (iconName: string) => {
    if (locale === 'en') return ICON_LABELS_EN[iconName] ?? iconName
    return ICON_LABELS[iconName] ?? iconName
  }

  const serviceDisplayName = (s: { name: string; icon: string; category: ServiceCategory }) => {
    // In EN mode, prefer standardized icon labels for tooth/jaw procedures.
    if (locale === 'en' && s.category !== 'GENERAL') return iconLabel(s.icon)
    return s.name
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
          <div style={styles.listTabs}>
            {LIST_TABS.map((tab) => {
              const active = listCategory === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setListCategory(tab)
                    setCategory(tab)
                    setIconMenuOpen(false)
                  }}
                  style={{
                    ...styles.listTab,
                    ...(tab === 'GENERAL' ? styles.listTabSeparated : null),
                    ...(active ? styles.listTabActive : null),
                  }}
                >
                  {t(tab === 'TOOTH' ? 'services.toothSpecific' : tab === 'JAW' ? 'services.jawSpecific' : 'services.general')}
                </button>
              )
            })}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <div style={{ fontWeight: 700 }}>
                {t(listCategory === 'TOOTH' ? 'services.toothSpecific' : listCategory === 'JAW' ? 'services.jawSpecific' : 'services.general')}
              </div>
              <Pill>{visibleServices.length}</Pill>
            </div>
            <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
              {visibleServices.map((s) => (
                <div key={s.id} className="row-service" style={s.category === 'GENERAL' ? { gridTemplateColumns: '1fr auto' } : undefined}>
                  {s.category !== 'GENERAL' ? (
                    <div className="row-icon" style={styles.iconWrap} aria-hidden>
                      <Icon name={s.icon} size={24} />
                    </div>
                  ) : null}
                  <div className="row-main" style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 650 }}>{serviceDisplayName(s)}</div>
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
                        if (!confirm(t('services.deleteConfirm', { name: serviceDisplayName(s) })))
                          return
                        removeService(s.id)
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              {visibleServices.length === 0 && (
                <div className="muted" style={{ fontSize: 13, padding: 'var(--space-3)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                  {t('services.noInCategory')}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card title={t('services.addService')} subtitle={t('services.addServiceSubtitle')}>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div>
            <div style={styles.label}>{t('services.category')}</div>
            <Select
              value={category}
              onChange={(v) => {
                const next = v as ServiceCategory
                setCategory(next)
                setListCategory(next)
              }}
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
          <div className="add-service-row" style={category === 'GENERAL' ? { gridTemplateColumns: '1fr' } : undefined}>
            {category !== 'GENERAL' ? (
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
                    <span>{iconLabel(icon)}</span>
                  </span>
                  <span style={{ opacity: 0.7 }}>▾</span>
                </button>

                {iconMenuOpen ? (
                  <div style={styles.iconPickerMenu} role="listbox">
                    {iconOptions.map((opt) => {
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
                          <span>{iconLabel(opt)}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
              </div>
            ) : null}
            <div>
              <div style={styles.label}>{t('services.price')}</div>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            {category !== 'GENERAL' ? (
              <div style={{ ...styles.iconWrap, width: 44, height: 44 }}>
                <Icon name={icon} size={26} />
              </div>
            ) : null}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 650 }}>{name.trim() || iconLabel(icon)}</div>
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
                icon: category === 'GENERAL' ? GENERAL_DEFAULT_ICON : icon,
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
  listTabs: {
    display: 'inline-flex',
    gap: 8,
    padding: 4,
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'color-mix(in oklab, var(--panel2) 86%, transparent)',
  },
  listTab: {
    borderRadius: 10,
    border: '1px solid transparent',
    background: 'transparent',
    color: 'var(--muted)',
    padding: '8px 12px',
    fontSize: 13,
    fontWeight: 650,
    cursor: 'pointer',
  },
  listTabSeparated: {
    marginLeft: 14,
  },
  listTabActive: {
    color: 'white',
    border: '1px solid color-mix(in oklab, var(--primary) 50%, var(--border))',
    background:
      'linear-gradient(180deg, color-mix(in oklab, var(--primary) 92%, white), color-mix(in oklab, var(--primary) 92%, #1142a2))',
  },
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


