import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { Avatar, Button, Card, Input, Pill } from '../components/ui'

export function DoctorsAdminPage() {
  const { doctors, userDoctor, addDoctor, deleteDoctor, refreshDoctors } = useAuth()
  const [fullName, setFullName] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void refreshDoctors()
  }, [refreshDoctors])

  const sortedDoctors = useMemo(
    () => [...doctors].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [doctors],
  )

  const onCreateDoctor = async () => {
    setFeedback(null)
    setBusy(true)
    const result = await addDoctor(fullName)
    setBusy(false)
    if (!result.ok) {
      setFeedback(result.message)
      return
    }
    setFullName('')
  }

  const onDeleteDoctor = async (doctorId: string, fullNameValue: string) => {
    if (!confirm(`Delete doctor "${fullNameValue}"?`)) return
    setFeedback(null)
    setBusy(true)
    const result = await deleteDoctor(doctorId)
    setBusy(false)
    if (!result.ok) setFeedback(result.message)
  }

  return (
    <div className="layout-two-col">
      <Card title="Doctors" subtitle={`${sortedDoctors.length} total doctors`}>
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {sortedDoctors.map((doctor) => (
            <div key={doctor.id} className="row-patient">
              <Avatar name={doctor.full_name} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 650 }}>{doctor.full_name}</div>
                  {doctor.is_admin ? <Pill>Admin</Pill> : null}
                  {doctor.id === userDoctor?.id ? <Pill>You</Pill> : null}
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                  Created: {new Date(doctor.created_at).toLocaleString()}
                </div>
              </div>
              <div className="row-actions" style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button
                  variant="danger"
                  title="Delete doctor"
                  disabled={busy || doctor.id === userDoctor?.id}
                  onClick={() => onDeleteDoctor(doctor.id, doctor.full_name)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}

          {sortedDoctors.length === 0 ? (
            <div className="muted" style={{ padding: 18, textAlign: 'center' }}>
              No doctors in table.
            </div>
          ) : null}
        </div>
      </Card>

      <Card title="Add doctor" subtitle="Create new doctor profile for login list">
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div>
            <div style={styles.label}>Full name</div>
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="e.g. Anna Petrova"
            />
          </div>

          <Button
            variant="primary"
            onClick={onCreateDoctor}
            disabled={busy || !fullName.trim()}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Plus size={16} />
            Add doctor
          </Button>

          <div className="muted" style={{ fontSize: 12 }}>
            New doctor appears in login screen immediately.
          </div>

          {feedback ? <div style={styles.errorBox}>{feedback}</div> : null}
        </div>
      </Card>
    </div>
  )
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
