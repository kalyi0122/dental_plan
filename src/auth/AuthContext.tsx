import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { AuthContext } from './context'
import type { AuthActionResult, AuthContextValue, Doctor } from './types'
import { supabase } from '../lib/supabaseClient'

const DOCTOR_EMAIL_DOMAIN = 'clinic.local'
const INVALID_CREDENTIALS = 'invalid login credentials'
const USER_ALREADY_REGISTERED = 'already registered'

function buildDoctorEmail(doctorId: string) {
  return `doctor-${doctorId}@${DOCTOR_EMAIL_DOMAIN}`
}

function doctorIdFromUser(user: User): string | null {
  const rawMeta = user.user_metadata as Record<string, unknown> | undefined
  const metaDoctorId = rawMeta?.doctor_id
  if (typeof metaDoctorId === 'string' && metaDoctorId.length > 0) return metaDoctorId

  const match = user.email?.match(/^doctor-([a-f0-9-]+)@clinic\.local$/i)
  return match?.[1] ?? null
}

function normalizeAuthMessage(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes(INVALID_CREDENTIALS)) return 'Wrong password.'
  if (normalized.includes(USER_ALREADY_REGISTERED)) return 'This doctor already has an account.'
  if (normalized.includes('email not confirmed')) {
    return 'Registration created, but email confirmation is enabled. Disable email confirmation for this flow.'
  }
  return message
}

async function loadDoctorById(doctorId: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select('id, full_name, is_admin, created_at')
    .eq('id', doctorId)
    .maybeSingle()
  if (error) return null
  return (data as Doctor | null) ?? null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [userDoctor, setUserDoctor] = useState<Doctor | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [authError, setAuthError] = useState<string | null>(null)

  const refreshDoctors = useCallback(async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select('id, full_name, is_admin, created_at')
      .order('full_name', { ascending: true })
    if (error) {
      setAuthError(error.message)
      return
    }
    setAuthError(null)
    setDoctors((data as Doctor[]) ?? [])
  }, [])

  const resolveDoctor = useCallback(async (user: User | null) => {
    if (!user) return null
    const doctorId = doctorIdFromUser(user)
    if (!doctorId) return null
    return loadDoctorById(doctorId)
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUserDoctor(null)
  }, [])

  const addDoctor = useCallback(
    async (fullName: string): Promise<AuthActionResult> => {
      const normalized = fullName.trim()
      if (!normalized) return { ok: false, message: 'Name is required.' }

      const { error } = await supabase.from('doctors').insert({ full_name: normalized })
      if (error) return { ok: false, message: error.message }

      await refreshDoctors()
      return { ok: true }
    },
    [refreshDoctors],
  )

  const deleteDoctor = useCallback(
    async (doctorId: string): Promise<AuthActionResult> => {
      const { error } = await supabase.from('doctors').delete().eq('id', doctorId)
      if (error) return { ok: false, message: error.message }

      await refreshDoctors()
      if (userDoctor?.id === doctorId) await signOut()
      return { ok: true }
    },
    [refreshDoctors, signOut, userDoctor?.id],
  )

  const signInOrRegisterDoctor = useCallback(
    async (doctorId: string, password: string): Promise<AuthActionResult> => {
      const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId)
      if (!selectedDoctor) return { ok: false, message: 'Please choose a doctor.' }

      const normalizedPassword = password.trim()
      if (normalizedPassword.length < 6) {
        return { ok: false, message: 'Password must be at least 6 characters.' }
      }

      const email = buildDoctorEmail(selectedDoctor.id)
      const signInResult = await supabase.auth.signInWithPassword({
        email,
        password: normalizedPassword,
      })

      if (signInResult.error) {
        const firstMessage = signInResult.error.message ?? 'Login failed.'
        const hasInvalidCreds = firstMessage.toLowerCase().includes(INVALID_CREDENTIALS)
        if (!hasInvalidCreds) return { ok: false, message: normalizeAuthMessage(firstMessage) }

        const signUpResult = await supabase.auth.signUp({
          email,
          password: normalizedPassword,
          options: {
            data: {
              doctor_id: selectedDoctor.id,
              doctor_name: selectedDoctor.full_name,
            },
          },
        })

        if (signUpResult.error) {
          const secondMessage = signUpResult.error.message ?? 'Registration failed.'
          if (secondMessage.toLowerCase().includes(USER_ALREADY_REGISTERED)) {
            return { ok: false, message: 'Wrong password.' }
          }
          return { ok: false, message: normalizeAuthMessage(secondMessage) }
        }

        if (!signUpResult.data.session) {
          return {
            ok: false,
            message:
              'Registration created, but email confirmation is enabled. Disable it in Supabase Auth settings for instant login.',
          }
        }
      }

      const { data } = await supabase.auth.getSession()
      setSession(data.session ?? null)
      const doctor = await resolveDoctor(data.session?.user ?? null)
      setUserDoctor(doctor)
      setAuthError(null)
      return { ok: true }
    },
    [doctors, resolveDoctor],
  )

  useEffect(() => {
    let active = true

    const initialize = async () => {
      await refreshDoctors()
      const { data, error } = await supabase.auth.getSession()
      if (!active) return

      if (error) setAuthError(error.message)
      const nextSession = data.session ?? null
      setSession(nextSession)
      if (nextSession?.user) {
        const doctor = await resolveDoctor(nextSession.user)
        if (active) setUserDoctor(doctor)
      }
      if (active) setReady(true)
    }

    void initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setReady(true)
      if (!nextSession?.user) {
        setUserDoctor(null)
        return
      }
      void resolveDoctor(nextSession.user).then((doctor) => {
        if (active) setUserDoctor(doctor)
      })
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [refreshDoctors, resolveDoctor])

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      userDoctor,
      doctors,
      isAdmin: Boolean(userDoctor?.is_admin),
      authError,
      refreshDoctors,
      signInOrRegisterDoctor,
      addDoctor,
      deleteDoctor,
      signOut,
    }),
    [
      ready,
      session,
      userDoctor,
      doctors,
      authError,
      refreshDoctors,
      signInOrRegisterDoctor,
      addDoctor,
      deleteDoctor,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
