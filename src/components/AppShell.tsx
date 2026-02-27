import { useEffect, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Users, Wrench, Settings as SettingsIcon } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useTranslation } from '../i18n/useTranslation'
import { LanguageSwitcher } from './LanguageSwitcher'

const navItems = [
  { to: '/patients', labelKey: 'nav.patients', icon: Users },
  { to: '/services', labelKey: 'nav.services', icon: Wrench },
  { to: '/settings', labelKey: 'nav.settings', icon: SettingsIcon },
]

function resolveTheme(theme: 'system' | 'light' | 'dark') {
  if (theme === 'light' || theme === 'dark') return theme
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.settings.theme)
  const location = useLocation()
  const { t } = useTranslation()

  const resolved = useMemo(() => resolveTheme(theme), [theme])

  useEffect(() => {
    document.documentElement.dataset.theme = resolved
  }, [resolved])

  // Update theme when system setting changes
  useEffect(() => {
    if (theme !== 'system') return
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mql) return
    const onChange = () => (document.documentElement.dataset.theme = resolveTheme('system'))
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [theme])

  return (
    <div className="app-shell" style={styles.shellBase}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logo} aria-hidden />
          <div>
            <div style={{ fontWeight: 700, letterSpacing: 0.2 }}>{t('app.title')}</div>
            <div style={{ fontSize: 12 }} className="muted">
              {t('app.subtitle')}
            </div>
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map((it) => {
            const Icon = it.icon
            return (
              <NavLink
                key={it.to}
                to={it.to}
                style={({ isActive }) => ({
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : null),
                })}
              >
                <Icon size={18} />
                <span>{t(it.labelKey)}</span>
              </NavLink>
            )
          })}
        </nav>

        <div style={styles.hint} className="muted">
          {t('hint.search')}
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: '0.01em' }}>
              {location.pathname.startsWith('/patients')
                ? t('topbar.patients')
                : location.pathname.startsWith('/services')
                  ? t('topbar.services')
                  : t('topbar.settings')}
            </div>
            <div className="muted topbar-subtitle" style={{ fontSize: 13 }}>
              {t('topbar.hint')}
            </div>
          </div>
          <LanguageSwitcher />
        </div>
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  shellBase: {
    minHeight: 0,
  },
  sidebar: {
    background: 'var(--panel)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)',
    padding: 'var(--space-5)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    background: 'linear-gradient(180deg, color-mix(in oklab, var(--panel2) 92%, transparent), transparent)',
    border: '1px solid var(--border)',
    marginBottom: 'var(--space-4)',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-md)',
    background:
      'radial-gradient(circle at 30% 30%, rgba(110,168,254,0.9), rgba(110,168,254,0.15) 60%), radial-gradient(circle at 70% 70%, rgba(36,192,138,0.6), transparent 65%)',
    border: '1px solid var(--border)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
    padding: 'var(--space-1)',
    flex: 1,
    minHeight: 0,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: '12px 12px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--muted)',
    border: '1px solid transparent',
    background: 'transparent',
    transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
  },
  navItemActive: {
    color: 'var(--text)',
    background: 'color-mix(in oklab, var(--primary) 12%, var(--panel))',
    border: '1px solid color-mix(in oklab, var(--primary) 28%, var(--border))',
  },
  hint: {
    padding: 'var(--space-3)',
    fontSize: 12,
    borderTop: '1px solid var(--border)',
    marginTop: 'var(--space-2)',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
  },
  topbar: {
    height: 56,
    background: 'var(--panel)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)',
    padding: '0 var(--space-5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    marginTop: 'var(--space-5)',
    minHeight: 0,
    flex: 1,
    overflow: 'auto',
  },
}

