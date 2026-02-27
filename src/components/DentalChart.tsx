import { FDI_TEETH, toDisplayToothLabel } from '../domain/teeth'
import type { ToothNumberingSystem } from '../domain/types'
import { useTranslation } from '../i18n/useTranslation'

export function DentalChart({
  selected,
  affected,
  numberingSystem,
  onToggle,
  onSetSelected,
}: {
  selected: string[]
  affected?: string[]
  numberingSystem: ToothNumberingSystem
  onToggle: (fdiToothId: string) => void
  onSetSelected?: (next: string[]) => void
}) {
  const { t } = useTranslation()
  const selectedSet = new Set(selected)
  const affectedSet = new Set(affected ?? [])

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

      <div className="dental-chart-arch">
        {upper.map((fdiId) => (
          <ToothButton
            key={fdiId}
            fdi={fdiId}
            label={toDisplayToothLabel(fdiId, numberingSystem)}
            title={t('chart.toothTitle', { label: toDisplayToothLabel(fdiId, numberingSystem), fdi: fdiId })}
            selected={selectedSet.has(fdiId)}
            affected={affectedSet.has(fdiId)}
            onToggle={onToggle}
            onSetSelected={onSetSelected}
            allTeeth={upper}
            selectedSet={selectedSet}
          />
        ))}
      </div>
      <div style={styles.separator} />
      <div className="dental-chart-arch">
        {lower.map((fdiId) => (
          <ToothButton
            key={fdiId}
            fdi={fdiId}
            label={toDisplayToothLabel(fdiId, numberingSystem)}
            title={t('chart.toothTitle', { label: toDisplayToothLabel(fdiId, numberingSystem), fdi: fdiId })}
            selected={selectedSet.has(fdiId)}
            affected={affectedSet.has(fdiId)}
            onToggle={onToggle}
            onSetSelected={onSetSelected}
            allTeeth={lower}
            selectedSet={selectedSet}
          />
        ))}
      </div>

      <div style={styles.legend}>
        <span style={{ ...styles.legendSwatch, background: 'color-mix(in oklab, var(--primary) 40%, transparent)' }} />
        <span className="muted">{t('chart.selected')}</span>
        <span style={{ width: 12 }} />
        <span style={{ ...styles.legendSwatch, background: 'color-mix(in oklab, var(--success) 35%, transparent)' }} />
        <span className="muted">{t('chart.inPlan')}</span>
      </div>
    </div>
  )
}

function ToothButton({
  fdi,
  label,
  title,
  selected,
  affected,
  onToggle,
  onSetSelected,
  allTeeth,
  selectedSet,
}: {
  fdi: string
  label: string
  title: string
  selected: boolean
  affected: boolean
  onToggle: (fdiToothId: string) => void
  onSetSelected?: (next: string[]) => void
  allTeeth: string[]
  selectedSet: Set<string>
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        if (e.shiftKey && onSetSelected) {
          const indices = allTeeth
            .map((t, i) => (selectedSet.has(t) ? i : -1))
            .filter((i) => i >= 0)
          const anchor = indices.length ? indices[indices.length - 1]! : allTeeth.indexOf(fdi)
          const end = allTeeth.indexOf(fdi)
          const lo = Math.min(anchor, end)
          const hi = Math.max(anchor, end)
          onSetSelected(Array.from(new Set([...selectedSet, ...allTeeth.slice(lo, hi + 1)])))
          return
        }
        onToggle(fdi)
      }}
      style={{
        ...styles.tooth,
        ...(selected ? styles.toothSelected : null),
        ...(affected ? styles.toothAffected : null),
      }}
      title={title}
    >
      <div style={{ fontSize: 12, fontWeight: 750 }}>{label}</div>
      <div style={{ fontSize: 11 }} className="muted">
        {fdi}
      </div>
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapOverrides: {},
  rowHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    background: 'var(--border)',
    margin: '10px 0',
  },
  tooth: {
    borderRadius: 14,
    border: '1px solid var(--border)',
    background: 'color-mix(in oklab, var(--panel) 85%, transparent)',
    padding: '10px 6px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 120ms ease',
  },
  toothSelected: {
    border: '1px solid color-mix(in oklab, var(--primary) 55%, var(--border))',
    background: 'color-mix(in oklab, var(--primary) 16%, var(--panel))',
  },
  toothAffected: {
    boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--success) 55%, transparent)',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    fontSize: 12,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
    border: '1px solid var(--border)',
  },
}

