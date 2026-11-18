import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import { BottomNav } from './components/BottomNav.jsx'
import { CombinationDetails } from './components/cards.jsx'
import { ChatSheet } from './components/ChatSheet.jsx'
import { InstallBanner } from './components/InstallBanner.jsx'
import { Onboarding } from './components/Onboarding.jsx'
import { Sheet } from './components/Sheet.jsx'
import { Toast } from './components/Toast.jsx'
import { Icon, Logo } from './icons.jsx'
import { SearchScreen } from './screens/SearchScreen.jsx'
import { EventsScreen } from './screens/EventsScreen.jsx'
import { ResultsScreen } from './screens/ResultsScreen.jsx'
import { SettingsScreen } from './screens/SettingsScreen.jsx'
import { SplashScreen } from './components/SplashScreen.jsx'
import { addDays, formatPrice, localISO, nextWeekend } from './format.js'
import { getLanguage, setLanguage, t } from './i18n.js'
import { applyTheme, loadSettings, saveSettings } from './settings.js'
import { currentPermission, requestPushPermission, showPush } from './notifications.js'
import {
  createHistoryEntry,
  loadHistory,
  mergeHistory,
  removeHistoryEntry,
  saveHistory
} from './history.js'
import { configureHaptics, haptic } from './haptics.js'
import { formFromIntent } from './intent.js'

const FORM_KEY = 'storm-trip.form.v1'
const EVENT_KEY = 'storm-trip.event.v1'
const USER_KEY = 'storm-trip.user.v1'
const ONBOARD_KEY = 'storm-trip.onboarded.v1'
const TAB_KEY = 'storm-trip.tab.v1'

function initialTab() {
  try {
    const stored = window.sessionStorage.getItem(TAB_KEY)
    return ['search', 'events', 'trips', 'settings'].includes(stored) ? stored : 'search'
  } catch {
    return 'search'
  }
}

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

