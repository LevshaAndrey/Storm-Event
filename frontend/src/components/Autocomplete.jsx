import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'
import { Icon } from '../icons.jsx'

export function Autocomplete({
  id,
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  icon = 'pin',
  autoFocus = false
}) {
  const [text, setText] = useState(value || '')
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [loading, setLoading] = useState(false)
  const skipFetch = useRef(false)
  const boxRef = useRef(null)

  useEffect(() => {
    setText(value || '')
  }, [value])

  useEffect(() => {
    const query = text.trim()
    if (!open || query.length < 2 || skipFetch.current) {
      return undefined
    }
    let cancelled = false
    setLoading(true)
    const timer = window.setTimeout(() => {
      api
        .localities(query)
        .then((result) => {
          if (!cancelled) {
            setItems(Array.isArray(result) ? result : [])
            setActive(-1)
          }
        })
        .catch(() => {
          if (!cancelled) setItems([])
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 260)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [text, open])

  useEffect(() => {
    const close = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  function select(item) {
    skipFetch.current = true
    setText(item.name)
    setItems([])
    setOpen(false)
    onSelect?.(item)
  }

  function handleChange(event) {
    skipFetch.current = false
    setText(event.target.value)
    setOpen(true)
    onChange?.(event.target.value)
  }

  function handleKeyDown(event) {
    if (!open || !items.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => (current + 1) % items.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => (current <= 0 ? items.length - 1 : current - 1))
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault()
      select(items[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="autocomplete" ref={boxRef}>
      <label className="field" htmlFor={id}>
        <span className="field-label">{label}</span>
        <span className="input-wrap">
          <Icon name={icon} size={19} className="input-icon" />
          <input
            id={id}
            className="input input-with-icon"
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder={placeholder}
            value={text}
            onChange={handleChange}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-expanded={open && items.length > 0}
          />
          {text ? (
            <button
              className="input-clear"
              type="button"
              aria-label="Очистить"
              onClick={() => {
                skipFetch.current = true
                setText('')
                setItems([])
                setOpen(false)
                onChange?.('')
              }}
            >
              <Icon name="x" size={16} />
            </button>
          ) : null}
        </span>
      </label>

      {open && (items.length > 0 || loading) ? (
        <div className="suggestions" role="listbox">
          {loading && !items.length ? <div className="suggestion-empty">Ищем населённый пункт…</div> : null}
          {items.map((item, index) => (
            <button
              key={`${item.id || item.label}-${index}`}
              type="button"
              role="option"
              aria-selected={index === active}
              className={`suggestion ${index === active ? 'is-active' : ''}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(item)}
            >
              <span className="suggestion-pin"><Icon name="pin" size={16} /></span>
              <span className="suggestion-text">
                <b>{item.name}</b>
                <small>{[item.district, item.region].filter(Boolean).join(' · ') || item.country}</small>
              </span>
              {item.kind === 'STATION' ? <span className="suggestion-kind">станция</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
