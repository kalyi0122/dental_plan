import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Patient, Service, Settings, ToothNumberingSystem, TreatmentPlan } from '../domain/types'
import { formatMoney } from '../domain/money'
import {
  sortTeethFdi,
  mapPlanToToothConditions,
  buildDentalChartSvg,
} from '../domain/teeth'
import type { ToothCondition } from '../domain/teeth'

// Убедись, что этот файл существует в папке src/assets/

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
  doc.roundedRect(margin, startY, pageW - margin * 2, 60, 10, 10, 'S')
  doc.setFontSize(10)
  const splitGreeting = doc.splitTextToSize(greeting, pageW - margin * 2 - 20)
  doc.text(splitGreeting, margin + 10, startY + 20)

  // Dental chart
  const toothConditions = mapPlanToToothConditions(plan, serviceById)
  const chartY = startY + 80
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Dental Chart', margin, chartY)

  const chartWidth = pageW - margin * 2
  const chartHeight = Math.round((chartWidth * 220) / 480) // preserve dental chart aspect ratio
  await drawChartAsync(doc, margin, chartY + 10, chartWidth, chartHeight, toothConditions, settings.numberingSystem)

  // Table
  const tableY = chartY + 10 + chartHeight + 16
  const { rows, totalCents } = buildRows(plan, serviceById)

  autoTable(doc, {
    startY: tableY,
    margin: { left: margin, right: margin },
    head: [['Stage', 'Service', 'Scope', 'Qty', 'Unit', 'Total']],
    body: rows.map((r) => [
      r.stage,
      r.service,
      r.scope,
      String(r.qty),
      formatMoney(r.unitCents, settings.currency),
      formatMoney(r.lineTotalCents, settings.currency),
    ]),
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [47, 111, 235] },
  })

  const finalY = (doc as any).lastAutoTable?.finalY || tableY + 100
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total: ${formatMoney(totalCents, settings.currency)}`, pageW - margin, finalY + 20, { align: 'right' })

  // Сохранение
  const safeName = patient.fullName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
  doc.save(`Estimate_${safeName}.pdf`)
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (ИСПРАВЛЕНЫ И ЗАКРЫТЫ) ---

function substitute(text: string, patient: Patient) {
  return text
    .replaceAll('{patientName}', patient.fullName)
    .replaceAll('{patient_name}', patient.fullName)
}

async function svgToPngDataUrl(svgString: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
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
  width: number,
  height: number,
  toothConditions: Map<string, ToothCondition>,
  numberingSystem: ToothNumberingSystem,
) {
  const svg = buildDentalChartSvg(toothConditions, numberingSystem)
  try {
    const pngData = await svgToPngDataUrl(svg, width, height)
    doc.addImage(pngData, 'PNG', x, y, width, height)
  } catch (e) {
    console.error("SVG chart failed", e)
  }
} // <--- Теперь функция закрыта корректно

function buildRows(
  plan: TreatmentPlan,
  serviceById: Map<string, Service>,
) {
  let totalCents = 0
  const rows = plan.procedures.map(p => {
    const svc = serviceById.get(p.serviceId)
    const unitCents = svc?.priceCents ?? 0
    const qty = p.quantity || 1
    const lineTotal = unitCents * qty
    totalCents += lineTotal

    return {
      stage: 'Treatment',
      service: svc?.name ?? 'Unknown',
      scope: p.toothIds ? `Teeth: ${sortTeethFdi(p.toothIds).join(', ')}` : 'General',
      qty,
      unitCents,
      lineTotalCents: lineTotal
    }
  })
  return { rows, totalCents }
}
