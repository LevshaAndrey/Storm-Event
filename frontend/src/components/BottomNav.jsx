import { Icon } from '../icons.jsx'

const tabs = [
  { id: 'search', label: 'Поиск', icon: 'search' },
  { id: 'events', label: 'Афиша', icon: 'ticket' },
  { id: 'trips', label: 'Поездки', icon: 'route' },
  { id: 'settings', label: 'Ещё', icon: 'tune' }
]

export function BottomNav({ active, onChange, badge }) {
  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      <div className="bottom-nav-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`nav-item ${active === tab.id ? 'is-active' : ''}`}
            aria-current={active === tab.id ? 'page' : undefined}
            onClick={() => onChange(tab.id)}
          >
            <span className="nav-icon">
              <Icon name={tab.icon} size={22} />
              {tab.id === 'trips' && badge ? <span className="nav-badge">{badge}</span> : null}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
