import type { Session } from '@supabase/supabase-js'

export type Doctor = {
  id: string
  full_name: string
  email: string
  is_admin: boolean
  created_at: string
}

export type DoctorPatient = {
  id: string
  doctor_id: string
  full_name: string
  phone: string | null
  email: string | null
  avatar_color: string | null
  created_at: string
}

export type AuthActionResult = { ok: true } | { ok: false; message: string }

export type CreateDoctorInput = {
  fullName: string
  email: string
  password: string
  isAdmin: boolean
}

export type AuthContextValue = {
  ready: boolean
  session: Session | null
  userDoctor: Doctor | null
  doctors: Doctor[]
  isAdmin: boolean
  authError: string | null
  refreshDoctors: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<AuthActionResult>
  addDoctor: (input: CreateDoctorInput) => Promise<AuthActionResult>
  updateDoctor: (doctorId: string, patch: { fullName: string; isAdmin: boolean }) => Promise<AuthActionResult>
  deleteDoctor: (doctorId: string) => Promise<AuthActionResult>
  getDoctorPatients: (doctorId: string) => Promise<DoctorPatient[]>
  signOut: () => Promise<void>
}
