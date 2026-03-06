import type { Locale, Service } from './types'

const ICON_NAME_BY_LOCALE: Record<Locale, Record<string, string>> = {
  en: {
    'tooth-pin': 'Inlay',
    implant: 'Implant',
    'tooth-crown': 'Crown',
    'tooth-inlay': 'Sinus lift',
    'tooth-filling': 'Filling',
    'tooth-extraction': 'Extraction',
    'tooth-root-canal': 'Root canal treatment',
    'tooth-veneer': 'Veneer',
    'tooth-blue-block': 'Braces',
    'tooth-blue-square': 'Gum former',
    'tooth-blue-cap': 'Crown',
    'tooth-purple-cap': 'Temporary crown',
    'tooth-blue-green-cap': 'Veneer',
    'tooth-bridge-x6': 'Veneer x6',
    'tooth-bridge-x7': 'Veneer x7',
    consultation: 'Consultation',
    photos: 'Intraoral photos',
    xray: 'X-ray',
    planning: 'Treatment planning',
  },
  ru: {
    'tooth-pin': 'Вкладка',
    implant: 'Имплант',
    'tooth-crown': 'Коронка',
    'tooth-inlay': 'Синус лифтинг',
    'tooth-filling': 'Пломба',
    'tooth-extraction': 'Удаление',
    'tooth-root-canal': 'Лечение канала',
    'tooth-veneer': 'Винир',
    'tooth-blue-block': 'Брекеты',
    'tooth-blue-square': 'Формирователь десны',
    'tooth-blue-cap': 'Коронка',
    'tooth-purple-cap': 'Временная коронка',
    'tooth-blue-green-cap': 'Винир',
    'tooth-bridge-x6': 'Винир x6',
    'tooth-bridge-x7': 'Винир x7',
    consultation: 'Консультация',
    photos: 'Интраоральные фото',
    xray: 'Рентген',
    planning: 'Планирование лечения',
  },
  kg: {
    'tooth-pin': 'Вкладка',
    implant: 'Имплант',
    'tooth-crown': 'Коронка',
    'tooth-inlay': 'Синус лифтинг',
    'tooth-filling': 'Пломба',
    'tooth-extraction': 'Алуу',
    'tooth-root-canal': 'Канал дарылоо',
    'tooth-veneer': 'Винир',
    'tooth-blue-block': 'Брекет',
    'tooth-blue-square': 'Тиш эти формирователи',
    'tooth-blue-cap': 'Коронка',
    'tooth-purple-cap': 'Убактылуу коронка',
    'tooth-blue-green-cap': 'Винир',
    'tooth-bridge-x6': 'Винир x6',
    'tooth-bridge-x7': 'Винир x7',
    consultation: 'Кеңеш берүү',
    photos: 'Ооз ичи сүрөтү',
    xray: 'Рентген',
    planning: 'Дарылоо планы',
  },
}

const EN_NAME_TO_ICON: Record<string, string> = {
  filling: 'tooth-filling',
  'professional cleaning': 'tooth-pin',
  crown: 'tooth-crown',
  'root canal treatment': 'tooth-root-canal',
  extraction: 'tooth-extraction',
  consultation: 'consultation',
  'intraoral photos': 'photos',
  'x-ray': 'xray',
  'treatment planning': 'planning',
}

const KNOWN_NAME_TO_ICON: Record<string, string> = { ...EN_NAME_TO_ICON }
for (const dict of Object.values(ICON_NAME_BY_LOCALE)) {
  for (const [icon, label] of Object.entries(dict)) {
    KNOWN_NAME_TO_ICON[label.trim().toLowerCase()] = icon
  }
}

export function getLocalizedServiceName(service: Pick<Service, 'name' | 'icon'>, locale: Locale) {
  const normalizedName = service.name.trim().toLowerCase()
  const iconFromName = KNOWN_NAME_TO_ICON[normalizedName]
  const isPickerLabel = service.name.trim().toLowerCase() === service.icon.trim().toLowerCase()

  // Keep user-defined/custom names as-is; only localize default/demo labels.
  if (!isPickerLabel && !iconFromName) return service.name

  const targetIcon = iconFromName ?? service.icon
  const byIcon = ICON_NAME_BY_LOCALE[locale][targetIcon]
  if (byIcon) return byIcon
  return service.name
}
