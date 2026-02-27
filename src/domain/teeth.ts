import type { ToothNumberingSystem } from './types'

// FDI permanent teeth codes (quadrants 1-4, teeth 1-8)
export const FDI_TEETH: string[] = [
  // maxilla (upper) right to left: 18..11, 21..28
  '18',
  '17',
  '16',
  '15',
  '14',
  '13',
  '12',
  '11',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  // mandible (lower) left to right: 38..31, 41..48
  '38',
  '37',
  '36',
  '35',
  '34',
  '33',
  '32',
  '31',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
]

// Universal numbers 1-32, ordered upper right→left then lower left→right
const UNIVERSAL_ORDER: string[] = Array.from({ length: 32 }, (_, i) => String(i + 1))

// Mapping by anatomical position (not by numeric value)
const FDI_TO_UNIVERSAL = new Map<string, string>(
  FDI_TEETH.map((fdi, idx) => [fdi, UNIVERSAL_ORDER[idx]]),
)

const UNIVERSAL_TO_FDI = new Map<string, string>(
  FDI_TEETH.map((fdi, idx) => [UNIVERSAL_ORDER[idx]!, fdi]),
)

export function toDisplayToothLabel(fdiToothId: string, system: ToothNumberingSystem) {
  if (system === 'FDI') return fdiToothId
  return FDI_TO_UNIVERSAL.get(fdiToothId) ?? fdiToothId
}

export function universalToFdi(universalTooth: string) {
  return UNIVERSAL_TO_FDI.get(universalTooth) ?? universalTooth
}

export function isValidFdiToothId(id: string) {
  return FDI_TEETH.includes(id)
}

export function sortTeethFdi(ids: string[]) {
  const index = new Map(FDI_TEETH.map((t, i) => [t, i]))
  return [...ids].sort((a, b) => (index.get(a) ?? 999) - (index.get(b) ?? 999))
}

