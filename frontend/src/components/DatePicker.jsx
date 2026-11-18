import { useMemo, useState } from 'react'
import { Icon } from '../icons.jsx'
import { Sheet } from './Sheet.jsx'
import { addDays, formatDate, formatDateLong, localISO, todayISO } from '../format.js'
import { getLanguage, t } from '../i18n.js'

const MONTHS = {
  ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  be: ['студзень', 'люты', 'сакавік', 'красавік', 'май', 'чэрвень', 'ліпень', 'жнівень', 'верасень', 'кастрычнік', 'лістапад', 'снежань'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  pl: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']
}

const WEEKDAYS = {
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  be: ['Пн', 'Аў', 'Ср', 'Чц', 'Пт', 'Сб', 'Нд'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  pl: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']
}

function toDate(iso) {
  if (!iso) return null
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day, 12)
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12)
}

function sameMonth(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth()
}

function fieldLabel(value) {
  const date = toDate(value)
  if (!date) return ''
  return formatDate(value)
}

function dayAriaLabel(date) {
  return formatDateLong(date)
}

function monthLabel(date) {
  const months = MONTHS[getLanguage()] || MONTHS.ru
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

function Calendar({ value, min, rangeStart, rangeEnd, onSelect, onClear, clearLabel }) {
  const anchor = toDate(value) || toDate(min) || new Date()
  const [view, setView] = useState(() => startOfMonth(anchor))
  const today = todayISO()
  const weekdays = WEEKDAYS[getLanguage()] || WEEKDAYS.ru

  const days = useMemo(() => {
    const first = startOfMonth(view)
    const offset = (first.getDay() + 6) % 7
    const gridStart = addDays(first, -offset)
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
  }, [view])

  const minimum = min || ''

  function pick(date) {
    onSelect?.(localISO(date))
  }

  return (
    <div className="calendar">
      <div className="calendar-head">
        <div>
          <span className="eyebrow">{t('выберите день')}</span>
          <div className="calendar-month">{monthLabel(view)}</div>
        </div>
        <div className="calendar-nav">
          <button
            type="button"
            className="icon-button"
            aria-label={t('Предыдущий месяц')}
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1, 12))}
          >
            <Icon name="chevronLeft" size={18} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={t('Следующий месяц')}
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1, 12))}
          >
            <Icon name="chevronRight" size={18} />
          </button>
        </div>
      </div>

      {minimum ? (
        <p className="calendar-hint">
          {t('Доступно с')} {formatDate(minimum)}
        </p>
      ) : null}

      <div className="calendar-grid" role="grid" aria-label={t('Календарь')}>
        {weekdays.map((weekday) => (
          <span key={weekday} className="calendar-weekday" role="columnheader">
            {weekday}
          </span>
        ))}
        {days.map((date) => {
          const iso = localISO(date)
          const disabled = Boolean(minimum && iso < minimum)
          const selected = iso === value
          const inRange =
            rangeStart && rangeEnd && iso >= rangeStart && iso <= rangeEnd && !selected
          const classes = [
            'calendar-day',
            sameMonth(date, view) ? '' : 'is-outside',
            disabled ? 'is-disabled' : '',
            iso === today ? 'is-today' : '',
            inRange ? 'is-range' : '',
            rangeStart && iso === rangeStart ? 'is-range-start' : '',
            rangeEnd && iso === rangeEnd ? 'is-range-end' : '',
            selected ? 'is-selected' : ''
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              className={classes}
              disabled={disabled}
              aria-label={dayAriaLabel(date)}
              aria-selected={selected}
              onClick={() => pick(date)}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      <div className="calendar-quick">
        <button
          type="button"
          className="chip"
          disabled={Boolean(minimum && today < minimum)}
          onClick={() => pick(toDate(today))}
        >
          {t('Сегодня')}
        </button>
        <button
          type="button"
          className="chip"
          disabled={Boolean(minimum && localISO(addDays(new Date(), 1)) < minimum)}
          onClick={() => pick(addDays(new Date(), 1))}
        >
          {t('Завтра')}
        </button>
        {onClear ? (
          <button type="button" className="chip calendar-clear" onClick={onClear}>
            {clearLabel || t('Очистить')}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function DateField({
  id,
  label,
  value,
  min,
  rangeStart,
  rangeEnd,
  onChange,
  onClear,
  clearLabel
}) {
  const [open, setOpen] = useState(false)
  const sheetTitle = onClear ? t('Дата возвращения') : t('Дата отправления')

  return (
    <div className="field">
      <span className="field-label" id={`${id}-label`}>
        {label}
      </span>
      <button
        type="button"
        id={id}
        className={`input date-input ${value ? '' : 'is-empty'}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
        onClick={() => setOpen(true)}
      >
        <span>{value ? fieldLabel(value) : t('Выберите дату')}</span>
        <Icon name="calendar" size={18} />
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={sheetTitle}
        subtitle={t('календарь')}
      >
        <Calendar
          value={value}
          min={min}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onSelect={(next) => {
            onChange?.(next)
            setOpen(false)
          }}
          onClear={
            onClear
              ? () => {
                  onClear()
                  setOpen(false)
                }
              : null
          }
          clearLabel={clearLabel ? t(clearLabel) : null}
        />
      </Sheet>
    </div>
  )
}
