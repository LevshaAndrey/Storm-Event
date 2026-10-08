package com.event.storm.task.core.service;

import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.offer.EventOffer;
import com.event.storm.task.core.models.offer.HotelOffer;
import com.event.storm.task.core.models.offer.Offer;
import com.event.storm.task.core.models.offer.Price;
import com.event.storm.task.core.models.offer.TransportOffer;
import com.event.storm.task.core.models.offer.enums.Currency;
import com.event.storm.task.core.models.offer.enums.Source;
import com.event.storm.task.core.models.result.Combination;
import com.event.storm.task.core.models.route.GeoPoint;
import com.event.storm.task.core.models.route.Location;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class DefaultCombinationServiceTest {

    private final DefaultCombinationService service = new DefaultCombinationService();

    @Test
    void buildsCompatibleCombinations() {
        Instant arrival = Instant.parse("2026-10-10T10:00:00Z");
        List<Offer> offers = offers(arrival, arrival.plus(Duration.ofHours(3)));

        List<Combination> combinations = service.build(intent(null), offers);

        assertThat(combinations).hasSize(3);
        assertThat(combinations)
                .anyMatch(c -> c.getTags().contains("BUS + EVENT + HOTEL"));
        assertThat(combinations)
                .extracting(c -> c.getTotalPrice().getAmount())
                .containsExactlyInAnyOrder(
                        new BigDecimal("180"), new BigDecimal("150"), new BigDecimal("130"));
    }

    @Test
    void dropsCombinationWhenEventStartsTooSoon() {
        Instant arrival = Instant.parse("2026-10-10T10:00:00Z");
        List<Offer> offers = offers(arrival, arrival.plus(Duration.ofHours(1)));

        List<Combination> combinations = service.build(intent(null), offers);

        assertThat(combinations).hasSize(2);
        assertThat(combinations)
                .noneMatch(c -> c.getTags().contains("BUS + EVENT + HOTEL"));
    }

    @Test
    void dropsCombinationsOverBudget() {
        Instant arrival = Instant.parse("2026-10-10T10:00:00Z");
        List<Offer> offers = offers(arrival, arrival.plus(Duration.ofHours(3)));

        List<Combination> combinations = service.build(intent(new BigDecimal("100")), offers);

        assertThat(combinations).isEmpty();
    }

    private SearchIntent intent(BigDecimal budget) {
        return new SearchIntent(
                Set.of(DomainType.BUS, DomainType.EVENT, DomainType.HOTEL),
                null, null, null, null, null, null,
                budget == null ? null
                        : new com.event.storm.task.core.models.intent.SearchPreferences(
                                null, budget, false, false)
        );
    }

    private List<Offer> offers(Instant arrival, Instant eventStart) {
        Price transportPrice = new Price(new BigDecimal("50"), Currency.BYN);
        Price eventPrice = new Price(new BigDecimal("30"), Currency.BYN);
        Price hotelPrice = new Price(new BigDecimal("100"), Currency.BYN);

        return List.of(
                new TransportOffer(
                        "t1", DomainType.BUS, Source.ATLAS, "Минск — Гомель",
                        new Location("1", "Минск", null),
                        new Location("2", "Гомель", null),
                        arrival.minus(Duration.ofHours(8)),
                        arrival,
                        transportPrice,
                        true,
                        "http://atlas.example/t1"
                ),
                new EventOffer(
                        "e1", Source.TICKET_PRO, "Концерт",
                        new Location("3", "Минск-Арена", new GeoPoint(53.9, 27.56)),
                        eventStart,
                        eventStart.plus(Duration.ofHours(3)),
                        eventPrice,
                        "music",
                        "http://ticketpro.example/e1"
                ),
                new HotelOffer(
                        "h1", Source.BEL_HOTEL, "Отель у площадки",
                        new Location("4", "Минск-Арена", new GeoPoint(53.901, 27.561)),
                        4,
                        hotelPrice,
                        "http://belhotel.example/h1"
                )
        );
    }
}
