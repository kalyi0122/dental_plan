import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type {
  JawRegion,
  Patient,
  PlanProcedure,
  Service,
  Settings,
  ToothNumberingSystem,
  TreatmentPlan,
} from '../domain/types'
import { formatMoney } from '../domain/money'
import {
  buildDentalChartSvg,
  sortTeethFdi,
  toDisplayToothLabel,
} from '../domain/teeth'
import type { ToothCondition } from '../domain/teeth'
import { mapPlanToToothConditions } from '../domain/teeth'

type PdfCopy = {
  planTitle: string
  patient: string
  createdAt: string
  chart: string
  stage: string
  unstaged: string
  no: string
  service: string
  unitPrice: string
  qty: string
  lineTotal: string
  total: string
  teeth: string
  jaw: string
  general: string
  missingService: string
  maxilla: string
  mandible: string
  bothJaws: string
  filePrefix: string
}

const PDF_COPY: Record<Settings['locale'], PdfCopy> = {
  ru: {
    planTitle: 'План лечения',
    patient: 'Пациент',
    createdAt: 'Дата создания',
    chart: 'Схема зубов',
    stage: 'Этап',
    unstaged: 'Без этапа',
    no: '№',
    service: 'Услуга',
    unitPrice: 'Цена за ед.',
    qty: 'Кол-во',
    lineTotal: 'Всего',
    total: 'ИТОГО ПО ПРАЙСУ',
    teeth: 'Зубы',
    jaw: 'Челюсть',
    general: 'Общие',
    missingService: 'Услуга удалена',
    maxilla: 'Верхняя челюсть',
    mandible: 'Нижняя челюсть',
    bothJaws: 'Обе челюсти',
    filePrefix: 'План',
  },
  kg: {
    planTitle: 'Дарылоо планы',
    patient: 'Пациент',
    createdAt: 'Түзүлгөн күнү',
    chart: 'Тиш схемасы',
    stage: 'Этап',
    unstaged: 'Этапсыз',
    no: '№',
    service: 'Кызмат',
    unitPrice: 'Баасы',
    qty: 'Саны',
    lineTotal: 'Жыйынтык',
    total: 'ЖАЛПЫ БАА',
    teeth: 'Тиштер',
    jaw: 'Жаак',
    general: 'Жалпы',
    missingService: 'Кызмат өчүрүлгөн',
    maxilla: 'Үстүңкү жаак',
    mandible: 'Төмөнкү жаак',
    bothJaws: 'Эки жаак',
    filePrefix: 'План',
  },
  en: {
    planTitle: 'Treatment Plan',
    patient: 'Patient',
    createdAt: 'Created at',
    chart: 'Dental Chart',
    stage: 'Stage',
    unstaged: 'Unstaged',
    no: '#',
    service: 'Service',
    unitPrice: 'Unit price',
    qty: 'Qty',
    lineTotal: 'Total',
    total: 'TOTAL',
    teeth: 'Teeth',
    jaw: 'Jaw',
    general: 'General',
    missingService: 'Missing service',
    maxilla: 'Maxilla',
    mandible: 'Mandible',
    bothJaws: 'Both jaws',
    filePrefix: 'Plan',
  },
}

let fontDataPromise: Promise<{ regularB64: string; boldB64: string }> | null = null

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
  const copy = settings.locale === 'kg' ? PDF_COPY.kg : PDF_COPY.ru
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  await ensurePdfFonts(doc)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 40
  const rightX = pageW - margin

  const serviceById = new Map(services.map((s) => [s.id, s]))
  const greeting = substitute(settings.quoteText.greeting, patient)
  const terms = substitute(settings.quoteText.terms, patient)
  const footer = substitute(settings.quoteText.footer, patient)

  let y = 56

  // Title
  doc.setFont('NotoSans', 'bold')
  doc.setFontSize(28)
  doc.text(copy.planTitle, pageW / 2, y, { align: 'center' })
  y += 54

  // Patient and date
  doc.setFont('NotoSans', 'normal')
  doc.setFontSize(12)
  doc.text(`${copy.patient}: ${patient.fullName}`, margin, y)
  y += 22
  doc.text(`${copy.createdAt}: ${formatDateTime(Date.now(), settings.locale)}`, margin, y)
  y += 32

  // Greeting block from settings
  const greetingLines = doc.splitTextToSize(greeting, pageW - margin * 2)
  doc.setFont('NotoSans', 'bold')
  doc.setFontSize(13)
  doc.text(greetingLines, margin, y)
  y += greetingLines.length * 17 + 26

  // Dental chart
  doc.setFont('NotoSans', 'bold')
  doc.setFontSize(14)
  doc.text(copy.chart, margin, y)
  y += 16

  const toothConditions = mapPlanToToothConditions(plan, serviceById)
  const chartWidth = pageW - margin * 2
  const chartHeight = Math.round((chartWidth * 220) / 480)
  await drawChartAsync(doc, margin, y, chartWidth, chartHeight, toothConditions, settings.numberingSystem)
  y += chartHeight + 34

  const stageSections = groupProceduresByStage(plan)
  let grandTotal = 0

  stageSections.forEach((section) => {
    if (y > pageH - 190) {
      doc.addPage()
      y = 52
    }

    const sectionRows = section.procedures.map((proc, i) => {
      const svc = serviceById.get(proc.serviceId)
      const unitCents = svc?.priceCents ?? 0
      const qty = proc.quantity || 1
      const lineCents = unitCents * qty
      grandTotal += lineCents

      return {
        no: String(i + 1),
        service: `${svc?.name ?? copy.missingService}${buildScopeLine(proc, settings.numberingSystem, copy)}`,
        unit: formatMoney(unitCents, settings.currency),
        qty: String(qty),
        total: formatMoney(lineCents, settings.currency),
        lineCents,
      }
    })

    const stageTotal = sectionRows.reduce((sum, r) => sum + r.lineCents, 0)
    const stageTitle = section.title ? section.title : copy.unstaged
    doc.setFont('NotoSans', 'bold')
    doc.setFontSize(16)
    doc.text(stageTitle, margin, y)
    doc.text(formatMoney(stageTotal, settings.currency), rightX, y, { align: 'right' })
    y += 12

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [[copy.no, copy.service, copy.unitPrice, copy.qty, copy.lineTotal]],
      body: sectionRows.map((r) => [r.no, r.service, r.unit, r.qty, r.total]),
      theme: 'plain',
      styles: {
        font: 'NotoSans',
        fontSize: 11,
        cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
        valign: 'top',
      },
      headStyles: {
        fontStyle: 'bold',
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: pageW - margin * 2 - 190 },
        2: { cellWidth: 76, halign: 'right' },
        3: { cellWidth: 52, halign: 'right' },
        4: { cellWidth: 62, halign: 'right' },
      },
    })
    y = ((doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y) + 34
  })

  if (y > pageH - 170) {
    doc.addPage()
    y = 56
  }

  doc.setFont('NotoSans', 'bold')
  doc.setFontSize(22)
  doc.text(`${copy.total}: ${formatMoney(grandTotal, settings.currency)}`, margin, y)
  y += 30

  // Terms and footer from settings
  doc.setFont('NotoSans', 'normal')
  doc.setFontSize(12)
  const termsLines = doc.splitTextToSize(terms, pageW - margin * 2)
  const footerLines = doc.splitTextToSize(footer, pageW - margin * 2)
  const allText = [...termsLines, '', ...footerLines]
  doc.text(allText, margin, y)

  const safeName = patient.fullName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
  doc.save(`${copy.filePrefix}_${safeName}.pdf`)
}

