import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Save, Trash2, UserRoundSearch, X } from 'lucide-react'
import type { DoctorPatient } from '../auth/types'
import { useAuth } from '../auth/useAuth'
import { supabase } from '../lib/supabaseClient'
import { Avatar, Button, Card, Input, Pill } from '../components/ui'

export function DoctorsAdminPage() {
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
        const message = error instanceof Error ? error.message : 'Failed to load doctor patients.'
        setPatientsError(message)
        setDoctorPatients([])
      }
    },
    [getDoctorPatients],
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
    if (!result.ok) {
      setFeedback(result.message)
      return
    }
    setCreateName('')
    setCreateEmail('')
    setCreatePassword('')
    setCreateIsAdmin(false)
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
    if (!confirm(`Delete doctor "${fullName}"?`)) return
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
          title="Doctors"
          subtitle={`${sortedDoctors.length} total`}
          right={
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Plus size={16} />
              Create Doctor
            </Button>
          }
        >
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {sortedDoctors.map((doctor) => {
              const active = doctor.id === selectedDoctorId
              return (
                <div
                  key={doctor.id}
                  role="button"
                  tabIndex={0}
                  className="row-patient"
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
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 650 }}>{doctor.full_name}</div>
                      {doctor.is_admin ? <Pill>Admin</Pill> : null}
                      {doctor.id === userDoctor?.id ? <Pill>You</Pill> : null}
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {doctor.email}
                    </div>
                  </div>
                  <div className="row-actions" style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Button
                      variant="danger"
                      title="Delete doctor"
                      disabled={busy || doctor.id === userDoctor?.id}
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        void onDeleteDoctor(doctor.id, doctor.full_name)
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              )
            })}

            {sortedDoctors.length === 0 ? (
              <div className="muted" style={{ padding: 16, textAlign: 'center' }}>
                No doctors in database.
              </div>
            ) : null}
          </div>
        </Card>

        <div style={{ display: 'grid', gap: 'var(--space-4)', minWidth: 0 }}>
          <Card title="Edit Doctor" subtitle="Update selected doctor profile">
            {selectedDoctor ? (
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                <div>
                  <div style={styles.label}>Full name</div>
                  <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
                </div>
                <div>
                  <div style={styles.label}>Email</div>
                  <Input value={selectedDoctor.email} disabled />
                </div>
                <label style={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={editIsAdmin}
                    onChange={(event) => setEditIsAdmin(event.target.checked)}
                  />
                  <span>Doctor is admin</span>
                </label>
                <Button
                  variant="primary"
                  disabled={busy || !editName.trim()}
                  onClick={() => void onUpdateDoctor()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                >
                  <Save size={16} />
                  Save changes
                </Button>
              </div>
            ) : (
              <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pencil size={16} />
                Select a doctor from the list.
              </div>
            )}
            {feedback ? <div style={styles.errorBox}>{feedback}</div> : null}
          </Card>

          <Card title="Doctor Patients" subtitle={selectedDoctor ? selectedDoctor.full_name : 'No doctor selected'}>
            {patientsError ? <div style={styles.errorBox}>{patientsError}</div> : null}
            {!selectedDoctor ? (
              <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserRoundSearch size={16} />
                Click a doctor to load their patients.
              </div>
            ) : doctorPatients.length === 0 ? (
              <div className="muted">No patients for this doctor.</div>
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
        <div className="tooth-modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div
            className="tooth-modal"
            style={{ width: 'min(560px, 100%)', borderRadius: 20, padding: 20 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Create Doctor Account</div>
              <button type="button" style={styles.iconClose} onClick={() => setIsCreateModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <div>
                <div style={styles.label}>Full name</div>
                <Input value={createName} onChange={(event) => setCreateName(event.target.value)} />
              </div>
              <div>
                <div style={styles.label}>Email</div>
                <Input
                  type="email"
                  value={createEmail}
                  onChange={(event) => setCreateEmail(event.target.value)}
                  placeholder="doctor@clinic.com"
                />
              </div>
              <div>
                <div style={styles.label}>Password</div>
                <Input
                  type="password"
                  minLength={6}
                  value={createPassword}
                  onChange={(event) => setCreatePassword(event.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              <label style={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={createIsAdmin}
                  onChange={(event) => setCreateIsAdmin(event.target.checked)}
                />
                <span>Grant admin rights</span>
              </label>
              <Button
                variant="primary"
                disabled={busy || !createName.trim() || !createEmail.trim() || createPassword.trim().length < 6}
                onClick={() => void onCreateDoctor()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
              >
                <Plus size={16} />
                Create account
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
