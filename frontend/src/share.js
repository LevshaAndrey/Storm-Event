import { formatDate, formatPrice, formatTime, offerType } from './format.js'

function pad(value) {
  return String(value).padStart(2, '0')
}

function icsDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(
    date.getUTCHours()
  )}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
}

function escapeICS(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

function eventLines(item, index) {
  const start = icsDate(item.start)
  if (!start) return []
  const end = icsDate(item.end) || icsDate(new Date(new Date(item.start).getTime() + 60 * 60 * 1000))
  const lines = [
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${index}@storm-trip`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(item.title || 'Поездка')}`
  ]
  if (item.location) lines.push(`LOCATION:${escapeICS(item.location)}`)
  if (item.description) lines.push(`DESCRIPTION:${escapeICS(item.description)}`)
  lines.push('END:VEVENT')
  return lines
}

export function downloadICS(filename, items) {
  const events = (items || []).filter((item) => item?.start)
  if (!events.length) return false
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Storm Trip//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events.flatMap(eventLines),
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'storm-trip.ics'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
  return true
}

function transportEvent(offer) {
  const title = offer.title || `${offer.from?.name || 'Отправление'} → ${offer.to?.name || 'Прибытие'}`
  return {
    start: offer.departure,
    end: offer.arrival,
    title,
    location: offer.from?.name,
    description: [
      offer.source,
      offer.price ? formatPrice(offer.price) : null,
      offer.url || null
    ]
      .filter(Boolean)
      .join(' · ')
  }
}

export function combinationToICS(combination) {
  const events = []
  ;(combination.offers || []).forEach((offer) => {
    const type = offerType(offer)
    if (type === 'transport') {
      events.push(transportEvent(offer))
    } else if (type === 'event') {
      events.push({
        start: offer.start,
        end: offer.end,
        title: offer.title,
        location: [offer.venue?.name, offer.venueLocality].filter(Boolean).join(', '),
        description: [offer.price ? formatPrice(offer.price) : null, offer.url || null]
          .filter(Boolean)
          .join(' · ')
      })
    }
  })
  return events
}

export function itineraryToICS(itinerary) {
  return (itinerary.legs || []).map(transportEvent)
}

export function eventToICS(event) {
  return [
    {
      start: event.start,
      end: event.end,
      title: event.title,
      location: [event.venue?.name, event.venueLocality].filter(Boolean).join(', '),
      description: [event.price ? formatPrice(event.price) : null, event.url || null]
        .filter(Boolean)
        .join(' · ')
    }
  ]
}

export function combinationShareText(combination, passengers = 1) {
  const offers = combination.offers || []
  const transport = offers.find((offer) => offerType(offer) === 'transport')
  const event = offers.find((offer) => offerType(offer) === 'event')
  const hotel = offers.find((offer) => offerType(offer) === 'hotel')
  const lines = ['Storm Trip — вариант поездки']
  if (transport) {
    lines.push(
      `${transport.from?.name || '—'} → ${transport.to?.name || '—'}, ${formatDate(
        transport.departure
      )}, ${formatTime(transport.departure)}–${formatTime(transport.arrival)}`
    )
  }
  if (event) lines.push(`Событие: ${event.title}`)
  if (hotel) lines.push(`Отель: ${hotel.title}${hotel.rating ? ` (${hotel.rating}★)` : ''}`)
  lines.push(`Итого: ${formatPrice(combination.totalPrice) || '—'}`)
  if (passengers > 1) {
    const perPerson = Number(combination.totalPrice?.amount) / passengers
    if (Number.isFinite(perPerson)) lines.push(`≈ ${Math.round(perPerson)} BYN на человека`)
  }
  if (combination.tags?.length) lines.push(combination.tags.join(' · '))
  return lines.join('\n')
}

export function itineraryShareText(itinerary) {
  const legs = itinerary.legs || []
  const first = legs[0]
  const last = legs[legs.length - 1]
  const lines = ['Storm Trip — маршрут']
  if (first) {
    lines.push(
      `${first.from?.name || '—'} → ${last?.to?.name || '—'}, ${formatDate(first.departure)}, ${formatTime(
        first.departure
      )}–${formatTime(last?.arrival)}`
    )
  }
  lines.push(`В пути: ${Math.floor(Number(itinerary.durationMinutes) / 60)} ч ${Number(itinerary.durationMinutes) % 60} мин`)
  lines.push(`Цена: ${formatPrice(itinerary.totalPrice) || '—'}`)
  if (Number(itinerary.transfers) > 0) lines.push(`Пересадок: ${itinerary.transfers}`)
  if (itinerary.savings) lines.push(`Экономия: ${formatPrice({ amount: itinerary.savings, currency: 'BYN' })}`)
  if (itinerary.tags?.length) lines.push(itinerary.tags.join(' · '))
  return lines.join('\n')
}

export function eventShareText(event) {
  return [
    event.title,
    [event.venue?.name, event.venueLocality].filter(Boolean).join(', '),
    `${formatDate(event.start)} · ${formatTime(event.start)}`,
    formatPrice(event.price) ? `Билеты: ${formatPrice(event.price)}` : null,
    event.url || null
  ]
    .filter(Boolean)
    .join('\n')
}

export async function shareOrCopy({ title, text }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text })
      return 'shared'
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
