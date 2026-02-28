import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Patient, Service, Settings, TreatmentPlan } from '../domain/types'
import { formatMoney } from '../domain/money'
import { FDI_TEETH, sortTeethFdi, toDisplayToothLabel, getToothPaths } from '../domain/teeth'

export async function generateQuotePdf({
  patient,
  plan,
  services,
  settings,
}: {
  patient: Patient
  plan: TreatmentPlan
  services: Service[]
  settings: Settings
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 40

  const serviceById = new Map(services.map((s) => [s.id, s]))

  const greeting = substitute(settings.quoteText.greeting, patient)
  const terms = substitute(settings.quoteText.terms, patient)
  const footer = substitute(settings.quoteText.footer, patient)

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Treatment Estimate', margin, 54)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(90)
  doc.text(`Plan: ${plan.title}`, margin, 74)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, 90)

  doc.setTextColor(0)
  doc.setFont('helvetica', 'bold')
  doc.text('Patient', pageW - margin - 180, 54)
  doc.setFont('helvetica', 'normal')
  const pLines = [
    patient.fullName,
    patient.phone ? `Phone: ${patient.phone}` : undefined,
    patient.email ? `Email: ${patient.email}` : undefined,
  ].filter(Boolean) as string[]
  pLines.forEach((l, i) => doc.text(l, pageW - margin - 180, 74 + i * 14))

  // Greeting block
  const startY = 116
  doc.setDrawColor(200)
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(margin, startY, pageW - margin * 2, 66, 10, 10, 'S')
  doc.setFontSize(11)
  doc.text(doc.splitTextToSize(greeting, pageW - margin * 2 - 18), margin + 10, startY + 22)

  // Dental chart (affected teeth)
  const affected = collectAffectedTeeth(plan)
  const chartY = startY + 86
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Affected teeth', margin, chartY)
  await drawChartAsync(doc, margin, chartY + 12, affected, settings.numberingSystem)

  // Table
  const tableY = chartY + 120
  const { rows, totalCents } = buildRows(plan, serviceById, settings.numberingSystem)

  autoTable(doc, {
    startY: tableY,
    margin: { left: margin, right: margin },
    head: [['Stage', 'Service', 'Scope', 'Qty', 'Unit', 'Line total']],
    body: rows.map((r) => [
      r.stage,
      r.service,
      r.scope,
      String(r.qty),
      formatMoney(r.unitCents, settings.currency),
      formatMoney(r.lineTotalCents, settings.currency),
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 6,
    },
    headStyles: { fillColor: [47, 111, 235] },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
    didDrawPage: () => {
      // no-op
    },
  })

  const afterTable = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 14 : tableY + 180

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`Total: ${formatMoney(totalCents, settings.currency)}`, pageW - margin, afterTable, { align: 'right' })

  // Terms + footer blocks
  const blockY = afterTable + 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Terms & conditions', margin, blockY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(60)
  doc.text(doc.splitTextToSize(terms, pageW - margin * 2), margin, blockY + 16)

  const footerY = blockY + 16 + doc.getTextDimensions(doc.splitTextToSize(terms, pageW - margin * 2)).h + 14
  doc.setTextColor(0)
  doc.setFont('helvetica', 'bold')
  doc.text('Footer', margin, footerY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60)
  doc.text(doc.splitTextToSize(footer, pageW - margin * 2), margin, footerY + 16)

  const safeName = patient.fullName.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')
  doc.save(`Estimate_${safeName || 'Patient'}.pdf`)
}

function substitute(text: string, patient: Patient) {
  return text.replaceAll('{patientName}', patient.fullName).replaceAll('{patient_name}', patient.fullName)
}

function collectAffectedTeeth(plan: TreatmentPlan) {
  const ids: string[] = []
  plan.procedures.forEach((p) => {
    if (p.scope === 'TOOTH' && p.toothIds?.length) ids.push(...p.toothIds)
  })
  return Array.from(new Set(ids))
}

async function svgToPngDataUrl(svgString: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      // Render at 2x resolution for better PDF print quality
      canvas.width = width * 2
      canvas.height = height * 2
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(2, 2)
        ctx.drawImage(img, 0, 0, width, height)
      }
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('SVG render failed'))
    }
    img.src = url
  })
}

