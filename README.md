# Storm Trip — мобильный планировщик поездок

Мобильный веб-интерфейс (PWA) для бэкенда Storm Event. Собирает транспорт, события афиши и отели в один маршрут: пользователь указывает города и даты, получает готовые варианты поездки с ценой и оценкой совместимости.

Приложение выглядит и ведёт себя как мобильное: нижняя навигация, шторка с деталями, безопасные отступы, установка на главный экран Android/iOS. Открывается в браузере телефона, отдельного APK не требует.

## Возможности

- Поиск поездки: откуда, куда, даты, пассажиры, бюджет, сортировка.
- Выбор разделов: поезд, автобус, события, отель.
- Автодополнение городов и станций через `/api/localities`.
- Готовые комбинации «транспорт + событие + отель» и отдельные маршруты.
- Статусы источников: AtlasBus, БЖД, TicketBus, TicketPro, BelHotel.
- Афиша событий с категориями и поиском; выбранное событие подставляется в маршрут.
- Сохранение формы и выбранного события в `localStorage`.
- Установка как PWA: полноэкранный режим без адресной строки.

## Стек

| Слой | Технологии |
| --- | --- |
| Фронтенд | React 19, Vite 8, чистый CSS, PWA manifest |
| Раздача фронта | nginx 1.27 Alpine |
| Бэкенд | Spring Boot 3, Java 21, H2 in-memory по умолчанию |
| Оркестрация | Docker Compose, два отдельных контейнера |

## Структура

```text
.
├─ src/                     # Spring Boot бэкенд
├─ frontend/
│  ├─ src/                  # React-приложение
│  │  ├─ screens/           # Поиск, афиша, результаты
│  │  ├─ components/        # Карточки, шторка, навигация
│  │  ├─ api.js             # Запросы к бэкенду
│  │  ├─ format.js          # Даты, цены, подписи
│  │  └─ styles.css         # Мобильная дизайн-система
│  ├─ public/               # manifest.webmanifest, иконка
│  ├─ nginx.conf            # SPA + прокси /api -> backend:8080
│  └─ Dockerfile            # Node build + nginx runtime
├─ scripts/demo-phone.ps1   # Запуск демо на Android по USB
├─ Dockerfile               # Сборка бэкенда
├─ compose.yaml             # backend + frontend
└─ .env                     # локальные секреты, не коммитится
```

## Быстрый старт

Нужен Docker Desktop с Docker Compose v2.

```powershell
docker compose up --build -d
docker compose ps
```

Открыть в браузере: **http://localhost:3100**

Проверка, что оба контейнера живы и прокси работает:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3100/healthz
Invoke-WebRequest -UseBasicParsing http://localhost:3100/api/event-categories
```

Полезные команды:

```powershell
docker compose logs -f backend frontend
docker compose down
docker compose up -d --build frontend   # пересобрать только фронт
```

### Порты

По умолчанию фронтенд слушает `3100`, бэкенд — только `127.0.0.1:8080` (наружу не выставлен, фронт ходит в него по внутренней сети Docker).

Порт можно переопределить, не меняя файлы:

```powershell
$env:FRONTEND_PORT = "3200"
$env:BACKEND_PORT = "8081"
docker compose up -d
```

После этого фронт будет доступен на `http://localhost:3200`.

## Демонстрация на Android-телефоне по USB

Это основной сценарий: запускаем контейнеры, подключаем телефон кабелем и открываем приложение на нём. Android Studio и сборка APK не нужны — нужен только `adb` из Android Platform Tools.

### 1. Подготовить телефон

1. Настройки → О телефоне → 7 раз нажать «Номер сборки».
2. Настройки → Система → Для разработчиков → включить «Отладка по USB».
3. Подключить телефон кабелем к ноутбуку.
4. На телефоне подтвердить запрос «Разрешить отладку по USB».

### 2. Установить adb (один раз)

```powershell
winget install --id Google.PlatformTools -e
```

После установки открыть новый терминал, чтобы `adb` появился в `PATH`. Проверка:

```powershell
adb devices
```

В списке должно быть устройство со статусом `device`, а не `unauthorized`.

### 3. Запустить демо

```powershell
powershell -ExecutionPolicy Bypass -File scripts\demo-phone.ps1
```

Скрипт:

