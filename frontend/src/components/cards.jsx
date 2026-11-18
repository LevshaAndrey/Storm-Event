import { useState } from 'react'
import { haptic } from '../haptics.js'
import { Icon } from '../icons.jsx'
import {
  combinationShareText,
  combinationToICS,
  downloadICS,
  itineraryShareText,
  itineraryToICS,
  shareOrCopy
} from '../share.js'
import {
  domainLabels,
  formatDate,
  formatDateLong,
  formatDuration,
  formatPrice,
  formatTime,
  offerType,
  plural,
  sourceLabels,
  statusLabels
} from '../format.js'
import { t } from '../i18n.js'

export function OfferRow({ offer, showLink = true }) {
  const [broken, setBroken] = useState(false)
  const type = offerType(offer)
  const price = formatPrice(offer?.price)
  const url = offer?.url
  const source = t(sourceLabels[offer?.source] || offer?.source)
  let icon = 'ticket'
  let title = offer?.title || t('Предложение')
  let meta = []
  let thumb = null

  if (type === 'transport') {
    icon = offer.domain === 'TRAIN' ? 'train' : 'bus'
    title = offer.title || `${offer.from?.name || '—'} → ${offer.to?.name || '—'}`
    meta = [
      `${formatDate(offer.departure)} · ${formatTime(offer.departure)} → ${formatTime(offer.arrival)}`,
      offer.direct ? t('без пересадок') : t('с пересадками'),
      source
    ]
  } else if (type === 'hotel') {
    icon = 'hotel'
    meta = [offer.location?.name, offer.rating ? `${offer.rating}★` : null, source]
  } else {
    icon = 'ticket'
    meta = [
      `${formatDateLong(offer.start)} · ${formatTime(offer.start)}${offer.end ? `–${formatTime(offer.end)}` : ''}`,
      [offer.venue?.name, offer.venueLocality].filter(Boolean).join(', '),
      source
    ]
    if (offer.imageUrl && !broken) {
      thumb = (
        <img
          className="offer-thumb"
          src={offer.imageUrl}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
        />
      )
    }
  }

  return (
    <div className="offer-row">
      {thumb || <span className={`offer-icon type-${type}`}><Icon name={icon} size={18} /></span>}
      <div className="offer-copy">
        <b>{title}</b>
        <small>{meta.filter(Boolean).join(' · ')}</small>
      </div>
      <div className="offer-tail">
        {price ? <strong>{price}</strong> : <span className="muted">цена не указана</span>}
        {showLink && url ? (
          <a href={url} target="_blank" rel="noreferrer" aria-label="Открыть источник">
            <Icon name="external" size={15} />
          </a>
        ) : null}
      </div>
    </div>
  )
}

