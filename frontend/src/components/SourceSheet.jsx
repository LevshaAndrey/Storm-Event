import { sourceLabels, statusLabels } from '../format.js'
import { Icon } from '../icons.jsx'
import { Sheet } from './Sheet.jsx'

export function SourceSheet({ open, sources, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="Источники" subtitle={`${sources?.length || 0} сервисов`}>
      <div className="source-list">
        <p className="settings-note">
          Поиск идёт параллельно по пяти источникам. Если один не ответил, остальные всё равно
          приносят результаты.
        </p>
        {(sources || []).map((source) => {
          const status = (source.status || 'EMPTY').toLowerCase()
          return (
            <div key={source.source} className={`source-row status-${status}`}>
              <span className={`source-status-dot status-${status}`} aria-hidden="true" />
              <div className="source-row-copy">
                <b>{sourceLabels[source.source] || source.source}</b>
                <small>{statusLabels[source.status] || source.status}</small>
                {source.status === 'FAILED' && source.error ? (
                  <span className="source-error">{source.error}</span>
                ) : null}
              </div>
              <span className="source-count">
                {source.status === 'SUCCESS' ? `${source.resultCount}` : '—'}
              </span>
            </div>
          )
        })}
        <div className="inline-note">
          <Icon name="info" size={16} />
          Ошибки источников не влияют на сохранённую историю поездок.
        </div>
      </div>
    </Sheet>
  )
}
