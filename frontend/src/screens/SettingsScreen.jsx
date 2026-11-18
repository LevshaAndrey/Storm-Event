import { useState } from 'react'
import { Toggle } from '../components/Controls.jsx'
import { Icon } from '../icons.jsx'
import { LANGUAGES } from '../i18n.js'

const themes = [
  { id: 'system', label: 'Система' },
  { id: 'light', label: 'Светлая' },
  { id: 'dark', label: 'Тёмная' }
]

export function SettingsScreen({
  settings,
  onChange,
  permission,
  onSetPush,
  onTestPush,
  historyCount = 0,
  onClearHistory,
  onReplayOnboarding
}) {
  const [confirmClear, setConfirmClear] = useState(false)
  const theme = settings.theme || 'dark'
  const themeIcon = theme === 'light' ? 'sun' : theme === 'system' ? 'tune' : 'moon'

  return (
    <div className="screen">
      <div className="screen-head">
        <span className="eyebrow">Storm Trip</span>
        <h1>Настройки</h1>
        <p>Уведомления, оформление, история и информация о приложении.</p>
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
            <Icon name={themeIcon} size={17} /> Оформление
          </div>
          <div className="segmented">
            {themes.map((option) => (
              <button
                key={option.id}
                type="button"
                className={theme === option.id ? 'is-active' : ''}
                onClick={() => onChange({ ...settings, theme: option.id })}
              >
                {option.label}
              </button>
            ))}
          </div>
          <small className="settings-note">
            «Система» повторяет тему телефона. Выбор применяется сразу и запоминается на устройстве.
          </small>
          <Toggle
            label="Вибрация"
            hint="Короткий отклик при выборе вариантов и запуске поиска"
            checked={Boolean(settings.haptics)}
            onChange={(value) => onChange({ ...settings, haptics: value })}
          />
        </div>

        <div className="settings-section">
          <div className="settings-title">
            <Icon name="globe" size={17} /> Язык
          </div>
          <div className="language-grid" data-i18n-skip>
            {LANGUAGES.map((language) => {
              const active = (settings.language || 'ru') === language.id
              return (
                <button
                  key={language.id}
                  type="button"
                  className={`language-option ${active ? 'is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => onChange({ ...settings, language: language.id })}
                >
                  <span className="language-code">{language.short}</span>
                  <span className="language-name">{language.label}</span>
                  {active ? <Icon name="check" size={15} /> : null}
                </button>
              )
            })}
          </div>
          <small className="settings-note">
            Интерфейс, даты и подсказки сразу на выбранном языке.
          </small>
        </div>

        <div className="settings-section">
          <div className="settings-title">
            <Icon name="clock" size={17} /> Данные на устройстве
          </div>
          <div className="info-list">
            <div className="info-row">
              <small>Поездок в истории</small>
              <b>{historyCount}</b>
            </div>
            <div className="info-row">
              <small>Хранение</small>
              <b>только этот браузер</b>
            </div>
          </div>
          <small className="settings-note">
            История не отправляется на сервер и переживает перезапуск приложения. Можно очистить её в любой момент.
          </small>
          <div className="settings-actions">
            <button
              type="button"
              className={`btn btn-small ${confirmClear ? 'btn-danger' : 'btn-dark'}`}
              disabled={!historyCount}
              onClick={() => {
                if (!historyCount) return
                if (confirmClear) {
                  onClearHistory?.()
                  setConfirmClear(false)
                } else {
                  setConfirmClear(true)
                  window.setTimeout(() => setConfirmClear(false), 3400)
                }
              }}
            >
              <Icon name="trash" size={15} />
              {confirmClear ? 'Точно очистить?' : 'Очистить историю'}
            </button>
            <button type="button" className="btn btn-soft btn-small" onClick={onReplayOnboarding}>
              <Icon name="spark" size={15} /> Показать знакомство
            </button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-title">
            <Icon name="info" size={17} /> О приложении
          </div>
          <div className="info-list">
            <div className="info-row">
              <small>Версия</small>
              <b>1.2.0</b>
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
