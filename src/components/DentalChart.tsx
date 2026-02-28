import { FDI_TEETH, toDisplayToothLabel, getToothPaths } from '../domain/teeth'
import type { ToothNumberingSystem } from '../domain/types'
import { useTranslation } from '../i18n/useTranslation'

export type ToothCondition = {
  hasCrown?: boolean
  hasFilling?: boolean
  hasRootCanal?: boolean
  hasExtraction?: boolean
}

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
        <span className="muted">Crown</span>
        <span style={{ width: 12 }} />
        <span style={{ ...styles.legendSwatch, background: '#38A169' }} />
        <span className="muted">Filling</span>
        <span style={{ width: 12 }} />
        <span style={{ ...styles.legendSwatch, background: '#1F2937' }} />
        <span className="muted">Extracted</span>
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

  // Apply visual colors for conditions exactly as requested
  let rootColor = selected ? 'rgba(56, 182, 255, 0.25)' : '#FFF0E6' // slight pinkish/peach root like in real anatomy
  let rootStroke = '#D1D5DB'
  let crownColor = selected ? 'rgba(56, 182, 255, 0.4)' : '#FFFFFF' // pure white crown
  let crownStroke = '#9CA3AF'

  if (condition?.hasExtraction) {
    rootColor = '#111111'
    crownColor = '#111111'
    rootStroke = '#555555'
    crownStroke = '#555555'
  } else if (condition?.hasCrown) {
    crownColor = '#FCD34D' // Yellow/Gold Crown
    crownStroke = '#B45309'
  }

  return (
    <div
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
      }}>
        {/* Draw Root */}
        <path
          d={root}
          fill={rootColor}
          stroke={rootStroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Draw Root Canal annotation if present */}
        {condition?.hasRootCanal && !condition?.hasExtraction && (
          <path
            d={isUp ? "M0,-40 L0,5" : "M0,40 L0,-5"}
            stroke="#A855F7" /* Purple line */
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}

        {/* Draw Crown */}
        <path
          d={crown}
          fill={crownColor}
          stroke={crownStroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Draw Filling annotation if present */}
        {condition?.hasFilling && !condition?.hasCrown && !condition?.hasExtraction && (
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
