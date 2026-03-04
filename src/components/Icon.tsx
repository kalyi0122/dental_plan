import { Camera, Ruler, Scan, Stethoscope } from 'lucide-react'

type IconProps = { size?: number }
type IconCmp = React.ComponentType<IconProps>

const PHOTO_ICON_KEYS = [
  'tooth-filling',
  'tooth-healthy',
  'tooth-crown',
  'tooth-root-canal',
  'tooth-extraction',
  'tooth-cavity',
  'tooth-deep-caries',
  'tooth-veneer',
  'tooth-braces',
  'tooth-before',
  'tooth-after',
  'jaw-teeth',
  'gum-inflammation',
  'implant',
  'consultation',
  'photos',
  'xray',
  'planning',
  // compatibility with saved legacy values
  'activity',
  'bone',
  'camera',
  'crown',
  'grid',
  'layers',
  'ruler',
  'scan',
  'shield',
  'stethoscope',
  'wrench',
  'sparkles',
] as const

const PHOTO_ICON_MODULES = import.meta.glob('../assets/tooth-photos/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function extractPhotoOrder(path: string) {
  const fileName = path.split('/').pop() ?? path
  const match = fileName.match(/(\d+)/)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

const PHOTO_ICON_SOURCES = Object.entries(PHOTO_ICON_MODULES)
  .sort(([a], [b]) => extractPhotoOrder(a) - extractPhotoOrder(b))
  .map(([, src]) => src)

const PHOTO_ICON_BY_NAME: Partial<Record<string, string>> = {}
PHOTO_ICON_KEYS.forEach((key, idx) => {
  const src = PHOTO_ICON_SOURCES[idx]
  if (src) PHOTO_ICON_BY_NAME[key] = src
})

function Svg({ size = 18, children }: React.PropsWithChildren<IconProps>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  )
}

const C = {
  blue: '#58A6FF',
  cyan: '#55D6FF',
  green: '#24E035',
  yellow: '#F6D84E',
  red: '#FF3B30',
  purple: '#A855F7',
  magenta: '#D946EF',
  white: '#E9EEF5',
  gray: '#9CA3AF',
  orange: '#F59E0B',
}

const Implant: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 2.8v3.1" stroke={C.blue} strokeWidth={1.8} strokeLinecap="round" />
    <rect x="10.1" y="5.7" width="3.8" height="10" rx="1.6" fill={C.blue} />
    <path d="M9.5 7.8h5M9.5 9.8h5M9.5 11.8h5M9.5 13.8h5" stroke="#A7D3FF" strokeWidth={0.85} />
    <path d="M8 17.2h8" stroke={C.blue} strokeWidth={1.9} strokeLinecap="round" />
  </Svg>
)

const ToothHealthy: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 3.2c-3 0-5.3 2.4-5.1 5.3l.5 5.4c.2 2.4 1.3 4.5 2.8 4.5.9 0 1.4-.7 1.8-1.9.2-.7.4-1.2 1-1.2s.8.5 1 1.2c.4 1.2.9 1.9 1.8 1.9 1.5 0 2.6-2.1 2.8-4.5l.5-5.4c.2-2.9-2.1-5.3-5.1-5.3z" fill={C.white} />
    <path d="M9 7.2c.6-.9 1.4-1.4 2.5-1.6" stroke={C.blue} strokeWidth={1.2} strokeLinecap="round" />
  </Svg>
)

const ToothCavity: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 3.2c-3 0-5.3 2.4-5.1 5.3l.5 5.4c.2 2.4 1.3 4.5 2.8 4.5.9 0 1.4-.7 1.8-1.9.2-.7.4-1.2 1-1.2s.8.5 1 1.2c.4 1.2.9 1.9 1.8 1.9 1.5 0 2.6-2.1 2.8-4.5l.5-5.4c.2-2.9-2.1-5.3-5.1-5.3z" fill={C.white} />
    <circle cx="12.2" cy="8.5" r="1.6" fill="#342B28" />
  </Svg>
)

const ToothDeepCaries: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 3.2c-3 0-5.3 2.4-5.1 5.3l.5 5.4c.2 2.4 1.3 4.5 2.8 4.5.9 0 1.4-.7 1.8-1.9.2-.7.4-1.2 1-1.2s.8.5 1 1.2c.4 1.2.9 1.9 1.8 1.9 1.5 0 2.6-2.1 2.8-4.5l.5-5.4c.2-2.9-2.1-5.3-5.1-5.3z" fill={C.white} />
    <circle cx="12" cy="8.5" r="2.2" fill="#2A201E" />
    <path d="M10.8 9.9l2.4-2.4" stroke={C.red} strokeWidth={1} strokeLinecap="round" />
  </Svg>
)

