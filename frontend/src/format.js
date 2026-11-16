const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const dateLongFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })
const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' })

export function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value) {
  const date = parseDate(value)
  return date ? dateFormatter.format(date) : '—'
}

export function formatDateLong(value) {
  const date = parseDate(value)
  return date ? dateLongFormatter.format(date) : '—'
}

export function formatTime(value) {
  const date = parseDate(value)
  return date ? timeFormatter.format(date) : '—'
}

export function formatWeekday(value) {
  const date = parseDate(value)
  return date ? weekdayFormatter.format(date) : ''
}

export function formatDuration(minutes) {
  if (minutes == null || Number.isNaN(Number(minutes))) return ''
  const total = Math.max(0, Math.round(Number(minutes)))
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (!hours) return `${rest} мин`
  return rest ? `${hours} ч ${rest} мин` : `${hours} ч`
}

export function formatMoney(value, currency = 'BYN') {
  if (value == null || value === '') return '—'
  const number = Number(value)
  if (Number.isNaN(number)) return '—'
  const formatted = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: number % 1 === 0 ? 0 : 2
  }).format(number)
  return `${formatted} ${currency || 'BYN'}`
}

export function formatPrice(price) {
  if (!price) return null
  return formatMoney(price.amount, price.currency)
}

export function dateRangeLabel(from, to) {
  if (!from && !to) return 'Даты не выбраны'
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
  const day = new Intl.DateTimeFormat('ru-RU', { day: '2-digit' }).format(date)
  const month = new Intl.DateTimeFormat('ru-RU', { month: 'short' }).format(date).replace('.', '')
  return { day, month, weekday: weekdayFormatter.format(date) }
}

export function plural(count, one, few, many) {
  const value = Math.abs(Number(count)) % 100
  const last = value % 10
  if (value > 10 && value < 20) return many
  if (last > 1 && last < 5) return few
  if (last === 1) return one
  return many
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
