import type { Patient } from '../domain/types'
import { supabase } from '../lib/supabaseClient'
import type { DoctorPatient } from '../auth/types'

export async function fetchDoctorPatients(doctorId: string) {
  return supabase
    .from('patients')
    .select('id, doctor_id, full_name, phone, email, avatar_color, created_at')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })
}

export async function upsertDoctorPatient(doctorId: string, patient: Patient) {
  return supabase.from('patients').upsert({
    id: patient.id,
    doctor_id: doctorId,
    full_name: patient.fullName,
    phone: patient.phone ?? null,
    email: patient.email ?? null,
    avatar_color: patient.avatarColor ?? null,
  })
}

export async function createDoctorPatient(
  doctorId: string,
  input: { fullName: string; phone?: string; email?: string; avatarColor?: string },
) {
  return supabase
    .from('patients')
    .insert({
      doctor_id: doctorId,
      full_name: input.fullName,
      phone: input.phone ?? null,
      email: input.email ?? null,
      avatar_color: input.avatarColor ?? null,
    })
    .select('id, doctor_id, full_name, phone, email, avatar_color, created_at')
    .single()
}

export async function deleteDoctorPatient(doctorId: string, patientId: string) {
  return supabase.from('patients').delete().eq('doctor_id', doctorId).eq('id', patientId)
}

export function mapDoctorPatientToPatient(row: DoctorPatient): Patient {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    avatarColor: row.avatar_color ?? undefined,
  }
}