const ToothFilling: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 3.2c-3 0-5.3 2.4-5.1 5.3l.5 5.4c.2 2.4 1.3 4.5 2.8 4.5.9 0 1.4-.7 1.8-1.9.2-.7.4-1.2 1-1.2s.8.5 1 1.2c.4 1.2.9 1.9 1.8 1.9 1.5 0 2.6-2.1 2.8-4.5l.5-5.4c.2-2.9-2.1-5.3-5.1-5.3z" fill={C.white} />
    <rect x="9.7" y="6.2" width="4.6" height="3.5" rx="1" fill={C.blue} />
  </Svg>
)

const ToothCrown: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 3.2c-3 0-5.3 2.4-5.1 5.3l.5 5.4c.2 2.4 1.3 4.5 2.8 4.5.9 0 1.4-.7 1.8-1.9.2-.7.4-1.2 1-1.2s.8.5 1 1.2c.4 1.2.9 1.9 1.8 1.9 1.5 0 2.6-2.1 2.8-4.5l.5-5.4c.2-2.9-2.1-5.3-5.1-5.3z" fill={C.white} />
    <path d="M8.5 5.6h7v4H8.5z" fill={C.yellow} />
    <path d="M8.9 7.7h6.2" stroke="#C3A529" strokeWidth={0.9} />
  </Svg>
)

const ToothVeneer: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 3.2c-3 0-5.3 2.4-5.1 5.3l.5 5.4c.2 2.4 1.3 4.5 2.8 4.5.9 0 1.4-.7 1.8-1.9.2-.7.4-1.2 1-1.2s.8.5 1 1.2c.4 1.2.9 1.9 1.8 1.9 1.5 0 2.6-2.1 2.8-4.5l.5-5.4c.2-2.9-2.1-5.3-5.1-5.3z" fill={C.white} />
    <path d="M12.6 4.2c1.7.4 2.8 1.8 2.6 3.7l-.3 3.2c-.1 1.3-.4 2.6-1.1 3.6-.4-.2-.7-.7-.9-1.4-.2-.8-.5-1.3-1-1.3h.7V4.2z" fill={C.cyan} />
  </Svg>
)

const ToothRootCanal: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 3.2c-3 0-5.3 2.4-5.1 5.3l.5 5.4c.2 2.4 1.3 4.5 2.8 4.5.9 0 1.4-.7 1.8-1.9.2-.7.4-1.2 1-1.2s.8.5 1 1.2c.4 1.2.9 1.9 1.8 1.9 1.5 0 2.6-2.1 2.8-4.5l.5-5.4c.2-2.9-2.1-5.3-5.1-5.3z" fill={C.white} />
    <circle cx="12" cy="7.2" r="1" fill="#FFE3A8" />
    <path d="M11.05 8.2v5.2M12.95 8.2v5.2" stroke={C.orange} strokeWidth={1.2} strokeLinecap="round" />
  </Svg>
)

const ToothBraces: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 3.2c-3 0-5.3 2.4-5.1 5.3l.5 5.4c.2 2.4 1.3 4.5 2.8 4.5.9 0 1.4-.7 1.8-1.9.2-.7.4-1.2 1-1.2s.8.5 1 1.2c.4 1.2.9 1.9 1.8 1.9 1.5 0 2.6-2.1 2.8-4.5l.5-5.4c.2-2.9-2.1-5.3-5.1-5.3z" fill={C.white} />
    <rect x="10.2" y="8.3" width="3.6" height="3.6" rx="0.9" fill={C.purple} />
    <path d="M8.1 10.1h7.8" stroke="#C79BFF" strokeWidth={1.1} strokeLinecap="round" />
  </Svg>
)

const ToothBefore: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 3.2c-3 0-5.3 2.4-5.1 5.3l.5 5.4c.2 2.4 1.3 4.5 2.8 4.5.9 0 1.4-.7 1.8-1.9.2-.7.4-1.2 1-1.2s.8.5 1 1.2c.4 1.2.9 1.9 1.8 1.9 1.5 0 2.6-2.1 2.8-4.5l.5-5.4c.2-2.9-2.1-5.3-5.1-5.3z" fill={C.gray} />
    <path d="M10.7 6.9l1.1 1.1-.8 1 .9 1" stroke="#6B7280" strokeWidth={1.1} strokeLinecap="round" />
  </Svg>
)

