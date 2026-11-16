import { useEffect } from 'react'
import { Icon } from '../icons.jsx'

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(onClose, 3400)
    return () => window.clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null
  return (
    <div className={`toast toast-${toast.kind || 'info'}`} role="status">
      <Icon name={toast.kind === 'error' ? 'info' : 'check'} size={18} />
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="Скрыть">
        <Icon name="x" size={14} />
      </button>
    </div>
  )
}