async function ensurePdfFonts(doc: jsPDF) {
  if (!fontDataPromise) {
    fontDataPromise = loadFontData()
  }
  const { regularB64, boldB64 } = await fontDataPromise
  // Important: register fonts on each jsPDF instance (each export creates a new doc).
  doc.addFileToVFS('NotoSans-Regular.ttf', regularB64)
  doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal')
  doc.addFileToVFS('NotoSans-Bold.ttf', boldB64)
  doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold')
}

async function loadFontData() {
  const regularUrl = new URL('../assets/fonts/NotoSans-Regular.ttf', import.meta.url).toString()
  const boldUrl = new URL('../assets/fonts/NotoSans-Bold.ttf', import.meta.url).toString()
  const [regularB64, boldB64] = await Promise.all([
    fetchFontBase64(regularUrl),
    fetchFontBase64(boldUrl),
  ])
  return { regularB64, boldB64 }
}

async function fetchFontBase64(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load font: ${url}`)
  const buf = await res.arrayBuffer()
  return uint8ToBase64(new Uint8Array(buf))
}

function uint8ToBase64(bytes: Uint8Array) {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function groupProceduresByStage(plan: TreatmentPlan): Array<{ title: string; procedures: PlanProcedure[] }> {
  const stages = plan.stages.slice().sort((a, b) => a.order - b.order)
  const byStage = new Map<string, PlanProcedure[]>()
  const validStageIds = new Set(stages.map((s) => s.id))

  plan.procedures.forEach((p) => {
    const stageKey = p.stageId && validStageIds.has(p.stageId) ? p.stageId : '__unstaged__'
    if (!byStage.has(stageKey)) byStage.set(stageKey, [])
    byStage.get(stageKey)!.push(p)
  })

  const sections: Array<{ title: string; procedures: PlanProcedure[] }> = []
  stages.forEach((stage) => {
    const items = byStage.get(stage.id) ?? []
    if (items.length > 0) sections.push({ title: stage.name, procedures: items })
  })

  const unstaged = byStage.get('__unstaged__') ?? []
  if (unstaged.length > 0) sections.push({ title: '', procedures: unstaged })

  return sections.length > 0 ? sections : [{ title: '', procedures: plan.procedures }]
}

function buildScopeLine(proc: PlanProcedure, numberingSystem: ToothNumberingSystem, copy: PdfCopy) {
  if (proc.scope === 'TOOTH' && proc.toothIds?.length) {
    const teeth = sortTeethFdi(proc.toothIds)
      .map((id) => toDisplayToothLabel(id, numberingSystem))
      .join(', ')
    return `\n${copy.teeth}: ${teeth}`
  }
  if (proc.scope === 'JAW') {
    return `\n${copy.jaw}: ${jawLabel(proc.jaw, copy)}`
  }
  return `\n${copy.general}`
}

function jawLabel(jaw: JawRegion | undefined, copy: PdfCopy) {
  if (jaw === 'MANDIBLE') return copy.mandible
  if (jaw === 'BOTH') return copy.bothJaws
  return copy.maxilla
}

function substitute(text: string, patient: Patient) {
  return text
    .replaceAll('{patientName}', patient.fullName)
    .replaceAll('{patient_name}', patient.fullName)
}

function formatDateTime(ts: number, locale: Settings['locale']) {
  const lang = locale === 'ru' ? 'ru-RU' : locale === 'kg' ? 'ky-KG' : 'en-US'
  return new Date(ts).toLocaleString(lang, {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
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
    console.error('SVG chart failed', e)
  }
}
