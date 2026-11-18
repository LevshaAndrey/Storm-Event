export const LANGUAGES = [
  { id: 'ru', label: 'Русский', short: 'RU', locale: 'ru-RU' },
  { id: 'be', label: 'Беларуская', short: 'BE', locale: 'be-BY' },
  { id: 'en', label: 'English', short: 'EN', locale: 'en-GB' },
  { id: 'pl', label: 'Polski', short: 'PL', locale: 'pl-PL' }
]

// Русский текст — источник. Для каждого языка: [беларуская, english, polski].
const TABLE = {
  // --- Навигация и общие элементы ---
  'Поиск': ['Пошук', 'Search', 'Szukaj'],
  'Афиша': ['Афіша', 'Events', 'Wydarzenia'],
  'Поездки': ['Паездкі', 'Trips', 'Podróże'],
  'Ещё': ['Яшчэ', 'More', 'Więcej'],
  'Основная навигация': ['Асноўная навігацыя', 'Main navigation', 'Nawigacja główna'],
  'Настройки': ['Налады', 'Settings', 'Ustawienia'],
  'Закрыть': ['Зачыніць', 'Close', 'Zamknij'],
  'Скрыть': ['Схаваць', 'Hide', 'Ukryj'],
  'Очистить': ['Ачысціць', 'Clear', 'Wyczyść'],
  'Все': ['Усе', 'All', 'Wszystkie'],
  'Сбросить': ['Скінуць', 'Reset', 'Wyczyść'],
  'Сбросить фильтры': ['Скінуць фільтры', 'Reset filters', 'Wyczyść filtry'],
  'Показать': ['Паказаць', 'Show', 'Pokaż'],
  'Показать все': ['Паказаць усе', 'Show all', 'Pokaż wszystkie'],
  'Обновить': ['Абнавіць', 'Refresh', 'Odśwież'],
  'Установить': ['Усталяваць', 'Install', 'Zainstaluj'],
  'Далее': ['Далей', 'Next', 'Dalej'],
  'Поехали': ['Паехалі', "Let's go", 'Ruszamy'],
  'Пропустить': ['Прапусціць', 'Skip', 'Pomiń'],

  // --- Поиск ---
  'планировщик поездок': ['планіроўшчык паездак', 'trip planner', 'planer podróży'],
  'Куда поедем?': ['Куды паедзем?', 'Where shall we go?', 'Dokąd jedziemy?'],
  'Соберём транспорт, событие и проживание в один маршрут.': [
    'Збяром транспарт, падзею і пражыванне ў адзін маршрут.',
    "We'll combine transport, an event and accommodation into one route.",
    'Połączymy transport, wydarzenie i nocleg w jedną trasę.'
  ],
  'Спросите словами': ['Спытайце словамі', 'Ask in words', 'Zapytaj słowami'],
  '«Из Минска в Брест на выходные»': [
    '«З Мінска ў Брэст на выхадныя»',
    '“From Minsk to Brest for the weekend”',
    '„Z Mińska do Brześcia na weekend”'
  ],
  'Собери выходные': ['Збяры выхадныя', 'Plan a weekend', 'Zaplanuj weekend'],
  'Случайное событие и маршрут': [
    'Выпадковая падзея і маршрут',
    'A random event and route',
    'Losowe wydarzenie i trasa'
  ],
  'Недавние поездки': ['Нядаўнія паездкі', 'Recent trips', 'Ostatnie podróże'],
  'Откуда': ['Адкуль', 'From', 'Skąd'],
  'Куда': ['Куды', 'To', 'Dokąd'],
  'Минск': ['Мінск', 'Minsk', 'Mińsk'],
  'Брест': ['Брэст', 'Brest', 'Brześć'],
  'Поменять города': ['Памяняць гарады', 'Swap cities', 'Zamień miasta'],
  'Выходные': ['Выходныя', 'Weekend', 'Weekend'],
  'Сегодня': ['Сёння', 'Today', 'Dziś'],
  'Завтра': ['Заўтра', 'Tomorrow', 'Jutro'],
  'Туда': ['Туды', 'Outbound', 'Tam'],
  'Обратно': ['Назад', 'Return', 'Powrót'],
  'Только туда': ['Толькі туды', 'One way', 'Tylko tam'],
  'Взрослые': ['Дарослыя', 'Adults', 'Dorośli'],
  'Дети': ['Дзеці', 'Children', 'Dzieci'],
  'Что включить': ['Што ўключыць', 'What to include', 'Co uwzględnić'],
  'Поезд': ['Цягнік', 'Train', 'Pociąg'],
  'Автобус': ['Аўтобус', 'Bus', 'Autobus'],
  'События': ['Падзеі', 'Events', 'Wydarzenia'],
  'Отель': ['Гатэль', 'Hotel', 'Hotel'],
  'Бюджет, BYN': ['Бюджэт, BYN', 'Budget, BYN', 'Budżet, BYN'],
  'например, 300': ['напрыклад, 300', 'e.g. 300', 'np. 300'],
  'Сортировка': ['Сартаванне', 'Sorting', 'Sortowanie'],
  'Лучшее': ['Найлепшае', 'Best', 'Najlepsze'],
  'Дешевле': ['Дзяшэй', 'Cheaper', 'Taniej'],
  'Быстрее': ['Хутчэй', 'Faster', 'Szybciej'],
  'Больше настроек': ['Больш налад', 'More settings', 'Więcej ustawień'],
  'Только прямые': ['Толькі прамыя', 'Direct only', 'Tylko bezpośrednie'],
  'только прямые': ['толькі прамыя', 'direct only', 'tylko bezpośrednie'],
  'Без пересадок в пути': ['Без перасадак у шляху', 'No transfers on the way', 'Bez przesiadek w drodze'],
  'Событие': ['Падзея', 'Event', 'Wydarzenie'],
  'БЖД': ['БЧ', 'BZD', 'BZD'],
  'концерт, фестиваль…': ['канцэрт, фестываль…', 'concert, festival…', 'koncert, festiwal…'],
  'Отель от': ['Гатэль ад', 'Hotel from', 'Hotel od'],
  'любой': ['любы', 'any', 'dowolny'],
  'Категории афиши': ['Катэгорыі афішы', 'Event categories', 'Kategorie wydarzeń'],
  'событие в поездке': ['падзея ў паездцы', 'event in the trip', 'wydarzenie w podróży'],
  'Убрать событие': ['Прыбраць падзею', 'Remove event', 'Usuń wydarzenie'],
  'Найти поездку': ['Знайсці паездку', 'Find a trip', 'Znajdź podróż'],
  'Ищем варианты…': ['Шукаем варыянты…', 'Searching options…', 'Szukamy opcji…'],
  'Опрашиваем пять источников. Первый поиск может занять до минуты.': [
    'Апытваем пяць крыніц. Першы пошук можа заняць да хвіліны.',
    'We query five sources. The first search may take up to a minute.',
    'Odpyujemy pięć źródeł. Pierwsze wyszukiwanie może potrwać do minuty.'
  ],
  'Не знаете, куда поехать?': ['Не ведаеце, куды паехаць?', "Don't know where to go?", 'Nie wiesz, dokąd pojechać?'],
  'Начните с афиши — подставим событие в маршрут.': [
    'Пачніце з афішы — дададзім падзею ў маршрут.',
    "Start with the events feed — we'll add an event to the route.",
    'Zacznij od wydarzeń — dodamy wydarzenie do trasy.'
  ],

  // --- Афиша ---
  'афиша Беларуси': ['афіша Беларусі', 'Belarus events feed', 'wydarzenia na Białorusi'],
  'Ближайшие концерты, фестивали и выставки на 180 дней вперёд.': [
    'Бліжэйшыя канцэрты, фестывалі і выставы на 180 дзён наперад.',
    'Upcoming concerts, festivals and exhibitions for the next 180 days.',
    'Najbliższe koncerty, festiwale i wystawy na 180 dni do przodu.'
  ],
  'Найти событие или площадку': ['Знайсці падзею або пляцоўку', 'Find an event or venue', 'Znajdź wydarzenie lub miejsce'],
  'Категории событий': ['Катэгорыі падзей', 'Event categories', 'Kategorie wydarzeń'],
  'Афиша не загрузилась': ['Афіша не загрузілася', 'The feed failed to load', 'Nie udało się wczytać wydarzeń'],
  'Попробовать снова': ['Паспрабаваць зноў', 'Try again', 'Spróbuj ponownie'],
  'Ничего не нашлось': ['Нічога не знайшлося', 'Nothing found', 'Nic nie znaleziono'],
  'Афиша пока пуста': ['Афіша пакуль пустая', 'The feed is empty for now', 'Na razie brak wydarzeń'],
  'По этому запросу событий нет. Попробуйте другую категорию или сбросьте фильтры.': [
    'Па гэтым запыце падзей няма. Паспрабуйце іншую катэгорыю або скідзьце фільтры.',
    'There are no events for this query. Try another category or reset the filters.',
    'Brak wydarzeń dla tego zapytania. Spróbuj innej kategorii lub wyczyść filtry.'
  ],
  'Источник афиши не вернул события. Обычно помогает повторить запрос чуть позже.': [
    'Крыніца афішы не вярнула падзей. Звычайна дапамагае паўтарыць запыт крыху пазней.',
    'The events source returned no events. Retrying a little later usually helps.',
    'Źródło wydarzeń nie zwróciło wyników. Zwykle pomaga ponowienie zapytania później.'
  ],
  'Не удалось загрузить афишу': ['Не ўдалося загрузіць афішу', 'Failed to load the feed', 'Nie udało się wczytać wydarzeń'],
  'Место уточняется': ['Месца ўдакладняецца', 'Venue to be confirmed', 'Miejsce zostanie potwierdzone'],
  'цена не указана': ['цана не паказана', 'price not specified', 'cena nieokreślona'],
  'Открыть событие': ['Адкрыць падзею', 'Open event', 'Otwórz wydarzenie'],
  'Выбрано': ['Выбрана', 'Selected', 'Wybrano'],
  'В поездку': ['У паездку', 'Add to trip', 'Do podróży'],
  'Собрать маршрут': ['Сабраць маршрут', 'Build a route', 'Zbuduj trasę'],
  'На карте': ['На карце', 'On the map', 'Na mapie'],
  'Билеты': ['Білеты', 'Tickets', 'Bilety'],
  'событие': ['падзея', 'event', 'wydarzenie'],
  'Событие добавлено в календарь': ['Падзея дададзена ў календар', 'Event added to calendar', 'Wydarzenie dodane do kalendarza'],
  'Событие скопировано — можно отправить в мессенджер.': [
    'Падзея скапіявана — можна адправіць у мессенджар.',
    'Event copied — you can send it in a messenger.',
    'Wydarzenie skopiowane — możesz wysłać je w komunikatorze.'
  ],
  'Не удалось поделиться событием.': ['Не ўдалося падзяліцца падзеяй.', 'Failed to share the event.', 'Nie udało się udostępnić wydarzenia.'],
  'У события нет времени начала.': ['У падзеі няма часу пачатку.', 'The event has no start time.', 'Wydarzenie nie ma godziny rozpoczęcia.'],

  // --- Результаты ---
  'собираем поездку': ['збіраем паездку', 'assembling the trip', 'składamy podróż'],
  'Проверяем транспорт, афишу и отели. Обычно это занимает 10–40 секунд.': [
    'Правяраем транспарт, афішу і гатэлі. Звычайна гэта займае 10–40 секунд.',
    'We check transport, events and hotels. This usually takes 10–40 seconds.',
    'Sprawdzamy transport, wydarzenia i hotele. Zwykle zajmuje to 10–40 sekund.'
  ],
  'сек': ['с', 'sec', 's'],
  'Как мы поняли запрос': ['Як мы зразумелі запыт', 'How we understood the request', 'Jak zrozumieliśmy zapytanie'],
  'Исправить': ['Выправіць', 'Edit', 'Popraw'],
  'Бюджет +20%': ['Бюджэт +20%', 'Budget +20%', 'Budżet +20%'],
  'Убрать отель': ['Прыбраць гатэль', 'Remove hotel', 'Usuń hotel'],
  'Разрешить пересадки': ['Дазволіць перасадкі', 'Allow transfers', 'Zezwól na przesiadki'],
  'Сдвинуть даты на день': ['Зрушыць даты на дзень', 'Shift dates by a day', 'Przesuń daty o dzień'],
  'Поиск не удался': ['Пошук не ўдаўся', 'Search failed', 'Wyszukiwanie nie powiodło się'],
  'Изменить запрос': ['Змяніць запыт', 'Change request', 'Zmień zapytanie'],
  'архив на устройстве': ['архіў на прыладзе', 'archive on device', 'archiwum na urządzeniu'],
  'Результаты поиска и сохранённая история. Работает даже без сети.': [
    'Вынікі пошуку і захаваная гісторыя. Працуе нават без сеткі.',
    'Search results and saved history. Works even offline.',
    'Wyniki wyszukiwania i zapisana historia. Działa nawet bez sieci.'
  ],
  'Здесь появятся поездки': ['Тут з\'явяцца паездкі', 'Trips will appear here', 'Tutaj pojawią się podróże'],
  'Заполните маршрут и даты — соберём варианты из транспорта, событий и отелей. Поиск сохранится на устройстве.': [
    'Запоўніце маршрут і даты — збяром варыянты з транспарту, падзей і гатэляў. Пошук захаваецца на прыладзе.',
    "Fill in the route and dates — we'll assemble options from transport, events and hotels. The search will be saved on the device.",
    'Uzupełnij trasę i daty — złożymy opcje z transportu, wydarzeń i hoteli. Wyszukiwanie zapisze się na urządzeniu.'
  ],
  'Начать поиск': ['Пачаць пошук', 'Start search', 'Rozpocznij wyszukiwanie'],
  'результаты поиска': ['вынікі пошуку', 'search results', 'wyniki wyszukiwania'],
  'поездка сегодня': ['паездка сёння', 'trip today', 'podróż dziś'],
  'до поездки': ['да паездкі', 'until the trip', 'do podróży'],
  'Фильтры': ['Фільтры', 'Filters', 'Filtry'],
  'Источники ничего не нашли': ['Крыніцы нічога не знайшлі', 'Sources found nothing', 'Źródła nic nie znalazły'],
  'Попробуйте один из вариантов ниже — поиск запустится сразу.': [
    'Паспрабуйце адзін з варыянтаў ніжэй — пошук запусціцца адразу.',
    'Try one of the options below — the search will start right away.',
    'Wypróbuj jedną z opcji poniżej — wyszukiwanie ruszy od razu.'
  ],
  'Под фильтры не подошёл ни один вариант.': [
    'Пад фільтры не падышоў ні адзін варыянт.',
    'No option matched the filters.',
    'Żadna opcja nie pasuje do filtrów.'
  ],
  'Готовые варианты': ['Гатовыя варыянты', 'Ready-made options', 'Gotowe opcje'],
  'Комбинации не собрались. Посмотрите отдельные предложения ниже — возможно, не хватает события или отеля.': [
    'Камбінацыі не сабраліся. Паглядзіце асобныя прапановы ніжэй — магчыма, не хапае падзеі або гатэля.',
    "Combinations didn't come together. Look at individual offers below — perhaps an event or hotel is missing.",
    'Nie udało się złożyć kombinacji. Zobacz osobne oferty poniżej — być może brakuje wydarzenia lub hotelu.'
  ],
  'Маршруты': ['Маршруты', 'Routes', 'Trasy'],
  'Предложения источников': ['Прапановы крыніц', 'Source offers', 'Oferty źródeł'],
  'Изменить параметры': ['Змяніць параметры', 'Change parameters', 'Zmień parametry'],
  'Уточнить словами': ['Удакладніць словамі', 'Refine in words', 'Doprecyzuj słowami'],
  'из': ['з', 'of', 'z'],
  'до': ['да', 'up to', 'do'],
  'отель': ['гатэль', 'hotel', 'hotel'],
  'взр.': ['даросл.', 'ad.', 'dor.'],
  'дет.': ['дз.', 'ch.', 'dz.'],
  'пассажир': ['пасажыр', 'passenger', 'pasażer'],
  'пассажира': ['пасажыры', 'passengers', 'pasażerów'],
  'пассажиров': ['пасажыраў', 'passengers', 'pasażerów'],
  'вариант': ['варыянт', 'option', 'opcja'],
  'варианта': ['варыянты', 'options', 'opcje'],
  'вариантов': ['варыянтаў', 'options', 'opcji'],
  'маршрут': ['маршрут', 'route', 'trasa'],
  'маршрута': ['маршруты', 'routes', 'trasy'],
  'маршрутов': ['маршрутаў', 'routes', 'tras'],
  'предложение': ['прапанова', 'offer', 'oferta'],
  'предложения': ['прапановы', 'offers', 'oferty'],
  'предложений': ['прапаноў', 'offers', 'ofert'],
  'день': ['дзень', 'day', 'dzień'],
  'дня': ['дні', 'days', 'dni'],
  'дней': ['дзён', 'days', 'dni'],
  'сервис': ['сэрвіс', 'service', 'usługa'],
  'сервиса': ['сэрвісы', 'services', 'usługi'],
  'сервисов': ['сэрвісаў', 'services', 'usług'],
  'пересадка': ['перасадка', 'transfer', 'przesiadka'],
  'пересадки': ['перасадкі', 'transfers', 'przesiadki'],
  'пересадок': ['перасадак', 'transfers', 'przesiadek'],
  'фильтр': ['фільтр', 'filter', 'filtr'],
  'фильтра': ['фільтры', 'filters', 'filtry'],
  'фильтров': ['фільтраў', 'filters', 'filtrów'],

  // --- Карточки ---
  'Предложение': ['Прапанова', 'Offer', 'Oferta'],
  'без пересадок': ['без перасадак', 'no transfers', 'bez przesiadek'],
  'с пересадками': ['з перасадкамі', 'with transfers', 'z przesiadkami'],
  'Открыть источник': ['Адкрыць крыніцу', 'Open source', 'Otwórz źródło'],
  'Вариант поездки': ['Варыянт паездкі', 'Trip option', 'Opcja podróży'],
  'Транспорт': ['Транспарт', 'Transport', 'Transport'],
  'Услуга': ['Паслуга', 'Service', 'Usługa'],
  'Оценка совместимости': ['Ацэнка сумяшчальнасці', 'Compatibility score', 'Ocena dopasowania'],
  'итого': ['разам', 'total', 'razem'],
  '/ чел.': ['/ чал.', '/ person', '/ os.'],
  'Маршрут Storm Trip': ['Маршрут Storm Trip', 'Storm Trip route', 'Trasa Storm Trip'],
  'Маршрут скопирован — можно отправить в мессенджер.': [
    'Маршрут скапіяваны — можна адправіць у мессенджар.',
    'Route copied — you can send it in a messenger.',
    'Trasa skopiowana — możesz wysłać ją w komunikatorze.'
  ],
  'Не удалось поделиться маршрутом.': ['Не ўдалося падзяліцца маршрутам.', 'Failed to share the route.', 'Nie udało się udostępnić trasy.'],
  'Маршрут добавлен в календарь': ['Маршрут дададзены ў календар', 'Route added to calendar', 'Trasa dodana do kalendarza'],
  'У маршрута нет времени отправления.': ['У маршруту няма часу адпраўлення.', 'The route has no departure time.', 'Trasa nie ma godziny odjazdu.'],
  'км': ['км', 'km', 'km'],
  'км/ч': ['км/г', 'km/h', 'km/h'],
  'Купить билет': ['Купіць білет', 'Buy ticket', 'Kup bilet'],
  'Раздельные билеты дешевле прямого на': [
    'Асобныя білеты таннейшыя за прамы на',
    'Separate tickets are cheaper than a direct one by',
    'Osobne bilety są tańsze od bezpośredniego o'
  ],
  'Поделиться': ['Падзяліцца', 'Share', 'Udostępnij'],
  'В календарь': ['У календар', 'To calendar', 'Do kalendarza'],
  'Вариант поездки Storm Trip': ['Варыянт паездкі Storm Trip', 'Storm Trip option', 'Opcja podróży Storm Trip'],
  'Вариант скопирован — можно отправить в мессенджер.': [
    'Варыянт скапіяваны — можна адправіць у мессенджар.',
    'Option copied — you can send it in a messenger.',
    'Opcja skopiowana — możesz wysłać ją w komunikatorze.'
  ],
  'Не удалось поделиться вариантом.': ['Не ўдалося падзяліцца варыянтам.', 'Failed to share the option.', 'Nie udało się udostępnić opcji.'],
  'Поездка добавлена в календарь': ['Паездка дададзена ў календар', 'Trip added to calendar', 'Podróż dodana do kalendarza'],
  'В варианте нет событий с датами.': ['У варыянце няма падзей з датамі.', 'The option has no events with dates.', 'Opcja nie zawiera wydarzeń z datami.'],
  'стоимость поездки': ['кошт паездкі', 'trip cost', 'koszt podróży'],
  'на человека': ['на чалавека', 'per person', 'na osobę'],
  'план дня': ['план дня', 'day plan', 'plan dnia'],
  'прибытие': ['прыбыццё', 'arrival', 'przyjazd'],
  'Статусы источников': ['Статусы крыніц', 'Source statuses', 'Statusy źródeł'],

  // --- Чат ---
  'Без автобуса': ['Без аўтобуса', 'Without bus', 'Bez autobusu'],
  'Отель 4★': ['Гатэль 4★', 'Hotel 4★', 'Hotel 4★'],
  'Покажи прошлый результат': ['Пакажы мінулы вынік', 'Show the previous result', 'Pokaż poprzedni wynik'],
  'Сброс': ['Скід', 'Reset', 'Reset'],
  'Напишите запрос словами — соберу маршрут. Например: «Из Минска в Брест на выходные до 300 BYN».\nПотом можно уточнять: «дешевле», «без автобуса», «отель 4★».': [
    'Напішыце запыт словамі — збяру маршрут. Напрыклад: «З Мінска ў Брэст на выхадныя да 300 BYN».\nПотым можна ўдакладняць: «дзяшэй», «без аўтобуса», «гатэль 4★».',
    'Describe your trip in words — I will build the route. For example: “From Minsk to Brest for the weekend up to 300 BYN”.\nThen refine it: “cheaper”, “without bus”, “4★ hotel”.',
    'Opisz podróż słowami — zbuduję trasę. Na przykład: „Z Mińska do Brześcia na weekend do 300 BYN”.\nPotem doprecyzuj: „taniej”, „bez autobusu”, „hotel 4★”.'
  ],
  'Готово.': ['Гатова.', 'Done.', 'Gotowe.'],
  'Источники не ответили за две минуты. Попробуйте ещё раз.': [
    'Крыніцы не адказалі за дзве хвіліны. Паспрабуйце яшчэ раз.',
    "Sources didn't respond within two minutes. Try again.",
    'Źródła nie odpowiedziały w ciągu dwóch minut. Spróbuj ponownie.'
  ],
  'Не удалось получить ответ.': ['Не ўдалося атрымаць адказ.', 'Failed to get a response.', 'Nie udało się uzyskać odpowiedzi.'],
  'Голосовой ввод не поддерживается этим браузером.': [
    'Галасавы ўвод не падтрымліваецца гэтым браўзерам.',
    'Voice input is not supported by this browser.',
    'Wprowadzanie głosowe nie jest obsługiwane przez tę przeglądarkę.'
  ],
  'Не удалось запустить микрофон.': ['Не ўдалося запусціць мікрафон.', 'Failed to start the microphone.', 'Nie udało się uruchomić mikrofonu.'],
  'AI-поиск и уточнения': ['AI-пошук і ўдакладненні', 'AI search and refinements', 'Wyszukiwanie AI i doprecyzowanie'],
  'Печатает': ['Друкуе', 'Typing', 'Pisze'],
  'Показать результат': ['Паказаць вынік', 'Show result', 'Pokaż wynik'],
  'Открыть результат': ['Адкрыць вынік', 'Open result', 'Otwórz wynik'],
  'Остановить запись': ['Спыніць запіс', 'Stop recording', 'Zatrzymaj nagrywanie'],
  'Сказать голосом': ['Сказаць голасам', 'Say by voice', 'Powiedz głosem'],
  'Из Минска в Брест на выходные…': ['З Мінска ў Брэст на выхадныя…', 'From Minsk to Brest for the weekend…', 'Z Mińska do Brześcia na weekend…'],
  'Отправить': ['Адправіць', 'Send', 'Wyślij'],
  'Опрашиваем пять источников — это может занять до минуты.': [
    'Апытваем пяць крыніц — гэта можа заняць да хвіліны.',
    'We query five sources — this may take up to a minute.',
    'Odpyujemy pięć źródeł — może to potrwać do minuty.'
  ],
  'Понимает даты, бюджет, пассажиров, звёзды отеля, время суток и «без автобуса».': [
    'Разумее даты, бюджэт, пасажыраў, зоркі гатэля, час сутак і «без аўтобуса».',
    'Understands dates, budget, passengers, hotel stars, time of day and “without bus”.',
    'Rozumie daty, budżet, pasażerów, gwiazdki hotelu, porę dnia i „bez autobusu”.'
  ],

  // --- Фильтры ---
  'все варианты': ['усе варыянты', 'all options', 'wszystkie opcje'],
  'Цена до, BYN': ['Цана да, BYN', 'Price up to, BYN', 'Cena do, BYN'],
  'без ограничения': ['без абмежавання', 'no limit', 'bez limitu'],
  'В пути не дольше': ['У шляху не даўжэй', 'Travel time no more than', 'Czas podróży nie dłuższy niż'],
  'любое': ['любое', 'any', 'dowolny'],
  '3 часов': ['3 гадзіны', '3 hours', '3 godziny'],
  '5 часов': ['5 гадзін', '5 hours', '5 godzin'],
  '8 часов': ['8 гадзін', '8 hours', '8 godzin'],
  '12 часов': ['12 гадзін', '12 hours', '12 godzin'],
  'Пересадок': ['Перасадак', 'Transfers', 'Przesiadki'],
  'до 1': ['да 1', 'up to 1', 'do 1'],
  'до 2': ['да 2', 'up to 2', 'do 2'],
  '2★ и выше': ['2★ і вышэй', '2★ and above', '2★ i wyżej'],
  '3★ и выше': ['3★ і вышэй', '3★ and above', '3★ i wyżej'],
  '4★ и выше': ['4★ і вышэй', '4★ and above', '4★ i wyżej'],
  'только 5★': ['толькі 5★', 'only 5★', 'tylko 5★'],
  'Только с событием': ['Толькі з падзеяй', 'Only with event', 'Tylko z wydarzeniem'],
  'Оставить варианты, где есть билет на событие': [
    'Пакінуць варыянты, дзе ёсць білет на падзею',
    'Keep options that include an event ticket',
    'Zostaw opcje z biletem na wydarzenie'
  ],
  'Только с отелем': ['Толькі з гатэлем', 'Only with hotel', 'Tylko z hotelem'],
  'Оставить варианты с проживанием': [
    'Пакінуць варыянты з пражываннем',
    'Keep options with accommodation',
    'Zostaw opcje z noclegiem'
  ],
  'Без пересадок в транспорте': ['Без перасадак у транспарце', 'No transfers in transport', 'Bez przesiadek w transporcie'],

  // --- История ---
  'История пока пуста': ['Гісторыя пакуль пустая', 'History is empty for now', 'Historia jest na razie pusta'],
  'Каждый поиск сохраняется на устройстве — сюда можно вернуться без интернета.': [
    'Кожны пошук захоўваецца на прыладзе — сюды можна вярнуцца без інтэрнэту.',
    'Every search is saved on the device — you can return here without the internet.',
    'Każde wyszukiwanie zapisuje się na urządzeniu — możesz tu wrócić bez internetu.'
  ],
  'История поездок': ['Гісторыя паездак', 'Trip history', 'Historia podróży'],
  'Точно?': ['Дакладна?', 'Sure?', 'Na pewno?'],
  'без цены': ['без цаны', 'no price', 'bez ceny'],
  'Удалить поездку из истории': ['Выдаліць паездку з гісторыі', 'Delete trip from history', 'Usuń podróż z historii'],

  // --- Знакомство ---
  'пять источников': ['пяць крыніц', 'five sources', 'pięć źródeł'],
  'Один маршрут вместо пяти вкладок': ['Адзін маршрут замест пяці ўкладак', 'One route instead of five tabs', 'Jedna trasa zamiast pięciu kart'],
  'AtlasBus, БЖД, TicketBus, TicketPro и BelHotel. Собираем транспорт, событие и отель в готовые варианты.': [
    'AtlasBus, БЧ, TicketBus, TicketPro і BelHotel. Збіраем транспарт, падзею і гатэль у гатовыя варыянты.',
    'AtlasBus, BZD, TicketBus, TicketPro and BelHotel. We combine transport, an event and a hotel into ready-made options.',
    'AtlasBus, BZD, TicketBus, TicketPro i BelHotel. Łączymy transport, wydarzenie i hotel w gotowe opcje.'
  ],
  'по-человечески': ['па-чалавечы', 'human-friendly', 'po ludzku'],
  '«Из Минска в Брест на выходные до 300 BYN». Потом уточняйте: «дешевле», «без автобуса», «отель 4★».': [
    '«З Мінска ў Брэст на выхадныя да 300 BYN». Потым удакладняйце: «дзяшэй», «без аўтобуса», «гатэль 4★».',
    '“From Minsk to Brest for the weekend up to 300 BYN”. Then refine: “cheaper”, “without bus”, “4★ hotel”.',
    '„Z Mińska do Brześcia na weekend do 300 BYN”. Potem doprecyzuj: „taniej”, „bez autobusu”, „hotel 4★”.'
  ],
  'как приложение': ['як праграма', 'like an app', 'jak aplikacja'],
  'История, уведомления и офлайн': ['Гісторыя, апавяшчэнні і афлайн', 'History, notifications and offline', 'Historia, powiadomienia i tryb offline'],
  'Установите на экран «Домой». Поездки сохраняются на устройстве, а уведомление придёт, когда маршрут собран.': [
    'Усталюйце на экран «Хатні». Паездкі захоўваюцца на прыладзе, а апавяшчэнне прыйдзе, калі маршрут сабраны.',
    'Install it on your Home screen. Trips are saved on the device, and a notification will arrive when the route is ready.',
    'Zainstaluj na ekranie głównym. Podróże zapisują się na urządzeniu, a powiadomienie przyjdzie, gdy trasa będzie gotowa.'
  ],
  'Знакомство с приложением': ['Знаёмства з праграмай', 'Meet the app', 'Poznaj aplikację'],

  // --- Установка ---
  'Установить Storm Trip': ['Усталяваць Storm Trip', 'Install Storm Trip', 'Zainstaluj Storm Trip'],
  'На экран «Домой» — без адресной строки': [
    'На экран «Хатні» — без адраснага радка',
    'To the Home screen — without an address bar',
    'Na ekran główny — bez paska adresu'
  ],
  'Добавить на экран «Домой»': ['Дадаць на экран «Хатні»', 'Add to Home screen', 'Dodaj do ekranu głównego'],
  'Поделиться → На экран «Домой»': ['Падзяліцца → На экран «Хатні»', 'Share → Home screen', 'Udostępnij → Ekran główny'],

  // --- Источники ---
  'Источники': ['Крыніцы', 'Sources', 'Źródła'],
  'Поиск идёт параллельно по пяти источникам. Если один не ответил, остальные всё равно приносят результаты.': [
    'Пошук ідзе паралельна па пяці крыніцах. Калі адна не адказала, астатнія ўсё роўна прыносяць вынікі.',
    'The search runs in parallel across five sources. If one fails, the others still bring results.',
    'Wyszukiwanie działa równolegle w pięciu źródłach. Jeśli jedno nie odpowie, pozostałe nadal przynoszą wyniki.'
  ],
  'Ошибки источников не влияют на сохранённую историю поездок.': [
    'Памылкі крыніц не ўплываюць на захаваную гісторыю паездак.',
    'Source errors do not affect saved trip history.',
    'Błędy źródeł nie wpływają na zapisaną historię podróży.'
  ],
  'данные получены': ['даныя атрыманы', 'data received', 'dane otrzymane'],
  'ничего не найдено': ['нічога не знойдзена', 'nothing found', 'nic nie znaleziono'],
  'источник недоступен': ['крыніца недаступная', 'source unavailable', 'źródło niedostępne'],

  // --- Погода ---
  'ясно': ['ясна', 'clear', 'bezchmurnie'],
  'почти ясно': ['амаль ясна', 'almost clear', 'prawie bezchmurnie'],
  'переменная облачность': ['пераменная воблачнасць', 'partly cloudy', 'częściowe zachmurzenie'],
  'облачно': ['воблачна', 'cloudy', 'pochmurno'],
  'туман': ['туман', 'fog', 'mgła'],
  'изморозь': ['шэрань', 'rime', 'szadź'],
  'морось': ['мрось', 'drizzle', 'mżawka'],
  'ледяная морось': ['ледзяная мрось', 'freezing drizzle', 'marznąca mżawka'],
  'дождь': ['дождж', 'rain', 'deszcz'],
  'сильный дождь': ['моцны дождж', 'heavy rain', 'silny deszcz'],
  'ледяной дождь': ['ледзяны дождж', 'freezing rain', 'marznący deszcz'],
  'снег': ['снег', 'snow', 'śnieg'],
  'сильный снег': ['моцны снег', 'heavy snow', 'silny śnieg'],
  'снежная крупа': ['снежная крупа', 'snow grains', 'krupa śnieżna'],
  'ливень': ['залева', 'shower', 'ulewa'],
  'сильный ливень': ['моцная залева', 'heavy shower', 'silna ulewa'],
  'снегопад': ['снегапад', 'snow shower', 'opady śniegu'],
  'гроза': ['навальніца', 'thunderstorm', 'burza'],
  'гроза с градом': ['навальніца з градам', 'thunderstorm with hail', 'burza z gradem'],
  'без осадков': ['без ападкаў', 'no precipitation', 'bez opadów'],
  'ночью': ['ноччу', 'at night', 'w nocy'],

  // --- Настройки ---
  'Уведомления, оформление, история и информация о приложении.': [
    'Апавяшчэнні, афармленне, гісторыя і інфармацыя пра праграму.',
    'Notifications, appearance, history and app information.',
    'Powiadomienia, wygląd, historia i informacje o aplikacji.'
  ],
  'Уведомления': ['Апавяшчэнні', 'Notifications', 'Powiadomienia'],
  'Push-уведомления': ['Push-апавяшчэнні', 'Push notifications', 'Powiadomienia push'],
  'Сигнал, когда маршрут собран, а приложение свёрнуто': [
    'Сігнал, калі маршрут сабраны, а праграма згорнута',
    'A signal when the route is ready and the app is minimised',
    'Sygnał, gdy trasa jest gotowa, a aplikacja jest zminimalizowana'
  ],
  'После завершения поиска': ['Пасля завяршэння пошуку', 'After the search completes', 'Po zakończeniu wyszukiwania'],
  'Сколько предложений нашли источники': ['Колькі прапаноў знайшлі крыніцы', 'How many offers the sources found', 'Ile ofert znalazły źródła'],
  'Уведомления заблокированы в браузере. Разрешите их в настройках сайта, чтобы получать сигналы.': [
    'Апавяшчэнні заблакаваныя ў браўзеры. Дазвольце іх у наладах сайта, каб атрымліваць сігналы.',
    'Notifications are blocked in the browser. Allow them in the site settings to receive signals.',
    'Powiadomienia są zablokowane w przeglądarce. Zezwól na nie w ustawieniach strony, aby otrzymywać sygnały.'
  ],
  'Этот браузер не поддерживает уведомления.': [
    'Гэты браўзер не падтрымлівае апавяшчэнні.',
    'This browser does not support notifications.',
    'Ta przeglądarka nie obsługuje powiadomień.'
  ],
  'Проверить уведомление': ['Праверыць апавяшчэнне', 'Test notification', 'Sprawdź powiadomienie'],
  'Оформление': ['Афармленне', 'Appearance', 'Wygląd'],
  'Система': ['Сістэма', 'System', 'System'],
  'Светлая': ['Светлая', 'Light', 'Jasny'],
  'Тёмная': ['Цёмная', 'Dark', 'Ciemny'],
  '«Система» повторяет тему телефона. Выбор применяется сразу и запоминается на устройстве.': [
    '«Сістэма» паўтарае тэму тэлефона. Выбар прымяняецца адразу і запомніваецца на прыладзе.',
    '“System” follows the phone theme. The choice applies immediately and is remembered on the device.',
    '„System” powtarza motyw telefonu. Wybór stosuje się od razu i jest zapamiętywany na urządzeniu.'
  ],
  'Вибрация': ['Вібрацыя', 'Vibration', 'Wibracja'],
  'Короткий отклик при выборе вариантов и запуске поиска': [
    'Кароткі водгук пры выбары варыянтаў і запуску пошуку',
    'A short response when selecting options and starting a search',
    'Krótka reakcja przy wyborze opcji i uruchamianiu wyszukiwania'
  ],
  'Данные на устройстве': ['Даныя на прыладзе', 'Data on the device', 'Dane na urządzeniu'],
  'Поездок в истории': ['Паездак у гісторыі', 'Trips in history', 'Podróże w historii'],
  'Хранение': ['Захоўванне', 'Storage', 'Przechowywanie'],
  'только этот браузер': ['толькі гэты браўзер', 'this browser only', 'tylko ta przeglądarka'],
  'История не отправляется на сервер и переживает перезапуск приложения. Можно очистить её в любой момент.': [
    'Гісторыя не адпраўляецца на сервер і перажывае перазапуск праграмы. Яе можна ачысціць у любы момант.',
    'History is not sent to the server and survives an app restart. You can clear it at any time.',
    'Historia nie jest wysyłana na serwer i przetrwa restart aplikacji. Możesz ją wyczyścić w każdej chwili.'
  ],
  '5 источников · Spring Boot': ['5 крыніц · Spring Boot', '5 sources · Spring Boot', '5 źródeł · Spring Boot'],
  'Точно очистить?': ['Дакладна ачысціць?', 'Clear for sure?', 'Na pewno wyczyścić?'],
  'Очистить историю': ['Ачысціць гісторыю', 'Clear history', 'Wyczyść historię'],
  'Показать знакомство': ['Паказаць знаёмства', 'Show onboarding', 'Pokaż wprowadzenie'],
  'О приложении': ['Пра праграму', 'About the app', 'O aplikacji'],
  'Версия': ['Версія', 'Version', 'Wersja'],
  'Клиент': ['Кліент', 'Client', 'Klient'],
  'Исходный код': ['Зыходны код', 'Source code', 'Kod źródłowy'],
  'Язык': ['Мова', 'Language', 'Język'],
  'Язык интерфейса': ['Мова інтэрфейсу', 'Interface language', 'Język interfejsu'],
  'Интерфейс, даты и подсказки сразу на выбранном языке.': [
    'Інтэрфейс, даты і падказкі адразу на абранай мове.',
    'Interface, dates and hints immediately in the selected language.',
    'Interfejs, daty i podpowiedzi od razu w wybranym języku.'
  ],

  // --- Сообщения ---
  'Нет сети — показываем последние загруженные данные.': [
    'Няма сеткі — паказваем апошнія загружаныя даныя.',
    'No network — showing the last loaded data.',
    'Brak sieci — pokazujemy ostatnie wczytane dane.'
  ],
  'Открыть афишу': ['Адкрыць афішу', 'Open the events feed', 'Otwórz wydarzenia'],
  'Storm Trip — на главную': ['Storm Trip — на галоўную', 'Storm Trip — go home', 'Storm Trip — do strony głównej'],
  'Доступно обновление': ['Даступна абнаўленне', 'Update available', 'Dostępna aktualizacja'],
  'Перезагрузите, чтобы получить новую версию': [
    'Перазагрузіце, каб атрымаць новую версію',
    'Reload to get the new version',
    'Odśwież, aby uzyskać nową wersję'
  ],
  'Укажите город отправления.': ['Укажыце горад адпраўлення.', 'Enter the departure city.', 'Podaj miasto wyjazdu.'],
  'Укажите город прибытия.': ['Укажыце горад прыбыцця.', 'Enter the destination city.', 'Podaj miasto przyjazdu.'],
  'Выберите дату отправления.': ['Выберыце дату адпраўлення.', 'Choose a departure date.', 'Wybierz datę wyjazdu.'],
  'Дата возвращения не может быть раньше даты отправления.': [
    'Дата вяртання не можа быць раней за дату адпраўлення.',
    'The return date cannot be earlier than the departure date.',
    'Data powrotu nie może być wcześniejsza niż data wyjazdu.'
  ],
  'Выберите хотя бы один раздел поиска.': [
    'Выберыце хаця б адзін раздзел пошуку.',
    'Choose at least one search section.',
    'Wybierz co najmniej jedną sekcję wyszukiwania.'
  ],
  'Браузер не поддерживает уведомления.': ['Браўзер не падтрымлівае апавяшчэнні.', 'The browser does not support notifications.', 'Przeglądarka nie obsługuje powiadomień.'],
  'Разрешение на уведомления не выдано.': ['Дазвол на апавяшчэнні не выдадзены.', 'Notification permission was not granted.', 'Nie udzielono zgody na powiadomienia.'],
  'Уведомления включены — сообщим, когда соберём маршрут.': [
    'Апавяшчэнні ўключаны — паведамім, калі збяром маршрут.',
    "Notifications are on — we'll let you know when the route is ready.",
    'Powiadomienia włączone — damy znać, gdy trasa będzie gotowa.'
  ],
  'Тестовое уведомление отправлено': ['Тэставае апавяшчэнне адпраўлена', 'Test notification sent', 'Wysłano powiadomienie testowe'],
  'Storm Trip работает': ['Storm Trip працуе', 'Storm Trip works', 'Storm Trip działa'],
  'Так придёт сигнал, когда поиск соберёт маршрут.': [
    'Так прыйдзе сігнал, калі пошук збярэ маршрут.',
    'This is how the signal will arrive when the search builds the route.',
    'Tak przyjdzie sygnał, gdy wyszukiwanie złoży trasę.'
  ],
  'Источники не вернули предложений. Попробуйте изменить даты.': [
    'Крыніцы не вярнулі прапаноў. Паспрабуйце змяніць даты.',
    'The sources returned no offers. Try changing the dates.',
    'Źródła nie zwróciły ofert. Spróbuj zmienić daty.'
  ],
  'Маршрут собран': ['Маршрут сабраны', 'Route is ready', 'Trasa gotowa'],
  'готовых вариантов': ['гатовых варыянтаў', 'ready-made options', 'gotowych opcji'],
  'Не удалось собрать поездку.': ['Не ўдалося сабраць паездку.', 'Failed to assemble the trip.', 'Nie udało się złożyć podróży.'],
  'Сервис поиска недоступен.': ['Сэрвіс пошуку недаступны.', 'The search service is unavailable.', 'Usługa wyszukiwania jest niedostępna.'],
  'Выходные:': ['Выхадныя:', 'Weekend:', 'Weekend:'],
  'Афиша недоступна — собираем выходные по вашему маршруту.': [
    'Афіша недаступная — збіраем выхадныя па вашым маршруце.',
    'The events feed is unavailable — planning the weekend along your route.',
    'Wydarzenia są niedostępne — planujemy weekend według Twojej trasy.'
  ],
  'Не удалось собрать выходные. Попробуйте ещё раз.': [
    'Не ўдалося сабраць выхадныя. Паспрабуйце яшчэ раз.',
    'Failed to plan the weekend. Try again.',
    'Nie udało się zaplanować weekendu. Spróbuj ponownie.'
  ],
  'Событие добавлено в маршрут': ['Падзея дададзена ў маршрут', 'Event added to the route', 'Wydarzenie dodane do trasy'],
  'Поездка удалена из истории': ['Паездка выдалена з гісторыі', 'Trip deleted from history', 'Podróż usunięta z historii'],
  'История поездок очищена': ['Гісторыя паездак ачышчана', 'Trip history cleared', 'Historia podróży wyczyszczona'],

  // --- Календарь ---
  'выберите день': ['выберыце дзень', 'pick a day', 'wybierz dzień'],
  'Доступно с': ['Даступна з', 'Available from', 'Dostępne od'],
  'Календарь': ['Календар', 'Calendar', 'Kalendarz'],
  'календарь': ['календар', 'calendar', 'kalendarz'],
  'Дата отправления': ['Дата адпраўлення', 'Departure date', 'Data wyjazdu'],
  'Дата возвращения': ['Дата вяртання', 'Return date', 'Data powrotu'],
  'Выберите дату': ['Выберыце дату', 'Choose a date', 'Wybierz datę'],
  'Предыдущий месяц': ['Папярэдні месяц', 'Previous month', 'Poprzedni miesiąc'],
  'Следующий месяц': ['Наступны месяц', 'Next month', 'Następny miesiąc'],

  // --- Подсказки ---
  'Ищем населённый пункт…': ['Шукаем населены пункт…', 'Searching for a locality…', 'Szukamy miejscowości…'],
  'станция': ['станцыя', 'station', 'stacja'],
  'Уменьшить': ['Паменшыць', 'Decrease', 'Zmniejsz'],
  'Увеличить': ['Павялічыць', 'Increase', 'Zwiększ'],

  // --- Категории ---
  'Концерты': ['Канцэрты', 'Concerts', 'Koncerty'],
  'Театр': ['Тэатр', 'Theatre', 'Teatr'],
  'Спорт': ['Спорт', 'Sport', 'Sport'],
  'Фестивали': ['Фестывалі', 'Festivals', 'Festiwale'],
  'Выставки': ['Выставы', 'Exhibitions', 'Wystawy'],
  'Шоу': ['Шоу', 'Shows', 'Pokazy'],

  // --- Прочее ---
  'Поездка': ['Паездка', 'Trip', 'Podróż'],
  'Отправление': ['Адпраўленне', 'Departure', 'Odjazd'],
  'Прибытие': ['Прыбыццё', 'Arrival', 'Przyjazd'],
  'Даты не выбраны': ['Даты не выбраны', 'Dates not selected', 'Daty nie wybrane'],
  'транспорт · события · отели': ['транспарт · падзеі · гатэлі', 'transport · events · hotels', 'transport · wydarzenia · hotele'],
  'ч': ['г', 'h', 'godz.'],
  'мин': ['хв', 'min', 'min']
}