async function drawChartAsync(
  doc: jsPDF,
  x: number,
  y: number,
  affectedTeethFdi: string[],
  numberingSystem: Settings['numberingSystem'],
) {
  const affected = new Set(affectedTeethFdi)
  const cellW = 30
  const gap = 0
  const scale = 0.65 // zoom in teeth
  const rowYUpper = 50
  const rowYLower = 160

  const upper = FDI_TEETH.slice(0, 16)
  // reverse lower jaw so 48 (Universal 32) is on the left
  const lower = FDI_TEETH.slice(16).reverse()

  const canvasW = 16 * (cellW + gap)
  const canvasH = 220

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}">`

  const addRow = (seq: string[], rowY: number) => {
    seq.forEach((t, i) => {
      const cx = i * (cellW + gap)
      const on = affected.has(t)
      const isUp = t.startsWith('1') || t.startsWith('2')

      const lbl = toDisplayToothLabel(t, numberingSystem)
      // Number position
      const labelY = isUp ? rowY - 40 : rowY + 50

      svg += `<text x="${cx + cellW / 2}" y="${labelY}" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold" fill="#111111" text-anchor="middle" dy="0.35em">${lbl}</text>`

      const paths = getToothPaths(t)
      const gX = cx + cellW / 2
      const gY = rowY

      svg += `<g transform="translate(${gX}, ${gY}) scale(${scale})">`

      // root
      svg += `<path d="${paths.root}" fill="#ffffff" stroke="#111111" stroke-width="2.5" stroke-linejoin="round" />`
      // crown
      svg += `<path d="${paths.crown}" fill="#ffffff" stroke="#111111" stroke-width="2.5" stroke-linejoin="round" />`

      if (on) {
        // dense light blue scribble
        svg += `<g stroke="#5bc0de" stroke-width="6" stroke-linecap="round">`
        if (isUp) {
          for (let sy = -50; sy <= 20; sy += 10) {
            svg += `<line x1="-15" y1="${sy}" x2="15" y2="${sy - 4}" />`
          }
        } else {
          for (let sy = -20; sy <= 50; sy += 10) {
            svg += `<line x1="-15" y1="${sy}" x2="15" y2="${sy - 4}" />`
          }
        }
        svg += `</g>`
      }

      svg += `</g>`
    })
  }

  addRow(upper, rowYUpper)
  addRow(lower, rowYLower)

  svg += `</svg>`

  try {
    const pngData = await svgToPngDataUrl(svg, canvasW, canvasH)
    doc.addImage(pngData, 'PNG', x, y, canvasW, canvasH)
  } catch (e) {
    console.error('Failed to render tooth chart svg', e)
  }
}

function buildRows(
  plan: TreatmentPlan,
  serviceById: Map<string, Service>,
  numberingSystem: Settings['numberingSystem'],
) {
  const stages = plan.stages.slice().sort((a, b) => a.order - b.order)
  const stageLabelById = new Map(stages.map((s) => [s.id, s.name]))

  const orderKey = (p: any) => {
    const stageOrder = p.stageId ? stages.find((s) => s.id === p.stageId)?.order ?? 999 : 0
    const stageName = p.stageId ? stageLabelById.get(p.stageId) ?? '' : 'Unstaged'
    return `${String(stageOrder).padStart(3, '0')}|${stageName}`
  }

  const procedures = plan.procedures.slice().sort((a, b) => orderKey(a).localeCompare(orderKey(b)))

  const rows: {
    stage: string
    service: string
    scope: string
    qty: number
    unitCents: number
    lineTotalCents: number
  }[] = []

  let totalCents = 0

  for (const p of procedures) {
    const svc = serviceById.get(p.serviceId)
    const stage = p.stageId ? stageLabelById.get(p.stageId) ?? 'Stage' : 'Unstaged'
    const unitCents = svc?.priceCents ?? 0
    const qty = Math.max(1, p.quantity || 1)
    const lineTotalCents = unitCents * qty
    totalCents += lineTotalCents

    const scope =
      p.scope === 'TOOTH'
        ? `Teeth ${p.toothIds?.length ? sortTeethFdi(p.toothIds).map((t) => toDisplayToothLabel(t, numberingSystem)).join(', ') : '—'}`
        : p.scope === 'JAW'
          ? `Jaw ${p.jaw ?? '—'}`
          : 'General'

    rows.push({
      stage,
      service: svc?.name ?? 'Missing service',
      scope,
      qty,
      unitCents,
      lineTotalCents,
    })
  }

  return { rows, totalCents }
}

