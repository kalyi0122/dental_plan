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
    'tooth-black-cap': 'Black crown',
    'tooth-gold-fill': 'Gold filling',
    'tooth-blue-fill': 'Blue filling',
    'tooth-gray-fill': 'Gray filling',
    'tooth-purple-canal': 'Root canal (purple)',
    'tooth-bridge-x6': 'Veneer x6',
    'tooth-bridge-x7': 'Veneer x7',
    consultation: 'Consultation',
    photos: 'Intraoral photos',
    xray: 'X-ray',
    planning: 'Treatment planning',
  },
  ru: {
    'tooth-pin': 'Р’РєР»Р°РґРєР°',
    implant: 'РРјРїР»Р°РЅС‚',
    'tooth-crown': 'РљРѕСЂРѕРЅРєР°',
    'tooth-inlay': 'РЎРёРЅСѓСЃ Р»РёС„С‚РёРЅРі',
    'tooth-filling': 'РџР»РѕРјР±Р°',
    'tooth-extraction': 'РЈРґР°Р»РµРЅРёРµ',
    'tooth-root-canal': 'Р›РµС‡РµРЅРёРµ РєР°РЅР°Р»Р°',
    'tooth-veneer': 'Р’РёРЅРёСЂ',
    'tooth-blue-block': 'Р‘СЂРµРєРµС‚С‹',
    'tooth-blue-square': 'Р¤РѕСЂРјРёСЂРѕРІР°С‚РµР»СЊ РґРµСЃРЅС‹',
    'tooth-blue-cap': 'РљРѕСЂРѕРЅРєР°',
    'tooth-purple-cap': 'Р’СЂРµРјРµРЅРЅР°СЏ РєРѕСЂРѕРЅРєР°',
    'tooth-blue-green-cap': 'Р’РёРЅРёСЂ',
    'tooth-black-cap': 'Black crown',
    'tooth-gold-fill': 'Gold filling',
    'tooth-blue-fill': 'Blue filling',
    'tooth-gray-fill': 'Gray filling',
    'tooth-purple-canal': 'Root canal (purple)',
    'tooth-bridge-x6': 'Р’РёРЅРёСЂ x6',
    'tooth-bridge-x7': 'Р’РёРЅРёСЂ x7',
    consultation: 'РљРѕРЅСЃСѓР»СЊС‚Р°С†РёСЏ',
    photos: 'РРЅС‚СЂР°РѕСЂР°Р»СЊРЅС‹Рµ С„РѕС‚Рѕ',
    xray: 'Р РµРЅС‚РіРµРЅ',
    planning: 'РџР»Р°РЅРёСЂРѕРІР°РЅРёРµ Р»РµС‡РµРЅРёСЏ',
  },
  kg: {
    'tooth-pin': 'Р’РєР»Р°РґРєР°',
    implant: 'РРјРїР»Р°РЅС‚',
    'tooth-crown': 'РљРѕСЂРѕРЅРєР°',
    'tooth-inlay': 'РЎРёРЅСѓСЃ Р»РёС„С‚РёРЅРі',
    'tooth-filling': 'РџР»РѕРјР±Р°',
    'tooth-extraction': 'РђР»СѓСѓ',
    'tooth-root-canal': 'РљР°РЅР°Р» РґР°СЂС‹Р»РѕРѕ',
    'tooth-veneer': 'Р’РёРЅРёСЂ',
    'tooth-blue-block': 'Р‘СЂРµРєРµС‚',
    'tooth-blue-square': 'РўРёС€ СЌС‚Рё С„РѕСЂРјРёСЂРѕРІР°С‚РµР»Рё',
    'tooth-blue-cap': 'РљРѕСЂРѕРЅРєР°',
    'tooth-purple-cap': 'РЈР±Р°РєС‚С‹Р»СѓСѓ РєРѕСЂРѕРЅРєР°',
    'tooth-blue-green-cap': 'Р’РёРЅРёСЂ',
    'tooth-black-cap': 'Black crown',
    'tooth-gold-fill': 'Gold filling',
    'tooth-blue-fill': 'Blue filling',
    'tooth-gray-fill': 'Gray filling',
    'tooth-purple-canal': 'Root canal (purple)',
    'tooth-bridge-x6': 'Р’РёРЅРёСЂ x6',
    'tooth-bridge-x7': 'Р’РёРЅРёСЂ x7',
    consultation: 'РљРµТЈРµС€ Р±РµСЂТЇТЇ',
    photos: 'РћРѕР· РёС‡Рё СЃТЇСЂУ©С‚ТЇ',
    xray: 'Р РµРЅС‚РіРµРЅ',
    planning: 'Р”Р°СЂС‹Р»РѕРѕ РїР»Р°РЅС‹',
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

