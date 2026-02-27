import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { produce } from 'immer'
import type {
  CurrencyCode,
  Id,
  JawRegion,
  Locale,
  Patient,
  Service,
  ServiceCategory,
  Settings,
  ThemeMode,
  ToothNumberingSystem,
  TreatmentPlan,
} from '../domain/types'

type AppState = {
  _hydrated: boolean
  patients: Patient[]
  services: Service[]
  plans: TreatmentPlan[]
  settings: Settings

  upsertPatient: (p: Omit<Patient, 'id'> & Partial<Pick<Patient, 'id'>>) => Id
  removePatient: (patientId: Id) => void

  upsertService: (s: Omit<Service, 'id'> & Partial<Pick<Service, 'id'>>) => Id
  removeService: (serviceId: Id) => void

  createPlanForPatient: (patientId: Id) => Id
  updatePlan: (planId: Id, updater: (draft: TreatmentPlan) => void) => void
  removePlan: (planId: Id) => void

  setNumberingSystem: (s: ToothNumberingSystem) => void
  setCurrency: (c: CurrencyCode) => void
  setTheme: (t: ThemeMode) => void
  setLocale: (l: Locale) => void
  setQuoteText: (patch: Partial<Settings['quoteText']>) => void

  _setHydrated: () => void
  resetDemoData: () => void
}

function centsFrom(amount: number) {
  return Math.round(amount * 100)
}

function seedServices(): Service[] {
  const mk = (
    category: ServiceCategory,
    icon: string,
    name: string,
    price: number,
    jawRegion?: JawRegion,
  ): Service => ({
    id: nanoid(),
    category,
    icon,
    name,
    priceCents: centsFrom(price),
    jawRegion,
  })

  return [
    mk('GENERAL', 'consultation', 'Consultation', 60),
    mk('GENERAL', 'photos', 'Intraoral photos', 30),
    mk('GENERAL', 'xray', 'X-ray', 40),
    mk('GENERAL', 'planning', 'Treatment planning', 80),
    mk('TOOTH', 'tooth-filling', 'Filling', 120),
    mk('TOOTH', 'tooth-healthy', 'Professional cleaning', 90),
    mk('TOOTH', 'tooth-crown', 'Crown', 650),
    mk('TOOTH', 'tooth-root-canal', 'Root canal treatment', 420),
    mk('TOOTH', 'tooth-extraction', 'Extraction', 180),
    mk('JAW', 'jaw-teeth', 'Sinus lifting', 1200, 'MAXILLA'),
    mk('JAW', 'jaw-teeth', 'Total prosthesis', 2800, 'BOTH'),
    mk('JAW', 'jaw-teeth', 'Bone graft', 900, 'MANDIBLE'),
  ]
}

function seedPatients(): Patient[] {
  return [
    {
      id: nanoid(),
      fullName: 'Ava Martin',
      phone: '+1 555 010 203',
      email: 'ava.martin@example.com',
      avatarColor: '#6ea8fe',
    },
    {
      id: nanoid(),
      fullName: 'Noah Thompson',
      phone: '+44 20 7946 0958',
      email: 'noah.t@example.com',
      avatarColor: '#24c08a',
    },
  ]
}

function seedSettings(): Settings {
  return {
    numberingSystem: 'FDI',
    currency: 'EUR',
    theme: 'system',
    locale: 'en',
    quoteText: {
      greeting: 'Dear {patientName},\n\nThank you for visiting our clinic. Below is your treatment estimate.',
      terms:
        'This estimate is provided for planning purposes and may change after clinical evaluation.\nPrices include standard materials and chair time unless otherwise stated.',
      footer: 'If you have questions, please contact us.\n\nSincerely,\nYour Dental Clinic',
    },
  }
}

function seedPlans(patients: Patient[]): TreatmentPlan[] {
  if (patients.length === 0) return []
  const patientId = patients[0]!.id
  const now = Date.now()
  return [
    {
      id: nanoid(),
      patientId,
      title: 'Initial treatment plan',
      createdAt: now,
      updatedAt: now,
      stages: [
        { id: nanoid(), name: 'Stage 1: Prep', order: 1 },
        { id: nanoid(), name: 'Stage 2: Surgery', order: 2 },
      ],
      procedures: [],
    },
  ]
}

