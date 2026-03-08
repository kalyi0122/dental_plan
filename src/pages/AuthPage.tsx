import { useMemo, useState } from 'react'
import { CheckCircle2, ShieldAlert, Stethoscope } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { Button, Card, Input } from '../components/ui'

export function AuthPage() {
  const { doctors, authError, signInOrRegisterDoctor } = useAuth()
  const [doctorId, setDoctorId] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resultMessage, setResultMessage] = useState<string | null>(null)

  const activeDoctorId = useMemo(() => {
    if (!doctors.length) return ''
    const hasCurrent = doctors.some((doctor) => doctor.id === doctorId)
    return hasCurrent ? doctorId : doctors[0]!.id
  }, [doctorId, doctors])

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === activeDoctorId) ?? null,
    [activeDoctorId, doctors],
  )

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setResultMessage(null)
    setIsSubmitting(true)
    const result = await signInOrRegisterDoctor(activeDoctorId, password)
    setIsSubmitting(false)
    if (!result.ok) {
      setResultMessage(result.message)
      return
    }
    setPassword('')
  }

  return (
    <div className="auth-screen">
      <div className="auth-grid">
        <Card
          title="Doctor Login"
          subtitle="Select your doctor profile and use one password. First login will create account automatically."
        >
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div style={styles.label}>Doctor</div>
            <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
              {doctors.map((doctor) => {
                const active = doctor.id === activeDoctorId
                return (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => setDoctorId(doctor.id)}
                    style={{
                      ...styles.doctorButton,
                      ...(active ? styles.doctorButtonActive : null),
                    }}
                  >
                    <Stethoscope size={16} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{doctor.full_name}</span>
                    {active ? <CheckCircle2 size={16} /> : null}
                  </button>
                )
              })}
            </div>

            {doctors.length === 0 ? (
              <div style={styles.errorBox}>No doctors found. Add at least one row in Supabase table "doctors".</div>
            ) : null}

            <div>
              <div style={styles.label}>Password</div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                placeholder="At least 6 characters"
              />
            </div>

            <Button variant="primary" type="submit" disabled={isSubmitting || !selectedDoctor}>
              {isSubmitting ? 'Please wait...' : 'Login / Register'}
            </Button>

            {resultMessage ? <div style={styles.errorBox}>{resultMessage}</div> : null}
            {authError ? <div style={styles.errorBox}>{authError}</div> : null}
          </form>
        </Card>

        <Card title="Admin setup required" subtitle="One doctor must be marked as admin in Supabase.">
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <div className="muted" style={{ fontSize: 14 }}>
              To use admin panel, configure Supabase table and policies first.
            </div>
            <div style={styles.infoRow}>
              <ShieldAlert size={16} />
              <span>Open SQL Editor and run the setup SQL from `supabase/setup.sql`.</span>
            </div>
            <div style={styles.infoRow}>
              <ShieldAlert size={16} />
              <span>Set `is_admin=true` for your own doctor row.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    fontSize: 12,
    color: 'var(--muted)',
    marginBottom: 8,
  },
  doctorButton: {
    border: '1px solid var(--border)',
    background: 'color-mix(in oklab, var(--panel2) 82%, transparent)',
    color: 'var(--text)',
    borderRadius: 'var(--radius-md)',
    minHeight: 44,
    padding: '8px 12px',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    width: '100%',
    cursor: 'pointer',
  },
  doctorButtonActive: {
    borderColor: 'color-mix(in oklab, var(--primary) 50%, var(--border))',
    background:
      'linear-gradient(180deg, color-mix(in oklab, var(--primary) 20%, var(--panel2)), color-mix(in oklab, var(--primary) 8%, var(--panel2)))',
  },
  errorBox: {
    borderRadius: 'var(--radius-md)',
    border: '1px solid color-mix(in oklab, var(--danger) 45%, var(--border))',
    background: 'color-mix(in oklab, var(--danger) 18%, var(--panel))',
    color: 'var(--text)',
    padding: '10px 12px',
    fontSize: 13,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
  },
}
