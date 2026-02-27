import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileDown, Plus } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '../store/useAppStore'
import { useTranslation } from '../i18n/useTranslation'
import { formatMoney } from '../domain/money'
import { Avatar, Button, Card, Pill, Select } from '../components/ui'
import { TreatmentPlanner } from '../components/TreatmentPlanner'
import { generateQuotePdf } from '../pdf/generateQuotePdf'

export function PatientDetailPage() {
  const { patientId } = useParams()
  const { t } = useTranslation()
  const { hydrated, patients, allPlans, createPlanForPatient, settings, services } = useAppStore(
    useShallow((s) => ({
      hydrated: s._hydrated,
      patients: s.patients,
      allPlans: s.plans,
      createPlanForPatient: s.createPlanForPatient,
      settings: s.settings,
      services: s.services,
    })),
  )

  const patient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId],
  )
  const plans = useMemo(
    () => allPlans.filter((p) => p.patientId === patientId),
    [allPlans, patientId],
  )

  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => plans[0]?.id ?? '')
  const selectedPlan = useMemo(() => plans.find((p) => p.id === selectedPlanId) ?? plans[0], [plans, selectedPlanId])

  // Update selectedPlanId when plans change
  useEffect(() => {
    if (plans.length > 0 && (!selectedPlanId || !plans.find((p) => p.id === selectedPlanId))) {
      setSelectedPlanId(plans[0].id)
    } else if (plans.length === 0) {
      setSelectedPlanId('')
    }
  }, [plans, selectedPlanId])

  const totals = useMemo(() => {
    if (!selectedPlan) return { totalCents: 0 }
    const serviceById = new Map(services.map((s) => [s.id, s]))
    const totalCents = selectedPlan.procedures.reduce((sum, pr) => {
      const svc = serviceById.get(pr.serviceId)
      if (!svc) return sum
      return sum + svc.priceCents * (pr.quantity || 1)
    }, 0)
    return { totalCents }
  }, [selectedPlan, services])

  // Wait for store to rehydrate from localStorage before deciding "not found"
  if (!hydrated) {
    return (
      <Card title={t('patient.loading')} subtitle={t('patient.loadingSubtitle')}>
        <div className="muted" style={{ padding: '8px 0' }}>{t('patient.pleaseWait')}</div>
      </Card>
    )
  }

  if (!patient) {
    return (
      <Card title={t('patient.notFound')} subtitle={t('patient.notFoundSubtitle')}>
        <Link to="/patients">
          <Button variant="primary">{t('patient.backToPatients')}</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
      <Card
        title={patient.fullName}
        subtitle={t('patient.workspace')}
        right={
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <Pill>{settings.numberingSystem === 'FDI' ? 'FDI 11–48' : 'Universal 1–32'}</Pill>
            <Pill>{settings.currency}</Pill>
          </div>
        }
      >
        <div className="patient-detail-top">
          <div className="patient-detail-meta">
            <Avatar name={patient.fullName} color={patient.avatarColor} size={44} />
            <div>
              <div className="muted" style={{ fontSize: 13 }}>
                {patient.phone ?? '—'} • {patient.email ?? '—'}
              </div>
              <div style={{ marginTop: 6, fontWeight: 600, fontSize: 15 }}>
                {t('patient.currentTotal')} {formatMoney(totals.totalCents, settings.currency)}
              </div>
            </div>
          </div>

          <div className="patient-detail-actions">
            {plans.length > 0 && (
              <div className="patient-detail-plan-select">
                <Select
                  value={selectedPlan?.id ?? ''}
                  onChange={(v) => setSelectedPlanId(v)}
                  options={plans.map((p) => ({ value: p.id, label: p.title }))}
                />
              </div>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                const id = createPlanForPatient(patient.id)
                setSelectedPlanId(id)
              }}
            >
              <Plus size={16} />
              {t('patient.newPlan')}
            </Button>
            {selectedPlan && (
              <Button
                variant="primary"
                onClick={async () => {
                  if (!selectedPlan) return
                  await generateQuotePdf({ patient, plan: selectedPlan, services, settings })
                }}
              >
                <FileDown size={16} />
                {t('patient.exportPdf')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {selectedPlan ? (
        <TreatmentPlanner plan={selectedPlan} />
      ) : (
        <Card title={t('patient.noPlan')} subtitle={t('patient.noPlanSubtitle')}>
          <Button
            variant="primary"
            onClick={() => {
              const id = createPlanForPatient(patient.id)
              setSelectedPlanId(id)
            }}
          >
            {t('patient.createFirstPlan')}
          </Button>
        </Card>
      )}
    </div>
  )
}

