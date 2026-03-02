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

export type ToothCondition = {
  hasCrown?: boolean
  hasFilling?: boolean
  hasRootCanal?: boolean
  hasExtraction?: boolean
  visualIcon?: string
}

/**
 * Translate procedures in a treatment plan into a map of tooth conditions.  
 * Currently recognizes Russian keywords contained in the service name:
 *   • 'коронк' -> crown
 *   • 'удал'   -> extraction
 *   • 'пломб'  -> filling
 *   • 'канал'  -> root‑canal
 * Other languages can be added later.  
 */
export function mapPlanToToothConditions(
  plan: import('./types').TreatmentPlan,
  serviceById: Map<string, import('./types').Service>,
): Map<string, ToothCondition> {
  const hasAny = (source: string, words: readonly string[]) => words.some((w) => source.includes(w))
  const normalize = (value?: string) => (value ?? '').toLowerCase().replaceAll('\u0451', '\u0435').trim()
  const iconAlias: Record<string, string> = {
    'tooth-healthy': 'tooth-pin',
    'tooth-cavity': 'tooth-filling',
    'tooth-deep-caries': 'tooth-inlay',
  }
  const visualIcons = new Set([
    'tooth-pin',
    'implant',
    'tooth-crown',
    'tooth-inlay',
    'tooth-filling',
    'tooth-extraction',
    'tooth-root-canal',
    'tooth-veneer',
    'tooth-blue-block',
    'tooth-blue-cap',
    'tooth-purple-cap',
    'tooth-blue-green-cap',
  ])

  const crownWords = ['crown', '\u043a\u043e\u0440\u043e\u043d\u043a', '\u043a\u0430\u043f\u043f', 'prosthe', '\u0438\u043c\u043f\u043b\u0430\u043d\u0442']
  const extractionWords = ['extract', '\u0443\u0434\u0430\u043b', 'remove']
  const fillingWords = [
    'filling',
    'fill',
    '\u043f\u043b\u043e\u043c\u0431',
    '\u0432\u0438\u043d\u0438\u0440',
    '\u0432\u043a\u043b\u0430\u0434\u043a',
    '\u0441\u0438\u043d\u0443\u0441',
    '\u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u0442\u0435\u043b',
    '\u0434\u0435\u0441\u043d',
  ]
  const rootCanalWords = ['root canal', 'endo', '\u043a\u0430\u043d\u0430\u043b']
  const crownIcons = new Set(['tooth-crown', 'tooth-blue-cap', 'tooth-purple-cap', 'implant'])
  const fillingIcons = new Set([
    'tooth-filling',
    'tooth-pin',
    'tooth-inlay',
    'tooth-veneer',
    'tooth-blue-block',
    'tooth-blue-green-cap',
  ])

  const result = new Map<string, ToothCondition>()
  plan.procedures.forEach((p) => {
    if (p.scope !== 'TOOTH' || !p.toothIds) return
    const svc = serviceById.get(p.serviceId)
    const name = normalize(svc?.name)
    const rawIcon = normalize(svc?.icon)
    const icon = iconAlias[rawIcon] ?? rawIcon
    const isCrown = crownIcons.has(icon) || hasAny(name, crownWords)
    const isExtraction = icon === 'tooth-extraction' || hasAny(name, extractionWords)
    const isFilling = fillingIcons.has(icon) || hasAny(name, fillingWords)
    const isRootCanal = icon === 'tooth-root-canal' || hasAny(name, rootCanalWords)
    p.toothIds.forEach((id) => {
      const prev = result.get(id) || {}
      if (visualIcons.has(icon)) prev.visualIcon = icon
      if (isCrown) prev.hasCrown = true
      if (isExtraction) prev.hasExtraction = true
      if (isFilling) prev.hasFilling = true
      if (isRootCanal) prev.hasRootCanal = true
      result.set(id, prev)
    })
  })
  return result
}

export function sortTeethFdi(ids: string[]) {
  const index = new Map(FDI_TEETH.map((t, i) => [t, i]))
  return [...ids].sort((a, b) => (index.get(a) ?? 999) - (index.get(b) ?? 999))
}

/**
 * Build an SVG string representing the full dental chart.  Each tooth g element
 * carries an id="tooth_<FDI>" so it can be styled or queried later.  A
 * simple set of visual rules are applied based on the provided conditions map.
 */
