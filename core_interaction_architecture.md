# Ядро взаимодействия

## 1. Цель

Построить минимальное доменное ядро для реализации описанных happy path.

Ядро не должно знать о PostgreSQL, Telegram, HTTP, конкретных парсерах, конкретной LLM, Spring, кэше, очередях и виртуальных потоках.

Основная цепочка:

```text
User request
    ↓
SearchIntent
    ↓
SearchService
    ↓
SearchProvider[]
    ↓
Offer[]
    ↓
CombinationService
    ↓
SearchResult
```

## 2. Архитектура

```text
                    TELEGRAM
                       │
                       ▼
              ChatApplicationService
                       │
              ┌────────┴────────┐
              ▼                 ▼
        IntentParser        SessionRepository
              │
              ▼
         UserCommand
              │
       ┌──────┴──────┐
       │             │
   NewSearch       Refine
       │             │
       ▼             ▼
 SearchService   RefineService
       │
       ▼
 SearchProvider[]
       │
 ┌─────┼──────┬────────┬─────────┐
 ▼     ▼      ▼        ▼         ▼
Atlas BZD TicketBus TicketPro BelHotel
 │     │      │        │         │
 └─────┴──────┴────────┴─────────┘
                 │
                 ▼
              Offer[]
                 │
                 ▼
         CombinationService
                 │
                 ▼
          SearchResult
                 │
                 ▼
        ChatApplicationService
                 │
                 ▼
              Telegram
```

## 3. Структура проекта

```text
com.storm.event
│
├── domain
│   ├── model
│   ├── service
│   └── port
│
├── application
│
├── infrastructure
│   ├── parser
│   ├── persistence
│   └── llm
│
└── api
    └── telegram
```

Ядро:

```text
domain/
├── model/
│   ├── SearchIntent
│   ├── SearchResult
│   ├── Offer
│   ├── Combination
│   ├── Price
│   ├── Location
│   ├── TimeRange
│   ├── Passenger
│   └── enums
│
├── service/
│   ├── SearchService
│   ├── RefineService
│   └── CombinationService
│
└── port/
    ├── SearchProvider
    ├── SessionRepository
    ├── SearchHistoryRepository
    └── IntentParser
```

## 4. SearchIntent

`SearchIntent` — состояние того, что пользователь хочет найти.

```java
public record SearchIntent(
        Set<DomainType> domains,
        Route route,
        DateRange dates,
        Passenger passenger,
        TransportCriteria transport,
        EventCriteria event,
        HotelCriteria hotel,
        SearchPreferences preferences
) {}
```

Это центральная сущность домена. Большинство действий пользователя сводятся к изменению intent:

```text
«Завтра»             → date = tomorrow
«Ещё ребёнок»        → children++
«Сравни с поездом»   → domains += TRAIN
«Только 4 звезды»    → hotel.rating = 4
«Бюджет 300»         → budget = 300
«Самый быстрый»      → sort = FASTEST
«Из Гомеля»          → route.from = Gomel
```

После изменения intent запускается один и тот же процесс поиска.

## 5. Базовые модели

### DomainType

```java
public enum DomainType {
    BUS,
    TRAIN,
    EVENT,
    HOTEL
}
```

### Route

```java
public record Route(
        Location from,
        Location to
) {}
```

### Location

```java
public record Location(
        String id,
        String name,
        GeoPoint coordinates
) {}
```

### GeoPoint

```java
public record GeoPoint(
        double latitude,
        double longitude
) {}
```

### DateRange

```java
public record DateRange(
        LocalDate from,
        LocalDate to
) {}
```

### TimeWindow

```java
public enum TimeWindow {
    ANY,
    MORNING,
    AFTERNOON,
    EVENING,
    NIGHT
}
```

### Passenger

```java
public record Passenger(
        int adults,
        int children
) {}
```

### TransportCriteria

```java
public record TransportCriteria(
        boolean directOnly,
        TimeWindow window,
        TimeWindow excludeWindow
) {}
```

### EventCriteria

```java
public record EventCriteria(
        String query,
        TimeWindow window
) {}
```

### HotelCriteria

```java
public record HotelCriteria(
        Integer minRating,
        Integer maxRating,
        boolean nearVenue,
        boolean center
) {}
```

### SearchPreferences

```java
public record SearchPreferences(
        SortType sort,
        BigDecimal budgetMax,
        boolean compare,
        boolean geoView
) {}
```

```java
public enum SortType {
    CHEAPEST,
    FASTEST,
    BEST
}
```

## 6. Offer

`Offer` — результат конкретного внешнего источника. Общий контракт и конкретные типы позволяют сохранить простоту и возможность расширения.

```java
public sealed interface Offer
        permits TransportOffer, EventOffer, HotelOffer {
}
```

### TransportOffer

```java
public record TransportOffer(
        String id,
        DomainType domain,
        Source source,
        String title,
        Location from,
        Location to,
        Instant departure,
        Instant arrival,
        Price price,
        boolean direct,
        String url
) implements Offer {}
```

### EventOffer

```java
public record EventOffer(
        String id,
        Source source,
        String title,
        Location venue,
        Instant start,
        Instant end,
        Price price,
        String category,
        String url
) implements Offer {}
```

