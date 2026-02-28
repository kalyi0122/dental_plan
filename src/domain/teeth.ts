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

// Highly detailed human anatomical paths carefully crafted to look realistic (like the screenshot)
export const TOOTH_PATHS = {
  molarUp: {
    // Upper molars: 3 roots (2 visible buccal, 1 palatal implied or partially visible). Boxy crown with cusps.
    root: "M -12,0 C -15,-20 -20,-38 -12,-55 C -8,-60 -2,-45 0,-30 C 2,-45 8,-60 12,-55 C 20,-38 15,-20 12,0 C 8,-10 -8,-10 -12,0 Z",
    crown: "M -12,0 C -16,8 -14,18 -8,22 C -4,24 -2,18 0,16 C 2,18 4,24 8,22 C 14,18 16,8 12,0 C 8,-4 -8,-4 -12,0 Z"
  },
  premolarUp: {
    // Upper premolars: 1-2 roots. Narrower crown, biting surface has 2 cusps.
    root: "M -8,0 C -10,-20 -12,-45 -2,-60 C 2,-62 6,-50 8,-20 C 10,-4 5,-4 -8,0 Z",
    crown: "M -8,0 C -12,10 -10,20 -4,24 C 0,26 2,20 4,18 C 6,24 10,20 8,0 C 5,-2 -5,-2 -8,0 Z"
  },
  canineUp: {
    // Canine: 1 massive long root. Pointy tear-drop crown.
    root: "M -9,0 C -12,-20 -10,-55 0,-70 C 10,-55 12,-20 9,0 C 5,-3 -5,-3 -9,0 Z",
    crown: "M -9,0 C -12,12 -5,22 0,28 C 5,22 12,12 9,0 C 5,-2 -5,-2 -9,0 Z"
  },
  incisorUp: {
    // Incisor: 1 root. Flat edge crown.
    root: "M -7,0 C -8,-20 -6,-45 0,-55 C 6,-45 8,-20 7,0 C 4,-2 -4,-2 -7,0 Z",
    crown: "M -7,0 C -9,12 -8,22 -6,26 L 6,26 C 8,22 9,12 7,0 C 4,-2 -4,-2 -7,0 Z"
  },

  molarDown: {
    // Lower molars: 2 distinct roots. Crown is rectangular with cusps.
    root: "M -13,0 C -16,20 -18,40 -12,55 C -8,60 -2,45 0,30 C 2,45 8,60 12,55 C 18,40 16,20 13,0 C 8,4 -8,4 -13,0 Z",
    crown: "M -13,0 C -16,-8 -14,-18 -8,-22 C -4,-24 -2,-18 0,-16 C 2,-18 4,-24 8,-22 C 14,-18 16,-8 13,0 C 8,4 -8,4 -13,0 Z"
  },
  premolarDown: {
    // Lower premolars: 1 root. Crown is narrow.
    root: "M -7,0 C -10,20 -12,45 -2,60 C 2,62 8,50 7,20 C 5,4 -5,4 -7,0 Z",
    crown: "M -7,0 C -10,-10 -8,-20 -2,-24 C 0,-26 2,-20 4,-18 C 6,-24 10,-20 7,0 C 5,2 -5,2 -7,0 Z"
  },
  canineDown: {
    // Canine down: 1 root. Pointy.
    root: "M -8,0 C -10,20 -9,55 0,70 C 9,55 10,20 8,0 C 5,3 -5,3 -8,0 Z",
    crown: "M -8,0 C -10,-12 -5,-22 0,-28 C 5,-22 10,-12 8,0 C 5,2 -5,2 -8,0 Z"
  },
  incisorDown: {
    // Incisor down: narrower than upper. Flat.
    root: "M -5,0 C -6,20 -4,45 0,55 C 4,45 6,20 5,0 C 3,2 -3,2 -5,0 Z",
    crown: "M -5,0 C -6,-12 -5,-22 -4,-26 L 4,-26 C 5,-22 6,-12 5,0 C 3,2 -3,2 -5,0 Z"
  }
}

export function getToothPaths(fdi: string) {
  const isUp = fdi.startsWith('1') || fdi.startsWith('2')
  const index = parseInt(fdi[1]!)

  let type = 'incisor'
  if (index >= 6) type = 'molar'
  else if (index >= 4) type = 'premolar'
  else if (index === 3) type = 'canine'

  const key = `${type}${isUp ? 'Up' : 'Down'}` as keyof typeof TOOTH_PATHS
  return TOOTH_PATHS[key]
}

export function sortTeethFdi(ids: string[]) {
  const index = new Map(FDI_TEETH.map((t, i) => [t, i]))
  return [...ids].sort((a, b) => (index.get(a) ?? 999) - (index.get(b) ?? 999))
}

