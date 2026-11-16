import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import { BottomNav } from './components/BottomNav.jsx'
import { CombinationDetails } from './components/cards.jsx'
import { Sheet } from './components/Sheet.jsx'
import { Toast } from './components/Toast.jsx'
import { Icon, Logo } from './icons.jsx'
import { SearchScreen } from './screens/SearchScreen.jsx'
import { EventsScreen } from './screens/EventsScreen.jsx'
import { ResultsScreen } from './screens/ResultsScreen.jsx'
import { SettingsScreen } from './screens/SettingsScreen.jsx'
import { SplashScreen } from './components/SplashScreen.jsx'
import { addDays, formatPrice, localISO, nextWeekend } from './format.js'
import { applyTheme, loadSettings, saveSettings } from './settings.js'
import { currentPermission, requestPushPermission, showPush } from './notifications.js'

const FORM_KEY = 'storm-trip.form.v1'
const EVENT_KEY = 'storm-trip.event.v1'
const USER_KEY = 'storm-trip.user.v1'

const fallbackCategories = [
  { id: '/bilety-na-koncert/', label: 'Концерты' },
  { id: '/bilety-v-teatr/', label: 'Театр' },
  { id: '/bilety-na-sportivnye-meropriyatiya/', label: 'Спорт' },
  { id: '/festivali/', label: 'Фестивали' },
  { id: '/bilety-na-vystavki/', label: 'Выставки' },
  { id: '/bilety-na-shou/', label: 'Шоу' }
]

function initialForm() {
  const weekend = nextWeekend()
  return {
    from: 'Минск',
    fromId: null,
    to: 'Брест',
    toId: null,
    dateFrom: weekend.from,
    dateTo: weekend.to,
    adults: 1,
    children: 0,
    budgetMax: '',
    sort: 'BEST',
    domains: ['TRAIN', 'BUS', 'EVENT', 'HOTEL'],
    directOnly: false,
    eventQuery: '',
    eventCategories: [],
    eventVenue: '',
    eventCity: '',
    eventRegion: '',
    eventCountry: '',
    minHotelRating: null
  }
}

function loadForm() {
  try {
    const stored = window.localStorage.getItem(FORM_KEY)
    if (!stored) return initialForm()
    return { ...initialForm(), ...JSON.parse(stored) }
  } catch {
    return initialForm()
  }
}