### HotelOffer

```java
public record HotelOffer(
        String id,
        Source source,
        String title,
        Location location,
        int rating,
        Price price,
        String url
) implements Offer {}
```

### Price

```java
public record Price(
        BigDecimal amount,
        Currency currency
) {}
```

```java
public enum Currency {
    BYN
}
```

### Source

```java
public enum Source {
    ATLAS,
    BZD,
    TICKET_BUS,
    TICKET_PRO,
    BEL_HOTEL
}
```

## 7. SearchProvider

Это основной порт для подключения парсеров.

```java
public interface SearchProvider {

    boolean supports(DomainType domain);

    Source source();

    List<Offer> search(SearchIntent intent);
}
```

Пример:

```java
@Component
public class AtlasProvider implements SearchProvider {

    @Override
    public Source source() {
        return Source.ATLAS;
    }

    @Override
    public boolean supports(DomainType domain) {
        return domain == DomainType.BUS;
    }

    @Override
    public List<Offer> search(SearchIntent intent) {
        // Atlas parser
    }
}
```

Аналогично подключаются BZD, TicketBus, TicketPro, BelHotel и новые источники.

Добавление нового provider не требует изменения `SearchService`.

## 8. SearchService

Главная точка входа в поиск.

```java
public interface SearchService {

    SearchResult search(SearchIntent intent);
}
```

```java
@Service
public class DefaultSearchService
        implements SearchService {

    private final List<SearchProvider> providers;
    private final CombinationService combinationService;

    @Override
    public SearchResult search(SearchIntent intent) {
        // 1. Определить необходимые providers
        // 2. Получить offers
        // 3. Собрать combinations
        // 4. Вернуть результат
        return ...;
    }
}
```

`SearchService` работает с `SearchProvider`, а не с конкретными парсерами.

## 9. SearchResult

```java
public record SearchResult(
        SearchIntent intent,
        List<Offer> offers,
        List<Combination> combinations,
        List<SourceResult> sources
) {}
```

### SourceResult

```java
public record SourceResult(
        Source source,
        SourceStatus status,
        int resultCount,
        String error
) {}
```

```java
public enum SourceStatus {
    SUCCESS,
    FAILED,
    EMPTY
}
```

Один неработающий источник не должен ломать весь поиск.

## 10. Combination

`Combination` — бизнес-результат, объединяющий несколько предложений.

Примеры:

```text
TRAIN + EVENT
TRAIN + HOTEL
BUS + EVENT + HOTEL
```

```java
public record Combination(
        String id,
        List<Offer> offers,
        Price totalPrice,
        double score,
        List<String> tags
) {}
```

## 11. CombinationService

```java
public interface CombinationService {

    List<Combination> build(
            SearchIntent intent,
            List<Offer> offers
    );
}
```

```java
@Service
public class DefaultCombinationService
        implements CombinationService {

    @Override
    public List<Combination> build(
            SearchIntent intent,
            List<Offer> offers) {

        // транспорт + событие
        // транспорт + отель
        // событие + отель
        // транспорт + событие + отель

        return ...;
    }
}
```

Именно здесь позднее размещается логика совместимости:

```text
event.start - transport.arrival >= 2 hours
hotel.distance(venue) <= 2 km
totalPrice <= budget
```

## 12. RefineService

Изменение существующего запроса — отдельный процесс.

```java
public interface RefineService {

    SearchIntent refine(
            SearchIntent current,
            RefineCommand command
    );
}
```

Примеры:

```text
«Самый быстрый»
→ sort = FASTEST

«Ещё ребёнок»
→ children++

«Сравни с поездом»
→ domains += TRAIN
```

## 13. RefineCommand

LLM или другой parser не должен напрямую изменять `SearchIntent`. Он преобразует пользовательский текст в команду.

```java
public sealed interface RefineCommand
        permits ChangeDates,
                ChangeBudget,
                ChangeSort,
                AddDomain,
                ChangePassengers,
                ChangeHotelCriteria {
}
```

Это позволяет держать бизнес-логику независимо от LLM.

## 14. SearchSession

Минимальная память текущего состояния пользователя:

```java
public record SearchSession(
        UUID id,
        SearchIntent intent,
        SearchResult lastResult,
        List<ConversationMessage> messages
) {}
```

### ConversationMessage

```java
public record ConversationMessage(
        MessageRole role,
        String text,
        Instant createdAt
) {}
```

```java
public enum MessageRole {
    USER,
    ASSISTANT,
    SYSTEM
}
```

## 15. Repository ports

Ядро не знает о PostgreSQL.

```java
public interface SessionRepository {

    Optional<SearchSession> find(UUID id);

    SearchSession save(SearchSession session);
}
```

Реализация находится в infrastructure:

```text
infrastructure/
└── persistence/
    └── PostgresSessionRepository
```

История:

```java
public interface SearchHistoryRepository {

    void save(SearchResult result);

    Optional<SearchResult> findLast(UUID sessionId);
}
```

На первом этапе достаточно сохранять состояние сессии и историю запросов. Сложное хранение результатов не требуется.

