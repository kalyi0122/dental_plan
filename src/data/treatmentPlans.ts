import type { TreatmentPlan } from '../domain/types'
import { supabase } from '../lib/supabaseClient'

export type TreatmentPlanRow = {
  id: string
  doctor_id: string
  patient_id: string
  title: string
  stages: unknown
  procedures: unknown
  created_at: string
  updated_at: string
}

const PLAN_SELECT = 'id, doctor_id, patient_id, title, stages, procedures, created_at, updated_at'

export async function fetchDoctorPlans(doctorId: string) {
  return supabase.from('treatment_plans').select(PLAN_SELECT).eq('doctor_id', doctorId).order('updated_at', {
    ascending: false,
  })
}

export async function fetchPatientPlans(patientId: string) {
  return supabase.from('treatment_plans').select(PLAN_SELECT).eq('patient_id', patientId).order('updated_at', {
    ascending: false,
  })
}

export async function upsertTreatmentPlan(doctorId: string, plan: TreatmentPlan) {
  return supabase.from('treatment_plans').upsert({
    id: plan.id,
    doctor_id: doctorId,
    patient_id: plan.patientId,
    title: plan.title,
    stages: plan.stages,
    procedures: plan.procedures,
    created_at: new Date(plan.createdAt).toISOString(),
    updated_at: new Date(plan.updatedAt).toISOString(),
  })
}

export async function deleteTreatmentPlan(doctorId: string, planId: string) {
  return supabase.from('treatment_plans').delete().eq('doctor_id', doctorId).eq('id', planId)
}

export function mapRowToTreatmentPlan(row: TreatmentPlanRow): TreatmentPlan {
  return {
    id: row.id,
    patientId: row.patient_id,
    title: row.title || 'Treatment plan',
    createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
    updatedAt: row.updated_at ? Date.parse(row.updated_at) : Date.now(),
    stages: Array.isArray(row.stages) ? (row.stages as TreatmentPlan['stages']) : [],
    procedures: Array.isArray(row.procedures) ? (row.procedures as TreatmentPlan['procedures']) : [],
  }
}
