import { useMemo, useState } from 'react'
import { nanoid } from 'nanoid'
import { Plus, Trash2 } from 'lucide-react'
import type { JawRegion, PlanProcedure, ServiceCategory, TreatmentPlan } from '../domain/types'
import { useAppStore } from '../store/useAppStore'
import { useTranslation } from '../i18n/useTranslation'
import { DentalChart } from './DentalChart'
import { formatMoney } from '../domain/money'
import { sortTeethFdi, toDisplayToothLabel, mapPlanToToothConditions } from '../domain/teeth'
import { Button, Card, Divider, Input, Pill, Select } from './ui'
import { Icon } from './Icon'

const CATEGORY_OPTIONS: { value: ServiceCategory; labelKey: string }[] = [
  { value: 'TOOTH', labelKey: 'services.toothSpecific' },
  { value: 'JAW', labelKey: 'services.jawSpecific' },
  { value: 'GENERAL', labelKey: 'services.general' },
]

export function TreatmentPlanner({ plan }: { plan: TreatmentPlan }) {
  const { t } = useTranslation()
  const services = useAppStore((s) => s.services)
  const settings = useAppStore((s) => s.settings)
  const updatePlan = useAppStore((s) => s.updatePlan)

  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([])
  const [category, setCategory] = useState<ServiceCategory>('TOOTH')
  const [serviceQuery, setServiceQuery] = useState('')
  const [newStageName, setNewStageName] = useState('')

  const serviceById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services])

  // re‑use the same logic that the PDF generator uses; keeps the UI and PDF in sync
  const toothConditions = useMemo(() => mapPlanToToothConditions(plan, serviceById), [plan, serviceById])

  const filteredServices = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase()
    return services
      .filter((s) => s.category === category)
      .filter((s) => (!q ? true : s.name.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [services, category, serviceQuery])

  const stages = plan.stages.slice().sort((a, b) => a.order - b.order)

  const proceduresByStage = useMemo(() => {
    const map = new Map<string, PlanProcedure[]>()
    const stageIdSet = new Set(stages.map((s) => s.id))
    plan.procedures.forEach((p) => {
      const key = p.stageId && stageIdSet.has(p.stageId) ? p.stageId : '__unstaged__'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    })
    map.forEach((arr) => {
      arr.sort((a, b) => {
        const sa = serviceById.get(a.serviceId)?.name ?? ''
        const sb = serviceById.get(b.serviceId)?.name ?? ''
        return sa.localeCompare(sb)
      })
    })
    return map
  }, [plan.procedures, serviceById])

  const stageOptions = useMemo(() => {
    return [
      { value: '', label: t('planner.unstaged') },
      ...stages.map((s) => ({ value: s.id, label: s.name })),
    ]
  }, [stages, t])

  const planTotal = useMemo(() => {
    return plan.procedures.reduce((sum, p) => {
      const svc = serviceById.get(p.serviceId)
      if (!svc) return sum
      return sum + svc.priceCents * (p.quantity || 1)
    }, 0)
  }, [plan.procedures, serviceById])

  const jawLabel = (jaw?: JawRegion) => {
    if (jaw === 'MANDIBLE') return t('planner.mandible')
    if (jaw === 'BOTH') return t('planner.bothJaws')
    return t('planner.maxilla')
  }

  return (
    <div className="layout-planner">
      <Card
        className="planner-step-1"
        title={t('planner.step1')}
        subtitle={t('planner.step1Subtitle')}
        right={<Pill>{selectedTeeth.length ? t('planner.selectedCount', { count: String(selectedTeeth.length) }) : t('planner.noneSelected')}</Pill>}
      >
        <DentalChart
          selected={selectedTeeth}
          conditions={toothConditions}
          numberingSystem={settings.numberingSystem}
          onToggle={(t) => {
            setSelectedTeeth((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))
          }}
          onSetSelected={(next) => setSelectedTeeth(next)}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => setSelectedTeeth([])}>{t('planner.clear')}</Button>
          <div className="muted" style={{ fontSize: 13 }}>
            Selected: {selectedTeeth.length ? sortTeethFdi(selectedTeeth).map((t) => toDisplayToothLabel(t, settings.numberingSystem)).join(', ') : '—'}
          </div>
        </div>
      </Card>

      <Card className="planner-step-2" title={t('planner.step2')} subtitle={t('planner.step2Subtitle')}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div className="planner-filters">
            <div>
              <div style={styles.label}>{t('planner.category')}</div>
              <Select
                value={category}
                onChange={(v) => setCategory(v as ServiceCategory)}
                options={CATEGORY_OPTIONS.map((c) => ({ value: c.value, label: t(c.labelKey) }))}
              />
            </div>
            <div>
              <div style={styles.label}>{t('planner.search')}</div>
              <Input value={serviceQuery} onChange={(e) => setServiceQuery(e.target.value)} placeholder={t('planner.typeToFilter')} />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 8, maxHeight: 520, overflow: 'auto', paddingRight: 4 }}>
            {filteredServices.map((s) => (
              <div key={s.id} className="service-row-inner">
                <div style={styles.serviceIcon}>
                  <Icon name={s.icon} size={24} />
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                  <div className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formatMoney(s.priceCents, settings.currency)}
                  </div>
                  {s.category === 'JAW' && s.jawRegion ? (
                    <div className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t('planner.jaw')}: {jawLabel(s.jawRegion)}
                    </div>
                  ) : null}
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    const scope = s.category
                    if (scope === 'TOOTH' && selectedTeeth.length === 0) {
                      alert(t('planner.selectToothFirst'))
                      return
                    }
                    updatePlan(plan.id, (draft) => {
                      const isJawMultiTooth = scope === 'JAW' && (
                        s.icon === 'tooth-blue-block' ||
                        s.icon === 'tooth-bridge-x6' ||
                        s.icon === 'tooth-bridge-x7'
                      )
                      if (isJawMultiTooth) {
                        // Keep one marker per icon+jaw. "BOTH" overrides upper/lower and vice versa.
                        const targetJaw: JawRegion = s.jawRegion ?? 'BOTH'
                        draft.procedures = draft.procedures.filter((p) => {
                          const ps = serviceById.get(p.serviceId)
                          if (!(p.scope === 'JAW' && ps?.icon === s.icon)) return true
                          if (targetJaw === 'BOTH') return false
                          if (p.jaw === 'BOTH') return false
                          return p.jaw !== targetJaw
                        })
                      }
                      const proc: PlanProcedure =
                        scope === 'TOOTH'
                          ? {
                            id: nanoid(),
                            serviceId: s.id,
                            scope: 'TOOTH',
                            toothIds: sortTeethFdi(selectedTeeth),
                            quantity: sortTeethFdi(selectedTeeth).length || 1,
                          }
                          : scope === 'JAW'
                            ? {
                              id: nanoid(),
                              serviceId: s.id,
                              scope: 'JAW',
                              // Jaw is taken from the selected service itself.
                              jaw: s.jawRegion ?? 'BOTH',
                              quantity: 1,
                            }
                            : { id: nanoid(), serviceId: s.id, scope: 'GENERAL', quantity: 1 }
                      draft.procedures.push(proc)
                    })
                    if (s.category === 'TOOTH') setSelectedTeeth([])
                  }}
                >
                  Add
                </Button>
              </div>
            ))}
            {filteredServices.length === 0 && (
              <div className="muted" style={{ fontSize: 13, padding: 12, border: '1px dashed var(--border)', borderRadius: 12 }}>
                {t('planner.noServicesMatch')}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card
        className="planner-step-3"
        title={t('planner.step3')}
        subtitle={`${t('planner.planTotal')} ${formatMoney(planTotal, settings.currency)}`}
        right={
          <div className="staging-new-stage">
            <Input
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder={t('planner.newStagePlaceholder')}
            />
            <Button
              variant="primary"
              onClick={() => {
                const name = newStageName.trim() || `Этап ${stages.length + 1}`
                updatePlan(plan.id, (draft) => {
                  const maxOrder = draft.stages.reduce((m, s) => Math.max(m, s.order), 0)
                  draft.stages.push({ id: nanoid(), name, order: maxOrder + 1 })
                })
                setNewStageName('')
              }}
            >
              <Plus size={16} />
            </Button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 10 }}>
          <StageBlock
            title={t('planner.unstaged')}
            procedures={proceduresByStage.get('__unstaged__') ?? []}
            currency={settings.currency}
            planId={plan.id}
            stageId={undefined}
            stageOptions={stageOptions}
            serviceById={serviceById}
          />

          {stages.map((st) => (
            <StageBlock
              key={st.id}
              title={st.name}
              procedures={proceduresByStage.get(st.id) ?? []}
              currency={settings.currency}
              planId={plan.id}
              stageId={st.id}
              stageOptions={stageOptions}
              serviceById={serviceById}
            />
          ))}
        </div>

        <Divider />
        <div className="muted" style={{ fontSize: 12 }}>
          {t('planner.notes')}
        </div>
      </Card>
    </div>
  )
}

