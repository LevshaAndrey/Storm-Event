import { useMemo, useState } from 'react'
import { Autocomplete } from '../components/Autocomplete.jsx'
import { Stepper, Toggle } from '../components/Controls.jsx'
import { Icon } from '../icons.jsx'
import { addDays, dateRangeLabel, eventDate, localISO, nextWeekend, todayISO } from '../format.js'

const domainOptions = [
  { id: 'TRAIN', label: 'Поезд', icon: 'train' },
  { id: 'BUS', label: 'Автобус', icon: 'bus' },
  { id: 'EVENT', label: 'События', icon: 'ticket' },
  { id: 'HOTEL', label: 'Отель', icon: 'hotel' }
]

const sorts = [
  { id: 'BEST', label: 'Лучшее' },
  { id: 'CHEAPEST', label: 'Дешевле' },
  { id: 'FASTEST', label: 'Быстрее' }
]

export function SearchScreen({
  form,
  setForm,
  selectedEvent,
  onClearEvent,
  onSubmit,
  onOpenEvents,
  onOpenChat,
  onPlanWeekend,
  history = [],
  onOpenHistory,
  categories,
  loading
}) {
  const [advanced, setAdvanced] = useState(false)
  const selectedEventDate = selectedEvent?.start ? eventDate(selectedEvent.start) : null

  const selectedCategories = useMemo(
    () => new Set(form.eventCategories || []),
    [form.eventCategories]
  )

  function patch(values) {
    setForm((current) => ({ ...current, ...values }))
  }

  function setDomain(id) {
    const domains = form.domains || []
    const next = domains.includes(id)
      ? domains.filter((domain) => domain !== id)
      : [...domains, id]
    patch({ domains: next })
  }

  function setCategory(id) {
    const next = selectedCategories.has(id)
      ? [...selectedCategories].filter((value) => value !== id)
      : [...selectedCategories, id]
    patch({ eventCategories: next })
  }

  function swapRoute() {
    patch({
      from: form.to,
      fromId: form.toId,
      to: form.from,
      toId: form.fromId
    })
  }

  function setWeekend() {
    const weekend = nextWeekend()
    patch({ dateFrom: weekend.from, dateTo: weekend.to })
  }

  function setToday() {
    const today = todayISO()
    patch({ dateFrom: today, dateTo: today })
  }

  function setTomorrow() {
    const tomorrow = localISO(addDays(new Date(), 1))
    patch({ dateFrom: tomorrow, dateTo: tomorrow })
  }

  return (
    <div className="screen search-screen">
      <section className="hero">
        <span className="eyebrow">планировщик поездок</span>
        <h1>Куда поедем?</h1>
        <p>Соберём транспорт, событие и проживание в один маршрут.</p>
      </section>

      <div className="hero-actions">
        <button type="button" className="quick-action" onClick={onOpenChat}>
          <span className="quick-icon"><Icon name="chat" size={19} /></span>
          <span>
            <b>Спросите словами</b>
            <small>«Из Минска в Брест на выходные»</small>
          </span>
          <Icon name="chevronRight" size={16} />
        </button>
        <button type="button" className="quick-action" onClick={onPlanWeekend} disabled={loading}>
          <span className="quick-icon quick-icon-amber"><Icon name="spark" size={19} /></span>
          <span>
            <b>Собери выходные</b>
            <small>Случайное событие и маршрут</small>
          </span>
          <Icon name="chevronRight" size={16} />
        </button>
      </div>

      {history.length ? (
        <div className="recent-routes">
          <span className="field-label">Недавние поездки</span>
          <div className="chip-scroll">
            {history.slice(0, 5).map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="chip"
                onClick={() => onOpenHistory?.(entry)}
              >
                {entry.form?.from || '—'} → {entry.form?.to || '—'}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <form
        className="card search-card"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <div className="route-fields">
          <Autocomplete
            id="from"
            label="Откуда"
            placeholder="Минск"
            value={form.from}
            onChange={(value) => patch({ from: value, fromId: null })}
            onSelect={(item) => patch({ from: item.name, fromId: item.id })}
          />
          <Autocomplete
            id="to"
            label="Куда"
            placeholder="Брест"
            value={form.to}
            onChange={(value) => patch({ to: value, toId: null })}
            onSelect={(item) => patch({ to: item.name, toId: item.id })}
          />
          <button className="swap-button" type="button" onClick={swapRoute} aria-label="Поменять города">
            <Icon name="swap" size={18} />
          </button>
        </div>

        <div className="preset-row">
          <button type="button" className="chip" onClick={setWeekend}>Выходные</button>
          <button type="button" className="chip" onClick={setToday}>Сегодня</button>
          <button type="button" className="chip" onClick={setTomorrow}>Завтра</button>
          <span className="preset-note">{dateRangeLabel(form.dateFrom, form.dateTo)}</span>
        </div>

        <div className="form-row">
          <label className="field" htmlFor="dateFrom">
            <span className="field-label">Туда</span>
            <span className="input-wrap">
              <input
                id="dateFrom"
                className="input"
                type="date"
                min={todayISO()}
                value={form.dateFrom || ''}
                onChange={(event) => patch({ dateFrom: event.target.value })}
                required
              />
            </span>
          </label>
          <label className="field" htmlFor="dateTo">
            <span className="field-label">Обратно</span>
            <span className="input-wrap">
              <input
                id="dateTo"
                className="input"
                type="date"
                min={form.dateFrom || todayISO()}
                value={form.dateTo || ''}
                onChange={(event) => patch({ dateTo: event.target.value })}
              />
            </span>
          </label>
        </div>

        <div className="form-row passengers-row">
          <Stepper
            label="Взрослые"
            value={form.adults}
            min={1}
            max={9}
            onChange={(value) => patch({ adults: value })}
          />
          <Stepper
            label="Дети"
            value={form.children}
            min={0}
            max={9}
            onChange={(value) => patch({ children: value })}
          />
        </div>

        <div className="field-block">
          <span className="field-label">Что включить</span>
          <div className="domain-grid">
            {domainOptions.map((domain) => {
              const active = (form.domains || []).includes(domain.id)
              return (
                <button
                  key={domain.id}
                  type="button"
                  className={`domain-chip domain-${domain.id.toLowerCase()} ${active ? 'is-on' : ''}`}
                  aria-pressed={active}
                  onClick={() => setDomain(domain.id)}
                >
                  <Icon name={domain.icon} size={19} />
                  <span>{domain.label}</span>
                  <span className="domain-check"><Icon name="check" size={12} /></span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="form-row budget-row">
          <label className="field" htmlFor="budget">
            <span className="field-label">Бюджет, BYN</span>
            <span className="input-wrap">
              <Icon name="wallet" size={18} className="input-icon" />
              <input
                id="budget"
                className="input input-with-icon"
                type="number"
                inputMode="decimal"
                min="0"
                max="1000000"
                step="0.01"
                placeholder="например, 300"
                value={form.budgetMax ?? ''}
                onChange={(event) => patch({ budgetMax: event.target.value })}
              />
            </span>
          </label>
          <div className="field grow">
            <span className="field-label">Сортировка</span>
            <div className="segmented">
              {sorts.map((sort) => (
                <button
                  key={sort.id}
                  type="button"
                  className={form.sort === sort.id ? 'is-active' : ''}
                  onClick={() => patch({ sort: sort.id })}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          className={`advanced-toggle ${advanced ? 'is-open' : ''}`}
          onClick={() => setAdvanced((value) => !value)}
          aria-expanded={advanced}
        >
          <Icon name="tune" size={18} />
          <span>Больше настроек</span>
          <Icon name="chevronDown" size={17} />
        </button>

        {advanced ? (
          <div className="advanced">
            <Toggle
              label="Только прямые"
              hint="Без пересадок в пути"
              checked={Boolean(form.directOnly)}
              onChange={(value) => patch({ directOnly: value })}
            />

            <div className="form-row">
              <label className="field" htmlFor="eventQuery">
                <span className="field-label">Событие</span>
                <input
                  id="eventQuery"
                  className="input"
                  placeholder="концерт, фестиваль…"
                  value={form.eventQuery || ''}
                  onChange={(event) => patch({ eventQuery: event.target.value })}
                  maxLength={200}
                />
              </label>
              <label className="field" htmlFor="hotelRating">
                <span className="field-label">Отель от</span>
                <select
                  id="hotelRating"
                  className="input select"
                  value={form.minHotelRating ?? ''}
                  onChange={(event) => patch({ minHotelRating: event.target.value ? Number(event.target.value) : null })}
                >
                  <option value="">любой</option>
                  <option value="2">2★</option>
                  <option value="3">3★</option>
                  <option value="4">4★</option>
                  <option value="5">5★</option>
                </select>
              </label>
            </div>

            <div className="field-block">
              <span className="field-label">Категории афиши</span>
              <div className="chip-wrap">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`chip ${selectedCategories.has(category.id) ? 'is-on' : ''}`}
                    aria-pressed={selectedCategories.has(category.id)}
                    onClick={() => setCategory(category.id)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {selectedEvent ? (
          <div className="selected-event">
            <span className="selected-event-icon"><Icon name="ticket" size={19} /></span>
            <div>
              <span className="eyebrow">событие в поездке</span>
              <b>{selectedEvent.title}</b>
              <small>
                {[selectedEventDate ? `${selectedEventDate.day} ${selectedEventDate.month}` : null,
                  selectedEvent.venue?.name,
                  selectedEvent.venueLocality].filter(Boolean).join(' · ')}
              </small>
            </div>
            <button className="icon-button" type="button" onClick={onClearEvent} aria-label="Убрать событие">
              <Icon name="x" size={17} />
            </button>
          </div>
        ) : null}

        <button className="btn btn-primary btn-submit" type="submit" disabled={loading}>
          {loading ? 'Ищем варианты…' : 'Найти поездку'}
          <Icon name={loading ? 'refresh' : 'arrowRight'} size={19} className={loading ? 'spin' : ''} />
        </button>

        <p className="form-note">
          Опрашиваем пять источников. Первый поиск может занять до минуты.
        </p>
      </form>

      <button type="button" className="feed-link" onClick={onOpenEvents}>
        <span className="feed-link-icon"><Icon name="ticket" size={20} /></span>
        <span>
          <b>Не знаете, куда поехать?</b>
          <small>Начните с афиши — подставим событие в маршрут.</small>
        </span>
        <Icon name="chevronRight" size={18} />
      </button>
    </div>
  )
}