function seedAll() {
  const patients = seedPatients()
  const services = seedServices()
  const settings = seedSettings()
  const plans = seedPlans(patients)
  return { patients, services, settings, plans }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      _hydrated: false,
      ...seedAll(),

      upsertPatient: (p) => {
        const id = p.id ?? nanoid()
        set(
          produce((draft: AppState) => {
            const idx = draft.patients.findIndex((x) => x.id === id)
            const next: Patient = {
              id,
              fullName: p.fullName,
              phone: p.phone?.trim() || undefined,
              email: p.email?.trim() || undefined,
              avatarColor: p.avatarColor,
            }
            if (idx >= 0) draft.patients[idx] = next
            else draft.patients.unshift(next)
          }),
        )
        return id
      },

      removePatient: (patientId) => {
        set(
          produce((draft: AppState) => {
            draft.patients = draft.patients.filter((p) => p.id !== patientId)
            const removedPlanIds = new Set(
              draft.plans.filter((pl) => pl.patientId === patientId).map((pl) => pl.id),
            )
            draft.plans = draft.plans.filter((pl) => !removedPlanIds.has(pl.id))
          }),
        )
      },

      upsertService: (s) => {
        const id = s.id ?? nanoid()
        set(
          produce((draft: AppState) => {
            const idx = draft.services.findIndex((x) => x.id === id)
            const next: Service = {
              id,
              category: s.category,
              icon: s.icon,
              name: s.name,
              priceCents: s.priceCents,
              jawRegion: s.jawRegion,
            }
            if (idx >= 0) draft.services[idx] = next
            else draft.services.unshift(next)
          }),
        )
        return id
      },

      removeService: (serviceId) => {
        set(
          produce((draft: AppState) => {
            draft.services = draft.services.filter((s) => s.id !== serviceId)
            // Keep procedures but they will show as missing service
          }),
        )
      },

      createPlanForPatient: (patientId) => {
        const id = nanoid()
        const now = Date.now()
        set(
          produce((draft: AppState) => {
            draft.plans.unshift({
              id,
              patientId,
              title: 'New treatment plan',
              createdAt: now,
              updatedAt: now,
              stages: [{ id: nanoid(), name: 'Stage 1', order: 1 }],
              procedures: [],
            })
          }),
        )
        return id
      },

      updatePlan: (planId, updater) => {
        set(
          produce((draft: AppState) => {
            const plan = draft.plans.find((p) => p.id === planId)
            if (!plan) return
            updater(plan)
            plan.updatedAt = Date.now()
            plan.stages.sort((a, b) => a.order - b.order)
          }),
        )
      },

      removePlan: (planId) => {
        set(
          produce((draft: AppState) => {
            draft.plans = draft.plans.filter((p) => p.id !== planId)
          }),
        )
      },

      setNumberingSystem: (s) => set({ settings: { ...get().settings, numberingSystem: s } }),
      setCurrency: (c) => set({ settings: { ...get().settings, currency: c } }),
      setTheme: (t) => set({ settings: { ...get().settings, theme: t } }),
      setLocale: (l) => set({ settings: { ...get().settings, locale: l } }),
      setQuoteText: (patch) =>
        set({ settings: { ...get().settings, quoteText: { ...get().settings.quoteText, ...patch } } }),

      _setHydrated: () => set({ _hydrated: true }),
      resetDemoData: () => set(seedAll()),
    }),
    {
      name: 'dentalPlanner.v1',
      version: 1,
      partialize: (s) => ({
        patients: s.patients,
        services: s.services,
        plans: s.plans,
        settings: s.settings,
      }),
      merge: (persisted, current) => {
        const p = persisted as Record<string, unknown>
        const settings = p?.settings as Partial<Settings> | undefined
        return {
          ...current,
          ...p,
          _hydrated: true,
          settings: {
            ...current.settings,
            ...settings,
            locale: settings?.locale ?? current.settings.locale,
          },
        }
      },
    },
  ),
)

