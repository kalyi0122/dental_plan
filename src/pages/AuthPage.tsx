import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { Button, Card, Input } from '../components/ui'

export function AuthPage() {
  const { authError, signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resultMessage, setResultMessage] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setResultMessage(null)
    setIsSubmitting(true)
    const result = await signInWithEmail(email, password)
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
        <Card title="Doctor Login" subtitle="Use email and password created by admin.">
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div>
              <div style={styles.label}>Email</div>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="doctor@clinic.com"
              />
            </div>

            <div>
              <div style={styles.label}>Password</div>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                placeholder="Password"
              />
            </div>

            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : 'Login'}
            </Button>

            {resultMessage ? <div style={styles.errorBox}>{resultMessage}</div> : null}
            {authError ? <div style={styles.errorBox}>{authError}</div> : null}
          </form>
        </Card>

        <Card title="Admin setup required" subtitle="Admin creates doctor accounts in modal window.">
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <div className="muted" style={{ fontSize: 14 }}>
              Open SQL Editor and run setup SQL. Then login as admin and create doctors with email/password.
            </div>
            <div style={styles.infoRow}>
              <ShieldAlert size={16} />
              <span>Use `admin@clinic.local` for first admin account row from setup SQL.</span>
            </div>
            <div style={styles.infoRow}>
              <ShieldAlert size={16} />
              <span>Disable email confirmation in Supabase Auth settings.</span>
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
