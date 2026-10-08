package com.event.storm.task.infrastructure.parser;

import com.event.storm.task.core.command.ChangeBudget;
import com.event.storm.task.core.command.ChangeDates;
import com.event.storm.task.core.command.ChangeHotelCriteria;
import com.event.storm.task.core.command.ChangePassengers;
import com.event.storm.task.core.command.ChangeSort;
import com.event.storm.task.core.command.AddDomain;
import com.event.storm.task.core.command.NewSearchCommand;
import com.event.storm.task.core.command.PreviousResultCommand;
import com.event.storm.task.core.command.RefineCommand;
import com.event.storm.task.core.command.ResetCommand;
import com.event.storm.task.core.command.UserCommand;
import com.event.storm.task.core.models.intent.DateRange;
import com.event.storm.task.core.models.intent.EventCriteria;
import com.event.storm.task.core.models.intent.Passenger;
import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.intent.SearchPreferences;
import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.intent.enums.SortType;
import com.event.storm.task.core.models.route.Location;
import com.event.storm.task.core.models.route.Route;
import com.event.storm.task.core.models.session.SearchSession;
import com.event.storm.task.core.port.IntentParser;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class RuleBasedIntentParser implements IntentParser {

    private static final Pattern ROUTE =
            Pattern.compile("из\\s+([а-яёa-z\\-]+)\\s+в\\s+([а-яёa-z\\-]+)", Pattern.CASE_INSENSITIVE);
    private static final Pattern BUDGET =
            Pattern.compile("бюджет[\\s:]*([\\d]+)");
    private static final Pattern ADULTS =
            Pattern.compile("(\\d+)\\s*взросл");
    private static final Pattern CHILDREN =
            Pattern.compile("(\\d+)\\s*реб[её]н");
    private static final Pattern STARS =
            Pattern.compile("только\\s+(\\d+)\\s*звезд");
    private static final Pattern RESET =
            Pattern.compile("^(сброс|сбрось|отмени|начать заново|reset)$");
    private static final Pattern PREVIOUS =
            Pattern.compile("^(предыдущ|прошл).*$");

    @Override
    public UserCommand parse(String text, SearchSession session) {
        String raw = text == null ? "" : text.trim();
        String low = raw.toLowerCase(Locale.ROOT);
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
        if (current != null) {
            RefineCommand refine = refine(low, current);
            if (refine != null) {
                return refine;
            }
        }

        return new NewSearchCommand(buildIntent(raw, low));
    }

    private RefineCommand refine(String low, SearchIntent current) {
        if (Pattern.compile("ещ[ёе]\\s*реб[её]нок").matcher(low).find()) {
            Passenger passenger = current.getPassenger();
            int adults = passenger == null ? 1 : passenger.getAdults();
            int children = passenger == null ? 0 : passenger.getChildren();
            return new ChangePassengers(adults, children + 1);
        }
        if (low.contains("самый быстрый") || low.contains("быстрее")) {
            return new ChangeSort(SortType.FASTEST);
        }
        if (low.contains("самый деш") || low.contains("дешевле")) {
            return new ChangeSort(SortType.CHEAPEST);
        }
        if (low.contains("лучший") || low.contains("оптимальн")) {
            return new ChangeSort(SortType.BEST);
        }
        Matcher budget = BUDGET.matcher(low);
        if (budget.find()) {
            return new ChangeBudget(new BigDecimal(budget.group(1)));
        }
        Matcher stars = STARS.matcher(low);
        if (stars.find()) {
            int rating = Integer.parseInt(stars.group(1));
            return new ChangeHotelCriteria(rating, rating, null, null);
        }
        if (low.contains("поезд") || low.contains("ж/д") || low.contains("электричк")) {
            return new AddDomain(DomainType.TRAIN);
        }
        if (low.contains("автобус")) {
            return new AddDomain(DomainType.BUS);
        }
        if (low.contains("отел") || low.contains("гостиниц")) {
            return new AddDomain(DomainType.HOTEL);
        }
        if (low.contains("послезавтра")) {
            LocalDate day = LocalDate.now().plusDays(2);
            return new ChangeDates(day, day);
        }
        if (low.contains("завтра")) {
            LocalDate day = LocalDate.now().plusDays(1);
            return new ChangeDates(day, day);
        }
        return null;
    }

    private SearchIntent buildIntent(String raw, String low) {
        Set<DomainType> domains = new LinkedHashSet<>();
        if (low.contains("поезд") || low.contains("ж/д") || low.contains("электричк")) {
            domains.add(DomainType.TRAIN);
        }
        if (low.contains("автобус")) {
            domains.add(DomainType.BUS);
        }
        if (low.contains("отел") || low.contains("гостиниц")) {
            domains.add(DomainType.HOTEL);
        }
        if (low.contains("билет") || low.contains("событ") || low.contains("концерт")
                || low.contains("спектакл") || low.contains("фестивал") || low.contains("матч")) {
            domains.add(DomainType.EVENT);
        }

        SearchPreferences preferences = preferences(low);
        EventCriteria event = domains.contains(DomainType.EVENT) ? new EventCriteria(raw, null) : null;

        return new SearchIntent(
                Set.copyOf(domains),
                route(low),
                dates(low),
                passengers(low),
                null,
                event,
                null,
                preferences
        );
    }

    private Route route(String low) {
        Matcher matcher = ROUTE.matcher(low);
        if (!matcher.find()) {
            return null;
        }
        String from = matcher.group(1).trim();
        String to = matcher.group(2).trim();
        return new Route(new Location(null, from, null), new Location(null, to, null));
    }

    private DateRange dates(String low) {
        if (low.contains("послезавтра")) {
            LocalDate day = LocalDate.now().plusDays(2);
            return new DateRange(day, day);
        }
        if (low.contains("завтра")) {
            LocalDate day = LocalDate.now().plusDays(1);
            return new DateRange(day, day);
        }
        return null;
    }

    private Passenger passengers(String low) {
        Matcher adults = ADULTS.matcher(low);
        Matcher children = CHILDREN.matcher(low);
        boolean hasAdults = adults.find();
        boolean hasChildren = children.find();
        if (!hasAdults && !hasChildren) {
            return null;
        }
        return new Passenger(
                hasAdults ? Integer.parseInt(adults.group(1)) : 1,
                hasChildren ? Integer.parseInt(children.group(1)) : 0
        );
    }

    private SearchPreferences preferences(String low) {
        SortType sort = null;
        if (low.contains("самый быстрый") || low.contains("быстрее")) {
            sort = SortType.FASTEST;
        } else if (low.contains("самый деш") || low.contains("дешевле")) {
            sort = SortType.CHEAPEST;
        } else if (low.contains("лучший") || low.contains("оптимальн")) {
            sort = SortType.BEST;
        }

        BigDecimal budget = null;
        Matcher budgetMatcher = BUDGET.matcher(low);
        if (budgetMatcher.find()) {
            budget = new BigDecimal(budgetMatcher.group(1));
        }

        if (sort == null && budget == null) {
            return null;
        }
        return new SearchPreferences(sort, budget, false, false);
    }
}
