import { FDI_TEETH, toDisplayToothLabel, getToothPaths } from '../domain/teeth'
import type { ToothCondition } from '../domain/teeth'
import type { ToothNumberingSystem } from '../domain/types'
import { useTranslation } from '../i18n/useTranslation'
import './DentalChart.css'

const SURFACE_OVERRIDE_ICONS = new Set([
  'tooth-blue-cap',
  'tooth-purple-cap',
  'tooth-black-cap',
  'tooth-blue-green-cap',
  'tooth-filling',
  'tooth-gold-fill',
  'tooth-blue-fill',
  'tooth-gray-fill',
  'tooth-crown',
  'implant',
])

export function DentalChart({
  selected,
  conditions = new Map(),
  numberingSystem,
  onToggle,
  onSetSelected,
}: {
  selected: string[]
  conditions?: Map<string, ToothCondition>
  numberingSystem: ToothNumberingSystem
  onToggle: (fdiToothId: string) => void
  onSetSelected?: (next: string[]) => void
}) {
  const { t } = useTranslation()
  const selectedSet = new Set(selected)

  const upper = FDI_TEETH.slice(0, 16)
  const lower = FDI_TEETH.slice(16)

  return (
    <div className="dental-chart-wrap" style={styles.wrapOverrides}>
      <div style={styles.rowHeader}>
        <div style={{ fontWeight: 700 }}>{t('chart.title')}</div>
        <div className="muted" style={{ fontSize: 12 }}>
          {t('chart.hint')}
        </div>
      </div>

      <div style={styles.chartArea}>
        {/* Upper Arch */}
        <div style={styles.archRow}>
          {upper.map((fdiId) => (
            <ToothNode
              key={fdiId}
              fdi={fdiId}
              label={toDisplayToothLabel(fdiId, numberingSystem)}
              selected={selectedSet.has(fdiId)}
              condition={conditions.get(fdiId)}
              allTeeth={upper}
              selectedSet={selectedSet}
              onToggle={onToggle}
              onSetSelected={onSetSelected}
            />
          ))}
        </div>

        <div style={styles.archDivider} />

        {/* Lower Arch */}
        <div style={styles.archRow}>
          {lower.map((fdiId) => (
            <ToothNode
              key={fdiId}
              fdi={fdiId}
              label={toDisplayToothLabel(fdiId, numberingSystem)}
              selected={selectedSet.has(fdiId)}
              condition={conditions.get(fdiId)}
              allTeeth={lower}
              selectedSet={selectedSet}
              onToggle={onToggle}
              onSetSelected={onSetSelected}
            />
          ))}
        </div>
      </div>

      <div style={styles.legend}>
        <span style={{ ...styles.legendSwatch, background: '#2563EB' }} />
        <span className="muted">{t('chart.selected')}</span>
        <span style={{ width: 12 }} />
        <span style={{ ...styles.legendSwatch, background: '#FDE047' }} />
        <span className="muted">{t('chart.legendCrown')}</span>
        <span style={{ width: 12 }} />
        <span style={{ ...styles.legendSwatch, background: '#38A169' }} />
        <span className="muted">{t('chart.legendFilling')}</span>
        <span style={{ width: 12 }} />
        <span style={{ ...styles.legendSwatch, background: '#1F2937' }} />
        <span className="muted">{t('chart.legendExtracted')}</span>
      </div>
    </div>
  )
}