const INDEX = { be: new Map(), en: new Map(), pl: new Map() }
for (const [source, values] of Object.entries(TABLE)) {
  INDEX.be.set(source, values[0])
  INDEX.en.set(source, values[1])
  INDEX.pl.set(source, values[2])
}

const LANGUAGE_IDS = new Set(LANGUAGES.map((item) => item.id))

let current = 'ru'
let observer = null
let scheduled = false
let pending = []

export function normalizeLanguage(value) {
  return LANGUAGE_IDS.has(value) ? value : 'ru'
}

export function getLanguage() {
  return current
}

export function getLocale() {
  return LANGUAGES.find((item) => item.id === current)?.locale || 'ru-RU'
}

export function setLanguage(value) {
  current = normalizeLanguage(value)
  if (typeof document !== 'undefined') {
    document.documentElement.lang = current
  }
}

export function t(text) {
  if (!text || current === 'ru') return text
  const table = INDEX[current]
  return table?.get(text) ?? text
}

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE'])
const ATTRS = ['placeholder', 'aria-label', 'title', 'alt']

function translateText(value) {
  if (!value) return value
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(value)
  const core = match?.[2]
  if (!core) return value
  const next = t(core)
  return next === core ? value : `${match[1]}${next}${match[3]}`
}

function translateAttributes(element) {
  for (const attr of ATTRS) {
    if (!element.hasAttribute(attr)) continue
    const source = element.getAttribute(attr)
    const next = translateText(source)
    if (next !== source) element.setAttribute(attr, next)
  }
}