export function buildDentalChartSvg(
  conditions: Map<string, ToothCondition>,
  numberingSystem: ToothNumberingSystem,
): string {
  const cellW = 30
  const gap = 0
  const scale = 0.65 // zoom in teeth
  const rowYUpper = 50
  const rowYLower = 160

  const upper = FDI_TEETH.slice(0, 16)
  const lower = FDI_TEETH.slice(16).reverse() // make 48 start at left side

  const canvasW = 16 * (cellW + gap)
  const canvasH = 220

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}">
  <style>
    .tooth-root { fill: #ffffff; stroke: #111111; }
    .tooth-crown { fill: #ffffff; stroke: #111111; }
    .tooth-crown-mark { fill: none; stroke: #b7791f; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    .tooth-root-canal { fill: none; stroke: #A855F7; stroke-width: 3.5; stroke-linecap: round; }
    .state-crown .tooth-crown { fill: #38A169; stroke: #25603B; }
    .state-filling .tooth-crown { fill: #60A5FA; stroke: #3B82F6; }
    .state-extracted .tooth-root,
    .state-extracted .tooth-crown { fill: #111111; stroke: #555555; }
    .state-extracted .tooth-cross { stroke: #E53E3E; stroke-width: 4; }
  </style>`

  const addRow = (seq: string[], rowY: number) => {
    seq.forEach((t, i) => {
      const cx = i * (cellW + gap)
      const cond = conditions.get(t)
      const isUp = t.startsWith('1') || t.startsWith('2')

      const lbl = toDisplayToothLabel(t, numberingSystem)
      const labelY = isUp ? rowY - 40 : rowY + 50
      svg += `<text x="${cx + cellW / 2}" y="${labelY}" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold" fill="#111111" text-anchor="middle" dy="0.35em">${lbl}</text>`

      const paths = getToothPaths(t)
      const gX = cx + cellW / 2
      const gY = rowY

      // assign a class based on state so consuming HTML/CSS can override
      let grpClass = ''
      if (cond?.hasExtraction) grpClass = 'state-extracted'
      else if (!cond?.visualIcon && cond?.hasCrown) grpClass = 'state-crown'
      else if (!cond?.visualIcon && cond?.hasFilling) grpClass = 'state-filling'

      svg += `<g id="tooth_${t}" class="${grpClass}" transform="translate(${gX}, ${gY}) scale(${scale})">`

      // choose colors according to condition
      let rootFill = '#ffffff'
      let rootStroke = '#111111'
      let crownFill = '#ffffff'
      let crownStroke = '#111111'
      const visualIcon = cond?.visualIcon

      if (visualIcon === 'tooth-blue-cap') {
        crownFill = '#1FA8E5'
        crownStroke = '#1579A7'
      } else if (visualIcon === 'tooth-purple-cap') {
        crownFill = '#A447EF'
        crownStroke = '#7E2FC4'
      } else if (visualIcon === 'tooth-blue-green-cap') {
        crownFill = '#1FA8E5'
        crownStroke = '#1579A7'
      } else if (visualIcon === 'tooth-inlay') {
        crownFill = '#F9CE1D'
        crownStroke = '#D6A700'
      } else if (visualIcon === 'tooth-filling') {
        crownFill = '#24E035'
        crownStroke = '#1CAA2A'
      } else if (visualIcon === 'tooth-crown') {
        crownFill = '#38A169'
        crownStroke = '#25603B'
      } else if (visualIcon === 'implant') {
        crownFill = '#00B4D8'
        crownStroke = '#02839E'
      } else if (cond?.hasExtraction) {
        rootFill = '#111111'
        crownFill = '#ffffff'
        rootStroke = '#555555'
        crownStroke = '#555555'
      } else if (cond?.hasCrown) {
        crownFill = '#38A169' // green
        crownStroke = '#25603B'
      } else if (cond?.hasFilling) {
        crownFill = '#60A5FA' // light blue
        crownStroke = '#3B82F6'
      }

      // root
      svg += `<path class="tooth-root" d="${paths.root}" fill="${rootFill}" stroke="${rootStroke}" stroke-width="2.5" stroke-linejoin="round" />`
      if (cond?.hasRootCanal && !cond?.hasExtraction) {
        const rootCanalPath = isUp ? 'M0,-40 L0,5' : 'M0,40 L0,-5'
        svg += `<path class="tooth-root-canal" d="${rootCanalPath}" />`
      }
      if (visualIcon === 'tooth-pin' && !cond?.hasExtraction) {
        const pinY = isUp ? -22 : -2
        svg += `<rect x="-1.6" y="${pinY}" width="3.2" height="24" rx="1.6" fill="#55D6FF" />`
      }
      // crown
      svg += `<path class="tooth-crown" d="${paths.crown}" fill="${crownFill}" stroke="${crownStroke}" stroke-width="2.5" stroke-linejoin="round" />`
      if (visualIcon === 'tooth-blue-block' && !cond?.hasExtraction) {
        svg += `<rect x="-6.5" y="${isUp ? 5.5 : -12.5}" width="13" height="13" fill="#72B6DF" />`
      }
      if (visualIcon === 'tooth-veneer' && !cond?.hasExtraction) {
        svg += `<rect x="-9" y="${isUp ? 8.5 : -14.5}" width="18" height="5.5" rx="1.2" fill="#24E035" />`
      }
      if (visualIcon === 'tooth-blue-green-cap' && !cond?.hasExtraction) {
        const inner = isUp ? 'M-7,12 Q0,18 7,12 Q0,26 -7,12' : 'M-7,-12 Q0,-18 7,-12 Q0,-26 -7,-12'
        svg += `<path d="${inner}" fill="#34E33C" stroke="#24C92D" stroke-width="1.4" />`
      }
      if (cond?.hasCrown && !cond?.hasExtraction && !visualIcon) {
        const capPath = isUp ? 'M-10,-2 Q0,-10 10,-2' : 'M-10,2 Q0,10 10,2'
        svg += `<path class="tooth-crown-mark" d="${capPath}" />`
      }

      if (cond?.hasExtraction) {
        // red X over tooth
        svg += `<g class="tooth-cross" stroke="#E53E3E" stroke-width="4" stroke-linecap="round">`
        svg += `<line x1="-15" y1="-15" x2="15" y2="15" />`
        svg += `<line x1="-15" y1="15" x2="15" y2="-15" />`
        svg += `</g>`
      }

      svg += `</g>`
    })
  }

  addRow(upper, rowYUpper)
  addRow(lower, rowYLower)

  svg += `</svg>`
  return svg
}