## 16. IntentParser

```java
public interface IntentParser {

    UserCommand parse(
            String text,
            SearchSession session
    );
}
```

```java
public sealed interface UserCommand
        permits NewSearchCommand,
                RefineCommand,
                ResetCommand,
                PreviousResultCommand {
}
```

LLM является только реализацией этого порта:

```text
IntentParser
    ↑
    ├── LlmIntentParser
    └── RuleBasedIntentParser
```

## 17. Application Service

Связывает Telegram, session и domain.

```java
@Service
public class ChatApplicationService {

    private final SessionRepository sessionRepository;
    private final IntentParser intentParser;
    private final SearchService searchService;
    private final RefineService refineService;
}
```

Основной flow:

```text
Telegram message
       ↓
ChatApplicationService
       ↓
найти session
       ↓
определить: новый запрос или refine
       ↓
UserCommand
       ↓
SearchIntent
       ↓
SearchService
       ↓
SearchProvider[]
       ↓
Offers
       ↓
CombinationService
       ↓
SearchResult
       ↓
сохранить session
       ↓
ответ пользователю
```

## 18. Telegram

Telegram должен быть максимально простым адаптером.

```java
@Component
public class TelegramHandler {

    private final ChatApplicationService chatService;

    public void handle(Update update) {

        String text = ...;
        UUID user = ...;

        String response =
                chatService.handle(user, text);

        send(response);
    }
}
```

Telegram не должен содержать бизнес-логику поиска.

## 19. Итоговый набор классов

### Domain model

```text
SearchIntent
Route
Location
GeoPoint
DateRange
Passenger
TransportCriteria
EventCriteria
HotelCriteria
SearchPreferences
Offer
TransportOffer
EventOffer
HotelOffer
Price
Combination
SearchResult
SourceResult
SearchSession
ConversationMessage
```

### Enums

```text
DomainType
Source
Currency
SortType
TimeWindow
SourceStatus
MessageRole
```

### Domain services

```text
SearchService
DefaultSearchService

CombinationService
DefaultCombinationService

RefineService
DefaultRefineService
```

### Ports

```text
SearchProvider
SessionRepository
SearchHistoryRepository
IntentParser
```

### Infrastructure

```text
AtlasProvider
BzdProvider
TicketBusProvider
TicketProProvider
BelHotelProvider

PostgresSessionRepository
PostgresSearchHistoryRepository

LlmIntentParser
```

### Application

```text
ChatApplicationService
```

### API

```text
TelegramHandler
```

## 20. Что пока не нужно делать

На первом этапе не включать в ядро:

```text
CacheManager
CircuitBreaker
Queue
Virtual Threads
Scheduler
MetricsCollector
AlertEvaluator
Idempotency
SourceErrorLog
CachedResult
RequestLog
сложные DTO
HTTP Gateway
```

Сначала должна стабильно работать цепочка:

```text
текст
 ↓
intent
 ↓
provider
 ↓
offers
 ↓
combination
 ↓
result
 ↓
refine
 ↓
новый result
```

## 21. Ключевое архитектурное решение

Центральной сущностью является `SearchIntent`, а не `Offer`.

Пользователь постоянно изменяет именно intent. Поэтому не нужно создавать отдельную бизнес-логику для каждого happy path.

Все сценарии сводятся к одной модели:

```text
SearchIntent
     ↓
SearchProvider[]
     ↓
Offer[]
     ↓
CombinationService
     ↓
SearchResult
```

## 22. Принцип расширения

Добавление нового парсера:

```java
@Component
public class NewProvider implements SearchProvider {

    @Override
    public Source source() {
        return Source.NEW_SOURCE;
    }

    @Override
    public boolean supports(DomainType domain) {
        return domain == DomainType.BUS;
    }

    @Override
    public List<Offer> search(SearchIntent intent) {
        // parse external source
        // map -> domain Offer
    }
}
```

`SearchService` при этом менять не нужно.

БД подключается аналогично:

```text
domain
   ↑
SessionRepository
   ↑
PostgresSessionRepository
```

Домен не зависит от PostgreSQL.

LLM подключается через:

```text
IntentParser
    ↑
    ├── LlmIntentParser
    └── RuleBasedIntentParser
```

## 23. Итог

Получается небольшое ядро, которое:

- не связано с Telegram;
- не связано с PostgreSQL;
- не связано с конкретными парсерами;
- не связано с LLM;
- поддерживает BUS/TRAIN/EVENT/HOTEL;
- поддерживает объединение предложений;
- поддерживает refine;
- поддерживает состояние сессии;
- позволяет добавлять новые источники без изменения `SearchService`;
- позволяет заменить БД без изменения domain;
- позволяет заменить LLM без изменения business logic.

Итоговая цепочка:

```text
User
 ↓
Telegram
 ↓
Application
 ↓
Intent
 ↓
Domain
 ├── SearchProvider[]
 ├── CombinationService
 └── RefineService
 ↓
Result
 ↓
Application
 ↓
Telegram
```

Это минимальная база, на которую позже можно добавлять persistence, реальные парсеры, LLM, кеширование, асинхронность и остальные инфраструктурные механизмы.
