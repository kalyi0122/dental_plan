import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Save, Trash2, UserRoundSearch, X } from 'lucide-react'
import type { DoctorPatient } from '../auth/types'
import { useAuth } from '../auth/useAuth'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from '../i18n/useTranslation'
import { Avatar, Button, Card, Input, Pill } from '../components/ui'

export function DoctorsAdminPage() {
  const { t } = useTranslation()
  const { doctors, userDoctor, addDoctor, updateDoctor, deleteDoctor, getDoctorPatients } = useAuth()
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [doctorPatients, setDoctorPatients] = useState<DoctorPatient[]>([])
  const [patientsError, setPatientsError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [editName, setEditName] = useState('')
  const [editIsAdmin, setEditIsAdmin] = useState(false)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createIsAdmin, setCreateIsAdmin] = useState(false)
  const [showCreatePassword, setShowCreatePassword] = useState(false)

  const sortedDoctors = useMemo(
    () => [...doctors].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [doctors],
  )
  const selectedDoctor = sortedDoctors.find((doctor) => doctor.id === selectedDoctorId) ?? null

  const loadDoctorPatients = useCallback(
    async (doctorId: string) => {
      setPatientsError(null)
      try {
        const patients = await getDoctorPatients(doctorId)
        setDoctorPatients(patients)
      } catch (error) {
        const message = error instanceof Error ? error.message : t('admin.error.loadDoctorPatients')
        setPatientsError(message)
        setDoctorPatients([])
      }
    },
    [getDoctorPatients, t],
  )

  const selectDoctor = async (doctorId: string) => {
    const doctor = sortedDoctors.find((item) => item.id === doctorId)
    if (!doctor) return
    setSelectedDoctorId(doctorId)
    setEditName(doctor.full_name)
    setEditIsAdmin(doctor.is_admin)
    setFeedback(null)
    setBusy(true)
    await loadDoctorPatients(doctorId)
    setBusy(false)
  }

  useEffect(() => {
    if (!selectedDoctorId) return
    const doctorId = selectedDoctorId
    const channel = supabase
      .channel(`admin-doctor-patients-${doctorId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients', filter: `doctor_id=eq.${doctorId}` },
        () => {
          void loadDoctorPatients(doctorId)
        },
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadDoctorPatients, selectedDoctorId])

  useEffect(() => {
    if (!selectedDoctorId) return
    const doctorId = selectedDoctorId
    const refresh = () => {
      void loadDoctorPatients(doctorId)
    }
    const intervalId = window.setInterval(refresh, 5000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [loadDoctorPatients, selectedDoctorId])

  const resetCreateForm = () => {
    setCreateName('')
    setCreateEmail('')
    setCreatePassword('')
    setCreateIsAdmin(false)
    setShowCreatePassword(false)
  }

  const onCreateDoctor = async () => {
    setFeedback(null)
    setBusy(true)
    const result = await addDoctor({
      fullName: createName,
      email: createEmail,
      password: createPassword,
      isAdmin: createIsAdmin,
    })
    setBusy(false)
    resetCreateForm()
    if (!result.ok) {
      setFeedback(result.message)
      return
    }
    setIsCreateModalOpen(false)
  }

  const onUpdateDoctor = async () => {
    if (!selectedDoctor) return
    setFeedback(null)
    setBusy(true)
    const result = await updateDoctor(selectedDoctor.id, { fullName: editName, isAdmin: editIsAdmin })
    setBusy(false)
    if (!result.ok) {
      setFeedback(result.message)
      return
    }
    await selectDoctor(selectedDoctor.id)
  }

  const onDeleteDoctor = async (doctorId: string, fullName: string) => {
    if (!confirm(t('admin.deleteConfirm', { name: fullName }))) return
    setFeedback(null)
    setBusy(true)
    const result = await deleteDoctor(doctorId)
    setBusy(false)
    if (!result.ok) {
      setFeedback(result.message)
      return
    }
    if (doctorId === selectedDoctorId) {
      setSelectedDoctorId('')
      setDoctorPatients([])
    }
  }

  return (
    <>
      <div className="layout-two-col">
        <Card
          title={t('admin.doctorsTitle')}
          subtitle={`${sortedDoctors.length} ${t('admin.total')}`}
          right={
            <Button
              variant="primary"
              onClick={() => {
                resetCreateForm()
                setIsCreateModalOpen(true)
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Plus size={16} />
              {t('admin.createDoctor')}
            </Button>
          }
        >
          <div className="doctor-list" style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {sortedDoctors.map((doctor) => {
              const active = doctor.id === selectedDoctorId
              return (
                <div
                  key={doctor.id}
                  role="button"
                  tabIndex={0}
                  className="doctor-list-row"
                  onClick={() => void selectDoctor(doctor.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      void selectDoctor(doctor.id)
                    }
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: active
                      ? 'linear-gradient(180deg, color-mix(in oklab, var(--primary) 22%, var(--panel2)), color-mix(in oklab, var(--primary) 8%, var(--panel2)))'
                      : undefined,
                    borderColor: active ? 'color-mix(in oklab, var(--primary) 45%, var(--border))' : undefined,
                  }}
                >
                  <Avatar name={doctor.full_name} />
                  <div className="doctor-row-main" style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 650 }}>{doctor.full_name}</div>
                      {doctor.is_admin ? <Pill>{t('admin.pillAdmin')}</Pill> : null}
                      {doctor.id === userDoctor?.id ? <Pill>{t('admin.pillYou')}</Pill> : null}
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {doctor.email}
                    </div>
                  </div>
                  <div className="doctor-row-actions">
                    <button
                      type="button"
                      className="doctor-delete-btn"
                      title={t('admin.deleteDoctorTitle')}
                      aria-label={t('admin.deleteDoctorTitle')}
                      disabled={busy || doctor.id === userDoctor?.id}
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        void onDeleteDoctor(doctor.id, doctor.full_name)
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}

            {sortedDoctors.length === 0 ? (
              <div className="muted" style={{ padding: 16, textAlign: 'center' }}>
                {t('admin.noDoctors')}
              </div>
            ) : null}
          </div>
        </Card>

        <div style={{ display: 'grid', gap: 'var(--space-4)', minWidth: 0 }}>
          <Card title={t('admin.editDoctorTitle')} subtitle={t('admin.editDoctorSubtitle')}>
            {selectedDoctor ? (
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                <div>
                  <div style={styles.label}>{t('admin.fullName')}</div>
                  <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
                </div>
                <div>
                  <div style={styles.label}>{t('admin.email')}</div>
                  <Input value={selectedDoctor.email} disabled />
                </div>
                <label style={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={editIsAdmin}
                    onChange={(event) => setEditIsAdmin(event.target.checked)}
                  />
                  <span>{t('admin.doctorIsAdmin')}</span>
                </label>
                <Button
                  variant="primary"
                  disabled={busy || !editName.trim()}
                  onClick={() => void onUpdateDoctor()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                >
                  <Save size={16} />
                  {t('admin.saveChanges')}
                </Button>
              </div>
            ) : (
              <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pencil size={16} />
                {t('admin.selectDoctor')}
              </div>
            )}
            {feedback ? <div style={styles.errorBox}>{feedback}</div> : null}
          </Card>

          <Card
            title={t('admin.doctorPatientsTitle')}
            subtitle={selectedDoctor ? selectedDoctor.full_name : t('admin.noDoctorSelected')}
          >
            {patientsError ? <div style={styles.errorBox}>{patientsError}</div> : null}
            {!selectedDoctor ? (
              <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserRoundSearch size={16} />
                {t('admin.clickDoctorToLoadPatients')}
              </div>
            ) : doctorPatients.length === 0 ? (
              <div className="muted">{t('admin.noPatientsForDoctor')}</div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                {doctorPatients.map((patient) => (
                  <div key={patient.id} style={styles.patientRow}>
                    <Avatar name={patient.full_name} size={32} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{patient.full_name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {patient.phone || patient.email || '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {isCreateModalOpen ? (
        <div
          className="tooth-modal-overlay"
          onClick={() => {
            resetCreateForm()
            setIsCreateModalOpen(false)
          }}
        >
          <div
            className="tooth-modal"
            style={{ width: 'min(560px, 100%)', borderRadius: 20, padding: 20 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{t('admin.createDoctorAccount')}</div>
              <button
                type="button"
                style={styles.iconClose}
                onClick={() => {
                  resetCreateForm()
                  setIsCreateModalOpen(false)
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <div>
                <div style={styles.label}>{t('admin.fullName')}</div>
                <Input
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                  autoComplete="off"
                  name="create-doctor-name"
                />
              </div>
              <div>
                <div style={styles.label}>{t('admin.email')}</div>
                <Input
                  type="email"
                  value={createEmail}
                  onChange={(event) => setCreateEmail(event.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="off"
                  name="create-doctor-email"
                />
              </div>
              <div>
                <div style={styles.label}>{t('auth.password')}</div>
                <Input
                  type={showCreatePassword ? 'text' : 'password'}
                  minLength={6}
                  value={createPassword}
                  onChange={(event) => setCreatePassword(event.target.value)}
                  placeholder={t('admin.passwordPlaceholder')}
                  autoComplete="new-password"
                  name="create-doctor-password"
                />
                <label style={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={showCreatePassword}
                    onChange={(event) => setShowCreatePassword(event.target.checked)}
                  />
                  <span>{t('auth.showPassword')}</span>
                </label>
              </div>
              <label style={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={createIsAdmin}
                  onChange={(event) => setCreateIsAdmin(event.target.checked)}
                />
                <span>{t('admin.grantAdminRights')}</span>
              </label>
              <Button
                variant="primary"
                disabled={busy || !createName.trim() || !createEmail.trim() || createPassword.trim().length < 6}
                onClick={() => void onCreateDoctor()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
              >
                <Plus size={16} />
                {t('admin.createAccount')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    fontSize: 12,
    color: 'var(--muted)',
    marginBottom: 'var(--space-2)',
  },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
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
  patientRow: {
    display: 'grid',
    gridTemplateColumns: '32px 1fr',
    gap: 10,
    alignItems: 'center',
    padding: '8px 10px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    background: 'color-mix(in oklab, var(--panel2) 86%, transparent)',
  },
  iconClose: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'color-mix(in oklab, var(--panel2) 80%, transparent)',
    color: 'var(--text)',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
  },
}
