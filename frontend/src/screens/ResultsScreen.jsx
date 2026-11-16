import { useEffect, useMemo, useState } from 'react'
import { CombinationCard, EmptyState, ItineraryCard, OfferRow, SourceStrip } from '../components/cards.jsx'
import { Icon } from '../icons.jsx'
import {
  dateRangeLabel,
  formatMoney,
  offerType,
  plural,
  sourceLabels
} from '../format.js'

const sourceOrder = ['ATLAS', 'BZD', 'TICKET_BUS', 'TICKET_PRO', 'BEL_HOTEL']

function durationOf(combination) {
  const transport = combination.offers?.find((offer) => offerType(offer) === 'transport')
  if (!transport?.departure || !transport?.arrival) return Number.POSITIVE_INFINITY
  return new Date(transport.arrival).getTime() - new Date(transport.departure).getTime()
}

function priceOf(combination) {
  const amount = Number(combination.totalPrice?.amount)
  return Number.isNaN(amount) ? Number.POSITIVE_INFINITY : amount
}

function sortCombinations(combinations, sort) {
  const copy = [...combinations]
  if (sort === 'CHEAPEST') {
    copy.sort((left, right) => priceOf(left) - priceOf(right) || right.score - left.score)
  } else if (sort === 'FASTEST') {
    copy.sort((left, right) => durationOf(left) - durationOf(right) || priceOf(left) - priceOf(right))
  } else {
    copy.sort((left, right) => right.score - left.score || priceOf(left) - priceOf(right))
  }
  return copy
}

function SearchProgress({ form }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="search-progress">
      <div className="progress-orbit" aria-hidden="true">
        <span className="orbit-core"><Icon name="route" size={26} /></span>
        <span className="orbit-ring" />
      </div>
      <span className="eyebrow">собираем поездку</span>
      <h1>{form.from || 'Откуда'} → {form.to || 'Куда'}</h1>
      <p>Проверяем транспорт, афишу и отели. Обычно это занимает 10–40 секунд.</p>
      <div className="source-loading">
        {sourceOrder.map((source, index) => (
          <div className="source-loading-row" key={source} style={{ animationDelay: `${index * 120}ms` }}>
            <span className="pulse-dot" />
            <span>{sourceLabels[source]}</span>
            <span className="loading-line" />
          </div>
        ))}
      </div>
      <span className="progress-time">{seconds} сек</span>
    </div>
  )
}

export function ResultsScreen({ result, loading, error, form, onEdit, onSelectCombination }) {
  const [showAllOffers, setShowAllOffers] = useState(false)

  const combinations = useMemo(
    () => sortCombinations(result?.combinations || [], form.sort),
    [result, form.sort]
  )

  if (loading) {
    return (
      <div className="screen">
        <SearchProgress form={form} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="screen">
        <EmptyState
          icon="info"
          title="Поиск не удался"
          text={error}
          action={<button className="btn btn-soft" type="button" onClick={onEdit}>Изменить запрос</button>}
        />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="screen">
        <EmptyState
          icon="route"
          title="Здесь появятся поездки"
          text="Заполните маршрут и даты — соберём варианты из транспорта, событий и отелей."
          action={<button className="btn btn-dark" type="button" onClick={onEdit}>Начать поиск</button>}
        />
      </div>
    )
  }

  const intent = result.intent
  const route = intent?.route
  const from = route?.from?.name || form.from || '—'
  const to = route?.to?.name || form.to || '—'
  const dates = intent?.dates
    ? dateRangeLabel(intent.dates.from, intent.dates.to)
    : dateRangeLabel(form.dateFrom, form.dateTo)
  const passengers = intent?.passenger
    ? intent.passenger.adults + intent.passenger.children
    : Number(form.adults || 1) + Number(form.children || 0)
  const budget = intent?.preferences?.budgetMax || form.budgetMax
  const itineraries = result.itineraries || []
  const offers = result.offers || []
  const sources = [...(result.sources || [])].sort(
    (left, right) => sourceOrder.indexOf(left.source) - sourceOrder.indexOf(right.source)
  )
  const visibleOffers = showAllOffers ? offers : offers.slice(0, 12)

  return (
    <div className="screen results-screen">
      <section className="result-head">
        <span className="eyebrow">результаты поиска</span>
        <h1>
          {from}
          <Icon name="arrowRight" size={22} />
          {to}
        </h1>
        <p>
          {dates}
          {passengers ? ` · ${passengers} ${plural(passengers, 'пассажир', 'пассажира', 'пассажиров')}` : ''}
          {budget ? ` · до ${formatMoney(budget)}` : ''}
        </p>
      </section>

      <div className="stat-row">
        <div className="stat"><b>{combinations.length}</b><span>{plural(combinations.length, 'вариант', 'варианта', 'вариантов')}</span></div>
        <div className="stat"><b>{itineraries.length}</b><span>{plural(itineraries.length, 'маршрут', 'маршрута', 'маршрутов')}</span></div>
        <div className="stat"><b>{offers.length}</b><span>{plural(offers.length, 'предложение', 'предложения', 'предложений')}</span></div>
      </div>

      <SourceStrip sources={sources} />

      {combinations.length ? (
        <section className="section-block">
          <div className="section-head">
            <h2>Готовые варианты</h2>
            <span className="section-count">{combinations.length}</span>
          </div>
          <div className="card-list">
            {combinations.map((combination) => (
              <CombinationCard
                key={combination.id}
                combination={combination}
                onClick={() => onSelectCombination(combination)}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="inline-note">
          <Icon name="info" size={17} />
          Комбинации не собрались. Посмотрите отдельные предложения ниже — возможно, не хватает события или отеля.
        </div>
      )}

      {itineraries.length ? (
        <section className="section-block">
          <div className="section-head">
            <h2>Маршруты</h2>
            <span className="section-count">{itineraries.length}</span>
          </div>
          <div className="card-list">
            {itineraries.map((itinerary) => (
              <ItineraryCard key={itinerary.id} itinerary={itinerary} />
            ))}
          </div>
        </section>
      ) : null}

      {offers.length ? (
        <section className="section-block">
          <div className="section-head">
            <h2>Предложения источников</h2>
            <span className="section-count">{offers.length}</span>
          </div>
          <div className="offer-list">
            {visibleOffers.map((offer, index) => <OfferRow key={offer.id || index} offer={offer} />)}
          </div>
          {offers.length > visibleOffers.length ? (
            <button className="btn btn-ghost btn-block" type="button" onClick={() => setShowAllOffers(true)}>
              Показать все ({offers.length})
            </button>
          ) : null}
        </section>
      ) : null}

      <div className="result-actions">
        <button className="btn btn-soft btn-block" type="button" onClick={onEdit}>
          <Icon name="tune" size={18} /> Изменить параметры
        </button>
      </div>
    </div>
  )
}
