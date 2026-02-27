import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Patient, Service, Settings, TreatmentPlan } from '../domain/types'
import { formatMoney } from '../domain/money'
import { FDI_TEETH, sortTeethFdi, toDisplayToothLabel } from '../domain/teeth'

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
  drawChart(doc, margin, chartY + 12, affected, settings.numberingSystem)

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

function drawChart(
  doc: jsPDF,
  x: number,
  y: number,
  affectedTeethFdi: string[],
  numberingSystem: Settings['numberingSystem'],
) {
  const affected = new Set(affectedTeethFdi)
  const cellW = 28
  const cellH = 22
  const gap = 4
  const upper = FDI_TEETH.slice(0, 16)
  const lower = FDI_TEETH.slice(16)

  const drawRow = (row: string[], rowY: number) => {
    row.forEach((t, i) => {
      const cx = x + i * (cellW + gap)
      const on = affected.has(t)
      doc.setDrawColor(200)
      if (on) {
        doc.setFillColor(36, 192, 138)
        doc.roundedRect(cx, rowY, cellW, cellH, 6, 6, 'FD')
        doc.setTextColor(255)
      } else {
        doc.setFillColor(248, 248, 248)
        doc.roundedRect(cx, rowY, cellW, cellH, 6, 6, 'S')
        doc.setTextColor(90)
      }
      doc.setFontSize(9)
      doc.text(toDisplayToothLabel(t, numberingSystem), cx + cellW / 2, rowY + 14, { align: 'center' })
    })
  }

  drawRow(upper, y)
  drawRow(lower, y + cellH + 8)
  doc.setTextColor(0)
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

