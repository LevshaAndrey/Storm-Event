import { useEffect } from 'react'
import { Icon } from '../icons.jsx'

export function Sheet({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-grab" aria-hidden="true" />
        <header className="sheet-head">
          <div>
            {subtitle ? <span className="eyebrow">{subtitle}</span> : null}
            <h2>{title}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Закрыть">
            <Icon name="x" size={20} />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </section>
    </div>
  )
}
