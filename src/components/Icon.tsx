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

const ToothBlueBlock: IconCmp = ({ size }) => (
  <Svg size={size}>
    <defs>
      <linearGradient id="blueBlockGrad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#4D8BFF" />
        <stop offset="1" stopColor="#2E5FEC" />
      </linearGradient>
    </defs>
    <rect x="4.5" y="4.5" width="15" height="15" rx="1.4" fill="url(#blueBlockGrad)" />
    <rect x="1.2" y="10.2" width="3.8" height="3.6" rx="0.5" fill="#3E78FF" />
    <rect x="19" y="10.2" width="3.8" height="3.6" rx="0.5" fill="#3E78FF" />
    <rect x="7.5" y="7.2" width="9" height="0.9" rx="0.45" fill="rgba(255,255,255,0.35)" />
  </Svg>
)

const ToothBlueSquare: IconCmp = ({ size }) => (
  <Svg size={size}>
    <rect x="4.5" y="4.5" width="15" height="15" fill="#74B7DD" />
  </Svg>
)

const ToothBridgeX6: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path
      d="M2 12 C2 7.6 4.9 3.3 8.8 3.3 C10.3 3.3 11.3 4 12 4.8 C12.7 4 13.7 3.3 15.2 3.3 C19.1 3.3 22 7.6 22 12 L19.9 15.6 L17.5 13.8 H6.5 L4.1 15.6 Z"
      fill="#1FA8E5"
    />
    <path
      d="M5.7 11.6 C5.7 9 7.6 7 10 7 C10.9 7 11.5 7.3 12 7.8 C12.5 7.3 13.1 7 14 7 C16.4 7 18.3 9 18.3 11.6 L16.8 14 H7.2 Z"
      fill="#24E035"
    />
    <rect x="2.2" y="15.8" width="19.6" height="4.4" rx="0.6" fill="#EAB6BE" />
    <text x="12" y="15.8" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="900">
      x6
    </text>
  </Svg>
)

const ToothBridgeX7: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path
      d="M2 12 C2 7.6 4.9 3.3 8.8 3.3 C10.3 3.3 11.3 4 12 4.8 C12.7 4 13.7 3.3 15.2 3.3 C19.1 3.3 22 7.6 22 12 L19.9 15.6 L17.5 13.8 H6.5 L4.1 15.6 Z"
      fill="#1FA8E5"
    />
    <path
      d="M5.7 11.6 C5.7 9 7.6 7 10 7 C10.9 7 11.5 7.3 12 7.8 C12.5 7.3 13.1 7 14 7 C16.4 7 18.3 9 18.3 11.6 L16.8 14 H7.2 Z"
      fill="#24E035"
    />
    <rect x="2.2" y="15.8" width="19.6" height="4.4" rx="0.6" fill="#EAB6BE" />
    <text x="12" y="15.8" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="900">
      x7
    </text>
  </Svg>
)

const ToothBlueCap: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path
      d="M4 16 C4 11 6.5 6 9.5 6 C10.7 6 11.4 6.5 12 7.3 C12.6 6.5 13.3 6 14.5 6 C17.5 6 20 11 20 16 L17.2 20 L14.9 17.8 H9.1 L6.8 20 Z"
      fill="#1FA8E5"
    />
  </Svg>
)

const ToothPurpleCap: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path
      d="M4 16 C4 11 6.5 6 9.5 6 C10.7 6 11.4 6.5 12 7.3 C12.6 6.5 13.3 6 14.5 6 C17.5 6 20 11 20 16 L17.2 20 L14.9 17.8 H9.1 L6.8 20 Z"
      fill="#A447EF"
    />
  </Svg>
)

const ToothBlueGreenCap: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path
      d="M4 16 C4 11 6.5 6 9.5 6 C10.7 6 11.4 6.5 12 7.3 C12.6 6.5 13.3 6 14.5 6 C17.5 6 20 11 20 16 L17.2 20 L14.9 17.8 H9.1 L6.8 20 Z"
      fill="#1FA8E5"
    />
    <path
      d="M7 15 C7 12.2 8.7 10 10.8 10 C11.3 10 11.7 10.2 12 10.6 C12.3 10.2 12.7 10 13.2 10 C15.3 10 17 12.2 17 15 L15.4 17.3 L14.2 16.2 H9.8 L8.6 17.3 Z"
      fill="#34E33C"
    />
  </Svg>
)

