import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, Users, Wrench, X, Settings as SettingsIcon } from 'lucide-react'
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

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

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileNavOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileNavOpen(false)
    }
    document.body.classList.add('mobile-nav-open')
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('mobile-nav-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isMobileNavOpen])

  useEffect(() => {
    const mql = window.matchMedia?.('(min-width: 1024px)')
    if (!mql) return
    const onChange = () => {
      if (mql.matches) setIsMobileNavOpen(false)
    }
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [])

  return (
    <div className="app-shell" style={styles.shellBase}>
      <div
        className={`mobile-nav-backdrop ${isMobileNavOpen ? 'open' : ''}`}
        aria-hidden={!isMobileNavOpen}
        onClick={() => setIsMobileNavOpen(false)}
      />
      <aside className={`app-sidebar ${isMobileNavOpen ? 'open' : ''}`} style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logo} aria-hidden />
          <div>
            <div style={{ fontWeight: 700, letterSpacing: 0.2 }}>{t('app.title')}</div>
            <div style={{ fontSize: 12 }} className="muted">
              {t('app.subtitle')}
            </div>
          </div>
        </div>

        <nav id="app-navigation" style={styles.nav}>
          {navItems.map((it) => {
            const Icon = it.icon
            return (
              <NavLink
                key={it.to}
                to={it.to}
                onClick={() => setIsMobileNavOpen(false)}
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
        <div className="app-topbar" style={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setIsMobileNavOpen((v) => !v)}
              aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileNavOpen}
              aria-controls="app-navigation"
            >
              {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
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
          <div className="topbar-language">
            <LanguageSwitcher />
          </div>
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
    background:
      'linear-gradient(180deg, color-mix(in oklab, var(--panel) 96%, transparent), color-mix(in oklab, var(--panel2) 90%, var(--panel)))',
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
    background:
      'linear-gradient(180deg, color-mix(in oklab, var(--panel2) 94%, transparent), color-mix(in oklab, var(--panel2) 68%, transparent))',
    border: '1px solid var(--border)',
    marginBottom: 'var(--space-4)',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-md)',
    background:
      'radial-gradient(circle at 24% 24%, rgba(96,157,255,0.95), rgba(96,157,255,0.2) 58%), radial-gradient(circle at 74% 74%, rgba(31,202,150,0.72), transparent 66%)',
    border: '1px solid var(--border)',
    boxShadow: '0 10px 24px rgba(3, 8, 20, 0.2)',
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
    transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease',
  },
  navItemActive: {
    color: 'var(--text)',
    background:
      'linear-gradient(180deg, color-mix(in oklab, var(--primary) 24%, var(--panel)), color-mix(in oklab, var(--primary) 12%, var(--panel)))',
    border: '1px solid color-mix(in oklab, var(--primary) 28%, var(--border))',
    boxShadow: '0 10px 24px color-mix(in oklab, var(--primary) 18%, transparent)',
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
    background:
      'linear-gradient(180deg, color-mix(in oklab, var(--panel) 96%, transparent), color-mix(in oklab, var(--panel2) 88%, var(--panel)))',
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

