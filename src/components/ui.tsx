import { forwardRef } from 'react'

export function Card({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title?: string
  subtitle?: string
  right?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={className} style={styles.card}>
      {(title || subtitle || right) && (
        <header className="card-header-wrap" style={styles.cardHeader}>
          <div style={{ minWidth: 0 }}>
            {title && <div style={styles.cardTitle}>{title}</div>}
            {subtitle && (
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                {subtitle}
              </div>
            )}
          </div>
          {right && <div className="card-header-right" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{right}</div>}
        </header>
      )}
      <div>{children}</div>
    </section>
  )
}

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }
>(function Button({ variant = 'ghost', style, ...props }, ref) {
  return (
    <button
      ref={ref}
      {...props}
      style={{
        ...styles.button,
        ...(variant === 'primary' ? styles.buttonPrimary : null),
        ...(variant === 'danger' ? styles.buttonDanger : null),
        ...style,
      }}
    />
  )
})

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ style, ...props }, ref) {
    return <input ref={ref} {...props} style={{ ...styles.input, ...style }} />
  },
)

export function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.select}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...styles.textarea, ...props.style }} />
}

export function Pill({ children }: { children: React.ReactNode }) {
  return <span style={styles.pill}>{children}</span>
}

export function Divider() {
  return <div style={styles.divider} />
}

export function Avatar({
  name,
  color,
  size = 36,
}: {
  name: string
  color?: string
  size?: number
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <div
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(10, Math.round(size / 3)),
        background: `linear-gradient(180deg, ${color ?? 'var(--primary)'}, color-mix(in oklab, ${color ?? 'var(--primary)'
          } 22%, var(--panel)))`,
        display: 'grid',
        placeItems: 'center',
        color: 'white',
        fontWeight: 700,
        border: '1px solid var(--border)',
        flex: '0 0 auto',
      }}
    >
      <span style={{ fontSize: Math.max(12, Math.round(size / 3)) }}>{initials || '?'}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--panel)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)',
    padding: 'var(--space-5)',
    minWidth: 0,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  },
  cardTitle: {
    fontWeight: 700,
    letterSpacing: '0.02em',
    fontSize: '1rem',
  },
  button: {
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'transparent',
    padding: '10px 16px',
    minHeight: 40,
    cursor: 'pointer',
    color: 'var(--text)',
    fontSize: 14,
    fontWeight: 500,
    transition: 'border-color 0.15s ease, background 0.15s ease, color 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
  },
  buttonPrimary: {
    background: 'linear-gradient(180deg, color-mix(in oklab, var(--primary) 95%, white), var(--primary))',
    border: '1px solid color-mix(in oklab, var(--primary) 55%, var(--border))',
    color: 'white',
  },
  buttonDanger: {
    background: 'linear-gradient(180deg, color-mix(in oklab, var(--danger) 90%, white), var(--danger))',
    border: '1px solid color-mix(in oklab, var(--danger) 55%, var(--border))',
    color: 'white',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    minHeight: 40,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'color-mix(in oklab, var(--panel2) 85%, transparent)',
    outline: 'none',
    fontSize: 14,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    minHeight: 40,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'color-mix(in oklab, var(--panel2) 85%, transparent)',
    fontSize: 14,
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    minHeight: 120,
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'color-mix(in oklab, var(--panel2) 85%, transparent)',
    resize: 'vertical',
    fontSize: 14,
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid var(--border)',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--muted)',
    background: 'color-mix(in oklab, var(--panel2) 70%, transparent)',
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    margin: 'var(--space-4) 0',
  },
}

