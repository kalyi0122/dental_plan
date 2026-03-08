import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2, X } from 'lucide-react'
import type { DoctorPatient } from '../auth/types'
import { useAuth } from '../auth/useAuth'
import {
  createDoctorPatient,
  deleteDoctorPatient,
  fetchDoctorPatients,
  mapDoctorPatientToPatient,
} from '../data/doctorPatients'
import { useAppStore } from '../store/useAppStore'
import { useTranslation } from '../i18n/useTranslation'
import { supabase } from '../lib/supabaseClient'
import { Avatar, Button, Card, Input, Pill } from '../components/ui'

export function PatientsPage() {
  const { t } = useTranslation()
  const { userDoctor } = useAuth()
  const patients = useAppStore((s) => s.patients)
  const setPatients = useAppStore((s) => s.setPatients)
  const upsertPatient = useAppStore((s) => s.upsertPatient)
  const removePatient = useAppStore((s) => s.removePatient)

  const [q, setQ] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const loadPatients = useCallback(
    async (doctorId: string) => {
      const { data, error } = await fetchDoctorPatients(doctorId)
      if (error) {
        setSyncError(error.message)
        return
      }
      const rows = (data as DoctorPatient[] | null) ?? []
      setPatients(rows.map(mapDoctorPatientToPatient))
      setSyncError(null)
    },
    [setPatients],
  )

  useEffect(() => {
    if (!userDoctor?.id) return
    let active = true
    void fetchDoctorPatients(userDoctor.id).then(({ data, error }) => {
      if (!active) return
      if (error) {
        setSyncError(error.message)
        return
      }
      const rows = (data as DoctorPatient[] | null) ?? []
      setPatients(rows.map(mapDoctorPatientToPatient))
      setSyncError(null)
    })
    return () => {
      active = false
    }
  }, [setPatients, userDoctor?.id])

  useEffect(() => {
    if (!userDoctor?.id) return
    const doctorId = userDoctor.id
    const channel = supabase
      .channel(`patients-realtime-${doctorId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients', filter: `doctor_id=eq.${doctorId}` },
        () => {
          void loadPatients(doctorId)
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadPatients, userDoctor?.id])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return patients
    return patients.filter((p) => {
      const hay = `${p.fullName} ${p.phone ? formatPhoneForDisplay(p.phone) : '-'} ${p.email ?? ''}`.toLowerCase()
      return hay.includes(query)
    })
  }, [patients, q])

  const onCreatePatient = async (options?: { closeAfter?: boolean }) => {
    const name = fullName.trim()
    if (!name || !userDoctor?.id) return

    const newPatient = {
      fullName: name,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
    }

    setIsBusy(true)
    setSyncError(null)
    const { data, error } = await createDoctorPatient(userDoctor.id, newPatient)
    setIsBusy(false)
    if (error) {
      setSyncError(error.message)
      await loadPatients(userDoctor.id)
      return
    }
    if (data) upsertPatient(mapDoctorPatientToPatient(data as DoctorPatient))

    setFullName('')
    setPhone('')
    setEmail('')
    if (options?.closeAfter) setIsCreateModalOpen(false)
    await loadPatients(userDoctor.id)
  }

  const renderCreatePatientForm = (closeAfterCreate = false) => (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div>
        <div style={styles.label}>{t('patients.fullName')}</div>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('patients.placeholderName')} />
      </div>
      <div>
        <div style={styles.label}>{t('patients.phone')}</div>
        <Input
          value={phone}
          onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
          placeholder={t('patients.placeholderPhone')}
        />
      </div>
      <div>
        <div style={styles.label}>{t('patients.email')}</div>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('patients.placeholderEmail')} />
      </div>
      <Button
        variant="primary"
        disabled={!userDoctor?.id || isBusy}
        onClick={() => void onCreatePatient({ closeAfter: closeAfterCreate })}
        style={{ display: 'inline-flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}
      >
        <Plus size={16} />
        {t('patients.createPatient')}
      </Button>
      <div className="muted" style={{ fontSize: 12 }}>
        {t('patients.supabaseNote')}
      </div>
      {syncError ? <div style={styles.errorBox}>{syncError}</div> : null}
    </div>
  )

  const onDeletePatient = async (patientId: string, patientName: string) => {
    if (!userDoctor?.id) return
    if (!confirm(t('patients.deleteConfirm', { name: patientName }))) return

    setIsBusy(true)
    setSyncError(null)
    removePatient(patientId)
    const { error } = await deleteDoctorPatient(userDoctor.id, patientId)
    setIsBusy(false)
    if (error) setSyncError(error.message)
    await loadPatients(userDoctor.id)
  }

  return (
    <div className="layout-two-col">
      <Card
        title={t('patients.title')}
        subtitle={`${patients.length} ${t('patients.total')}`}
        right={
          <div className="card-search-wrap">
            <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, opacity: 0.7 }} />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('patients.search')}
                style={{ paddingLeft: 36 }}
              />
            </div>
            <Button
              className="patients-mobile-add-trigger"
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Plus size={16} />
              {t('patients.addPatient')}
            </Button>
          </div>
        }
      >
        <div className="patient-list" style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {filtered.map((p) => (
            <div key={p.id} className="row-patient patient-list-row">
              <Avatar name={p.fullName} color={p.avatarColor} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Link to={`/patients/${p.id}`} style={{ fontWeight: 650 }}>
                    {p.fullName}
                  </Link>
                  {p.email ? <Pill>{p.email}</Pill> : null}
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                  {p.phone ? formatPhoneForDisplay(p.phone) : '-'}
                </div>
              </div>
              <div className="row-actions patient-row-actions">
                <Link className="patient-open-link" to={`/patients/${p.id}`}>
                  <Button className="patient-open-btn" variant="primary">
                    {t('patients.open')}
                  </Button>
                </Link>
                <Button
                  className="patient-delete-btn"
                  variant="danger"
                  title={t('patients.deletePatient')}
                  disabled={isBusy}
                  onClick={() => void onDeletePatient(p.id, p.fullName)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="muted" style={{ padding: 18, textAlign: 'center' }}>
              {t('patients.noMatch')}
            </div>
          )}
        </div>
      </Card>

      <Card className="patients-add-card" title={t('patients.addPatient')} subtitle={t('patients.addPatientSubtitle')}>
        {renderCreatePatientForm()}
      </Card>

      {isCreateModalOpen ? (
        <div className="tooth-modal-overlay patients-create-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="tooth-modal patients-create-modal" onClick={(event) => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{t('patients.addPatient')}</div>
              <button
                type="button"
                className="patients-create-close"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label={t('common.cancel')}
              >
                <X size={16} />
              </button>
            </div>
            {renderCreatePatientForm(true)}
          </div>
        </div>
      ) : null}
    </div>
  )
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

function formatPhoneInput(value: string) {
  const hasPlus = value.trim().startsWith('+')
  const digits = value.replace(/\D/g, '')
  if (!digits) return hasPlus ? '+' : ''

  const apply = (parts: number[]) => {
    let cursor = 0
    const chunks: string[] = []
    for (const len of parts) {
      if (cursor >= digits.length) break
      chunks.push(digits.slice(cursor, cursor + len))
      cursor += len
    }
    if (cursor < digits.length) chunks.push(digits.slice(cursor))
    return `${hasPlus ? '+' : ''}${chunks.join(' ')}`
  }

  if (digits.startsWith('996')) return apply([3, 3, 3, 3])
  if (digits.startsWith('7')) return apply([1, 3, 3, 2, 2])
  if (digits.startsWith('1')) return apply([1, 3, 3, 4])
  if (digits.startsWith('44')) return apply([2, 2, 4, 4])
  return `${hasPlus ? '+' : ''}${digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()}`
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    fontSize: 12,
    color: 'var(--muted)',
    marginBottom: 'var(--space-2)',
  },
  errorBox: {
    borderRadius: 'var(--radius-md)',
    border: '1px solid color-mix(in oklab, var(--danger) 45%, var(--border))',
    background: 'color-mix(in oklab, var(--danger) 18%, var(--panel))',
    color: 'var(--text)',
    padding: '10px 12px',
    fontSize: 13,
  },
}