const ToothBlackCap: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path
      d="M4 16 C4 11 6.5 6 9.5 6 C10.7 6 11.4 6.5 12 7.3 C12.6 6.5 13.3 6 14.5 6 C17.5 6 20 11 20 16 L17.2 20 L14.9 17.8 H9.1 L6.8 20 Z"
      fill="#1F2937"
    />
  </Svg>
)

const ToothGoldFill: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M4 16 C4 11 6.5 6 9.5 6 C10.7 6 11.4 6.5 12 7.3 C12.6 6.5 13.3 6 14.5 6 C17.5 6 20 11 20 16 L17.2 20 L14.9 17.8 H9.1 L6.8 20 Z" fill="#1FA8E5" />
    <ellipse cx="12" cy="13.6" rx="5.7" ry="3.6" fill="#FACC15" />
  </Svg>
)

const ToothBlueFill: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M4 16 C4 11 6.5 6 9.5 6 C10.7 6 11.4 6.5 12 7.3 C12.6 6.5 13.3 6 14.5 6 C17.5 6 20 11 20 16 L17.2 20 L14.9 17.8 H9.1 L6.8 20 Z" fill="#FFFFFF" stroke="#9CA3AF" />
    <ellipse cx="12" cy="13.6" rx="5.7" ry="3.6" fill="#38BDF8" />
  </Svg>
)

const ToothGrayFill: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M4 16 C4 11 6.5 6 9.5 6 C10.7 6 11.4 6.5 12 7.3 C12.6 6.5 13.3 6 14.5 6 C17.5 6 20 11 20 16 L17.2 20 L14.9 17.8 H9.1 L6.8 20 Z" fill="#FFFFFF" stroke="#9CA3AF" />
    <ellipse cx="12" cy="13.6" rx="5.7" ry="3.6" fill="#9CA3AF" />
  </Svg>
)

const ToothPurpleCanal: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M4 16 C4 11 6.5 6 9.5 6 C10.7 6 11.4 6.5 12 7.3 C12.6 6.5 13.3 6 14.5 6 C17.5 6 20 11 20 16 L17.2 20 L14.9 17.8 H9.1 L6.8 20 Z" fill="#FFFFFF" stroke="#9CA3AF" />
    <path d="M12 7.8 V19.2" stroke="#A855F7" strokeWidth="2.4" strokeLinecap="round" />
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
  'tooth-blue-block': ToothBlueBlock,
  'tooth-blue-square': ToothBlueSquare,
  'tooth-blue-cap': ToothBlueCap,
  'tooth-purple-cap': ToothPurpleCap,
  'tooth-blue-green-cap': ToothBlueGreenCap,
  'tooth-black-cap': ToothBlackCap,
  'tooth-gold-fill': ToothGoldFill,
  'tooth-blue-fill': ToothBlueFill,
  'tooth-gray-fill': ToothGrayFill,
  'tooth-purple-canal': ToothPurpleCanal,
  'tooth-bridge-x6': ToothBridgeX6,
  'tooth-bridge-x7': ToothBridgeX7,

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

// 12 options for the service icon picker
export const ICON_OPTIONS = [
  'tooth-pin',
  'implant',
  'tooth-crown',
  'tooth-inlay',
  'tooth-filling',
  'tooth-extraction',
  'tooth-root-canal',
  'tooth-veneer',
  'tooth-blue-block',
  'tooth-blue-square',
  'tooth-blue-cap',
  'tooth-purple-cap',
  'tooth-blue-green-cap',
  'tooth-black-cap',
  'tooth-gold-fill',
  'tooth-blue-fill',
  'tooth-gray-fill',
  'tooth-purple-canal',
  'tooth-bridge-x6',
  'tooth-bridge-x7',
]

export const ICON_LABELS: Record<string, string> = {
  'tooth-pin': 'Вкладка',
  implant: 'Имплант',
  'tooth-crown': 'Коронка',
  'tooth-inlay': 'Синус лифтинг',
  'tooth-filling': 'Пломба',
  'tooth-extraction': 'Удаление',
  'tooth-root-canal': 'Канал',
  'tooth-veneer': 'Наращивание кости',
  'tooth-blue-block': 'Брекеты',
  'tooth-blue-square': 'Формирователь десы',
  'tooth-blue-cap': 'Коронка',
  'tooth-purple-cap': 'Коронка',
  'tooth-blue-green-cap': 'Винир',
  'tooth-bridge-x6': 'Винир x6',
  'tooth-bridge-x7': 'Винир x7',
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
      flexShrink: 0,
    }}>
      <Cmp size={size} />
    </div>
  )
}



