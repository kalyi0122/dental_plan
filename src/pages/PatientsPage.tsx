import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useTranslation } from '../i18n/useTranslation'
import { Avatar, Button, Card, Input, Pill } from '../components/ui'

export function PatientsPage() {
  const { t } = useTranslation()
  const patients = useAppStore((s) => s.patients)
  const upsertPatient = useAppStore((s) => s.upsertPatient)
  const removePatient = useAppStore((s) => s.removePatient)

  const [q, setQ] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return patients
    return patients.filter((p) => {
      const hay = `${p.fullName} ${p.phone ? formatPhoneForDisplay(p.phone) : '—'} ${p.email ?? ''}`.toLowerCase()
      return hay.includes(query)
    })
  }, [patients, q])

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
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {filtered.map((p) => (
            <div key={p.id} className="row-patient">
              <Avatar name={p.fullName} color={p.avatarColor} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Link to={`/patients/${p.id}`} style={{ fontWeight: 650 }}>
                    {p.fullName}
                  </Link>
                  {p.email ? <Pill>{p.email}</Pill> : null}
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                  {p.phone ? formatPhoneForDisplay(p.phone) : '—'}
                </div>
              </div>
              <div className="row-actions" style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Link to={`/patients/${p.id}`}>
                  <Button variant="primary">{t('patients.open')}</Button>
                </Link>
                <Button
                  variant="ghost"
                  title={t('patients.deletePatient')}
                  onClick={() => {
                    if (!confirm(t('patients.deleteConfirm', { name: p.fullName }))) return
                    removePatient(p.id)
                  }}
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

      <Card title={t('patients.addPatient')} subtitle={t('patients.addPatientSubtitle')}>
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
            onClick={() => {
              const name = fullName.trim()
              if (!name) return
              upsertPatient({ fullName: name, phone, email })
              setFullName('')
              setPhone('')
              setEmail('')
            }}
            style={{ display: 'inline-flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={16} />
            {t('patients.createPatient')}
          </Button>
          <div className="muted" style={{ fontSize: 12 }}>
            {t('patients.demoNote')}
          </div>
        </div>
      </Card>
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
}



