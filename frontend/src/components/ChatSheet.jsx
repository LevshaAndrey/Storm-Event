import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'
import { haptic } from '../haptics.js'
import { getLocale, t } from '../i18n.js'
import { Icon } from '../icons.jsx'
import { getSpeechRecognition } from '../voice.js'
import { Sheet } from './Sheet.jsx'

const suggestions = [
  'Дешевле',
  'Без автобуса',
  'Отель 4★',
  'Только прямые',
  'Покажи прошлый результат',
  'Сброс'
]

function newMessage(role, text, extra = {}) {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    text,
    ...extra
  }
}

export function ChatSheet({ open, onClose, userId, onResult, onOpenResults, onNotify }) {
  const [messages, setMessages] = useState(() => [
    newMessage(
      'assistant',
      'Напишите запрос словами — соберу маршрут. Например: «Из Минска в Брест на выходные до 300 BYN».\nПотом можно уточнять: «дешевле», «без автобуса», «отель 4★».'
    )
  ])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [resultCount, setResultCount] = useState(0)
  const logRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 250)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, busy, open])

  useEffect(
    () => () => {
      try {
        recognitionRef.current?.abort?.()
      } catch {
        /* recognition may already be stopped */
      }
    },
    []
  )

  async function send(value) {
    const message = String(value ?? text).trim()
    if (!message || busy) return
    haptic(8)
    setText('')
    setMessages((current) => [...current, newMessage('user', message)])
    setBusy(true)

    try {
      const data = await api.chat({ message, userId })
      const reply = data?.reply || 'Готово.'
      const nextResult = data?.result || null
      const count = nextResult
        ? (nextResult.combinations?.length || 0) + (nextResult.offers?.length || 0)
        : 0
      setMessages((current) => [...current, newMessage('assistant', reply, { hasResult: Boolean(nextResult) })])
      if (nextResult) {
        setHasResult(true)
        setResultCount(count)
        onResult?.(nextResult, data.intent)
        haptic(14)
      }
    } catch (reason) {
      const messageText =
        reason?.name === 'AbortError'
          ? 'Источники не ответили за две минуты. Попробуйте ещё раз.'
          : reason?.message || 'Не удалось получить ответ.'
      setMessages((current) => [...current, newMessage('assistant', messageText)])
      onNotify?.(messageText, 'error')
    } finally {
      setBusy(false)
    }
  }

  function toggleVoice() {
    const Recognition = getSpeechRecognition()
    if (!Recognition) {
      onNotify?.('Голосовой ввод не поддерживается этим браузером.', 'error')
      return
    }
    if (listening) {
      try {
        recognitionRef.current?.stop?.()
      } catch {
        /* already stopped */
      }
      setListening(false)
      return
    }
    const recognition = new Recognition()
    recognition.lang = getLocale()
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript
      if (transcript) setText(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
      haptic(10)
    } catch {
      setListening(false)
      onNotify?.('Не удалось запустить микрофон.', 'error')
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Спросите словами" subtitle="AI-поиск и уточнения">
      <div className="chat">
        <div className="chat-log" ref={logRef}>
          {messages.map((message) => (
            <div key={message.id} className={`chat-msg chat-msg-${message.role}`}>
              <div className="chat-bubble">
                <span className="chat-text">{message.text}</span>
                {message.hasResult && hasResult ? (
                  <button
                    type="button"
                    className="btn btn-soft btn-small chat-result-btn"
                    onClick={() => {
                      onOpenResults?.()
                      onClose?.()
                    }}
                  >
                    <Icon name="route" size={15} />
                    {resultCount ? `${t('Показать результат')} · ${resultCount}` : t('Открыть результат')}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          {busy ? (
            <div className="chat-msg chat-msg-assistant">
              <div className="chat-bubble chat-typing" aria-label="Печатает">
                <i />
                <i />
                <i />
              </div>
            </div>
          ) : null}
        </div>

        <div className="chat-suggestions">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="chip"
              disabled={busy}
              onClick={() => send(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          className="chat-input-row"
          onSubmit={(event) => {
            event.preventDefault()
            send()
          }}
        >
          <button
            type="button"
            className={`chat-mic ${listening ? 'is-listening' : ''}`}
            onClick={toggleVoice}
            aria-label={listening ? 'Остановить запись' : 'Сказать голосом'}
          >
            <Icon name="mic" size={19} />
          </button>
          <input
            ref={inputRef}
            className="input chat-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Из Минска в Брест на выходные…"
            maxLength={300}
            disabled={busy}
          />
          <button
            type="submit"
            className="chat-send"
            disabled={busy || !text.trim()}
            aria-label="Отправить"
          >
            <Icon name="arrowRight" size={19} />
          </button>
        </form>
        <p className="chat-note">
          {busy
            ? 'Опрашиваем пять источников — это может занять до минуты.'
            : 'Понимает даты, бюджет, пассажиров, звёзды отеля, время суток и «без автобуса».'}
        </p>
      </div>
    </Sheet>
  )
}
