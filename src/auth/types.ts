import type { Session } from '@supabase/supabase-js'

export type Doctor = {
  id: string
  full_name: string
  is_admin: boolean
  created_at: string
}

export type AuthActionResult = { ok: true } | { ok: false; message: string }

export type AuthContextValue = {
  ready: boolean
  session: Session | null
  userDoctor: Doctor | null
  doctors: Doctor[]
  isAdmin: boolean
  authError: string | null
  refreshDoctors: () => Promise<void>
  signInOrRegisterDoctor: (doctorId: string, password: string) => Promise<AuthActionResult>
  addDoctor: (fullName: string) => Promise<AuthActionResult>
  deleteDoctor: (doctorId: string) => Promise<AuthActionResult>
  signOut: () => Promise<void>
}