1. Поднимает `backend` и `frontend` через `docker compose`.
2. Ждёт, пока фронтенд ответит на `/healthz`.
3. Делает `adb reverse tcp:3100 tcp:3100`.
4. Открывает на телефоне `http://localhost:3100`.
5. Если `adb` не найден, печатает инструкцию и адрес для Wi-Fi.

Флаг `-SkipBuild` пропускает пересборку образов:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\demo-phone.ps1 -SkipBuild
```

### Вручную, без скрипта

```powershell
docker compose up -d --build
adb devices
adb reverse tcp:3100 tcp:3100
adb shell am start -a android.intent.action.VIEW -d http://localhost:3100
```

`adb reverse` пробрасывает порт телефона на ноутбук, поэтому на телефоне открывается именно `localhost:3100`, а не IP ноутбука.

### Установить как приложение

В Chrome на телефоне: меню → «Добавить на главный экран» / «Установить приложение». После этого Storm Trip открывается с иконки в полноэкранном режиме, как обычное приложение.

### Вариант без кабеля (Wi-Fi)

Если `adb` нет или телефон не видится:

```powershell
ipconfig
```

Найти IPv4-адрес ноутбука и открыть на телефоне `http://<IPv4>:3100` (телефон и ноутбук в одной сети). При первом запуске Windows может спросить разрешение для брандмауэра — разрешить для частных сетей.

### Почему PWA, а не APK

PWA не требует Android SDK, Gradle и эмулятора: интерфейс обновляется вместе с контейнером, а на телефоне ставится в один клик. Для текущей демонстрации это быстрее и надёжнее. Если в будущем понадобится именно APK, фронтенд можно обернуть через Capacitor, не переписывая интерфейс.

## Разработка без Docker

Бэкенд в контейнере, фронтенд локально с горячей перезагрузкой:

```powershell
docker compose up -d backend
cd frontend
npm install
npm run dev
```

Vite откроет **http://localhost:5173** и проксирует `/api` на `http://localhost:8080`.

Сборка production-версии:

```powershell
cd frontend
npm run build
```

## API, которое использует фронтенд

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/api/localities?query=Минск&limit=10` | Автодополнение городов и станций |
| `GET` | `/api/event-categories` | Категории афиши |
| `GET` | `/api/events?category=&query=&limit=20` | Лента событий |
| `POST` | `/api/search` | Поиск поездки |
| `GET` | `/actuator/health` | Healthcheck бэкенда |

Пример запроса поиска:

```json
{
  "userId": "00000000-0000-0000-0000-000000000001",
  "from": "Минск",
  "to": "Брест",
  "dateFrom": "2026-11-21",
  "dateTo": "2026-11-22",
  "adults": 1,
  "children": 0,
  "budgetMax": 300,
  "sort": "BEST",
  "domains": ["TRAIN", "BUS", "EVENT", "HOTEL"],
  "directOnly": false,
  "eventCategories": [],
  "minHotelRating": null
}
```

Ответ содержит `intent`, `offers`, `itineraries`, `combinations` и статусы источников `sources`. Полный первый поиск может занимать до минуты: бэкенд синхронно опрашивает внешние источники.

## Особенности и ограничения

- Бэкенд по умолчанию использует H2 in-memory: после перезапуска контейнера данные сбрасываются.
- Источники внешние, поэтому выдача зависит от их доступности. TicketPro сейчас может отдавать 404 на старые страницы категорий — в этом случае «Афиша» показывает пустое состояние, а поиск продолжает работать с остальными источниками.
- PWA не работает офлайн как полноценный кэш: нужен доступ к бэкенду.
- Выбранное событие и форма хранятся в браузере (`localStorage`), на сервер не отправляются.
- Файл `.env` с ключами не коммитится и не попадает в Docker-образы.

## Git

В репозитории используется простая модель веток:

- `main` — стабильная версия.
- `dev` — интеграционная ветка.
- `feature/mobile-frontend` — мобильный фронтенд, Docker-обвязка и демо-скрипт.

Текущая работа ведётся в `feature/mobile-frontend`:

```powershell
git switch feature/mobile-frontend
git status
git log --oneline --decorate -5
```

Перед слиянием в `dev` стоит прогнать `docker compose up --build -d` и smoke-тест: главный экран, автодополнение, поиск, карточка комбинации, афиша.
