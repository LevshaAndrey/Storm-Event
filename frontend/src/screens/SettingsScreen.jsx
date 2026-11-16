import { Icon } from '../icons.jsx'

export function SettingsScreen({ settings, onChange, permission, onSetPush, onTestPush }) {
  const isDark = settings.theme === 'dark'

  return (
    <div className="screen">
      <div className="screen-head">
        <span className="eyebrow">Storm Trip</span>
        <h1>Настройки</h1>
        <p>Уведомления, оформление и информация о приложении.</p>
      </div>

      <div className="card settings-card">
        <div className="settings-section">
          <div className="settings-title">
            <Icon name="bell" size={17} /> Уведомления
          </div>
          <button
            type="button"
            className={`toggle-row ${settings.pushEnabled ? 'is-on' : ''}`}
            onClick={() => onSetPush(!settings.pushEnabled)}
          >
            <span className="toggle-copy">
              <b>Push-уведомления</b>
              <small>Сигнал, когда маршрут собран, а приложение свёрнуто</small>
            </span>
            <span className="switch">
              <span />
            </span>
          </button>
          <button
            type="button"
            className={`toggle-row ${settings.pushEnabled && settings.pushOnResults ? 'is-on' : ''}`}
            disabled={!settings.pushEnabled}
            onClick={() => onChange({ ...settings, pushOnResults: !settings.pushOnResults })}
          >
            <span className="toggle-copy">
              <b>После завершения поиска</b>
              <small>Сколько предложений нашли источники</small>
            </span>
            <span className="switch">
              <span />
            </span>
          </button>
          {permission === 'denied' ? (
            <div className="inline-note">
              <Icon name="info" size={15} /> Уведомления заблокированы в браузере. Разрешите их в настройках сайта,
              чтобы получать сигналы.
            </div>
          ) : null}
          {permission === 'unsupported' ? (
            <div className="inline-note">
              <Icon name="info" size={15} /> Этот браузер не поддерживает уведомления.
            </div>
          ) : null}
          <button type="button" className="btn btn-soft btn-small" onClick={onTestPush} disabled={permission === 'unsupported'}>
            <Icon name="bell" size={15} /> Проверить уведомление
          </button>
        </div>

        <div className="settings-section">
          <div className="settings-title">
            <Icon name={isDark ? 'moon' : 'sun'} size={17} /> Оформление
          </div>
          <div className="segmented">
            <button type="button" className={!isDark ? 'is-active' : ''} onClick={() => onChange({ ...settings, theme: 'light' })}>
              Светлая
            </button>
            <button type="button" className={isDark ? 'is-active' : ''} onClick={() => onChange({ ...settings, theme: 'dark' })}>
              Тёмная
            </button>
          </div>
          <small className="settings-note">Тема применяется сразу и запоминается на устройстве.</small>
        </div>

        <div className="settings-section">
          <div className="settings-title">
            <Icon name="info" size={17} /> О приложении
          </div>
          <div className="info-list">
            <div className="info-row">
              <small>Версия</small>
              <b>1.1.0</b>
            </div>
            <div className="info-row">
              <small>Клиент</small>
              <b>React 19 · PWA</b>
            </div>
            <div className="info-row">
              <small>Поиск</small>
              <b>5 источников · Spring Boot</b>
            </div>
            <div className="info-row">
              <small>Исходный код</small>
              <b>
                <a className="text-link" href="https://github.com/LevshaAndrey/Storm-Event" target="_blank" rel="noreferrer">
                  GitHub <Icon name="external" size={13} />
                </a>
              </b>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
