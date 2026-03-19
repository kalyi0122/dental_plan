import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { formatMoney } from '../domain/money'
import type { TreatmentPlan } from '../domain/types'
import { supabase } from '../lib/supabaseClient'
import { Avatar, Button, Card, Pill } from '../components/ui'
import { fetchPatientPlans, mapRowToTreatmentPlan } from '../data/treatmentPlans'
import { generateQuotePdfBlob } from '../pdf/generateQuotePdf'

type AdminPatient = {
  id: string
  doctor_id: string
  full_name: string
  phone: string | null
  email: string | null
  avatar_color: string | null
  created_at: string
  doctor?: {
    id: string
    full_name: string
    email: string
  } | null
}

export function AdminPatientDetailPage() {
  const { patientId } = useParams()
  const { t } = useTranslation()
  const services = useAppStore((s) => s.services)
  const settings = useAppStore((s) => s.settings)
  const serviceById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services])
  const [patient, setPatient] = useState<AdminPatient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [plansLoading, setPlansLoading] = useState(true)
  const [plansError, setPlansError] = useState<string | null>(null)
  const [plans, setPlans] = useState<TreatmentPlan[]>([])
  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)

  useEffect(() => {
    if (!patientId) return
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      const { data, error: loadError } = await supabase
        .from('patients')
        .select('id, doctor_id, full_name, phone, email, avatar_color, created_at, doctor:doctors(id, full_name, email)')
        .eq('id', patientId)
        .maybeSingle()
      if (!active) return
      if (loadError) {
        setError(loadError.message)
        setPatient(null)
        setLoading(false)
        return
      }
      setPatient((data as AdminPatient | null) ?? null)
      setLoading(false)
    }
    void load()
    return () => {
      active = false
    }
  }, [patientId])

  const loadPlans = useCallback(async () => {
    if (!patientId) return
    setPlansLoading(true)
    setPlansError(null)
    const { data, error: loadError } = await fetchPatientPlans(patientId)
    if (loadError) {
      setPlansError(loadError.message)
      setPlans([])
      setPlansLoading(false)
      return
    }
    const rows = (data as any[] | null) ?? []
    setPlans(rows.map((row) => mapRowToTreatmentPlan(row)))
    setPlansLoading(false)
  }, [patientId])

  useEffect(() => {
    if (!patientId) return
    let active = true
    const run = async () => {
      if (!active) return
      await loadPlans()
    }
    void run()
    return () => {
      active = false
    }
  }, [loadPlans, patientId])

  useEffect(() => {
    if (!patientId) return
    const channel = supabase
      .channel(`admin-plans-${patientId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'treatment_plans', filter: `patient_id=eq.${patientId}` },
        () => {
          void loadPlans()
        },
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadPlans, patientId])

  const subtitle = useMemo(() => {
    const doctorName = patient?.doctor?.full_name ?? '-'
    return `${t('common.doctor')}: ${doctorName}`
  }, [patient?.doctor?.full_name, t])

  if (loading) {
    return (
      <Card title={t('patient.loading')} subtitle={t('patient.loadingSubtitle')}>
        <div className="muted" style={{ padding: '8px 0' }}>
          {t('patient.pleaseWait')}
        </div>
      </Card>
    )
  }

  if (!patient) {
    return (
      <Card title={t('patient.notFound')} subtitle={t('patient.notFoundSubtitle')}>
        <Link to="/admin/doctors">
          <Button variant="primary">{t('admin.patientBack')}</Button>
        </Link>
        {error ? <div style={styles.errorBox}>{error}</div> : null}
      </Card>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
      <Card
        title={patient.full_name}
        subtitle={subtitle}
        right={
          <Link to="/admin/doctors">
            <Button variant="ghost">{t('admin.patientBack')}</Button>
          </Link>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div style={styles.patientTop}>
            <div style={styles.patientMeta}>
              <Avatar name={patient.full_name} color={patient.avatar_color ?? undefined} size={46} />
              <div style={{ minWidth: 0 }}>
                <div className="muted" style={{ fontSize: 13 }}>
                  {patient.phone ? formatPhoneForDisplay(patient.phone) : '-'} • {patient.email ?? '-'}
                </div>
                {patient.doctor?.full_name ? <Pill>{patient.doctor.full_name}</Pill> : null}
              </div>
            </div>
          </div>
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>{t('patients.fullName')}</div>
              <div>{patient.full_name}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>{t('patients.phone')}</div>
              <div>{patient.phone ? formatPhoneForDisplay(patient.phone) : '-'}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>{t('patients.email')}</div>
              <div>{patient.email ?? '-'}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>{t('admin.patientCreatedAt')}</div>
              <div>{formatDateForDisplay(patient.created_at)}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>{t('admin.patientId')}</div>
              <div style={styles.mono}>{patient.id}</div>
            </div>
          </div>
        </div>
      </Card>

      <Card title={t('admin.patientPlansTitle')} subtitle={t('admin.patientPlansSubtitle')}>
        {plansError ? <div style={styles.errorBox}>{plansError}</div> : null}
        {pdfError ? <div style={styles.errorBox}>{pdfError}</div> : null}
        {plansLoading ? (
          <div className="muted">{t('admin.plansLoading')}</div>
        ) : plans.length === 0 ? (
          <div className="muted">{t('admin.noPlansForPatient')}</div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {plans.map((plan) => {
              const totalCents = plan.procedures.reduce((sum, p) => {
                const svc = serviceById.get(p.serviceId)
                if (!svc) return sum
                return sum + svc.priceCents * (p.quantity || 1)
              }, 0)

              return (
                <div key={plan.id} style={styles.planCard}>
                  <div style={styles.planHeader}>
                    <div style={{ fontWeight: 700 }}>{plan.title}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {t('admin.planUpdatedAt')} {formatDateForDisplay(plan.updatedAt)}
                    </div>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                    {t('planner.planTotal')} {formatMoney(totalCents, settings.currency)}
                  </div>
                  <Button
                    variant="primary"
                    onClick={async () => {
                      if (!patient) return
                      setPdfError(null)
                      setPdfBusyId(plan.id)
                      try {
                        const { blob, fileName } = await generateQuotePdfBlob({
                          patient: {
                            id: patient.id,
                            fullName: patient.full_name,
                            phone: patient.phone ?? undefined,
                            email: patient.email ?? undefined,
                            avatarColor: patient.avatar_color ?? undefined,
                          },
                          plan,
                          services,
                          settings,
                        })
                        const path = `patients/${patient.id}/plans/${plan.id}.pdf`
                        const { error: uploadError } = await supabase.storage
                          .from('patient-pdfs')
                          .upload(path, blob, {
                            upsert: true,
                            contentType: 'application/pdf',
                            cacheControl: '3600',
                          })
                        if (uploadError) throw uploadError
                        const { data: signed, error: signedError } = await supabase.storage
                          .from('patient-pdfs')
                          .createSignedUrl(path, 60 * 10)
                        if (signedError || !signed?.signedUrl) {
                          throw signedError ?? new Error('No signed URL')
                        }
                        window.open(signed.signedUrl, '_blank', 'noopener')
                      } catch (err) {
                        const message = err instanceof Error ? err.message : t('admin.pdfFailed')
                        setPdfError(message)
                      } finally {
                        setPdfBusyId(null)
                      }
                    }}
                    disabled={pdfBusyId === plan.id}
                    style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}
                  >
                    {pdfBusyId === plan.id ? t('admin.pdfUploading') : t('patient.exportPdf')}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

function formatDateForDisplay(value: string | number) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    const numeric = Number(value)
    if (!Number.isNaN(numeric)) return new Date(numeric).toLocaleString()
    return String(value)
  }
  return date.toLocaleString()
}

function formatPhoneForDisplay(value: string) {
  const raw = value.trim()
  const hasPlus = raw.startsWith('+')
  const digits = raw.replace(/\D/g, '')
  if (!digits) return raw

  if (digits.startsWith('996') && digits.length >= 12) {
    return `${hasPlus ? '+' : ''}${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`
  }
  if (digits.startsWith('7') && digits.length >= 11) {
    return `${hasPlus ? '+' : ''}${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`
  }
  if (digits.startsWith('44') && digits.length >= 12) {
    return `${hasPlus ? '+' : ''}${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`
  }
  if (digits.startsWith('1') && digits.length >= 11) {
    return `${hasPlus ? '+' : ''}${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`
  }

  const grouped = digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
  return `${hasPlus ? '+' : ''}${grouped}`
}

const styles: Record<string, React.CSSProperties> = {
  patientTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-4)',
    flexWrap: 'wrap',
  },
  patientMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--space-3)',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'color-mix(in oklab, var(--panel2) 82%, transparent)',
  },
  planCard: {
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-3)',
    background: 'color-mix(in oklab, var(--panel2) 86%, transparent)',
  },
  planHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  detailItem: {
    display: 'grid',
    gap: 6,
    minWidth: 0,
  },
  detailLabel: {
    fontSize: 12,
    color: 'var(--muted)',
  },
  mono: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 12,
  },
  errorBox: {
    marginTop: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid color-mix(in oklab, var(--danger) 45%, var(--border))',
    background: 'color-mix(in oklab, var(--danger) 18%, var(--panel))',
    color: 'var(--text)',
    padding: '10px 12px',
    fontSize: 13,
  },
}