const ToothAfter: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 3.2c-3 0-5.3 2.4-5.1 5.3l.5 5.4c.2 2.4 1.3 4.5 2.8 4.5.9 0 1.4-.7 1.8-1.9.2-.7.4-1.2 1-1.2s.8.5 1 1.2c.4 1.2.9 1.9 1.8 1.9 1.5 0 2.6-2.1 2.8-4.5l.5-5.4c.2-2.9-2.1-5.3-5.1-5.3z" fill={C.white} />
    <path d="m9.7 9.3 1.3 1.3 3-3" stroke={C.green} strokeWidth={1.45} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const ToothExtraction: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 3.2c-3 0-5.3 2.4-5.1 5.3l.5 5.4c.2 2.4 1.3 4.5 2.8 4.5.9 0 1.4-.7 1.8-1.9.2-.7.4-1.2 1-1.2s.8.5 1 1.2c.4 1.2.9 1.9 1.8 1.9 1.5 0 2.6-2.1 2.8-4.5l.5-5.4c.2-2.9-2.1-5.3-5.1-5.3z" fill={C.white} />
    <path d="M8.6 7.2l6.8 6.8M15.4 7.2l-6.8 6.8" stroke={C.red} strokeWidth={1.35} strokeLinecap="round" />
  </Svg>
)

const JawTeeth: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M4.2 10.2c2.2-1 4.1-1.3 7.8-1.3 3.7 0 5.6.3 7.8 1.3" stroke={C.green} strokeWidth={2.2} strokeLinecap="round" />
    <path d="M4.8 12.5c2.2-.9 4.1-1.2 7.2-1.2s5 .3 7.2 1.2" stroke="#62ED6F" strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
)

const GumInflammation: IconCmp = ({ size }) => (
  <Svg size={size}>
    <path d="M12 3.2c-3 0-5.3 2.4-5.1 5.3l.5 5.4c.2 2.4 1.3 4.5 2.8 4.5.9 0 1.4-.7 1.8-1.9.2-.7.4-1.2 1-1.2s.8.5 1 1.2c.4 1.2.9 1.9 1.8 1.9 1.5 0 2.6-2.1 2.8-4.5l.5-5.4c.2-2.9-2.1-5.3-5.1-5.3z" fill={C.white} />
    <path d="M7.4 10.1c1.5-1.1 3.2-1.6 4.6-1.6 1.4 0 3.1.5 4.6 1.6" stroke={C.magenta} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
)

const ICONS: Record<string, IconCmp> = {
  implant: Implant,
  'tooth-healthy': ToothHealthy,
  'tooth-cavity': ToothCavity,
  'tooth-deep-caries': ToothDeepCaries,
  'tooth-filling': ToothFilling,
  'tooth-crown': ToothCrown,
  'tooth-veneer': ToothVeneer,
  'tooth-root-canal': ToothRootCanal,
  'tooth-braces': ToothBraces,
  'tooth-before': ToothBefore,
  'tooth-after': ToothAfter,
  'tooth-extraction': ToothExtraction,
  'jaw-teeth': JawTeeth,
  'gum-inflammation': GumInflammation,
  consultation: Stethoscope,
  photos: Camera,
  xray: Scan,
  planning: Ruler,
  // compatibility with saved legacy values
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
  sparkles: ToothHealthy,
}

export const ICON_LABELS: Record<string, string> = {
  implant: 'Имплант',
  'tooth-healthy': 'Вкладка',
  'tooth-cavity': 'Синус лифтинг',
  'tooth-deep-caries': 'Наращивание кости', 
  'tooth-filling': 'Пломба',
  'tooth-crown': 'Зеленный коронка',
  'tooth-veneer': 'Винир',
  'tooth-root-canal': 'Лечение каналов',
  'tooth-braces': 'Брекеты',
  'tooth-extraction': 'Удаление',
  'tooth-before': 'До лечения',
  'tooth-after': 'После лечения',
  'jaw-teeth': 'Челюсть',
  'gum-inflammation': 'Формирователь десны',
  consultation: 'Голубой коронка',
  photos: 'Филотывый коронка',
  xray: 'Рентген',
  planning: 'Планирование',
}

export const ICON_OPTIONS = [
  'implant',
  'tooth-healthy',
  'tooth-cavity',
  'tooth-deep-caries',
  'tooth-filling',
  'tooth-crown',
  'tooth-veneer',
  'tooth-root-canal',
  'tooth-braces',
  'tooth-extraction',
  'tooth-before',
  'tooth-after',
  'jaw-teeth',
  'gum-inflammation',
  'consultation',
  'photos',
  'xray',
  'planning',
]

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const imageSrc = PHOTO_ICON_BY_NAME[name]
  if (imageSrc) {
    const scale = size <= 20 ? 2.8 : 2.2
    return (
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
        }}
      />
    )
  }
  const Cmp = ICONS[name] ?? ToothHealthy
  return <Cmp size={size} />
}
