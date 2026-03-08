import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { Button, Card, Input } from '../components/ui'
import { useTranslation } from '../i18n/useTranslation'

export function AuthPage() {
  const { t } = useTranslation()
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
        <Card title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div>
              <div style={styles.label}>{t('auth.email')}</div>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            <div>
              <div style={styles.label}>{t('auth.password')}</div>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                placeholder={t('auth.passwordPlaceholder')}
              />
            </div>

            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('auth.pleaseWait') : t('auth.loginButton')}
            </Button>

            {resultMessage ? <div style={styles.errorBox}>{resultMessage}</div> : null}
            {authError ? <div style={styles.errorBox}>{authError}</div> : null}
          </form>
        </Card>

        <Card title={t('auth.setupTitle')} subtitle={t('auth.setupSubtitle')}>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <div className="muted" style={{ fontSize: 14 }}>
              {t('auth.setupInfo')}
            </div>
            <div style={styles.infoRow}>
              <ShieldAlert size={16} />
              <span>{t('auth.setupAdminHint')}</span>
            </div>
            <div style={styles.infoRow}>
              <ShieldAlert size={16} />
              <span>{t('auth.setupDisableConfirmHint')}</span>
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
