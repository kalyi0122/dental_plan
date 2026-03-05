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

export function getLocalizedServiceName(service: Pick<Service, 'name' | 'icon'>, locale: Locale) {
  const byIcon = ICON_NAME_BY_LOCALE[locale][service.icon]
  if (byIcon) return byIcon
  const normalizedName = service.name.trim().toLowerCase()
  const iconFromName = EN_NAME_TO_ICON[normalizedName]
  if (iconFromName) {
    const byMappedIcon = ICON_NAME_BY_LOCALE[locale][iconFromName]
    if (byMappedIcon) return byMappedIcon
  }
  return service.name
}

