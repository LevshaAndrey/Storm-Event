export function Stepper({ label, value, min = 0, max = 9, onChange }) {
  const current = Number(value) || 0
  return (
    <div className="stepper">
      <span className="field-label">{label}</span>
      <div className="stepper-control">
        <button
          type="button"
          aria-label={`Уменьшить: ${label}`}
          disabled={current <= min}
          onClick={() => onChange(Math.max(min, current - 1))}
        >
          <span aria-hidden="true">−</span>
        </button>
        <span className="stepper-value">{current}</span>
        <button
          type="button"
          aria-label={`Увеличить: ${label}`}
          disabled={current >= max}
          onClick={() => onChange(Math.min(max, current + 1))}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  )
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      className={`toggle-row ${checked ? 'is-on' : ''}`}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-copy">
        <b>{label}</b>
        {hint ? <small>{hint}</small> : null}
      </span>
      <span className="switch" aria-hidden="true"><span /></span>
    </button>
  )
}
