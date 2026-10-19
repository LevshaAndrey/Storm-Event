package com.event.storm.task.infrastructure.parser;

import com.event.storm.task.core.command.ChangeDates;
import com.event.storm.task.core.command.ChangePassengers;
import com.event.storm.task.core.command.ChangeSort;
import com.event.storm.task.core.command.ChangeTransportCriteria;
import com.event.storm.task.core.command.NewSearchCommand;
import com.event.storm.task.core.command.PreviousResultCommand;
import com.event.storm.task.core.command.RemoveDomain;
import com.event.storm.task.core.command.ResetCommand;
import com.event.storm.task.core.command.UserCommand;
import com.event.storm.task.core.models.intent.DateRange;
import com.event.storm.task.core.models.intent.Passenger;
import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.intent.SearchPreferences;
import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.intent.enums.SortType;
import com.event.storm.task.core.models.route.Location;
import com.event.storm.task.core.models.route.Route;
import com.event.storm.task.core.models.session.SearchSession;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class RuleBasedIntentParserTest {

    private static final Clock CLOCK = Clock.fixed(
            Instant.parse("2026-10-19T09:00:00Z"),
            ZoneId.of("Europe/Minsk"));

    private final RuleBasedIntentParser parser = new RuleBasedIntentParser(CLOCK);

    @Test
    void parsesNaturalWeekendQuery() {
        UserCommand command = parser.parse(
                "Хочу в Брест на выходные, рок-концерт, до 300 BYN, можно маршруткой", null);

        assertThat(command).isInstanceOf(NewSearchCommand.class);
        SearchIntent intent = ((NewSearchCommand) command).getIntent();
        assertThat(intent.getDomains()).contains(DomainType.BUS, DomainType.EVENT);
        assertThat(intent.getDates().getFrom()).isEqualTo(LocalDate.of(2026, 10, 24));
        assertThat(intent.getDates().getTo()).isEqualTo(LocalDate.of(2026, 10, 25));
        assertThat(intent.getPreferences().getBudgetMax()).isEqualByComparingTo("300");
    }

    @Test
    void parsesRouteDatesPassengersAndBudget() {
        UserCommand command = parser.parse(
                "из Минска в Брест завтра, 2 взрослых и ребёнок, поезд, до 250 BYN", null);

        SearchIntent intent = ((NewSearchCommand) command).getIntent();
        assertThat(intent.getDomains()).containsExactly(DomainType.TRAIN);
        assertThat(intent.getRoute().getFrom().getName()).containsIgnoringCase("Минск");
        assertThat(intent.getRoute().getTo().getName()).isEqualTo("Брест");
        assertThat(intent.getDates().getFrom()).isEqualTo(LocalDate.of(2026, 10, 20));
        assertThat(intent.getPassenger().getAdults()).isEqualTo(2);
        assertThat(intent.getPassenger().getChildren()).isEqualTo(1);
        assertThat(intent.getPreferences().getBudgetMax()).isEqualByComparingTo("250");
    }

    @Test
    void parsesExplicitDateRange() {
        SearchIntent intent = ((NewSearchCommand) parser.parse(
                "из Минска в Брест 24-26 октября", null)).getIntent();

        assertThat(intent.getDates().getFrom()).isEqualTo(LocalDate.of(2026, 10, 24));
        assertThat(intent.getDates().getTo()).isEqualTo(LocalDate.of(2026, 10, 26));
    }

    @Test
    void parsesHotelAndDirectTransportCriteria() {
        SearchIntent hotel = ((NewSearchCommand) parser.parse(
                "отель 4 звезды в центре", null)).getIntent();
        assertThat(hotel.getDomains()).contains(DomainType.HOTEL);
        assertThat(hotel.getHotel().getMinRating()).isEqualTo(4);
        assertThat(hotel.getHotel().isCenter()).isTrue();

        SearchIntent transport = ((NewSearchCommand) parser.parse(
                "прямой поезд из Минска в Брест без пересадок", null)).getIntent();
        assertThat(transport.getTransport().isDirectOnly()).isTrue();
    }

    @Test
    void refinesActiveSearch() {
        SearchSession session = session(baseIntent());

        UserCommand child = parser.parse("ещё ребёнок", session);
        assertThat(child).isInstanceOf(ChangePassengers.class);
        assertThat(((ChangePassengers) child).getChildren()).isEqualTo(1);

        UserCommand cheapest = parser.parse("дешевле", session);
        assertThat(cheapest).isInstanceOf(ChangeSort.class);
        assertThat(((ChangeSort) cheapest).getSort()).isEqualTo(SortType.CHEAPEST);

        UserCommand withoutHotels = parser.parse("без отелей", session);
        assertThat(withoutHotels).isInstanceOf(RemoveDomain.class);
        assertThat(((RemoveDomain) withoutHotels).getDomain()).isEqualTo(DomainType.HOTEL);

        UserCommand weekend = parser.parse("на выходные", session);
        assertThat(weekend).isInstanceOf(ChangeDates.class);
        assertThat(((ChangeDates) weekend).getFrom()).isEqualTo(LocalDate.of(2026, 10, 24));

        UserCommand direct = parser.parse("только прямые", session);
        assertThat(direct).isInstanceOf(ChangeTransportCriteria.class);
        assertThat(((ChangeTransportCriteria) direct).getDirectOnly()).isTrue();
    }

    @Test
    void handlesResetAndPrevious() {
        assertThat(parser.parse("сброс", null)).isInstanceOf(ResetCommand.class);
        assertThat(parser.parse("предыдущий", null)).isInstanceOf(PreviousResultCommand.class);
    }

    private static SearchIntent baseIntent() {
        return new SearchIntent(
                Set.of(DomainType.BUS, DomainType.EVENT, DomainType.HOTEL),
                new Route(
                        new Location(null, "Минск", null),
                        new Location(null, "Брест", null)),
                new DateRange(LocalDate.of(2026, 10, 20), LocalDate.of(2026, 10, 20)),
                new Passenger(2, 0),
                null,
                null,
                null,
                new SearchPreferences(null, null, false, false)
        );
    }

    private static SearchSession session(SearchIntent intent) {
        return new SearchSession(UUID.randomUUID(), intent, null, List.of());
    }
}
