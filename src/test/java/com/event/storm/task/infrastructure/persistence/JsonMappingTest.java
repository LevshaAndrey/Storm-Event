package com.event.storm.task.infrastructure.persistence;

import com.event.storm.task.core.models.intent.DateRange;
import com.event.storm.task.core.models.intent.EventCriteria;
import com.event.storm.task.core.models.intent.Passenger;
import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.intent.SearchPreferences;
import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.intent.enums.SortType;
import com.event.storm.task.core.models.result.SearchResult;
import com.event.storm.task.core.models.result.SourceResult;
import com.event.storm.task.core.models.result.SourceStatus;
import com.event.storm.task.core.models.offer.enums.Source;
import com.event.storm.task.core.models.route.GeoPoint;
import com.event.storm.task.core.models.route.Location;
import com.event.storm.task.core.models.route.Route;
import com.event.storm.task.core.models.session.ConversationMessage;
import com.event.storm.task.core.models.session.MessageRole;
import com.event.storm.task.core.models.session.SearchSession;
import com.event.storm.task.config.JacksonConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JsonMappingTest {

    private final ObjectMapper mapper = new JacksonConfig().objectMapper();

    @Test
    void searchSessionRoundTrip() throws Exception {
        SearchSession session = new SearchSession(
                UUID.randomUUID(),
                intent(),
                result(),
                List.of(new ConversationMessage(MessageRole.USER, "автобус из Минска", Instant.now()))
        );

        String json = mapper.writeValueAsString(session);
        SearchSession restored = mapper.readValue(json, SearchSession.class);

        assertThat(restored.getId()).isEqualTo(session.getId());
        assertThat(restored.getIntent().getDomains()).containsExactlyInAnyOrder(
                DomainType.BUS, DomainType.EVENT);
        assertThat(restored.getIntent().getRoute().getFrom().getName()).isEqualTo("Минск");
        assertThat(restored.getIntent().getRoute().getTo().getCoordinates().getLatitude())
                .isEqualTo(52.4);
        assertThat(restored.getIntent().getDates().getFrom()).isEqualTo(LocalDate.of(2026, 10, 10));
        assertThat(restored.getIntent().getPassenger().getChildren()).isEqualTo(1);
        assertThat(restored.getIntent().getEvent().getQuery()).isEqualTo("концерт");
        assertThat(restored.getIntent().getPreferences().getSort()).isEqualTo(SortType.CHEAPEST);
        assertThat(restored.getIntent().getPreferences().getBudgetMax())
                .isEqualByComparingTo(new BigDecimal("300"));
        assertThat(restored.getMessages()).hasSize(1);
        assertThat(restored.getMessages().get(0).getRole()).isEqualTo(MessageRole.USER);
        assertThat(restored.getLastResult().getSources()).hasSize(1);
        assertThat(restored.getLastResult().getSources().get(0).getStatus())
                .isEqualTo(SourceStatus.EMPTY);
    }

    private SearchIntent intent() {
        return new SearchIntent(
                Set.of(DomainType.BUS, DomainType.EVENT),
                new Route(
                        new Location("1", "Минск", null),
                        new Location("2", "Гомель", new GeoPoint(52.4, 30.9))),
                new DateRange(LocalDate.of(2026, 10, 10), LocalDate.of(2026, 10, 12)),
                new Passenger(2, 1),
                null,
                new EventCriteria("концерт", null),
                null,
                new SearchPreferences(SortType.CHEAPEST, new BigDecimal("300"), true, false)
        );
    }

    private SearchResult result() {
        return new SearchResult(
                intent(),
                List.of(),
                List.of(),
                List.of(new SourceResult(Source.ATLAS, SourceStatus.EMPTY, 0, null))
        );
    }
}
