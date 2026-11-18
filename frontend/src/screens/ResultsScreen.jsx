import { useEffect, useMemo, useState } from 'react'
import {
  CombinationCard,
  EmptyState,
  ItineraryCard,
  OfferRow,
  SourceStrip
} from '../components/cards.jsx'
import { countFilters, emptyFilters, FiltersSheet } from '../components/FiltersSheet.jsx'
import { HistoryList } from '../components/HistoryList.jsx'
import { SourceSheet } from '../components/SourceSheet.jsx'
import { WeatherChip } from '../components/WeatherChip.jsx'
import {
  addDays,
  dateRangeLabel,
  domainLabels,
  formatDate,
  formatMoney,
  localISO,
  offerType,
  plural,
  sortLabels
} from '../format.js'
import { Icon } from '../icons.jsx'

const sourceOrder = ['ATLAS', 'BZD', 'TICKET_BUS', 'TICKET_PRO', 'BEL_HOTEL']
const sorts = [
  { id: 'BEST', label: 'Лучшее' },
  { id: 'CHEAPEST', label: 'Дешевле' },
  { id: 'FASTEST', label: 'Быстрее' }
]

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

function combinationMatches(combination, filters) {
  const offers = combination.offers || []
  const price = Number(combination.totalPrice?.amount)

  if (filters.maxPrice && Number.isFinite(price) && price > Number(filters.maxPrice)) return false
  if (filters.maxDuration && durationOf(combination) > Number(filters.maxDuration) * 60 * 1000) {
    return false
  }
  if (filters.onlyWithEvent && !offers.some((offer) => offerType(offer) === 'event')) return false
  if (filters.onlyWithHotel && !offers.some((offer) => offerType(offer) === 'hotel')) return false
  if (filters.onlyDirect) {
    const transports = offers.filter((offer) => offerType(offer) === 'transport')
    if (!transports.every((offer) => offer.direct)) return false
  }
  if (filters.minHotelRating) {
    const hotels = offers.filter((offer) => offerType(offer) === 'hotel')
    if (!hotels.some((hotel) => Number(hotel.rating) >= Number(filters.minHotelRating))) return false
  }
  return true
}

function itineraryMatches(itinerary, filters) {
  const price = Number(itinerary.totalPrice?.amount)
  if (filters.maxPrice && Number.isFinite(price) && price > Number(filters.maxPrice)) return false
  if (filters.maxDuration && Number(itinerary.durationMinutes) > Number(filters.maxDuration)) return false
  if (filters.maxTransfers !== '' && Number(itinerary.transfers) > Number(filters.maxTransfers)) return false
  if (filters.onlyDirect && Number(itinerary.transfers) > 0) return false
  return true
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
            <span>{source === 'ATLAS' ? 'AtlasBus' : source === 'BZD' ? 'БЖД' : source === 'TICKET_BUS' ? 'TicketBus' : source === 'TICKET_PRO' ? 'TicketPro' : 'BelHotel'}</span>
            <span className="loading-line" />
          </div>
        ))}
      </div>
      <span className="progress-time">{seconds} сек</span>
    </div>
  )
}