export function CombinationCard({ combination, onClick, passengers = 1 }) {
  const offers = combination.offers || []
  const transport = offers.find((offer) => offerType(offer) === 'transport')
  const event = offers.find((offer) => offerType(offer) === 'event')
  const hotel = offers.find((offer) => offerType(offer) === 'hotel')
  const title = event?.title || hotel?.title || transport?.title || t('Вариант поездки')
  const price = formatPrice(combination.totalPrice)
  const score = Math.round((Number(combination.score) || 0) * 100)
  const perPerson = Number(combination.totalPrice?.amount) / (Number(passengers) || 1)

  const composition = offers
    .map((offer) => {
      const type = offerType(offer)
      if (type === 'transport') return t(domainLabels[offer.domain] || 'Транспорт')
      if (type === 'event') return t('Событие')
      if (type === 'hotel') return t('Отель')
      return t('Услуга')
    })
    .join(' + ')

  const meta = []
  if (transport) {
    meta.push(`${formatTime(transport.departure)} → ${formatTime(transport.arrival)}`)
  }
  if (event) {
    meta.push(formatDateLong(event.start))
  }
  if (hotel) {
    meta.push(`${hotel.rating}★`)
  }

  return (
    <button
      type="button"
      className="card combo-card"
      onClick={() => {
        haptic(6)
        onClick?.()
      }}
    >
      <div className="combo-head">
        <span className="eyebrow">{composition}</span>
        <span className="score-pill" title="Оценка совместимости">{score}%</span>
      </div>
      <h3>{title}</h3>
      {meta.length ? <p className="combo-meta">{meta.join(' · ')}</p> : null}
      {combination.tags?.length ? (
        <div className="tag-row">
          {combination.tags.slice(0, 4).map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>
      ) : null}
      <div className="combo-foot">
        <span className="price-label">итого</span>
        {Number(passengers) > 1 && Number.isFinite(perPerson) ? (
          <span className="per-person">≈ {Math.round(perPerson)} {t('/ чел.')}</span>
        ) : null}
        <strong className="price">{price || '—'}</strong>
        <Icon name="chevronRight" size={18} />
      </div>
    </button>
  )
}

export function ItineraryCard({ itinerary, onNotify }) {
  const [open, setOpen] = useState(false)
  const legs = itinerary.legs || []
  const first = legs[0]
  const last = legs[legs.length - 1]
  const price = formatPrice(itinerary.totalPrice)
  const transfers = Number(itinerary.transfers) || 0
  const departure = first?.departure
  const arrival = last?.arrival
  const score = Math.round((Number(itinerary.score) || 0) * 100)
  const savings = itinerary.savings ? Number(itinerary.savings) : null
  const distance = Number(itinerary.distanceKm)
  const speed = distance > 0 && Number(itinerary.durationMinutes) > 0
    ? Math.round(distance / (Number(itinerary.durationMinutes) / 60))
    : null

  async function share() {
    const result = await shareOrCopy({ title: 'Маршрут Storm Trip', text: itineraryShareText(itinerary) })
    if (result === 'copied') onNotify?.('Маршрут скопирован — можно отправить в мессенджер.')
    if (result === 'failed') onNotify?.('Не удалось поделиться маршрутом.', 'error')
  }

  function calendar() {
    const ok = downloadICS('storm-trip-route.ics', itineraryToICS(itinerary))
    onNotify?.(ok ? 'Маршрут добавлен в календарь' : 'У маршрута нет времени отправления.', ok ? 'info' : 'error')
  }

  return (
    <article className="card itinerary-card">
      <button type="button" className="itinerary-head" onClick={() => setOpen((value) => !value)}>
        <span className="itinerary-icon"><Icon name="route" size={20} /></span>
        <span className="itinerary-title">
          <b>{first?.from?.name || '—'} → {last?.to?.name || '—'}</b>
          <small>
            {formatDate(departure)} · {formatTime(departure)} → {formatTime(arrival)}
          </small>
        </span>
        <span className="itinerary-price">
          <strong>{price || '—'}</strong>
          {score ? <span className="iti-score">{score}%</span> : null}
          <Icon name={open ? 'chevronDown' : 'chevronRight'} size={17} />
        </span>
      </button>

      <div className="itinerary-meta">
        <span><Icon name="clock" size={14} />{formatDuration(itinerary.durationMinutes)}</span>
        <span>
          {transfers
            ? `${transfers} ${plural(transfers, 'пересадка', 'пересадки', 'пересадок')}`
            : t('без пересадок')}
        </span>
        {distance ? <span>{Math.round(distance)} км</span> : null}
        {speed ? <span>≈ {speed} км/ч</span> : null}
        {savings > 0 ? (
          <span className="iti-savings">−{formatPrice({ amount: savings, currency: 'BYN' })}</span>
        ) : null}
      </div>

      {open ? (
        <div className="legs">
          {legs.map((leg, index) => (
            <div className="leg" key={leg.id || index}>
              <span className="leg-rail" aria-hidden="true"><i /><i /></span>
              <div className="leg-body">
                <div className="leg-row">
                  <span>{formatTime(leg.departure)}</span>
                  <b>{leg.from?.name}</b>
                  <em className="leg-domain">
                    <Icon name={leg.domain === 'TRAIN' ? 'train' : 'bus'} size={12} />
                    {domainLabels[leg.domain] || 'Транспорт'}
                  </em>
                </div>
                <div className="leg-row">
                  <span>{formatTime(leg.arrival)}</span>
                  <b>{leg.to?.name}</b>
                </div>
                <small>
                  {leg.title} · {t(sourceLabels[leg.source] || leg.source)}
                  {leg.price ? ` · ${formatPrice(leg.price)}` : ''}
                </small>
                {leg.url ? (
                  <a className="text-link" href={leg.url} target="_blank" rel="noreferrer">
                    Купить билет <Icon name="external" size={13} />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
          {savings > 0 ? (
            <p className="saving">Раздельные билеты дешевле прямого на {formatPrice({ amount: savings, currency: 'BYN' })}</p>
          ) : null}
          {itinerary.tags?.length ? (
            <div className="tag-row">
              {itinerary.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="itinerary-actions">
        <button type="button" className="share-btn" onClick={share}>
          <Icon name="share" size={14} /> Поделиться
        </button>
        <button type="button" className="share-btn" onClick={calendar}>
          <Icon name="calendarPlus" size={14} /> В календарь
        </button>
      </div>
    </article>
  )
}

export function CombinationDetails({ combination, passengers = 1, onNotify }) {
  const offers = combination.offers || []
  const transport = offers.find((offer) => offerType(offer) === 'transport')
  const event = offers.find((offer) => offerType(offer) === 'event')
  const perPerson = Number(combination.totalPrice?.amount) / (Number(passengers) || 1)

  async function share() {
    const result = await shareOrCopy({
      title: 'Вариант поездки Storm Trip',
      text: combinationShareText(combination, passengers)
    })
    if (result === 'copied') onNotify?.('Вариант скопирован — можно отправить в мессенджер.')
    if (result === 'failed') onNotify?.('Не удалось поделиться вариантом.', 'error')
  }

  function calendar() {
    const ok = downloadICS('storm-trip-trip.ics', combinationToICS(combination))
    onNotify?.(ok ? 'Поездка добавлена в календарь' : 'В варианте нет событий с датами.', ok ? 'info' : 'error')
  }

  return (
    <div className="details">
      <div className="details-total">
        <span className="eyebrow">стоимость поездки</span>
        <strong>{formatPrice(combination.totalPrice) || '—'}</strong>
        {Number(passengers) > 1 && Number.isFinite(perPerson) ? (
          <span className="per-person">≈ {Math.round(perPerson)} BYN {t('на человека')}</span>
        ) : null}
        <span className="score-note">Оценка совместимости {Math.round((Number(combination.score) || 0) * 100)}%</span>
      </div>

      {combination.tags?.length ? (
        <div className="tag-row details-tags">
          {combination.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>
      ) : null}

      {transport && event ? (
        <div className="mini-timeline">
          <span className="eyebrow">план дня</span>
          <div className="timeline-row">
            <span className="timeline-dot" />
            <div><b>{formatTime(transport.arrival)}</b><small>прибытие · {transport.to?.name}</small></div>
          </div>
          <div className="timeline-row">
            <span className="timeline-dot accent" />
            <div><b>{formatTime(event.start)}</b><small>{event.title}</small></div>
          </div>
        </div>
      ) : null}

      <div className="share-row details-actions">
        <button type="button" className="btn btn-dark btn-small" onClick={share}>
          <Icon name="share" size={16} /> Поделиться
        </button>
        <button type="button" className="btn btn-dark btn-small" onClick={calendar}>
          <Icon name="calendarPlus" size={16} /> В календарь
        </button>
      </div>

      <div className="details-offers">
        {offers.map((offer, index) => <OfferRow key={offer.id || index} offer={offer} />)}
      </div>
    </div>
  )
}

export function SourceStrip({ sources, onSelect }) {
  if (!sources?.length) return null
  return (
    <div className="source-strip" role="list" aria-label="Статусы источников">
      {sources.map((source) => (
        <button
          key={source.source}
          type="button"
          role="listitem"
          className={`source-chip status-${(source.status || 'EMPTY').toLowerCase()}`}
          title={source.error || statusLabels[source.status] || ''}
          onClick={() => onSelect?.(source)}
        >
          <i className="dot" />
          {t(sourceLabels[source.source] || source.source)}
          {source.status === 'SUCCESS' ? <b>{source.resultCount}</b> : null}
        </button>
      ))}
    </div>
  )
}

export function EmptyState({ icon = 'route', title, text, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} size={28} /></span>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
      {action}
    </div>
  )
}