function loadEvent() {
  try {
    const stored = window.localStorage.getItem(EVENT_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function getUserId() {
  try {
    const existing = window.localStorage.getItem(USER_KEY)
    if (existing) return existing
    const created = window.crypto?.randomUUID?.() || `user-${Date.now()}`
    window.localStorage.setItem(USER_KEY, created)
    return created
  } catch {
    return `user-${Date.now()}`
  }
}

function validate(form) {
  if (!form.from?.trim()) return 'Укажите город отправления.'
  if (!form.to?.trim()) return 'Укажите город прибытия.'
  if (!form.dateFrom) return 'Выберите дату отправления.'
  if (form.dateTo && form.dateTo < form.dateFrom) {
    return 'Дата возвращения не может быть раньше даты отправления.'
  }
  if (!form.domains?.length) return 'Выберите хотя бы один раздел поиска.'
  return null
}

function payload(form, userId) {
  return {
    userId,
    from: form.from.trim(),
    fromId: form.fromId || null,
    to: form.to.trim(),
    toId: form.toId || null,
    dateFrom: form.dateFrom,
    dateTo: form.dateTo || null,
    adults: Number(form.adults) || 1,
    children: Number(form.children) || 0,
    budgetMax: form.budgetMax === '' || form.budgetMax == null ? null : Number(form.budgetMax),
    sort: form.sort,
    domains: form.domains,
    directOnly: Boolean(form.directOnly),
    eventQuery: form.eventQuery?.trim() || null,
    eventCategories: form.eventCategories || [],
    eventVenue: form.eventVenue || null,
    eventCity: form.eventCity || null,
    eventRegion: form.eventRegion || null,
    eventCountry: form.eventCountry || null,
    minHotelRating: form.minHotelRating || null
  }
}

export default function App() {
  const [tab, setTab] = useState('search')
  const [form, setForm] = useState(loadForm)
  const [selectedEvent, setSelectedEvent] = useState(loadEvent)
  const [categories, setCategories] = useState(fallbackCategories)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [selectedCombination, setSelectedCombination] = useState(null)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [userId] = useState(getUserId)
  const [settings, setSettings] = useState(loadSettings)
  const [pushPermission, setPushPermission] = useState(currentPermission)
  const [booting, setBooting] = useState(true)
  const [splashLeaving, setSplashLeaving] = useState(false)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  useEffect(() => {
    const t1 = setTimeout(() => setSplashLeaving(true), 1500)
    const t2 = setTimeout(() => setBooting(false), 1950)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(FORM_KEY, JSON.stringify(form))
    } catch {
      /* storage may be unavailable */
    }
  }, [form])

  useEffect(() => {
    try {
      if (selectedEvent) {
        window.localStorage.setItem(EVENT_KEY, JSON.stringify(selectedEvent))
      } else {
        window.localStorage.removeItem(EVENT_KEY)
      }
    } catch {
      /* storage may be unavailable */
    }
  }, [selectedEvent])

  useEffect(() => {
    api
      .eventCategories()
      .then((list) => {
        if (Array.isArray(list) && list.length) setCategories(list)
      })
      .catch(() => {
        /* keep fallback categories */
      })
  }, [])

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab])

  const notify = useCallback((message, kind = 'info') => {
    setToast({ message, kind })
  }, [])

  const closeToast = useCallback(() => setToast(null), [])
  const closeSheet = useCallback(() => setSelectedCombination(null), [])

  const updateSettings = useCallback((patch) => {
    setSettings((current) => ({ ...current, ...patch }))
  }, [])

  const setPush = useCallback(
    async (next) => {
      if (!next) {
        updateSettings({ pushEnabled: false })
        return
      }
      const permission = await requestPushPermission()
      setPushPermission(permission)
      if (permission !== 'granted') {
        notify(
          permission === 'unsupported'
            ? 'Браузер не поддерживает уведомления.'
            : 'Разрешение на уведомления не выдано.',
          'error'
        )
        return
      }
      updateSettings({ pushEnabled: true })
      showPush('Storm Trip', 'Уведомления включены — сообщим, когда соберём маршрут.')
    },
    [notify, updateSettings]
  )

  const testPush = useCallback(async () => {
    const permission = await requestPushPermission()
    setPushPermission(permission)
    if (permission !== 'granted') {
      notify('Разрешение на уведомления не выдано.', 'error')
      return
    }
    const shown = await showPush('Storm Trip работает', 'Так придёт сигнал, когда поиск соберёт маршрут.')
    if (shown) notify('Тестовое уведомление отправлено')
  }, [notify])

  async function runSearch() {
    const problem = validate(form)
    if (problem) {
      notify(problem, 'error')
      setTab('search')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setTab('trips')

    try {
      const data = await api.search(payload(form, userId))
      if (data?.result) {
        setResult(data.result)
        if (!data.result.offers?.length && !data.result.combinations?.length) {
          notify('Источники не вернули предложений. Попробуйте изменить даты.', 'info')
        }
        if (settings.pushEnabled && settings.pushOnResults && document.hidden) {
          showPush(
            'Маршрут собран',
            `${form.from} → ${form.to}: предложений ${data.result.offers?.length || 0}, готовых вариантов ${data.result.combinations?.length || 0}.`
          )
        }
      } else {
        const message = data?.reply || 'Не удалось собрать поездку.'
        setError(message)
        notify(message, 'error')
      }
    } catch (reason) {
      const message = reason.message || 'Сервис поиска недоступен.'
      setError(message)
      notify(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function chooseEvent(event) {
    setSelectedEvent(event)
    const eventDay = event.start ? localISO(new Date(event.start)) : null

    setForm((current) => {
      let dateFrom = eventDay || current.dateFrom
      let dateTo = current.dateTo
      if (dateFrom && (!dateTo || dateTo < dateFrom)) {
        dateTo = localISO(addDays(new Date(`${dateFrom}T12:00:00`), 1))
      }
      return {
        ...current,
        to: event.venueLocality || current.to,
        toId: null,
        dateFrom,
        dateTo,
        eventVenue: event.venue?.name || '',
        eventCity: event.venueLocality || '',
        eventRegion: event.venueRegion || '',
        eventCountry: event.venueCountry || '',
        eventCategories: event.category?.startsWith('/')
          ? [event.category]
          : current.eventCategories
      }
    })

    notify('Событие добавлено в маршрут')
    setTab('search')
    window.scrollTo(0, 0)
  }

  function clearEvent() {
    setSelectedEvent(null)
    setForm((current) => ({
      ...current,
      eventVenue: '',
      eventCity: '',
      eventRegion: '',
      eventCountry: ''
    }))
  }

  const combinationTitle = useMemo(() => {
    if (!selectedCombination) return ''
    return selectedCombination.offers?.find((offer) => offer.title)?.title || 'Вариант поездки'
  }, [selectedCombination])

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setTab('search')} aria-label="Storm Trip — на главную">
          <Logo />
          <span className="brand-copy">
            <b>Storm Trip</b>
          </span>
        </button>
        <button
          className={`icon-button topbar-action ${tab === 'events' ? 'is-active' : ''}`}
          type="button"
          onClick={() => setTab('events')}
          aria-label="Открыть афишу"
        >
          <Icon name="ticket" size={20} />
        </button>
      </header>

      {!online ? (
        <div className="offline-bar">
          <Icon name="info" size={15} /> Нет сети — показываем последние загруженные данные.
        </div>
      ) : null}

      <main className="app-main">
        {tab === 'search' ? (
          <SearchScreen
            form={form}
            setForm={setForm}
            selectedEvent={selectedEvent}
            onClearEvent={clearEvent}
            onSubmit={runSearch}
            onOpenEvents={() => setTab('events')}
            categories={categories}
            loading={loading}
          />
        ) : null}

        {tab === 'events' ? (
          <EventsScreen
            categories={categories}
            selectedEvent={selectedEvent}
            onSelectEvent={chooseEvent}
          />
        ) : null}

        {tab === 'trips' ? (
          <ResultsScreen
            result={result}
            loading={loading}
            error={error}
            form={form}
            onEdit={() => setTab('search')}
            onSelectCombination={setSelectedCombination}
          />
        ) : null}

        {tab === 'settings' ? (
          <SettingsScreen
            settings={settings}
            onChange={updateSettings}
            permission={pushPermission}
            onSetPush={setPush}
            onTestPush={testPush}
          />
        ) : null}
      </main>

      <BottomNav active={tab} onChange={setTab} badge={result?.combinations?.length || null} />

      <Sheet
        open={Boolean(selectedCombination)}
        onClose={closeSheet}
        subtitle={selectedCombination ? formatPrice(selectedCombination.totalPrice) : undefined}
        title={combinationTitle}
      >
        {selectedCombination ? <CombinationDetails combination={selectedCombination} /> : null}
      </Sheet>

      <Toast toast={toast} onClose={closeToast} />

      {booting ? <SplashScreen leaving={splashLeaving} /> : null}
    </div>
  )
}
