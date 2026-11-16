import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { Icon } from '../icons.jsx'
import { eventDate, formatPrice } from '../format.js'

function EventCard({ event, category, selected, onSelect }) {
  const [broken, setBroken] = useState(false)
  const date = eventDate(event.start)
  const price = formatPrice(event.price)

  return (
    <article className={`event-card ${selected ? 'is-selected' : ''}`}>
      <div className="event-cover">
        {event.imageUrl && !broken ? (
          <img
            src={event.imageUrl}
            alt=""
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="cover-fallback"><Icon name="ticket" size={30} /></span>
        )}
        <span className="event-date-badge">
          <b>{date.day}</b>
          <span>{date.month}</span>
        </span>
      </div>
      <div className="event-body">
        {category ? <span className="eyebrow">{category}</span> : null}
        <h3>{event.title}</h3>
        <p className="event-place">
          <Icon name="pin" size={14} />
          {[event.venue?.name, event.venueLocality].filter(Boolean).join(', ') || 'Место уточняется'}
        </p>
        <div className="event-foot">
          <span className="event-price">{price || 'цена не указана'}</span>
          <div className="event-actions">
            {event.url ? (
              <a className="icon-button" href={event.url} target="_blank" rel="noreferrer" aria-label="Открыть событие">
                <Icon name="external" size={17} />
              </a>
            ) : null}
            <button
              type="button"
              className={`btn btn-small ${selected ? 'btn-soft' : 'btn-dark'}`}
              onClick={() => onSelect(event)}
            >
              {selected ? 'Выбрано' : 'В поездку'}
              {selected ? <Icon name="check" size={15} /> : null}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function EventSkeleton() {
  return (
    <div className="event-card skeleton-card" aria-hidden="true">
      <div className="event-cover skeleton" />
      <div className="event-body">
        <span className="skeleton line short" />
        <span className="skeleton line" />
        <span className="skeleton line medium" />
        <span className="skeleton line short" />
      </div>
    </div>
  )
}

export function EventsScreen({ categories, selectedEvent, onSelectEvent }) {
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [reload, setReload] = useState(0)

  const categoryLabels = Object.fromEntries(categories.map((item) => [item.id, item.label]))

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setNote('')
    const timer = window.setTimeout(() => {
      api
        .events({ category, query: query.trim(), limit: 20 })
        .then((data) => {
          if (cancelled) return
          setEvents(Array.isArray(data?.events) ? data.events : [])
          if (data?.error) setNote(data.error)
        })
        .catch((reason) => {
          if (!cancelled) {
            setEvents([])
            setError(reason.message || 'Не удалось загрузить афишу')
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, query ? 360 : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [category, query, reload])

  return (
    <div className="screen events-screen">
      <section className="screen-head">
        <span className="eyebrow">афиша Беларуси</span>
        <h1>События</h1>
        <p>Ближайшие концерты, фестивали и выставки на 180 дней вперёд.</p>
      </section>

      <label className="feed-search" htmlFor="feed-query">
        <Icon name="search" size={19} />
        <input
          id="feed-query"
          type="search"
          placeholder="Найти событие или площадку"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          maxLength={200}
        />
        {query ? (
          <button type="button" onClick={() => setQuery('')} aria-label="Очистить">
            <Icon name="x" size={16} />
          </button>
        ) : null}
      </label>

      <div className="chip-scroll" role="list" aria-label="Категории событий">
        <button
          type="button"
          className={`chip ${!category ? 'is-on' : ''}`}
          onClick={() => setCategory('')}
        >
          Все
        </button>
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chip ${category === item.id ? 'is-on' : ''}`}
            onClick={() => setCategory(category === item.id ? '' : item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {note ? <div className="inline-note"><Icon name="info" size={16} />{note}</div> : null}

      {loading ? (
        <div className="event-list">
          {Array.from({ length: 3 }).map((_, index) => <EventSkeleton key={index} />)}
        </div>
      ) : error ? (
        <div className="state-card">
          <span className="empty-icon"><Icon name="info" size={26} /></span>
          <h2>Афиша не загрузилась</h2>
          <p>{error}</p>
          <button className="btn btn-soft" type="button" onClick={() => setReload((value) => value + 1)}>
            <Icon name="refresh" size={17} /> Попробовать снова
          </button>
        </div>
      ) : events.length ? (
        <div className="event-list">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              category={categoryLabels[event.category] || (event.category?.startsWith('/') ? '' : event.category)}
              selected={selectedEvent?.id === event.id}
              onSelect={onSelectEvent}
            />
          ))}
        </div>
      ) : (
        <div className="state-card">
          <span className="empty-icon"><Icon name="ticket" size={26} /></span>
          <h2>{query || category ? 'Ничего не нашлось' : 'Афиша пока пуста'}</h2>
          <p>
            {query || category
              ? 'По этому запросу событий нет. Попробуйте другую категорию или сбросьте фильтры.'
              : 'Источник афиши не вернул события. Обычно помогает повторить запрос чуть позже.'}
          </p>
          {query || category ? (
            <button
              className="btn btn-soft"
              type="button"
              onClick={() => {
                setQuery('')
                setCategory('')
              }}
            >
              Сбросить фильтры
            </button>
          ) : (
            <button className="btn btn-soft" type="button" onClick={() => setReload((value) => value + 1)}>
              <Icon name="refresh" size={17} /> Обновить
            </button>
          )}
        </div>
      )}
    </div>
  )
}
