import { Camera, Ruler, Scan, Stethoscope } from 'lucide-react'

type IconProps = { size?: number; color?: string }
type IconCmp = React.ComponentType<IconProps>

function Svg({ size = 18, children }: React.PropsWithChildren<IconProps>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  )
}

// Exactly matching the iOS screenshot procedure icons
const ToothPin: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M7 4 h10 a2 2 0 0 1 2 2 v4 a2 2 0 0 1 -2 2 h-3.5 v9 a1 1 0 0 1 -2 0 v-9 h-3.5 a2 2 0 0 1 -2 -2 v-4 a2 2 0 0 1 2 -2 z" fill="#58A6FF" />
  </Svg>
)

const Implant: IconCmp = ({ size }) => (
  // Flat head, then triangular threaded body
  <Svg size={size}>
    <path d="M5 2 h14 v3 h-14 z" fill="#00B4D8" />
    <path d="M6 6 h12 l-1.5 3 h-9 z" fill="#00B4D8" />
    <path d="M6.5 10 h11 l-1.5 3 h-8 z" fill="#00B4D8" />
    <path d="M7.5 14 h9 l-1.5 3 h-6 z" fill="#00B4D8" />
    <path d="M8.5 18 h7 l-1.5 3 h-4 z" fill="#00B4D8" />
  </Svg>
)

const ToothCrown: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M4 18 L 4 10 C 4 5, 10 5, 12 9 C 14 5, 20 5, 20 10 L 20 18 Z" fill="#1ED760" />
  </Svg>
)

const ToothInlay: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M3 16 C 3 6, 21 6, 21 16 Z" fill="#F9CE1D" />
  </Svg>
)

const ToothFilling: IconCmp = ({ size }) => (
  <Svg size={size}>
    <rect x="5" y="5" width="14" height="14" rx="2" fill="#24E035" />
  </Svg>
)

const ToothExtraction: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M6 6 L18 18 M18 6 L6 18" stroke="#FF3B30" strokeWidth="4" strokeLinecap="round" />
  </Svg>
)

const ToothRootCanal: IconCmp = ({ size }) => (
  <Svg size={size}>
    <rect x="10.5" y="3" width="3" height="18" rx="1.5" fill="#55D6FF" />
  </Svg>
)

const ToothVeneer: IconCmp = ({ size }) => (
  <Svg size={size}>
    <rect x="2" y="8" width="20" height="8" rx="1.5" fill="#24E035" />
  </Svg>
)

// Define remaining standard fallback icons
const JawTeeth: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M4.2 10.2c2.2-1 4.1-1.3 7.8-1.3 3.7 0 5.6.3 7.8 1.3" stroke="#24E035" strokeWidth={2.2} strokeLinecap="round" />
    <path d="M4.8 12.5c2.2-.9 4.1-1.2 7.2-1.2s5 .3 7.2 1.2" stroke="#62ED6F" strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
)

export const ICONS: Record<string, IconCmp> = {
  'tooth-pin': ToothPin,
  implant: Implant,
  'tooth-crown': ToothCrown,
  'tooth-inlay': ToothInlay,
  'tooth-filling': ToothFilling,
  'tooth-extraction': ToothExtraction,
  'tooth-root-canal': ToothRootCanal,
  'tooth-veneer': ToothVeneer,

  // Legacy mappings for rest of app
  'tooth-healthy': ToothPin,
  'tooth-cavity': ToothFilling,
  'tooth-deep-caries': ToothInlay,
  'tooth-braces': JawTeeth,
  'tooth-before': Camera,
  'tooth-after': Camera,
  'jaw-teeth': JawTeeth,
  'gum-inflammation': JawTeeth,
  consultation: Stethoscope,
  photos: Camera,
  xray: Scan,
  planning: Ruler,
  activity: ToothFilling,
  bone: JawTeeth,
  camera: Camera,
  crown: ToothCrown,
  grid: JawTeeth,
  layers: JawTeeth,
  ruler: Ruler,
  scan: Scan,
  shield: ToothRootCanal,
  stethoscope: Stethoscope,
  wrench: ToothExtraction,
  sparkles: ToothPin,
}

// Exactly the 8 options from the iOS screenshot
export const ICON_OPTIONS = [
  'tooth-pin',
  'implant',
  'tooth-crown',
  'tooth-inlay',
  'tooth-filling',
  'tooth-extraction',
  'tooth-root-canal',
  'tooth-veneer',
]

export const ICON_LABELS: Record<string, string> = {
  'tooth-pin': 'Штифт',
  'implant': 'Имплант',
  'tooth-crown': 'Коронка',
  'tooth-inlay': 'Вкладка',
  'tooth-filling': 'Пломба',
  'tooth-extraction': 'Удаление',
  'tooth-root-canal': 'Канал',
  'tooth-veneer': 'Винир',
}

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const Cmp = ICONS[name] ?? ToothPin
  return (
    <div style={{
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Cmp size={size} />
    </div>
  )
}

