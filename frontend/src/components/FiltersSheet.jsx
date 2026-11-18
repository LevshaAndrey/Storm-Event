import { Toggle } from './Controls.jsx'
import { Icon } from '../icons.jsx'
import { Sheet } from './Sheet.jsx'

export const emptyFilters = {
  maxPrice: '',
  maxDuration: '',
  maxTransfers: '',
  minHotelRating: '',
  onlyWithEvent: false,
  onlyWithHotel: false,
  onlyDirect: false
}

export function countFilters(filters) {
  if (!filters) return 0
  return Object.entries(filters).filter(([, value]) => value !== '' && value !== false && value != null).length
}

export function FiltersSheet({ open, filters, onChange, onClose, onReset }) {
  const active = countFilters(filters)
  const patch = (values) => onChange({ ...filters, ...values })

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Фильтры"
      subtitle={active ? `активно ${active}` : 'все варианты'}
    >
      <div className="filters-sheet">
        <label className="field">
          <span className="field-label">Цена до, BYN</span>
          <span className="input-wrap">
            <Icon name="wallet" size={18} className="input-icon" />
            <input
              className="input input-with-icon"
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="без ограничения"
              value={filters.maxPrice}
              onChange={(event) => patch({ maxPrice: event.target.value })}
            />
          </span>
        </label>

        <div className="form-row">
          <label className="field">
            <span className="field-label">В пути не дольше</span>
            <select
              className="input select"
              value={filters.maxDuration}
              onChange={(event) => patch({ maxDuration: event.target.value })}
            >
              <option value="">любое</option>
              <option value="180">3 часов</option>
              <option value="300">5 часов</option>
              <option value="480">8 часов</option>
              <option value="720">12 часов</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">Пересадок</span>
            <select
              className="input select"
              value={filters.maxTransfers}
              onChange={(event) => patch({ maxTransfers: event.target.value })}
            >
              <option value="">любое</option>
              <option value="0">без пересадок</option>
              <option value="1">до 1</option>
              <option value="2">до 2</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field-label">Отель от</span>
          <select
            className="input select"
            value={filters.minHotelRating}
            onChange={(event) => patch({ minHotelRating: event.target.value })}
          >
            <option value="">любой</option>
            <option value="2">2★ и выше</option>
            <option value="3">3★ и выше</option>
            <option value="4">4★ и выше</option>
            <option value="5">только 5★</option>
          </select>
        </label>

        <div className="filter-toggles">
          <Toggle
            label="Только с событием"
            hint="Оставить варианты, где есть билет на событие"
            checked={filters.onlyWithEvent}
            onChange={(value) => patch({ onlyWithEvent: value })}
          />
          <Toggle
            label="Только с отелем"
            hint="Оставить варианты с проживанием"
            checked={filters.onlyWithHotel}
            onChange={(value) => patch({ onlyWithHotel: value })}
          />
          <Toggle
            label="Только прямые"
            hint="Без пересадок в транспорте"
            checked={filters.onlyDirect}
            onChange={(value) => patch({ onlyDirect: value })}
          />
        </div>

        <div className="filter-actions">
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            Сбросить
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Показать
          </button>
        </div>
      </div>
    </Sheet>
  )
}
