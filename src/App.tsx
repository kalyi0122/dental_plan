import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useAuth } from './auth/useAuth'
import { DoctorsAdminPage } from './pages/DoctorsAdminPage'
import { AdminPatientDetailPage } from './pages/AdminPatientDetailPage'
import { PatientsPage } from './pages/PatientsPage'
import { PatientDetailPage } from './pages/PatientDetailPage'
import { ServicesPage } from './pages/ServicesPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AuthPage } from './pages/AuthPage'
import { useTranslation } from './i18n/useTranslation'

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/patients" replace />
  return children
}

export default function App() {
  const { ready, session } = useAuth()
  const { t } = useTranslation()

  if (!ready) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
        }}
      >
        {t('app.connecting')}
      </div>
    )
  }

  if (!session) return <AuthPage />

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/patients" replace />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:patientId" element={<PatientDetailPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/admin/doctors"
          element={
            <RequireAdmin>
              <DoctorsAdminPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/patients/:patientId"
          element={
            <RequireAdmin>
              <AdminPatientDetailPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  )
}