function translateNode(node) {
  if (!node || current === 'ru') return
  if (node.nodeType === Node.TEXT_NODE) {
    const next = translateText(node.nodeValue)
    if (next !== node.nodeValue) node.nodeValue = next
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return
  if (SKIP_TAGS.has(node.tagName) || node.hasAttribute('data-i18n-skip')) return
  translateAttributes(node)
  for (const child of node.childNodes) translateNode(child)
}

export function translateDom(root) {
  if (current === 'ru' || typeof document === 'undefined') return
  translateNode(root || document.body)
}

function flush() {
  scheduled = false
  const mutations = pending
  pending = []
  if (current === 'ru') return
  for (const mutation of mutations) {
    if (mutation.type === 'characterData') {
      translateNode(mutation.target)
    } else if (mutation.type === 'attributes') {
      const target = mutation.target
      if (target.nodeType === Node.ELEMENT_NODE) translateAttributes(target)
    } else {
      mutation.addedNodes.forEach((node) => translateNode(node))
    }
  }
}

export function installTranslations() {
  if (observer || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return observer
  translateDom(document.body)
  observer = new MutationObserver((mutations) => {
    pending.push(...mutations)
    if (scheduled) return
    scheduled = true
    Promise.resolve().then(flush)
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS
  })
  return observer
}
