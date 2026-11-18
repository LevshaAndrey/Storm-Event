import { useState } from 'react'
import { formatDateLong, formatPrice, formatTime } from '../format.js'
import { Icon } from '../icons.jsx'
import { downloadICS, eventShareText, eventToICS, shareOrCopy } from '../share.js'
import { Sheet } from './Sheet.jsx'

export function EventSheet({ event, categoryLabel, onClose, onSelect, onNotify }) {
  const [broken, setBroken] = useState(false)
  if (!event) return null

  const place = [event.venue?.name, event.venueLocality].filter(Boolean).join(', ')
  const region = [event.venueDistrict, event.venueRegion, event.venueCountry].filter(Boolean).join(', ')
  const coordinates = event.venue?.coordinates
  const mapUrl = coordinates
    ? `https://yandex.by/maps/?pt=${coordinates.longitude},${coordinates.latitude}&z=16&l=map`
    : `https://yandex.by/maps/?text=${encodeURIComponent([place, region].filter(Boolean).join(', '))}`

  async function share() {
    const result = await shareOrCopy({ title: event.title, text: eventShareText(event) })
    if (result === 'copied') onNotify?.('Событие скопировано — можно отправить в мессенджер.')
    if (result === 'failed') onNotify?.('Не удалось поделиться событием.', 'error')
  }

  function calendar() {
    const ok = downloadICS('storm-trip-event.ics', eventToICS(event))
    onNotify?.(ok ? 'Событие добавлено в календарь' : 'У события нет времени начала.', ok ? 'info' : 'error')
  }

  return (
    <Sheet open onClose={onClose} title={event.title} subtitle={categoryLabel || 'событие'}>
      <div className="event-sheet">
        <div className="event-sheet-cover">
          {event.imageUrl && !broken ? (
            <img src={event.imageUrl} alt="" onError={() => setBroken(true)} />
          ) : (
            <span className="cover-fallback"><Icon name="ticket" size={34} /></span>
          )}
        </div>

        <div className="event-sheet-meta">
          <span><Icon name="calendar" size={16} />{formatDateLong(event.start)}</span>
          <span>
            <Icon name="clock" size={16} />
            {formatTime(event.start)}
            {event.end ? `–${formatTime(event.end)}` : ''}
          </span>
          <span><Icon name="pin" size={16} />{place || 'Место уточняется'}</span>
          {region ? <span><Icon name="map" size={16} />{region}</span> : null}
          <span><Icon name="wallet" size={16} />{formatPrice(event.price) || 'цена не указана'}</span>
        </div>

        <div className="event-sheet-actions">
          <button type="button" className="btn btn-primary btn-block" onClick={() => onSelect(event)}>
            <Icon name="route" size={17} /> Собрать маршрут
          </button>
          <div className="share-row">
            <button type="button" className="btn btn-dark btn-small" onClick={calendar}>
              <Icon name="calendarPlus" size={16} /> В календарь
            </button>
            <button type="button" className="btn btn-dark btn-small" onClick={share}>
              <Icon name="share" size={16} /> Поделиться
            </button>
            <a className="btn btn-dark btn-small" href={mapUrl} target="_blank" rel="noreferrer">
              <Icon name="map" size={16} /> На карте
            </a>
            {event.url ? (
              <a className="btn btn-soft btn-small" href={event.url} target="_blank" rel="noreferrer">
                Билеты <Icon name="external" size={14} />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Sheet>
  )
}