function shouldOnboard() {
  try {
    return window.localStorage.getItem(ONBOARD_KEY) !== '1'
  } catch {
    return false
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
  const [tab, setTab] = useState(initialTab)
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
  const [history, setHistory] = useState(loadHistory)
  const [chatOpen, setChatOpen] = useState(false)
  const [onboarding, setOnboarding] = useState(shouldOnboard)
  const [updateReady, setUpdateReady] = useState(null)

  const passengers = useMemo(
    () => (Number(form.adults) || 1) + (Number(form.children) || 0),
    [form.adults, form.children]
  )

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    try {
      window.sessionStorage.setItem(TAB_KEY, tab)
    } catch {
      /* storage may be unavailable */
    }
  }, [tab])

  useEffect(() => {
    const next = settings.language || 'ru'
    if (next === getLanguage()) return
    setLanguage(next)
    window.location.reload()
  }, [settings.language])

  useEffect(() => {
    configureHaptics(settings.haptics)
  }, [settings.haptics])

  useEffect(() => {
    applyTheme(settings.theme)
    if (settings.theme !== 'system' || !window.matchMedia) return undefined
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => applyTheme('system')
    media.addEventListener?.('change', onChange)
    return () => media.removeEventListener?.('change', onChange)
  }, [settings.theme])

  useEffect(() => {
    saveHistory(history)
  }, [history])

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
    const onSwUpdate = (event) => setUpdateReady(event.detail || null)
    window.addEventListener('storm-sw-update', onSwUpdate)
    return () => window.removeEventListener('storm-sw-update', onSwUpdate)
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

  const changeTab = useCallback((next) => {
    haptic(6)
    setTab(next)
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
            ? t('Браузер не поддерживает уведомления.')
            : t('Разрешение на уведомления не выдано.'),
          'error'
        )
        return
      }
      updateSettings({ pushEnabled: true })
      showPush(
        'Storm Trip',
        t('Уведомления включены — сообщим, когда соберём маршрут.')
      )
    },
    [notify, updateSettings]
  )

  const testPush = useCallback(async () => {
    const permission = await requestPushPermission()
    setPushPermission(permission)
    if (permission !== 'granted') {
      notify(t('Разрешение на уведомления не выдано.'), 'error')
      return
    }
    const shown = await showPush(
      t('Storm Trip работает'),
      t('Так придёт сигнал, когда поиск соберёт маршрут.')
    )
    if (shown) notify(t('Тестовое уведомление отправлено'))
  }, [notify])

  const rememberTrip = useCallback((tripForm, tripResult) => {
    if (!tripResult) return
    const entry = createHistoryEntry(tripForm, tripResult)
    setHistory((current) => mergeHistory(current, entry))
  }, [])

  const runSearch = useCallback(
    async (override) => {
      const nextForm = override ? { ...form, ...override } : form
      if (override) setForm(nextForm)

      const problem = validate(nextForm)
      if (problem) {
        notify(problem, 'error')
        setTab('search')
        return
      }

      haptic(14)
      setLoading(true)
      setError('')
      setResult(null)
      setTab('trips')

      try {
        const data = await api.search(payload(nextForm, userId))
        if (data?.result) {
          setResult(data.result)
          rememberTrip(nextForm, data.result)
          if (!data.result.offers?.length && !data.result.combinations?.length) {
            notify(t('Источники не вернули предложений. Попробуйте изменить даты.'), 'info')
          }
          if (settings.pushEnabled && settings.pushOnResults && document.hidden) {
            showPush(
              t('Маршрут собран'),
              `${nextForm.from} → ${nextForm.to}: ${t('предложений')} ${data.result.offers?.length || 0}, ${t('готовых вариантов')} ${data.result.combinations?.length || 0}.`
            )
          }
        } else {
          const message = data?.reply || t('Не удалось собрать поездку.')
          setError(message)
          notify(message, 'error')
        }
      } catch (reason) {
        const message = reason.message || t('Сервис поиска недоступен.')
        setError(message)
        notify(message, 'error')
      } finally {
        setLoading(false)
        haptic(10)
      }
    },
    [form, userId, settings.pushEnabled, settings.pushOnResults, notify, rememberTrip]
  )

  const planWeekend = useCallback(async () => {
    setLoading(true)
    setError('')
    setTab('trips')
    haptic(14)

    try {
      const data = await api.events({ limit: 12 })
      const list = Array.isArray(data?.events) ? data.events : []
      const withPlace = list.filter((event) => event?.start && event?.venueLocality)
      const pool = withPlace.length ? withPlace : list.filter((event) => event?.start)
      const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
      const weekend = nextWeekend()

      let nextForm
      if (pick) {
        const day = localISO(new Date(pick.start))
        nextForm = {
          ...form,
          to: pick.venueLocality || form.to,
          toId: null,
          dateFrom: day,
          dateTo: localISO(addDays(new Date(`${day}T12:00:00`), 1)),
          eventVenue: pick.venue?.name || '',
          eventCity: pick.venueLocality || '',
          eventRegion: pick.venueRegion || '',
          eventCountry: pick.venueCountry || '',
          eventCategories: pick.category?.startsWith('/') ? [pick.category] : []
        }
        setSelectedEvent(pick)
        notify(`${t('Выходные:')} ${pick.title}`)
      } else {
        nextForm = { ...form, dateFrom: weekend.from, dateTo: weekend.to }
        notify(t('Афиша недоступна — собираем выходные по вашему маршруту.'), 'info')
      }

      setLoading(false)
      await runSearch(nextForm)
    } catch {
      setLoading(false)
      setTab('search')
      notify(t('Не удалось собрать выходные. Попробуйте ещё раз.'), 'error')
    }
  }, [form, notify, runSearch])

  const applyChatResult = useCallback(
    (nextResult, intent) => {
      if (!nextResult) return
      const nextForm = intent ? formFromIntent(intent, form) : form
      setForm(nextForm)
      setResult(nextResult)
      setError('')
      setTab('trips')
      rememberTrip(nextForm, nextResult)
      haptic(14)
    },
    [form, rememberTrip]
  )

  const openHistoryEntry = useCallback(
    (entry) => {
      if (!entry) return
      setForm({ ...initialForm(), ...entry.form })
      setSelectedEvent(null)
      setResult(entry.result)
      setError('')
      setTab('trips')
      haptic(8)
      window.scrollTo(0, 0)
    },
    []
  )

  const deleteHistory = useCallback(
    (id) => {
      setHistory((current) => removeHistoryEntry(current, id))
      haptic(6)
      notify(t('Поездка удалена из истории'))
    },
    [notify]
  )

  const clearHistory = useCallback(() => {
    setHistory([])
    haptic(12)
    notify(t('История поездок очищена'))
  }, [notify])

  const adjustSearch = useCallback((patch) => runSearch(patch), [runSearch])

  const changeSort = useCallback((sort) => {
    setForm((current) => ({ ...current, sort }))
    haptic(5)
  }, [])

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

    haptic(8)
    notify(t('Событие добавлено в маршрут'))
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

  const finishOnboarding = useCallback(() => {
    setOnboarding(false)
    try {
      window.localStorage.setItem(ONBOARD_KEY, '1')
    } catch {
      /* storage may be unavailable */
    }
    setTab('search')
    haptic(8)
  }, [])

  const applyUpdate = useCallback(() => {
    try {
      updateReady?.apply?.()
    } catch {
      window.location.reload()
    }
    setUpdateReady(null)
  }, [updateReady])

  const combinationTitle = useMemo(() => {
    if (!selectedCombination) return ''
    return selectedCombination.offers?.find((offer) => offer.title)?.title || t('Вариант поездки')
  }, [selectedCombination])

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => changeTab('search')} aria-label="Storm Trip — на главную">
          <Logo />
          <span className="brand-copy">
            <b>Storm Trip</b>
          </span>
        </button>
        <button
          className={`icon-button topbar-action ${tab === 'events' ? 'is-active' : ''}`}
          type="button"
          onClick={() => changeTab('events')}
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
            onOpenEvents={() => changeTab('events')}
            onOpenChat={() => setChatOpen(true)}
            onPlanWeekend={planWeekend}
            history={history}
            onOpenHistory={openHistoryEntry}
            categories={categories}
            loading={loading}
          />
        ) : null}

        {tab === 'events' ? (
          <EventsScreen
            categories={categories}
            selectedEvent={selectedEvent}
            onSelectEvent={chooseEvent}
            onNotify={notify}
          />
        ) : null}

        {tab === 'trips' ? (
          <ResultsScreen
            result={result}
            loading={loading}
            error={error}
            form={form}
            history={history}
            categories={categories}
            onEdit={() => changeTab('search')}
            onSelectCombination={setSelectedCombination}
            onOpenHistory={openHistoryEntry}
            onDeleteHistory={deleteHistory}
            onClearHistory={clearHistory}
            onAdjust={adjustSearch}
            onNotify={notify}
            onOpenChat={() => setChatOpen(true)}
            onSortChange={changeSort}
          />
        ) : null}

        {tab === 'settings' ? (
          <SettingsScreen
            settings={settings}
            onChange={updateSettings}
            permission={pushPermission}
            onSetPush={setPush}
            onTestPush={testPush}
            historyCount={history.length}
            onClearHistory={clearHistory}
            onReplayOnboarding={() => setOnboarding(true)}
          />
        ) : null}
      </main>

      <BottomNav active={tab} onChange={changeTab} badge={result?.combinations?.length || null} />

      <Sheet
        open={Boolean(selectedCombination)}
        onClose={closeSheet}
        subtitle={selectedCombination ? formatPrice(selectedCombination.totalPrice) : undefined}
        title={combinationTitle}
      >
        {selectedCombination ? (
          <CombinationDetails
            combination={selectedCombination}
            passengers={passengers}
            onNotify={notify}
          />
        ) : null}
      </Sheet>

      <ChatSheet
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        userId={userId}
        onResult={applyChatResult}
        onOpenResults={() => changeTab('trips')}
        onNotify={notify}
      />

      <Toast toast={toast} onClose={closeToast} />

      {booting ? <SplashScreen leaving={splashLeaving} /> : null}

      {!booting && onboarding ? <Onboarding open onDone={finishOnboarding} /> : null}

      {!booting && !onboarding ? (
        updateReady ? (
          <div className="install-banner update-banner">
            <span className="install-icon"><Icon name="refresh" size={18} /></span>
            <div>
              <b>Доступно обновление</b>
              <small>Перезагрузите, чтобы получить новую версию</small>
            </div>
            <button type="button" className="btn btn-soft btn-small" onClick={applyUpdate}>
              Обновить
            </button>
            <button
              type="button"
              className="install-close"
              onClick={() => setUpdateReady(null)}
              aria-label="Скрыть"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        ) : (
          <InstallBanner />
        )
      ) : null}
    </div>
  )
}