function StageBlock({
  title,
  procedures,
  currency,
  planId,
  stageId,
  stageOptions,
  serviceById,
}: {
  title: string
  procedures: PlanProcedure[]
  currency: string
  planId: string
  stageId?: string
  stageOptions: { value: string; label: string }[]
  serviceById: Map<string, { name: string; priceCents: number; icon: string }>
}) {
  const { t } = useTranslation()
  const updatePlan = useAppStore((s) => s.updatePlan)
  const numberingSystem = useAppStore((s) => s.settings.numberingSystem)

  const subtotal = procedures.reduce((sum, p) => {
    const svc = serviceById.get(p.serviceId)
    if (!svc) return sum
    return sum + svc.priceCents * (p.quantity || 1)
  }, 0)

  return (
    <div style={styles.stageBlock}>
      <div style={styles.stageHeader}>
        <div style={{ fontWeight: 750 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill>{formatMoney(subtotal, currency as any)}</Pill>
          {stageId ? (
            <Button
              title="Удалить этап"
              onClick={() => {
                updatePlan(planId, (draft) => {
                  draft.stages = draft.stages.filter((s) => s.id !== stageId)
                  draft.procedures.forEach((p) => {
                    if (p.stageId === stageId) p.stageId = undefined
                  })
                })
              }}
            >
              <Trash2 size={14} />
            </Button>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {procedures.map((p) => {
          const svc = serviceById.get(p.serviceId)
          return (
            <div key={p.id} className="proc-row">
              <div className="proc-row-icon" style={styles.procIcon}>{svc ? <Icon name={svc.icon} size={22} /> : '?'}</div>
              <div className="proc-row-main" style={{ minWidth: 0, overflow: 'hidden' }}>
                <div className="proc-row-title-row" style={{ flexWrap: 'nowrap' }}>
                  <span className="proc-row-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{svc?.name ?? t('planner.missingService')}</span>
                  <Pill>
                    {p.scope === 'TOOTH'
                      ? `${(p.toothIds?.length ?? 0) || 0} ${t('planner.tooth')}`
                      : p.scope === 'JAW'
                        ? `${t('planner.jaw')} ${p.jaw}`
                        : t('services.general')}
                  </Pill>
                </div>
                {p.scope === 'TOOTH' && p.toothIds?.length ? (
                  <div className="muted proc-row-teeth" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t('planner.teethLabel')}{' '}
                    {sortTeethFdi(p.toothIds)
                      .map((t) => toDisplayToothLabel(t, numberingSystem))
                      .join(', ')}
                  </div>
                ) : null}
              </div>

              <div className="proc-row-controls">
                <div className="proc-row-qty">
                  <Input
                    value={String(p.quantity || 1)}
                    inputMode="numeric"
                    onChange={(e) => {
                      const n = Math.max(1, Math.floor(Number(e.target.value || '1')))
                      updatePlan(planId, (draft) => {
                        const pp = draft.procedures.find((x) => x.id === p.id)
                        if (!pp) return
                        pp.quantity = n
                      })
                    }}
                    className="proc-row-qty-input"
                  />
                  <span className="muted proc-row-price">
                    {svc ? formatMoney(svc.priceCents * (p.quantity || 1), currency as any) : '—'}
                  </span>
                </div>
                <div className="proc-row-stage">
                  <Select
                    value={p.stageId ?? ''}
                    onChange={(v) => {
                      updatePlan(planId, (draft) => {
                        const pp = draft.procedures.find((x) => x.id === p.id)
                        if (!pp) return
                        pp.stageId = v || undefined
                      })
                    }}
                    options={stageOptions}
                  />
                </div>
                <div className="proc-row-actions">
                  <Button
                    title={t('planner.removeProcedure')}
                    onClick={() => {
                      updatePlan(planId, (draft) => {
                        draft.procedures = draft.procedures.filter((x) => x.id !== p.id)
                      })
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}

        {procedures.length === 0 && (
          <div className="muted" style={{ fontSize: 13, padding: 10, border: '1px dashed var(--border)', borderRadius: 12 }}>
            {t('planner.noProceduresInStage')}
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    fontSize: 12,
    color: 'var(--muted)',
    marginBottom: 6,
  },
  serviceIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    border: 'none',
    background: 'transparent',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--text)',
    overflow: 'hidden',
  },
  stageBlock: {
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 10,
    background: 'color-mix(in oklab, var(--panel2) 72%, transparent)',
  },
  stageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 8,
  },
  procIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    border: 'none',
    background: 'transparent',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--text)',
    overflow: 'hidden',
  },
}