function IntentPanel({ result, categories, onEdit }) {
  const [open, setOpen] = useState(false)
  const intent = result?.intent
  if (!intent) return null

  const chips = []
  const domains = Array.isArray(intent.domains) ? intent.domains : []
  domains.forEach((domain) => chips.push(domainLabels[domain] || domain))
  if (intent.passenger) {
    const adults = Number(intent.passenger.adults) || 1
    const children = Number(intent.passenger.children) || 0
    chips.push(`${adults} взр.${children ? ` + ${children} дет.` : ''}`)
  }
  if (intent.preferences?.budgetMax) chips.push(`до ${formatMoney(intent.preferences.budgetMax)}`)
  if (intent.preferences?.sort) chips.push(sortLabels[intent.preferences.sort] || intent.preferences.sort)
  if (intent.transport?.directOnly) chips.push('только прямые')
  if (intent.event?.query) chips.push(`«${intent.event.query}»`)
  if (intent.event?.categories?.length) {
    intent.event.categories.forEach((id) => {
      const category = categories.find((item) => item.id === id)
      if (category) chips.push(category.label)
    })
  }
  if (intent.hotel?.minRating) chips.push(`отель ${intent.hotel.minRating}★+`)

  if (!chips.length) return null

  return (
    <div className={`intent-panel ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="intent-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="spark" size={16} />
        <span>Как мы поняли запрос</span>
        <small>{chips.slice(0, 2).join(' · ')}</small>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={16} />
      </button>
      {open ? (
        <div className="intent-chips">
          {chips.map((chip, index) => (
            <span className="intent-chip" key={`${chip}-${index}`}>{chip}</span>
          ))}
          <button type="button" className="intent-edit" onClick={onEdit}>
            Исправить
          </button>
        </div>
      ) : null}
    </div>
  )
}

function RecoveryActions({ form, filtersActive, onAdjust, onResetFilters }) {
  const actions = []
  if (filtersActive) {
    actions.push({ key: 'filters', label: 'Сбросить фильтры', onClick: onResetFilters })
  }
  if (form.budgetMax) {
    actions.push({
      key: 'budget',
      label: 'Бюджет +20%',
      onClick: () => onAdjust?.({ budgetMax: Math.round(Number(form.budgetMax) * 1.2) })
    })
  }
  if (form.domains?.includes('HOTEL')) {
    actions.push({
      key: 'hotel',
      label: 'Убрать отель',
      onClick: () => onAdjust?.({ domains: form.domains.filter((domain) => domain !== 'HOTEL') })
    })
  }
  if (form.directOnly) {
    actions.push({ key: 'direct', label: 'Разрешить пересадки', onClick: () => onAdjust?.({ directOnly: false }) })
  }
  if (form.dateFrom) {
    actions.push({
      key: 'dates',
      label: 'Сдвинуть даты на день',
      onClick: () => {
        const shift = (value) =>
          value ? localISO(addDays(new Date(`${value}T12:00:00`), 1)) : value
        onAdjust?.({
          dateFrom: shift(form.dateFrom),
          dateTo: shift(form.dateTo || form.dateFrom)
        })
      }
    })
  }

  if (!actions.length) return null

  return (
    <div className="smart-actions">
      {actions.map((action) => (
        <button key={action.key} type="button" className="smart-action" onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  )
}

function daysUntil(value) {
  if (!value) return null
  const target = new Date(`${value}T12:00:00`)
  if (Number.isNaN(target.getTime())) return null
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
}

export function ResultsScreen({
  result,
  loading,
  error,
  form,
  history = [],
  categories = [],
  onEdit,
  onSelectCombination,
  onOpenHistory,
  onDeleteHistory,
  onClearHistory,
  onAdjust,
  onNotify,
  onOpenChat,
  onSortChange
}) {
  const [showAllOffers, setShowAllOffers] = useState(false)
  const [filters, setFilters] = useState({ ...emptyFilters })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sourceOpen, setSourceOpen] = useState(false)

  useEffect(() => {
    setFilters({ ...emptyFilters })
    setShowAllOffers(false)
  }, [result])

  const allCombinations = result?.combinations || []
  const allItineraries = result?.itineraries || []
  const offers = result?.offers || []
  const activeFilters = countFilters(filters)

  const combinations = useMemo(
    () => sortCombinations(allCombinations.filter((item) => combinationMatches(item, filters)), form.sort),
    [allCombinations, filters, form.sort]
  )
  const itineraries = useMemo(
    () => allItineraries.filter((item) => itineraryMatches(item, filters)),
    [allItineraries, filters]
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
        <HistoryList
          items={history}
          onOpen={onOpenHistory}
          onDelete={onDeleteHistory}
          onClear={onClearHistory}
          compact
        />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="screen trips-screen">
        <section className="screen-head">
          <span className="eyebrow">архив на устройстве</span>
          <h1>Поездки</h1>
          <p>Результаты поиска и сохранённая история. Работает даже без сети.</p>
        </section>

        <HistoryList
          items={history}
          onOpen={onOpenHistory}
          onDelete={onDeleteHistory}
          onClear={onClearHistory}
        />

        {!history.length ? (
          <EmptyState
            icon="route"
            title="Здесь появятся поездки"
            text="Заполните маршрут и даты — соберём варианты из транспорта, событий и отелей. Поиск сохранится на устройстве."
            action={<button className="btn btn-dark" type="button" onClick={onEdit}>Начать поиск</button>}
          />
        ) : null}
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
  const tripDate = intent?.dates?.from || form.dateFrom
  const passengers = intent?.passenger
    ? Number(intent.passenger.adults) + Number(intent.passenger.children)
    : Number(form.adults || 1) + Number(form.children || 0)
  const budget = intent?.preferences?.budgetMax || form.budgetMax
  const sources = [...(result.sources || [])].sort(
    (left, right) => sourceOrder.indexOf(left.source) - sourceOrder.indexOf(right.source)
  )
  const visibleOffers = showAllOffers ? offers : offers.slice(0, 12)
  const countdown = daysUntil(tripDate)
  const hasNothing = !allCombinations.length && !offers.length && !allItineraries.length
  const filtersHideAll =
    activeFilters > 0 && !combinations.length && !itineraries.length && (allCombinations.length || allItineraries.length)

  return (
    <div className="screen results-screen">
      <section className="result-head">
        <span className="eyebrow">результаты поиска</span>
        <h1>
          {from}
          <Icon name="arrowRight" size={22} />
          {to}
        </h1>
        <p className="result-sub">
          {dates}
          {passengers ? ` · ${passengers} ${plural(passengers, 'пассажир', 'пассажира', 'пассажиров')}` : ''}
          {budget ? ` · до ${formatMoney(budget)}` : ''}
        </p>
        <div className="result-badges">
          <WeatherChip city={to} date={tripDate} />
          {countdown != null && countdown >= 0 && countdown <= 21 ? (
            <span className="countdown-chip">
              <Icon name="calendar" size={13} />
              {countdown === 0
                ? 'поездка сегодня'
                : `до поездки ${countdown} ${plural(countdown, 'день', 'дня', 'дней')}`}
            </span>
          ) : null}
        </div>
      </section>

      <IntentPanel result={result} categories={categories} onEdit={onEdit} />

      <div className="stat-row">
        <div className="stat"><b>{combinations.length}</b><span>{plural(combinations.length, 'вариант', 'варианта', 'вариантов')}</span></div>
        <div className="stat"><b>{itineraries.length}</b><span>{plural(itineraries.length, 'маршрут', 'маршрута', 'маршрутов')}</span></div>
        <div className="stat"><b>{offers.length}</b><span>{plural(offers.length, 'предложение', 'предложения', 'предложений')}</span></div>
      </div>

      <SourceStrip sources={sources} onSelect={() => setSourceOpen(true)} />

      <div className="results-toolbar">
        <div className="segmented segmented-small">
          {sorts.map((sort) => (
            <button
              key={sort.id}
              type="button"
              className={form.sort === sort.id ? 'is-active' : ''}
              onClick={() => onSortChange?.(sort.id)}
            >
              {sort.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`filter-button ${activeFilters ? 'is-active' : ''}`}
          onClick={() => setFiltersOpen(true)}
        >
          <Icon name="filter" size={16} />
          Фильтры
          {activeFilters ? <span className="filter-count">{activeFilters}</span> : null}
        </button>
      </div>

      {hasNothing ? (
        <EmptyState
          icon="search"
          title="Источники ничего не нашли"
          text="Попробуйте один из вариантов ниже — поиск запустится сразу."
          action={
            <RecoveryActions
              form={form}
              filtersActive={activeFilters}
              onAdjust={onAdjust}
              onResetFilters={() => setFilters({ ...emptyFilters })}
            />
          }
        />
      ) : null}

      {filtersHideAll ? (
        <div className="inline-note filter-note">
          <Icon name="info" size={17} />
          <span>Под фильтры не подошёл ни один вариант.</span>
          <button type="button" className="inline-action" onClick={() => setFilters({ ...emptyFilters })}>
            Сбросить
          </button>
        </div>
      ) : null}

      {combinations.length ? (
        <section className="section-block">
          <div className="section-head">
            <h2>Готовые варианты</h2>
            <span className="section-count">
              {activeFilters && combinations.length !== allCombinations.length
                ? `${combinations.length} из ${allCombinations.length}`
                : combinations.length}
            </span>
          </div>
          <div className="card-list">
            {combinations.map((combination) => (
              <CombinationCard
                key={combination.id}
                combination={combination}
                passengers={passengers}
                onClick={() => onSelectCombination(combination)}
              />
            ))}
          </div>
        </section>
      ) : !hasNothing && !filtersHideAll ? (
        <div className="inline-note">
          <Icon name="info" size={17} />
          Комбинации не собрались. Посмотрите отдельные предложения ниже — возможно, не хватает события или отеля.
        </div>
      ) : null}

      {itineraries.length ? (
        <section className="section-block">
          <div className="section-head">
            <h2>Маршруты</h2>
            <span className="section-count">
              {activeFilters && itineraries.length !== allItineraries.length
                ? `${itineraries.length} из ${allItineraries.length}`
                : itineraries.length}
            </span>
          </div>
          <div className="card-list">
            {itineraries.map((itinerary) => (
              <ItineraryCard key={itinerary.id} itinerary={itinerary} onNotify={onNotify} />
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

      <div className="result-actions result-actions-grid">
        <button className="btn btn-soft btn-block" type="button" onClick={onEdit}>
          <Icon name="tune" size={18} /> Изменить параметры
        </button>
        <button className="btn btn-dark btn-block" type="button" onClick={onOpenChat}>
          <Icon name="chat" size={18} /> Уточнить словами
        </button>
      </div>

      <HistoryList
        items={history}
        onOpen={onOpenHistory}
        onDelete={onDeleteHistory}
        onClear={onClearHistory}
        limit={3}
        compact
      />

      <FiltersSheet
        open={filtersOpen}
        filters={filters}
        onChange={setFilters}
        onClose={() => setFiltersOpen(false)}
        onReset={() => setFilters({ ...emptyFilters })}
      />

      <SourceSheet open={sourceOpen} sources={sources} onClose={() => setSourceOpen(false)} />
    </div>
  )
}
