package com.event.storm.task.core.service;

import com.event.storm.task.core.command.ChangeTransportCriteria;
import com.event.storm.task.core.command.RemoveDomain;
import com.event.storm.task.core.models.intent.DateRange;
import com.event.storm.task.core.models.intent.Passenger;
import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.intent.SearchPreferences;
import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.intent.enums.TimeWindow;
import com.event.storm.task.core.models.route.Location;
import com.event.storm.task.core.models.route.Route;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class DefaultRefineServiceTest {

    private final DefaultRefineService service = new DefaultRefineService();

    @Test
    void removesDomainFromActiveSearch() {
        SearchIntent refined = service.refine(baseIntent(), new RemoveDomain(DomainType.HOTEL));

        assertThat(refined.getDomains())
                .containsExactlyInAnyOrder(DomainType.BUS, DomainType.EVENT);
    }

    @Test
    void updatesTransportCriteria() {
        SearchIntent refined = service.refine(
                baseIntent(), new ChangeTransportCriteria(true, TimeWindow.EVENING, null));

        assertThat(refined.getTransport().isDirectOnly()).isTrue();
        assertThat(refined.getTransport().getWindow()).isEqualTo(TimeWindow.EVENING);
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
}
