package com.event.storm.task.infrastructure.parser;

import com.event.storm.task.core.command.AddDomain;
import com.event.storm.task.core.command.ChangeBudget;
import com.event.storm.task.core.command.ChangeDates;
import com.event.storm.task.core.command.ChangeHotelCriteria;
import com.event.storm.task.core.command.ChangePassengers;
import com.event.storm.task.core.command.ChangeSort;
import com.event.storm.task.core.command.ChangeTransportCriteria;
import com.event.storm.task.core.command.NewSearchCommand;
import com.event.storm.task.core.command.PreviousResultCommand;
import com.event.storm.task.core.command.RefineCommand;
import com.event.storm.task.core.command.RemoveDomain;
import com.event.storm.task.core.command.ResetCommand;
import com.event.storm.task.core.command.UserCommand;
import com.event.storm.task.core.models.intent.DateRange;
import com.event.storm.task.core.models.intent.EventCriteria;
import com.event.storm.task.core.models.intent.HotelCriteria;
import com.event.storm.task.core.models.intent.Passenger;
import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.intent.SearchPreferences;
import com.event.storm.task.core.models.intent.TransportCriteria;
import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.intent.enums.SortType;
import com.event.storm.task.core.models.intent.enums.TimeWindow;
import com.event.storm.task.core.models.route.Location;
import com.event.storm.task.core.models.route.Route;
import com.event.storm.task.core.models.session.SearchSession;
import com.event.storm.task.core.port.IntentParser;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class RuleBasedIntentParser implements IntentParser {

    private static final int RE = Pattern.CASE_INSENSITIVE
            | Pattern.UNICODE_CASE
            | Pattern.UNICODE_CHARACTER_CLASS;

    private static final String MONTH = "(январ[а-я]*|феврал[а-я]*|март[а-я]*|апрел[а-я]*"
            + "|ма[йяе][а-я]*|июн[а-я]*|июл[а-я]*|август[а-я]*|сентябр[а-я]*"
            + "|октябр[а-я]*|ноябр[а-я]*|декабр[а-я]*)";

    private static final Pattern ROUTE =
            Pattern.compile("из\\s+(.+?)\\s+(?:в|до)\\s+(.+)", RE);
    private static final Pattern ROUTE_REVERSED =
            Pattern.compile("(?:^|\\s)в\\s+(.+?)\\s+из\\s+(.+)", RE);
    private static final Pattern ROUTE_TAIL =
            Pattern.compile("\\s+(?:\\d+|в\\s+\\d|на\\b|за\\b|через\\b|до\\b|после\\b"
                    + "|бюджет[а-я]*|стоимост[а-я]*|цен[а-я]*|дешев[а-я]*|быстр[а-я]*"
                    + "|лучш[а-я]*|оптимальн[а-я]*|удобн[а-я]*|взросл[а-я]*|ребен[а-я]*"
                    + "|дет[а-я]*|звезд[а-я]*|отел[а-я]*|гостиниц[а-я]*|хостел[а-я]*"
                    + "|концерт[а-я]*|фестивал[а-я]*|выставк[а-я]*|спектакл[а-я]*"
                    + "|поезд[а-я]*|автобус[а-я]*|маршрутк[а-я]*|электричк[а-я]*"
                    + "|завтра\\b|сегодня\\b|послезавтра\\b|выходн[а-я]*|прям[а-я]*|без\\b).*$", RE);

    private static final Pattern DATE_RANGE = Pattern.compile(
            "(?:с\\s+)?(\\d{1,2})\\s*(?:-|–|—|по)\\s*(\\d{1,2})\\s+" + MONTH, RE);
    private static final Pattern DATE_SINGLE = Pattern.compile("(\\d{1,2})\\s+" + MONTH, RE);

    private static final Pattern BUDGET_EXPLICIT = Pattern.compile(
            "(?:бюджет[а-я]*|не\\s+более|максимум|макс\\.?)\\s*[:=]?\\s*(\\d+(?:[.,]\\d+)?)", RE);
    private static final Pattern BUDGET_UP_TO = Pattern.compile(
            "\\bдо\\s+(\\d+(?:[.,]\\d+)?)(?!\\s*(?:взросл|ребен|дет|звезд|час|мин|дн))", RE);
    private static final Pattern BUDGET_CURRENCY = Pattern.compile(
            "(\\d+(?:[.,]\\d+)?)\\s*(?:byn|br|бел\\.?\\s*руб[а-я]*|руб[а-я]*|р\\.?\\b)", RE);

    private static final Pattern ADULTS = Pattern.compile("(\\d+)\\s*взросл[а-я]*", RE);
    private static final Pattern CHILDREN = Pattern.compile("(\\d+)\\s*(?:ребен[а-я]*|дет[а-я]*)", RE);
    private static final Pattern CHILD_WORD = Pattern.compile(
            "(?:^|\\s)(?:с\\s+)?(?:ребен(?:ок|ка|ком)?|дет(?:и|ей|ьми|ям|ями|ях)?)\\b", RE);
    private static final Pattern GROUP = Pattern.compile(
            "(?:^|\\s)(?:(?:на\\s+)?(двоих|троих|четверых)|(вдвоем|втроем|вчетвером)"
                    + "|(двое|трое|четверо)|(один|одна|одного))\\b", RE);

    private static final Pattern STARS = Pattern.compile("(?:только\\s+)?(\\d)\\s*(?:звезд[а-я]*|\\*)", RE);
    private static final Pattern NEAR = Pattern.compile("\\bрядом\\b|\\bвозле\\b|\\bнедалеко\\b", RE);
    private static final Pattern CENTER = Pattern.compile("\\bв\\s+центре\\b|\\bцентр[а-я]*\\b", RE);
    private static final Pattern DIRECT = Pattern.compile("\\bпрям[а-я]*\\b|без\\s+пересад[а-я]*", RE);

    private static final Pattern MORNING = Pattern.compile("\\bутр[а-я]*\\b", RE);
    private static final Pattern AFTERNOON = Pattern.compile("\\bднем\\b|\\bдня\\b|после\\s+обеда", RE);
    private static final Pattern EVENING = Pattern.compile("\\bвечер[а-я]*\\b", RE);
    private static final Pattern NIGHT = Pattern.compile("\\bноч[а-я]*\\b", RE);

    private static final Pattern REMOVE_HOTEL =
            Pattern.compile("без\\s+(?:отел[а-я]*|гостиниц[а-я]*|хостел[а-я]*)", RE);
    private static final Pattern REMOVE_BUS =
            Pattern.compile("без\\s+(?:автобус[а-я]*|маршрут[а-я]*)", RE);
    private static final Pattern REMOVE_TRAIN =
            Pattern.compile("без\\s+(?:поезд[а-я]*|электрич[а-я]*|ж/д)", RE);
    private static final Pattern REMOVE_EVENT =
            Pattern.compile("без\\s+(?:событ[а-я]*|концерт[а-я]*|фестивал[а-я]*|мероприят[а-я]*)", RE);

    private static final Pattern RESET =
            Pattern.compile("^(сброс|сбрось|отмени|начать заново|reset)$", RE);
    private static final Pattern PREVIOUS =
            Pattern.compile("^(предыдущ|прошл).*$", RE);

    private final Clock clock;

    public RuleBasedIntentParser() {
        this(Clock.systemDefaultZone());
    }

    RuleBasedIntentParser(Clock clock) {
        this.clock = clock;
    }

    @Override
    public UserCommand parse(String text, SearchSession session) {
        String raw = text == null ? "" : text.trim();
        String low = normalize(raw);
        if (low.isBlank()) {
            throw new IllegalArgumentException("запрос пустой");
        }

        if (RESET.matcher(low).matches()) {
            return new ResetCommand();
        }
        if (PREVIOUS.matcher(low).matches()) {
            return new PreviousResultCommand();
        }

        SearchIntent current = session == null ? null : session.getIntent();
        boolean hasRoute = ROUTE.matcher(low).find() || ROUTE_REVERSED.matcher(low).find();
        if (current != null && !hasRoute) {
            RefineCommand refine = refine(low, current);
            if (refine != null) {
                return refine;
            }
        }

        return new NewSearchCommand(buildIntent(raw, low));
    }

    private RefineCommand refine(String low, SearchIntent current) {
        int adults = current.getPassenger() == null ? 1 : current.getPassenger().getAdults();
        int children = current.getPassenger() == null ? 0 : current.getPassenger().getChildren();

        if (low.contains("еще ребенок") || low.contains("еще один ребенок")) {
            return new ChangePassengers(adults, children + 1);
        }
        if (low.contains("еще один взрослый") || low.contains("еще взрослый")) {
            return new ChangePassengers(adults + 1, children);
        }
        if (low.contains("без дет") || low.contains("без ребен")) {
            return new ChangePassengers(adults, 0);
        }
        if (low.contains("с ребенком")) {
            return new ChangePassengers(adults, children + 1);
        }

        DomainType removed = removedDomain(low);
        if (removed != null) {
            return new RemoveDomain(removed);
        }
        if (DIRECT.matcher(low).find()) {
            return new ChangeTransportCriteria(true, null, null);
        }
        if (NEAR.matcher(low).find()) {
            return new ChangeHotelCriteria(null, null, true, null);
        }
        if (CENTER.matcher(low).find()) {
            return new ChangeHotelCriteria(null, null, null, true);
        }

        BigDecimal budget = budget(low);
        if (budget != null) {
            return new ChangeBudget(budget);
        }

        HotelCriteria hotel = hotelCriteria(low);
        if (hotel != null && hotel.getMinRating() != null) {
            return new ChangeHotelCriteria(hotel.getMinRating(), hotel.getMaxRating(), null, null);
        }

        DateRange dates = dates(low);
        if (dates != null) {
            return new ChangeDates(dates.getFrom(), dates.getTo());
        }

        SortType sort = sort(low);
        if (sort != null) {
            return new ChangeSort(sort);
        }

        Passenger passenger = passengers(low);
        if (passenger != null) {
            return new ChangePassengers(passenger.getAdults(), passenger.getChildren());
        }

        DomainType added = firstDomain(low);
        if (added != null) {
            return new AddDomain(added);
        }
        return null;
    }

    private SearchIntent buildIntent(String raw, String low) {
        Set<DomainType> domains = domains(low);
        Set<DomainType> resultDomains = new LinkedHashSet<>(domains);

        HotelCriteria hotel = hotelCriteria(low);
        if (hotel != null) {
            resultDomains.add(DomainType.HOTEL);
        }

        EventCriteria event = resultDomains.contains(DomainType.EVENT)
                ? new EventCriteria(raw, timeWindow(low))
                : null;

        TimeWindow window = timeWindow(low);
        boolean direct = DIRECT.matcher(low).find();
        TransportCriteria transport = direct || window != null
                ? new TransportCriteria(direct, window, null)
                : null;

        return new SearchIntent(
                Set.copyOf(resultDomains),
                route(raw),
                dates(low),
                passengers(low),
                transport,
                event,
                hotel,
                preferences(low)
        );
    }

    private Set<DomainType> domains(String low) {
        Set<DomainType> domains = new LinkedHashSet<>();
        if (low.contains("автобус") || low.contains("маршрутк") || low.contains("микроавтобус")) {
            domains.add(DomainType.BUS);
        }
        if (low.contains("поезд") || low.contains("ж/д") || low.contains("железнодорож")
                || low.contains("электричк") || low.contains("плацкарт") || low.contains("купе")) {
            domains.add(DomainType.TRAIN);
        }
        if (low.contains("концерт") || low.contains("фестивал") || low.contains("выставк")
                || low.contains("спектакл") || low.contains("матч") || low.contains("событ")
                || low.contains("афиш") || low.contains("театр") || low.contains("шоу")) {
            domains.add(DomainType.EVENT);
        }
        if (low.contains("отел") || low.contains("гостиниц") || low.contains("хостел")
                || low.contains("переночевать") || low.contains("ночевк") || low.contains("проживан")) {
            domains.add(DomainType.HOTEL);
        }
        return domains;
    }

    private DomainType firstDomain(String low) {
        Set<DomainType> domains = domains(low);
        return domains.isEmpty() ? null : domains.iterator().next();
    }

    private DomainType removedDomain(String low) {
        if (REMOVE_HOTEL.matcher(low).find()) {
            return DomainType.HOTEL;
        }
        if (REMOVE_BUS.matcher(low).find()) {
            return DomainType.BUS;
        }
        if (REMOVE_TRAIN.matcher(low).find()) {
            return DomainType.TRAIN;
        }
        if (REMOVE_EVENT.matcher(low).find()) {
            return DomainType.EVENT;
        }
        return null;
    }

    private Route route(String low) {
        Matcher forward = ROUTE.matcher(low);
        if (forward.find()) {
            return route(forward.group(1), forward.group(2));
        }
        Matcher reversed = ROUTE_REVERSED.matcher(low);
        if (reversed.find()) {
            return route(reversed.group(2), reversed.group(1));
        }
        return null;
    }

    private Route route(String fromValue, String toValue) {
        String from = cleanCity(fromValue);
        String to = cleanCity(toValue);
        if (from.isEmpty() || to.isEmpty()) {
            return null;
        }
        return new Route(new Location(null, from, null), new Location(null, to, null));
    }

    private static String cleanCity(String value) {
        if (value == null) {
            return "";
        }
        String cleaned = ROUTE_TAIL.matcher(value).replaceFirst("");
        int comma = cleaned.indexOf(',');
        if (comma > 0) {
            cleaned = cleaned.substring(0, comma);
        }
        cleaned = cleaned.replaceAll("[\\s\\-]+$", "");
        cleaned = cleaned.replaceAll("^[\\s\\-]+", "");
        return cleaned.replaceAll("[\\.,;:!\\?]+$", "").trim();
    }

    private DateRange dates(String low) {
        Matcher range = DATE_RANGE.matcher(low);
        if (range.find()) {
            int startDay = Integer.parseInt(range.group(1));
            int endDay = Integer.parseInt(range.group(2));
            int month = month(range.group(3));
            if (month > 0) {
                LocalDate from = futureDate(startDay, month);
                LocalDate to = safeDate(from.getYear(), month, endDay);
                if (to.isBefore(from)) {
                    to = to.plusMonths(1);
                }
                return new DateRange(from, to);
            }
        }

        Matcher single = DATE_SINGLE.matcher(low);
        if (single.find()) {
            int day = Integer.parseInt(single.group(1));
            int month = month(single.group(2));
            if (month > 0) {
                LocalDate date = futureDate(day, month);
                return new DateRange(date, date);
            }
        }

        if (low.contains("послезавтра")) {
            LocalDate date = LocalDate.now(clock).plusDays(2);
            return new DateRange(date, date);
        }
        if (low.contains("завтра")) {
            LocalDate date = LocalDate.now(clock).plusDays(1);
            return new DateRange(date, date);
        }
        if (low.contains("сегодня")) {
            LocalDate date = LocalDate.now(clock);
            return new DateRange(date, date);
        }
        if (low.contains("выходн")) {
            return weekend();
        }
        if (low.contains("майск")) {
            LocalDate from = futureDate(1, 5);
            return new DateRange(from, from.plusDays(2));
        }
        return null;
    }

    private DateRange weekend() {
        LocalDate today = LocalDate.now(clock);
        DayOfWeek day = today.getDayOfWeek();
        if (day == DayOfWeek.SATURDAY) {
            return new DateRange(today, today.plusDays(1));
        }
        if (day == DayOfWeek.SUNDAY) {
            return new DateRange(today.minusDays(1), today);
        }
        LocalDate saturday = today.plusDays(6L - day.getValue());
        return new DateRange(saturday, saturday.plusDays(1));
    }

    private LocalDate futureDate(int day, int month) {
        LocalDate today = LocalDate.now(clock);
        LocalDate candidate = safeDate(today.getYear(), month, day);
        return candidate.isBefore(today)
                ? safeDate(today.getYear() + 1, month, day)
                : candidate;
    }

    private static LocalDate safeDate(int year, int month, int day) {
        int lastDay = YearMonth.of(year, month).lengthOfMonth();
        return LocalDate.of(year, month, Math.min(day, lastDay));
    }

    private static int month(String value) {
        if (value.startsWith("январ")) {
            return 1;
        }
        if (value.startsWith("феврал")) {
            return 2;
        }
        if (value.startsWith("март")) {
            return 3;
        }
        if (value.startsWith("апрел")) {
            return 4;
        }
        if (value.startsWith("ма")) {
            return 5;
        }
        if (value.startsWith("июн")) {
            return 6;
        }
        if (value.startsWith("июл")) {
            return 7;
        }
        if (value.startsWith("август")) {
            return 8;
        }
        if (value.startsWith("сентябр")) {
            return 9;
        }
        if (value.startsWith("октябр")) {
            return 10;
        }
        if (value.startsWith("ноябр")) {
            return 11;
        }
        if (value.startsWith("декабр")) {
            return 12;
        }
        return -1;
    }

    private Passenger passengers(String low) {
        Integer adults = null;
        Integer children = null;

        Matcher adultMatcher = ADULTS.matcher(low);
        if (adultMatcher.find()) {
            adults = Integer.parseInt(adultMatcher.group(1));
        }
        Matcher childMatcher = CHILDREN.matcher(low);
        if (childMatcher.find()) {
            children = Integer.parseInt(childMatcher.group(1));
        }

        boolean withoutChildren = low.contains("без дет") || low.contains("без ребен");
        if (children == null && !withoutChildren && CHILD_WORD.matcher(low).find()) {
            children = 1;
        }
        if (adults == null) {
            Integer group = groupCount(low);
            if (group != null) {
                adults = group;
            }
        }
        if (adults == null && children != null) {
            adults = 1;
        }
        if (adults == null && children == null) {
            return null;
        }
        return new Passenger(adults == null ? 1 : adults, children == null ? 0 : children);
    }

    private static Integer groupCount(String low) {
        Matcher matcher = GROUP.matcher(low);
        if (!matcher.find()) {
            return null;
        }
        for (int i = 1; i <= matcher.groupCount(); i++) {
            String value = matcher.group(i);
            if (value == null) {
                continue;
            }
            if (value.startsWith("дв")) {
                return 2;
            }
            if (value.startsWith("тр")) {
                return 3;
            }
            if (value.startsWith("чет")) {
                return 4;
            }
            if (value.startsWith("од")) {
                return 1;
            }
        }
        return null;
    }

    private HotelCriteria hotelCriteria(String low) {
        Integer rating = null;
        Matcher stars = STARS.matcher(low);
        if (stars.find()) {
            rating = Integer.parseInt(stars.group(1));
        }
        boolean near = NEAR.matcher(low).find();
        boolean center = CENTER.matcher(low).find();
        if (rating == null && !near && !center) {
            return null;
        }
        return new HotelCriteria(rating, rating, near, center);
    }

    private TimeWindow timeWindow(String low) {
        if (MORNING.matcher(low).find()) {
            return TimeWindow.MORNING;
        }
        if (AFTERNOON.matcher(low).find()) {
            return TimeWindow.AFTERNOON;
        }
        if (EVENING.matcher(low).find()) {
            return TimeWindow.EVENING;
        }
        if (NIGHT.matcher(low).find()) {
            return TimeWindow.NIGHT;
        }
        return null;
    }

    private SearchPreferences preferences(String low) {
        SortType sort = sort(low);
        BigDecimal budget = budget(low);
        if (sort == null && budget == null) {
            return null;
        }
        return new SearchPreferences(sort, budget, false, false);
    }

    private static SortType sort(String low) {
        if (low.contains("быстр") || low.contains("скорее")) {
            return SortType.FASTEST;
        }
        if (low.contains("дешев") || low.contains("эконом") || low.contains("недорог")) {
            return SortType.CHEAPEST;
        }
        if (low.contains("лучш") || low.contains("оптимальн") || low.contains("удобн")) {
            return SortType.BEST;
        }
        return null;
    }

    private static BigDecimal budget(String low) {
        Matcher explicit = BUDGET_EXPLICIT.matcher(low);
        if (explicit.find()) {
            return decimal(explicit.group(1));
        }
        Matcher upTo = BUDGET_UP_TO.matcher(low);
        if (upTo.find()) {
            return decimal(upTo.group(1));
        }
        Matcher currency = BUDGET_CURRENCY.matcher(low);
        if (currency.find()) {
            return decimal(currency.group(1));
        }
        return null;
    }

    private static BigDecimal decimal(String value) {
        return new BigDecimal(value.replace(',', '.'));
    }

    private static String normalize(String value) {
        return value.toLowerCase(Locale.ROOT)
                .replace('ё', 'е')
                .replaceAll("\\s+", " ")
                .trim();
    }
}
