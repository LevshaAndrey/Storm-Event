import { getLanguage, getLocale, t } from './i18n.js'

const formatterCache = new Map()

// Chrome не всегда содержит белорусские данные Intl и подставляет русские месяцы,
// поэтому для be-BY форматируем даты сами.
const BE_MONTHS_SHORT = [
  'студз.', 'лют.', 'сак.', 'крас.', 'мая', 'чэрв.',
  'ліп.', 'жн.', 'верас.', 'кастр.', 'ліс.', 'снеж.'
]
const BE_MONTHS_LONG = [
  'студзеня', 'лютага', 'сакавіка', 'красавіка', 'мая', 'чэрвеня',
  'ліпеня', 'жніўня', 'верасня', 'кастрычніка', 'лістапада', 'снежня'
]
const BE_WEEKDAYS = ['пн', 'аў', 'ср', 'чц', 'пт', 'сб', 'нд']

function beWeekday(date) {
  return BE_WEEKDAYS[(date.getDay() + 6) % 7]
}

function formatter(options) {
  const locale = getLocale()
  const key = `${locale}:${JSON.stringify(options)}`
  let cached = formatterCache.get(key)
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, options)
    formatterCache.set(key, cached)
  }
  return cached
}

export function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value) {
  const date = parseDate(value)
  if (!date) return '—'
  if (getLanguage() === 'be') {
    return `${date.getDate()} ${BE_MONTHS_SHORT[date.getMonth()]}`
  }
  return formatter({ day: 'numeric', month: 'short' }).format(date)
}

export function formatDateLong(value) {
  const date = parseDate(value)
  if (!date) return '—'
  if (getLanguage() === 'be') {
    return `${beWeekday(date)}, ${date.getDate()} ${BE_MONTHS_LONG[date.getMonth()]}`
  }
  return formatter({ day: 'numeric', month: 'long', weekday: 'short' }).format(date)
}

export function formatTime(value) {
  const date = parseDate(value)
  if (!date) return '—'
  if (getLanguage() === 'be') {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  return formatter({ hour: '2-digit', minute: '2-digit' }).format(date)
}

export function formatWeekday(value) {
  const date = parseDate(value)
  if (!date) return ''
  if (getLanguage() === 'be') return beWeekday(date)
  return formatter({ weekday: 'short' }).format(date)
}

export function formatDuration(minutes) {
  if (minutes == null || Number.isNaN(Number(minutes))) return ''
  const total = Math.max(0, Math.round(Number(minutes)))
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (!hours) return `${rest} ${t('мин')}`
  return rest ? `${hours} ${t('ч')} ${rest} ${t('мин')}` : `${hours} ${t('ч')}`
}

export function formatMoney(value, currency = 'BYN') {
  if (value == null || value === '') return '—'
  const number = Number(value)
  if (Number.isNaN(number)) return '—'
  const formatted = new Intl.NumberFormat(getLocale(), {
    maximumFractionDigits: number % 1 === 0 ? 0 : 2
  }).format(number)
  return `${formatted} ${currency || 'BYN'}`
}

export function formatPrice(price) {
  if (!price) return null
  return formatMoney(price.amount, price.currency)
}

export function dateRangeLabel(from, to) {
  if (!from && !to) return t('Даты не выбраны')
  if (!from) return formatDate(to)
  if (!to || from === to) return formatDate(from)
  return `${formatDate(from)} — ${formatDate(to)}`
}

export function todayISO() {
  return localISO(new Date())
}

export function localISO(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date, days) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

export function nextWeekend() {
  const today = new Date()
  const day = today.getDay()
  const daysToSaturday = (6 - day + 7) % 7
  const saturday = addDays(today, daysToSaturday)
  return {
    from: localISO(saturday),
    to: localISO(addDays(saturday, 1))
  }
}

export function eventDate(value) {
  const date = parseDate(value)
  if (!date) return { day: '—', month: '', weekday: '' }
  if (getLanguage() === 'be') {
    return {
      day: String(date.getDate()).padStart(2, '0'),
      month: BE_MONTHS_SHORT[date.getMonth()].replace('.', ''),
      weekday: beWeekday(date)
    }
  }
  const day = formatter({ day: '2-digit' }).format(date)
  const month = formatter({ month: 'short' }).format(date).replace('.', '')
  return { day, month, weekday: formatter({ weekday: 'short' }).format(date) }
}

export function plural(count, one, few, many) {
  const value = Math.abs(Number(count)) % 100
  const last = value % 10
  if (value > 10 && value < 20) return t(many)
  if (last > 1 && last < 5) return t(few)
  if (last === 1) return t(one)
  return t(many)
}

export const domainLabels = {
  TRAIN: 'Поезд',
  BUS: 'Автобус',
  EVENT: 'События',
  HOTEL: 'Отель'
}

export const sourceLabels = {
  ATLAS: 'AtlasBus',
  BZD: 'БЖД',
  TICKET_BUS: 'TicketBus',
  TICKET_PRO: 'TicketPro',
  BEL_HOTEL: 'BelHotel'
}

export const statusLabels = {
  SUCCESS: 'данные получены',
  EMPTY: 'ничего не найдено',
  FAILED: 'источник недоступен'
}

export const sortLabels = {
  BEST: 'Лучшее',
  CHEAPEST: 'Дешевле',
  FASTEST: 'Быстрее'
}

export function offerType(offer) {
  return offer?.['@type'] || (offer?.departure ? 'transport' : offer?.rating ? 'hotel' : 'event')
}

export function offerTitle(offer) {
  if (!offer) return 'Предложение'
  return offer.title || offer.name || 'Предложение'
}
