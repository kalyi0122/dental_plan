import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { AuthContext } from './context'
import type { AuthActionResult, AuthContextValue, CreateDoctorInput, Doctor, DoctorPatient } from './types'
import { fetchDoctorPatients } from '../data/doctorPatients'
import { createIsolatedSupabaseClient, supabase } from '../lib/supabaseClient'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function doctorIdFromUser(user: User): string | null {
  const rawMeta = user.user_metadata as Record<string, unknown> | undefined
  const metaDoctorId = rawMeta?.doctor_id
  if (typeof metaDoctorId === 'string' && metaDoctorId.length > 0) return metaDoctorId
  return null
}

function normalizeAuthMessage(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) return 'Wrong email or password.'
  if (normalized.includes('email not confirmed')) {
    return 'Email confirmation is enabled. Disable it in Supabase Auth settings.'
  }
  return message
}

function isInvalidCredentialsMessage(message: string) {
  return message.toLowerCase().includes('invalid login credentials')
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function loadDoctorById(doctorId: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select('id, full_name, email, is_admin, created_at')
    .eq('id', doctorId)
    .maybeSingle()
  if (error) return null
  return (data as Doctor | null) ?? null
}

async function loadDoctorByEmail(email: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select('id, full_name, email, is_admin, created_at')
    .eq('email', email)
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
      .select('id, full_name, email, is_admin, created_at')
      .order('full_name', { ascending: true })
    if (error) {
      setAuthError(error.message)
      return
    }
    setAuthError(null)
    const nextDoctors = (data as Doctor[]) ?? []
    setDoctors(nextDoctors)
    setUserDoctor((current) => {
      if (!current) return current
      return nextDoctors.find((doctor) => doctor.id === current.id) ?? null
    })
  }, [])

  const resolveDoctor = useCallback(async (user: User | null) => {
    if (!user) return null
    const doctorId = doctorIdFromUser(user)
    if (doctorId) {
      const doctorById = await loadDoctorById(doctorId)
      if (doctorById) return doctorById
    }
    const email = user.email ? normalizeEmail(user.email) : ''
    if (!email) return null
    return loadDoctorByEmail(email)
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUserDoctor(null)
  }, [])

  const addDoctor = useCallback(
    async (input: CreateDoctorInput): Promise<AuthActionResult> => {
      const fullName = input.fullName.trim()
      const email = normalizeEmail(input.email)
      const password = input.password.trim()
      if (!fullName) return { ok: false, message: 'Doctor name is required.' }
      if (!isValidEmail(email)) return { ok: false, message: 'Valid email is required.' }
      if (password.length < 6) return { ok: false, message: 'Password must be at least 6 characters.' }

      const doctorId = crypto.randomUUID()
      const { error: insertError } = await supabase.from('doctors').insert({
        id: doctorId,
        full_name: fullName,
        email,
        is_admin: input.isAdmin,
      })
      if (insertError) return { ok: false, message: insertError.message }

      const isolated = createIsolatedSupabaseClient()
      const signUpResult = await isolated.auth.signUp({
        email,
        password,
        options: {
          data: {
            doctor_id: doctorId,
            doctor_name: fullName,
          },
        },
      })

      if (signUpResult.error) {
        await supabase.from('doctors').delete().eq('id', doctorId)
        return { ok: false, message: normalizeAuthMessage(signUpResult.error.message) }
      }

      if (!signUpResult.data.session) {
        await supabase.from('doctors').delete().eq('id', doctorId)
        return {
          ok: false,
          message: 'Disable email confirmation in Supabase Auth to create doctor accounts instantly.',
        }
      }

      await isolated.auth.signOut()
      await refreshDoctors()
      return { ok: true }
    },
    [refreshDoctors],
  )

  const updateDoctor = useCallback(
    async (doctorId: string, patch: { fullName: string; isAdmin: boolean }): Promise<AuthActionResult> => {
      const normalized = patch.fullName.trim()
      if (!normalized) return { ok: false, message: 'Name is required.' }

      const { error } = await supabase
        .from('doctors')
        .update({
          full_name: normalized,
          is_admin: patch.isAdmin,
        })
        .eq('id', doctorId)
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

  const getDoctorPatients = useCallback(async (doctorId: string): Promise<DoctorPatient[]> => {
    const { data, error } = await fetchDoctorPatients(doctorId)
    if (error) throw new Error(error.message)
    return (data as DoctorPatient[] | null) ?? []
  }, [])

  const signInWithEmail = useCallback(
    async (emailInput: string, password: string): Promise<AuthActionResult> => {
      const email = normalizeEmail(emailInput)
      if (!isValidEmail(email)) return { ok: false, message: 'Enter valid email.' }
      const normalizedPassword = password.trim()
      if (normalizedPassword.length < 6) return { ok: false, message: 'Password is too short.' }

      let signInResult = await supabase.auth.signInWithPassword({
        email,
        password: normalizedPassword,
      })
      if (signInResult.error) {
        const signInMessage = signInResult.error.message ?? 'Login failed.'
        if (!isInvalidCredentialsMessage(signInMessage)) {
          return { ok: false, message: normalizeAuthMessage(signInMessage) }
        }

        const doctor = await loadDoctorByEmail(email)
        if (!doctor) return { ok: false, message: 'Wrong email or password.' }

        const isolated = createIsolatedSupabaseClient()
        const signUpResult = await isolated.auth.signUp({
          email,
          password: normalizedPassword,
          options: {
            data: {
              doctor_id: doctor.id,
              doctor_name: doctor.full_name,
            },
          },
        })
        if (signUpResult.error) {
          return { ok: false, message: normalizeAuthMessage(signUpResult.error.message) }
        }
        if (!signUpResult.data.session) {
          return {
            ok: false,
            message: 'Disable email confirmation in Supabase Auth settings.',
          }
        }
        await isolated.auth.signOut()
        signInResult = await supabase.auth.signInWithPassword({
          email,
          password: normalizedPassword,
        })
        if (signInResult.error) {
          return { ok: false, message: normalizeAuthMessage(signInResult.error.message) }
        }
      }

      const activeUser = signInResult.data.user
      const doctor = await resolveDoctor(activeUser)
      if (!doctor) {
        await supabase.auth.signOut()
        return { ok: false, message: 'No doctor profile linked to this account.' }
      }

      if (activeUser && !doctorIdFromUser(activeUser)) {
        await supabase.auth.updateUser({
          data: {
            doctor_id: doctor.id,
            doctor_name: doctor.full_name,
          },
        })
      }

      const { data } = await supabase.auth.getSession()
      setSession(data.session ?? null)
      setUserDoctor(doctor)
      setAuthError(null)
      return { ok: true }
    },
    [resolveDoctor],
  )

  useEffect(() => {
    let active = true

    const initialize = async () => {
      const [{ data, error }] = await Promise.all([supabase.auth.getSession(), refreshDoctors()])
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

  useEffect(() => {
    const channel = supabase
      .channel('doctors-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => {
        void refreshDoctors()
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refreshDoctors])

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      userDoctor,
      doctors,
      isAdmin: Boolean(userDoctor?.is_admin),
      authError,
      refreshDoctors,
      signInWithEmail,
      addDoctor,
      updateDoctor,
      deleteDoctor,
      getDoctorPatients,
      signOut,
    }),
    [
      ready,
      session,
      userDoctor,
      doctors,
      authError,
      refreshDoctors,
      signInWithEmail,
      addDoctor,
      updateDoctor,
      deleteDoctor,
      getDoctorPatients,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
