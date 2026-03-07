import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LogOut, Menu, ShieldCheck, Users, Wrench, X, Settings as SettingsIcon } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { useAppStore } from '../store/useAppStore'
import { useTranslation } from '../i18n/useTranslation'
import { LanguageSwitcher } from './LanguageSwitcher'

const defaultNavItems = [
  { to: '/patients', labelKey: 'nav.patients', icon: Users },
  { to: '/services', labelKey: 'nav.services', icon: Wrench },
  { to: '/settings', labelKey: 'nav.settings', icon: SettingsIcon },
]

const adminNavItem = { to: '/admin/doctors', label: 'Doctors Admin', icon: ShieldCheck }

function MogulLogo() {
  return (
    <svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true">
      <g opacity="0.85" stroke="#2D6DFF" strokeWidth="1.7" strokeLinecap="round">
        <line x1="0.5" y1="11.5" x2="12" y2="11.5" />
        <line x1="0" y1="15" x2="11" y2="15" />
        <line x1="1" y1="18.5" x2="12.8" y2="18.5" />
        <line x1="2" y1="22" x2="11.5" y2="22" />
      </g>
      <path
        d="M9.6 21.5 C9.6 14.1 14.5 7.4 20.6 7.4 C22.9 7.4 24.4 8.3 25.6 9.7 C26.8 8.3 28.3 7.4 30.6 7.4 C36.7 7.4 41.6 14.1 41.6 21.5 L37.2 29 L33.6 25.7 H16.6 L13 29 Z"
        fill="#246BFF"
      />
      <text x="25" y="24" textAnchor="middle" fill="#111111" fontSize="13.6" fontWeight="900">$</text>
    </svg>
  )
}

function resolveTheme(theme: 'system' | 'light' | 'dark') {
  if (theme === 'light' || theme === 'dark') return theme
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.settings.theme)
  const { isAdmin, signOut, userDoctor } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const resolved = useMemo(() => resolveTheme(theme), [theme])
  const navItems = useMemo(
    () => (isAdmin ? [...defaultNavItems, adminNavItem] : defaultNavItems),
    [isAdmin],
  )

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
          <div style={styles.logo} aria-hidden>
            <MogulLogo />
          </div>
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
                <span>{'labelKey' in it ? t(it.labelKey) : it.label}</span>
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
                  : location.pathname.startsWith('/admin')
                    ? 'Doctors Admin'
                    : t('topbar.settings')}
            </div>
            <div className="muted topbar-subtitle" style={{ fontSize: 13 }}>
              {t('topbar.hint')}
            </div>
          </div>
          <div className="topbar-language" style={styles.topbarActions}>
            <div style={styles.userChip}>{userDoctor?.full_name ?? 'Doctor'}</div>
            <button type="button" style={styles.logoutButton} onClick={() => void signOut()}>
              <LogOut size={15} />
              Sign out
            </button>
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
      'linear-gradient(180deg, color-mix(in oklab, var(--panel2) 88%, transparent), color-mix(in oklab, var(--panel) 94%, black))',
    border: '1px solid var(--border)',
    boxShadow: '0 10px 24px rgba(3, 8, 20, 0.2)',
    display: 'grid',
    placeItems: 'center',
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
  topbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  userChip: {
    border: '1px solid var(--border)',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    background: 'color-mix(in oklab, var(--panel2) 82%, transparent)',
    maxWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutButton: {
    minHeight: 34,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'color-mix(in oklab, var(--panel2) 82%, transparent)',
    color: 'var(--text)',
    cursor: 'pointer',
    padding: '6px 10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
  },
  content: {
    marginTop: 'var(--space-5)',
    minHeight: 0,
    flex: 1,
    overflow: 'auto',
  },
}

