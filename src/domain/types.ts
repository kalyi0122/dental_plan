export type Id = string

export type CurrencyCode =
  | 'EUR'
  | 'USD'
  | 'GBP'
  | 'AZN'
  | 'ARS'
  | 'AMD'
  | 'BYN'
  | 'BRL'
  | 'GEL'
  | 'AED'
  | 'KZT'
  | 'KHR'
  | 'CAD'
  | 'QAR'
  | 'KGS'
  | 'MXN'
  | 'MDL'
  | 'PLN'
  | 'RUB'
  | 'TJS'
  | 'TMT'
  | 'UZS'
  | 'UAH'
  | 'ZAR'
export type ToothNumberingSystem = 'FDI' | 'UNIVERSAL'
export type ThemeMode = 'system' | 'light' | 'dark'
export type Locale = 'en' | 'ru' | 'kg'

export type ServiceCategory = 'TOOTH' | 'JAW' | 'GENERAL'

export type Service = {
  id: Id
  category: ServiceCategory
  icon: string
  name: string
  priceCents: number
  jawRegion?: JawRegion
}

export type Patient = {
  id: Id
  fullName: string
  phone?: string
  email?: string
  avatarColor?: string
}

export type ProcedureScope = 'TOOTH' | 'JAW' | 'GENERAL'

export type JawRegion = 'MAXILLA' | 'MANDIBLE' | 'BOTH'

export type PlanProcedure = {
  id: Id
  serviceId: Id
  scope: ProcedureScope
  toothIds?: string[] // stored as FDI codes (e.g. "11", "24", "48")
  jaw?: JawRegion
  quantity: number
  stageId?: Id
  notes?: string
}

export type PlanStage = {
  id: Id
  name: string
  order: number
}

export type TreatmentPlan = {
  id: Id
  patientId: Id
  title: string
  createdAt: number
  updatedAt: number
  stages: PlanStage[]
  procedures: PlanProcedure[]
}

export type QuoteTextBlocks = {
  greeting: string
  terms: string
  footer: string
}

export type Settings = {
  numberingSystem: ToothNumberingSystem
  currency: CurrencyCode
  theme: ThemeMode
  locale: Locale
  quoteText: QuoteTextBlocks
}

