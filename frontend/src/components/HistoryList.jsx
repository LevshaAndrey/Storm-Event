import { useState } from 'react'
import { formatDate, formatMoney, plural } from '../format.js'
import { historyPrice } from '../history.js'
import { Icon } from '../icons.jsx'

function passengerCount(entry) {
  return (Number(entry?.form?.adults) || 1) + (Number(entry?.form?.children) || 0)
}

function entryCounts(entry) {
  return {
    combinations: entry?.result?.combinations?.length || 0,
    offers: entry?.result?.offers?.length || 0
  }
}

export function HistoryList({ items, onOpen, onDelete, onClear, limit, compact = false }) {
  const [confirmClear, setConfirmClear] = useState(false)
  const visible = limit ? items.slice(0, limit) : items

  if (!items.length) {
    if (compact) return null
    return (
      <div className="state-card history-empty">
        <span className="empty-icon"><Icon name="clock" size={26} /></span>
        <h2>История пока пуста</h2>
        <p>Каждый поиск сохраняется на устройстве — сюда можно вернуться без интернета.</p>
      </div>
    )
  }

  return (
    <section className={`history-block ${compact ? 'is-compact' : ''}`}>
      <div className="history-head">
        <h2>
          <Icon name="clock" size={17} /> {compact ? 'Недавние поездки' : 'История поездок'}
        </h2>
        <div className="history-head-actions">
          <span className="section-count">{items.length}</span>
          {onClear ? (
            <button
              type="button"
              className={`history-clear ${confirmClear ? 'is-confirm' : ''}`}
              onClick={() => {
                if (confirmClear) {
                  onClear()
                  setConfirmClear(false)
                } else {
                  setConfirmClear(true)
                  window.setTimeout(() => setConfirmClear(false), 3200)
                }
              }}
            >
              {confirmClear ? 'Точно?' : 'Очистить'}
            </button>
          ) : null}
        </div>
      </div>

      <div className="history-list">
        {visible.map((entry) => {
          const form = entry.form || {}
          const counts = entryCounts(entry)
          const price = historyPrice(entry)
          return (
            <div className="history-card" key={entry.id}>
              <button type="button" className="history-main" onClick={() => onOpen?.(entry)}>
                <span className="history-route">
                  {form.from || 'Откуда'} <Icon name="arrowRight" size={14} /> {form.to || 'Куда'}
                </span>
                <span className="history-meta">
                  {formatDate(form.dateFrom)}
                  {form.dateTo && form.dateTo !== form.dateFrom ? ` — ${formatDate(form.dateTo)}` : ''}
                  {' · '}
                  {passengerCount(entry)} {plural(passengerCount(entry), 'пассажир', 'пассажира', 'пассажиров')}
                </span>
                <span className="history-foot">
                  {price != null ? <b>{formatMoney(price)}</b> : <b>без цены</b>}
                  <small>
                    {counts.combinations} {plural(counts.combinations, 'вариант', 'варианта', 'вариантов')}
                    {' · '}
                    {counts.offers} {plural(counts.offers, 'предложение', 'предложения', 'предложений')}
                  </small>
                </span>
              </button>
              <button
                type="button"
                className="history-delete"
                aria-label="Удалить поездку из истории"
                onClick={() => onDelete?.(entry.id)}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
