import { useState } from 'react'
import { Icon } from '../icons.jsx'
import {
  domainLabels,
  formatDate,
  formatDateLong,
  formatDuration,
  formatPrice,
  formatTime,
  offerType,
  sourceLabels,
  statusLabels
} from '../format.js'

export function OfferRow({ offer, showLink = true }) {
  const type = offerType(offer)
  const price = formatPrice(offer?.price)
  const url = offer?.url
  let icon = 'ticket'
  let title = offer?.title || 'Предложение'
  let meta = []

  if (type === 'transport') {
    icon = offer.domain === 'TRAIN' ? 'train' : 'bus'
    title = offer.title || `${offer.from?.name || '—'} → ${offer.to?.name || '—'}`
    meta = [
      `${formatDate(offer.departure)} · ${formatTime(offer.departure)} → ${formatTime(offer.arrival)}`,
      offer.direct ? 'без пересадок' : 'с пересадками'
    ]
  } else if (type === 'hotel') {
    icon = 'hotel'
    meta = [
      offer.location?.name,
      offer.rating ? `${offer.rating}★` : null
    ]
  } else {
    icon = 'ticket'
    meta = [
      `${formatDateLong(offer.start)}${offer.start ? ` · ${formatTime(offer.start)}` : ''}`,
      [offer.venue?.name, offer.venueLocality].filter(Boolean).join(', ')
    ]
  }

  return (
    <div className="offer-row">
      <span className={`offer-icon type-${type}`}><Icon name={icon} size={18} /></span>
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

export function CombinationCard({ combination, onClick }) {
  const offers = combination.offers || []
  const transport = offers.find((offer) => offerType(offer) === 'transport')
  const event = offers.find((offer) => offerType(offer) === 'event')
  const hotel = offers.find((offer) => offerType(offer) === 'hotel')
  const title = event?.title || hotel?.title || transport?.title || 'Вариант поездки'
  const price = formatPrice(combination.totalPrice)
  const score = Math.round((Number(combination.score) || 0) * 100)

  const composition = offers
    .map((offer) => {
      const type = offerType(offer)
      if (type === 'transport') return domainLabels[offer.domain] || 'Транспорт'
      if (type === 'event') return 'Событие'
      if (type === 'hotel') return 'Отель'
      return 'Услуга'
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
    <button type="button" className="card combo-card" onClick={onClick}>
      <div className="combo-head">
        <span className="eyebrow">{composition}</span>
        <span className="score-pill" title="Оценка совместимости">{score}%</span>
      </div>
      <h3>{title}</h3>
      {meta.length ? <p className="combo-meta">{meta.join(' · ')}</p> : null}
      {combination.tags?.length ? (
        <div className="tag-row">
          {combination.tags.slice(0, 3).map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>
      ) : null}
      <div className="combo-foot">
        <span className="price-label">итого</span>
        <strong className="price">{price || '—'}</strong>
        <Icon name="chevronRight" size={18} />
      </div>
    </button>
  )
}

export function ItineraryCard({ itinerary }) {
  const [open, setOpen] = useState(false)
  const legs = itinerary.legs || []
  const first = legs[0]
  const last = legs[legs.length - 1]
  const price = formatPrice(itinerary.totalPrice)
  const transfers = Number(itinerary.transfers) || 0
  const departure = first?.departure
  const arrival = last?.arrival

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
          <Icon name={open ? 'chevronDown' : 'chevronRight'} size={17} />
        </span>
      </button>

      <div className="itinerary-meta">
        <span><Icon name="clock" size={14} />{formatDuration(itinerary.durationMinutes)}</span>
        <span>{transfers ? `${transfers} пересад.` : 'без пересадок'}</span>
        {itinerary.distanceKm ? <span>{Math.round(itinerary.distanceKm)} км</span> : null}
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
                </div>
                <div className="leg-row">
                  <span>{formatTime(leg.arrival)}</span>
                  <b>{leg.to?.name}</b>
                </div>
                <small>
                  {leg.title} · {sourceLabels[leg.source] || leg.source}
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
          {itinerary.savings ? (
            <p className="saving">Раздельные билеты дешевле прямого на {formatPrice({ amount: itinerary.savings, currency: 'BYN' })}</p>
          ) : null}
          {itinerary.tags?.length ? (
            <div className="tag-row">
              {itinerary.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

export function CombinationDetails({ combination }) {
  const offers = combination.offers || []
  const transport = offers.find((offer) => offerType(offer) === 'transport')
  const event = offers.find((offer) => offerType(offer) === 'event')

  return (
    <div className="details">
      <div className="details-total">
        <span className="eyebrow">стоимость поездки</span>
        <strong>{formatPrice(combination.totalPrice) || '—'}</strong>
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

      <div className="details-offers">
        {offers.map((offer, index) => <OfferRow key={offer.id || index} offer={offer} />)}
      </div>
    </div>
  )
}

export function SourceStrip({ sources }) {
  if (!sources?.length) return null
  return (
    <div className="source-strip">
      {sources.map((source) => (
        <span
          key={source.source}
          className={`source-chip status-${(source.status || 'EMPTY').toLowerCase()}`}
          title={source.error || statusLabels[source.status] || ''}
        >
          <i className="dot" />
          {sourceLabels[source.source] || source.source}
          {source.status === 'SUCCESS' ? <b>{source.resultCount}</b> : null}
        </span>
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