function ToothNode({
  fdi,
  label,
  selected,
  condition,
  allTeeth,
  selectedSet,
  onToggle,
  onSetSelected,
}: {
  fdi: string
  label: string
  selected: boolean
  condition?: ToothCondition
  allTeeth: string[]
  selectedSet: Set<string>
  onToggle: (fdiToothId: string) => void
  onSetSelected?: (next: string[]) => void
}) {
  const { root, crown } = getToothPaths(fdi)
  const isUp = fdi.startsWith('1') || fdi.startsWith('2')
  const visualIcons = condition?.visualIcons ?? []
  const primaryIcon = visualIcons[0]
  const secondaryIcon = visualIcons[1]
  const extraCount = condition?.extraCount ?? 0
  const rootCanalMarks =
    condition?.rootCanalMarks ??
    (condition?.hasRootCanal ? ['#A855F7'] : [])
  const surfaceIcon = visualIcons.find((icon) => SURFACE_OVERRIDE_ICONS.has(icon))
  const iconScale = 1.2
  const pinScale = 1.3
  const x6UpOffset = 0
  const x6DownOffset = -10

  // derive a single state class for the tooth (used by CSS file)
  let stateClass = ''
  if (condition?.hasExtraction) stateClass = 'state-extracted'

  // base colors (selection highlight); CSS classes will override when a procedure is present
  const rootColor = selected ? 'rgba(56, 182, 255, 0.25)' : '#FFF0E6'
  const rootStroke = '#D1D5DB'
  let crownColor = selected ? 'rgba(56, 182, 255, 0.4)' : '#FFFFFF'
  let crownStroke = '#9CA3AF'

  if (surfaceIcon) {
    crownColor = selected ? 'rgba(56, 182, 255, 0.4)' : '#FFFFFF'
    crownStroke = '#9CA3AF'
  }

  const renderIcon = (visualIcon: string, scale: number, offsetX = 0, offsetY = 0) => {
    const transform = offsetX !== 0 || offsetY !== 0 ? `translate(${offsetX}, ${offsetY})` : undefined
    if (visualIcon === 'tooth-pin') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <g transform={isUp ? `translate(0, 7) scale(${pinScale}, -${pinScale})` : `translate(0, -3) scale(${pinScale})`}>
              <rect x="-10.5" y="-4" width="21" height="9.2" rx="3" fill="#58A6FF" />
              <rect x="-3" y="4.2" width="6" height="17.2" rx="3" fill="#55D6FF" />
            </g>
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-blue-block') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <g transform="scale(1.55)">
              <rect x="-7.2" y={isUp ? 0.6 : -9.6} width="14.4" height="8.2" rx="1.1" fill="#4E86FF" />
              <rect x="-10.1" y={isUp ? 2.3 : -7.9} width="2.9" height="4.8" rx="0.7" fill="#3F78FF" />
              <rect x="7.2" y={isUp ? 2.3 : -7.9} width="2.9" height="4.8" rx="0.7" fill="#3F78FF" />
              <rect x="-5.1" y={isUp ? 1.4 : -8.8} width="10.2" height="0.9" rx="0.45" fill="rgba(255,255,255,0.3)" />
            </g>
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-bridge-x6' || visualIcon === 'tooth-bridge-x7') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <g transform={`translate(0, ${isUp ? x6UpOffset : x6DownOffset}) scale(1.9)`}>
              <rect x="-11" y={isUp ? -9.2 : 13.8} width="22" height="4.2" rx="0.8" fill="#EAB6BE" />
              <path
                d={isUp ? 'M-9,3 C-7,0 -3,-1 0,1.8 C3,-1 7,0 9,3 L7,12.5 C5,15.2 3.2,14.7 0,13 C-3.2,14.7 -5,15.2 -7,12.5 Z' : 'M-9,-3 C-7,0 -3,1 0,-1.8 C3,1 7,0 9,-3 L7,-12.5 C5,-15.2 3.2,-14.7 0,-13 C-3.2,-14.7 -5,-15.2 -7,-12.5 Z'}
                fill="#1FA8E5"
                stroke="#1579A7"
                strokeWidth="1.2"
                strokeLinejoin="round"
                transform={isUp ? undefined : 'translate(0, 5)'}
              />
              <g transform={`translate(0, ${isUp ? -12 : 15})`}>
                <path
                  d={isUp ? 'M-8.5,14.5 Q0,22 8.5,14.5 Q0,31 -8.5,14.5' : 'M-8.5,-14.5 Q0,-22 8.5,-14.5 Q0,-31 -8.5,-14.5'}
                  fill="#34E33C"
                  stroke="#24C92D"
                  strokeWidth="0.95"
                />
              </g>
            </g>
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-blue-square') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <rect x="-2.5" y={isUp ? 1 : -13.5} width="15" height="15" fill="#74B7DD" />
          </g>
        </g>
      )
    }
    if (visualIcon === 'implant') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <g transform={isUp ? 'translate(0, -26) scale(2.45, -2.45)' : 'translate(0, 27) scale(2.45)'}>
              <path d="M-7 -10 H7 V-7 H-7 Z" fill="#00B4D8" />
              <path d="M-6 -6 H6 L4.5 -3 H-4.5 Z" fill="#00B4D8" />
              <path d="M-5.5 -2 H5.5 L4 1 H-4 Z" fill="#00B4D8" />
              <path d="M-4.5 2 H4.5 L3 5 H-3 Z" fill="#00B4D8" />
              <path d="M-3.5 6 H3.5 L2 9 H-2 Z" fill="#00B4D8" />
            </g>
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-crown') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <g transform="scale(1.9)">
              <path
                d={isUp ? 'M-9,3 C-7,0 -3,-1 0,1.6 C3,-1 7,0 9,3 L7,12 C5,14.8 3.2,14.4 0,12.8 C-3.2,14.4 -5,14.8 -7,12 Z' : 'M-9,-3 C-7,0 -3,1 0,-1.6 C3,1 7,0 9,-3 L7,-12 C5,-14.8 3.2,-14.4 0,-12.8 C-3.2,-14.4 -5,-14.8 -7,-12 Z'}
                fill="#38A169"
                stroke="#25603B"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-inlay') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <g transform="scale(2)">
              <path
                d={isUp ? 'M-11,-20 Q0,-26 11,-20 L11,-10 L-11,-10 Z' : 'M-11,20 Q0,26 11,20 L11,10 L-11,10 Z'}
                fill="#F9CE1D"
                stroke="#D6A700"
                strokeWidth="0.78"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-purple-cap') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <g transform="translate(0, 2.2) scale(1.15)">
              <path
                d={isUp ? 'M-14.8,2.4 C-10.5,-2.2 -5.2,-3.7 0,0.8 C5.2,-3.7 10.5,-2.2 14.8,2.4 L12.3,20 C9.1,25.2 5.2,23.3 0,20 C-5.2,23.3 -9.1,25.2 -12.3,20 Z' : 'M-14.8,0.2 C-10.5,4.8 -5.2,6.3 0,1.8 C5.2,6.3 10.5,4.8 14.8,0.2 L12.3,-17.4 C9.1,-22.6 5.2,-20.7 0,-17.4 C-5.2,-20.7 -9.1,-22.6 -12.3,-17.4 Z'}
                fill="#A447EF"
                stroke="#7E2FC4"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-black-cap') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <g transform="scale(1.9)">
              <path
                d={isUp ? 'M-9,3 C-7,0 -3,-1 0,1.8 C3,-1 7,0 9,3 L7,12.5 C5,15.2 3.2,14.7 0,13 C-3.2,14.7 -5,15.2 -7,12.5 Z' : 'M-9,-3 C-7,0 -3,1 0,-1.8 C3,1 7,0 9,-3 L7,-12.5 C5,-15.2 3.2,-14.7 0,-13 C-3.2,-14.7 -5,-15.2 -7,-12.5 Z'}
                fill="#1F2937"
                stroke="#111827"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-veneer') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <rect x="-25" y={isUp ? -37 : 23.5} width="75" height="25" rx="3.8" fill="#24E035" />
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-blue-cap') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <g transform="scale(1.9)">
              <path
                d={isUp ? 'M-9,3 C-7,0 -3,-1 0,1.8 C3,-1 7,0 9,3 L7,12.5 C5,15.2 3.2,14.7 0,13 C-3.2,14.7 -5,15.2 -7,12.5 Z' : 'M-9,-3 C-7,0 -3,1 0,-1.8 C3,1 7,0 9,-3 L7,-12.5 C5,-15.2 3.2,-14.7 0,-13 C-3.2,-14.7 -5,-15.2 -7,-12.5 Z'}
                fill="#1FA8E5"
                stroke="#1579A7"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-filling') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <g transform="scale(1.55)">
              <rect x="-6" y={isUp ? 8 : -14} width="12" height="8.5" rx="2" fill="#24E035" stroke="#1CAA2A" strokeWidth="1" />
            </g>
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-gold-fill' || visualIcon === 'tooth-blue-fill' || visualIcon === 'tooth-gray-fill') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <g transform="scale(1.8)">
              <ellipse
                cx="0"
                cy={isUp ? 9.5 : -9.5}
                rx="5.2"
                ry="3.3"
                fill={visualIcon === 'tooth-gold-fill' ? '#FACC15' : visualIcon === 'tooth-blue-fill' ? '#38BDF8' : '#9CA3AF'}
                stroke={visualIcon === 'tooth-gold-fill' ? '#CA8A04' : visualIcon === 'tooth-blue-fill' ? '#0284C7' : '#6B7280'}
                strokeWidth="0.9"
              />
            </g>
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-blue-green-cap') {
      return (
        <g transform={transform}>
          <g transform={`scale(${scale})`}>
            <g transform="scale(1.9)">
              <path
                d={isUp ? 'M-9,3 C-7,0 -3,-1 0,1.8 C3,-1 7,0 9,3 L7,12.5 C5,15.2 3.2,14.7 0,13 C-3.2,14.7 -5,15.2 -7,12.5 Z' : 'M-9,-3 C-7,0 -3,1 0,-1.8 C3,1 7,0 9,-3 L7,-12.5 C5,-15.2 3.2,-14.7 0,-13 C-3.2,-14.7 -5,-15.2 -7,-12.5 Z'}
                fill="#1FA8E5"
                stroke="#1579A7"
                strokeWidth="1.2"
                strokeLinejoin="round"
                transform={isUp ? undefined : 'translate(0, 5)'}
              />
              <g transform={`translate(0, ${isUp ? -12 : 15})`}>
                <path
                  d={isUp ? "M-8.5,14.5 Q0,22 8.5,14.5 Q0,31 -8.5,14.5" : "M-8.5,-14.5 Q0,-22 8.5,-14.5 Q0,-31 -8.5,-14.5"}
                  fill="#34E33C"
                  stroke="#24C92D"
                  strokeWidth="0.95"
                />
              </g>
            </g>
          </g>
        </g>
      )
    }
    if (visualIcon === 'tooth-purple-canal') {
      return (
        <g transform={transform}>
          <path
            d={isUp ? "M0,-40 L0,5" : "M0,40 L0,-5"}
            stroke="#A855F7"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      )
    }
    return null
  }

  return (
    <div
      className={stateClass}
      style={{ ...styles.nodeWrap, cursor: 'pointer' }}
      onClick={(e) => {
        if (e.shiftKey && onSetSelected) {
          const indices = allTeeth.map((t, i) => (selectedSet.has(t) ? i : -1)).filter((i) => i >= 0)
          const anchor = indices.length ? indices[indices.length - 1]! : allTeeth.indexOf(fdi)
          const end = allTeeth.indexOf(fdi)
          const lo = Math.min(anchor, end)
          const hi = Math.max(anchor, end)
          onSetSelected(Array.from(new Set([...selectedSet, ...allTeeth.slice(lo, hi + 1)])))
          return
        }
        onToggle(fdi)
      }}
    >
      {!isUp && <div style={{ ...styles.nodeLabel, color: selected ? '#58A6FF' : 'var(--muted)', opacity: 0.6 }}>{label}</div>}

      <svg width="25" height="75" viewBox="-24 -65 48 130" style={{
        filter: selected ? 'drop-shadow(0px 0px 4px rgba(56, 182, 255, 0.8))' : 'none',
        transition: 'all 0.2s',
        overflow: 'visible',
      }}>
        {/* Draw Root */}
        <path
          className="tooth-root"
          d={root}
          fill={rootColor}
          stroke={rootStroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Draw Root Canal annotation if present */}
        {!condition?.hasExtraction && rootCanalMarks.length > 0 && (() => {
          const maxRootCanals = 3
          const rootCanalLines = rootCanalMarks.slice(0, maxRootCanals)
          const offsets =
            rootCanalLines.length === 1
              ? [0]
              : rootCanalLines.length === 2
                ? [-3, 3]
                : [-4.5, 0, 4.5]
          return rootCanalLines.map((color, idx) => (
            <path
              key={`rc_${idx}`}
              d={isUp ? "M0,-40 L0,5" : "M0,40 L0,-5"}
              transform={`translate(${offsets[idx] ?? 0}, 0)`}
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ))
        })()}
        {/* extraction cross */}
        {condition?.hasExtraction && (
          <g className="tooth-cross" stroke="#E53E3E" strokeWidth="4" strokeLinecap="round">
            <line x1="-15" y1="-15" x2="15" y2="15" />
            <line x1="-15" y1="15" x2="15" y2="-15" />
          </g>
        )}

        {/* Draw Crown */}
        <path
          className="tooth-crown"
          d={crown}
          fill={crownColor}
          stroke={crownStroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {!condition?.hasExtraction && primaryIcon ? renderIcon(primaryIcon, iconScale, 0, 0) : null}
        {!condition?.hasExtraction && secondaryIcon ? (
          <g opacity={0.9}>
            {renderIcon(secondaryIcon, iconScale * 0.78, 0, 0)}
          </g>
        ) : null}
        {!condition?.hasExtraction && extraCount > 0 ? (
          <g>
            <circle cx="0" cy={isUp ? -30 : 30} r="5.3" fill="#0f172a" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
            <text
              x="0"
              y={isUp ? -30 : 30}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="6.5"
              fontWeight="700"
              fill="#ffffff"
            >
              +{extraCount}
            </text>
          </g>
        ) : null}

        {/* Draw Filling annotation if present */}
        {condition?.hasFilling && !condition?.hasCrown && !condition?.hasExtraction && visualIcons.length === 0 && (
          <path
            d={isUp ? "M-7,12 Q0,18 7,12 Q0,26 -7,12" : "M-7,-12 Q0,-18 7,-12 Q0,-26 -7,-12"}
            fill="#60A5FA" /* Blue filling */
            stroke="#3B82F6"
            strokeWidth="1.5"
          />
        )}
      </svg>

      {isUp && <div style={{ ...styles.nodeLabel, color: selected ? '#58A6FF' : 'var(--muted)', opacity: 0.6 }}>{label}</div>}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapOverrides: {},
  rowHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  chartArea: {
    padding: '24px 12px',
    background: '#1D1F23',
    border: '1px solid var(--border)',
    borderRadius: 16,
    overflowX: 'auto',
  },
  archRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
    minWidth: 'max-content',
  },
  archDivider: {
    height: 1,
    background: '#2d3036',
    margin: '16px auto',
    width: '90%',
  },
  nodeWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '4px',
    borderRadius: 8,
  },
  nodeLabel: {
    fontSize: 14,
    fontWeight: 600,
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    fontSize: 12,
    flexWrap: 'wrap',
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
    border: '1px solid var(--border)',
  },
}
