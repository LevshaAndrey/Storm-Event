package com.event.storm.task.core.service;

import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.offer.enums.Currency;
import com.event.storm.task.core.models.offer.EventOffer;
import com.event.storm.task.core.models.offer.HotelOffer;
import com.event.storm.task.core.models.offer.Offer;
import com.event.storm.task.core.models.offer.Price;
import com.event.storm.task.core.models.offer.TransportOffer;
import com.event.storm.task.core.models.result.Combination;
import com.event.storm.task.core.models.route.GeoPoint;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DefaultCombinationService implements CombinationService {

    private static final Duration MIN_EVENT_GAP = Duration.ofHours(2);
    private static final Duration COMFORT_EVENT_GAP = Duration.ofHours(6);
    private static final double MAX_DISTANCE_KM = 2.0;

    @Override
    public List<Combination> build(SearchIntent intent, List<Offer> offers) {
        if (offers == null || offers.isEmpty()) {
            return List.of();
        }

        List<TransportOffer> transports = filter(offers, TransportOffer.class);
        List<EventOffer> events = filter(offers, EventOffer.class);
        List<HotelOffer> hotels = filter(offers, HotelOffer.class);

        List<Combination> combinations = new ArrayList<>();

        for (TransportOffer transport : transports) {
            for (EventOffer event : events) {
                if (!arrivesInTime(transport, event)) {
                    continue;
                }
                for (HotelOffer hotel : hotels) {
                    if (!nearVenue(hotel, event)) {
                        continue;
                    }
                    add(combinations, intent, List.of(transport, event, hotel));
                }
                if (hotels.isEmpty()) {
                    add(combinations, intent, List.of(transport, event));
                }
            }
            for (HotelOffer hotel : hotels) {
                add(combinations, intent, List.of(transport, hotel));
            }
        }

        for (EventOffer event : events) {
            for (HotelOffer hotel : hotels) {
                if (!nearVenue(hotel, event)) {
                    continue;
                }
                add(combinations, intent, List.of(event, hotel));
            }
        }

        return combinations;
    }

    private void add(List<Combination> out, SearchIntent intent, List<Offer> group) {
        Price total = total(group);
        if (total == null || !withinBudget(intent, total)) {
            return;
        }
        out.add(new Combination(
                id(group),
                group,
                total,
                score(group),
                tags(group)
        ));
    }

    private Price total(List<Offer> group) {
        Currency currency = null;
        BigDecimal sum = BigDecimal.ZERO;
        for (Offer offer : group) {
            Price price = price(offer);
            if (price == null || price.getAmount() == null) {
                return null;
            }
            if (currency == null) {
                currency = price.getCurrency();
            } else if (currency != price.getCurrency()) {
                return null;
            }
            sum = sum.add(price.getAmount());
        }
        return currency == null ? null : new Price(sum, currency);
    }

    private boolean withinBudget(SearchIntent intent, Price total) {
        if (intent.getPreferences() == null || intent.getPreferences().getBudgetMax() == null) {
            return true;
        }
        return total.getAmount().compareTo(intent.getPreferences().getBudgetMax()) <= 0;
    }

    private boolean arrivesInTime(TransportOffer transport, EventOffer event) {
        if (transport.getArrival() == null || event.getStart() == null) {
            return false;
        }
        return !event.getStart().isBefore(transport.getArrival().plus(MIN_EVENT_GAP));
    }

    private boolean nearVenue(HotelOffer hotel, EventOffer event) {
        GeoPoint hotelPoint = hotel.getLocation() == null ? null : hotel.getLocation().getCoordinates();
        GeoPoint venuePoint = event.getVenue() == null ? null : event.getVenue().getCoordinates();
        if (hotelPoint == null || venuePoint == null) {
            return true;
        }
        return distanceKm(hotelPoint, venuePoint) <= MAX_DISTANCE_KM;
    }

    private double distanceKm(GeoPoint a, GeoPoint b) {
        double lat1 = Math.toRadians(a.getLatitude());
        double lat2 = Math.toRadians(b.getLatitude());
        double dLat = lat2 - lat1;
        double dLon = Math.toRadians(b.getLongitude() - a.getLongitude());
        double h = Math.pow(Math.sin(dLat / 2), 2)
                + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dLon / 2), 2);
        return 2 * 6371 * Math.asin(Math.sqrt(h));
    }

    private double score(List<Offer> group) {
        double score = 0.4;
        TransportOffer transport = find(group, TransportOffer.class);
        EventOffer event = find(group, EventOffer.class);
        HotelOffer hotel = find(group, HotelOffer.class);

        if (transport != null && transport.isDirect()) {
            score += 0.2;
        }
        if (hotel != null) {
            score += 0.2 * (hotel.getRating() / 5.0);
        }
        if (transport != null && event != null
                && transport.getArrival() != null && event.getStart() != null) {
            Duration gap = Duration.between(transport.getArrival(), event.getStart());
            score += gap.compareTo(COMFORT_EVENT_GAP) <= 0 ? 0.2 : 0.1;
        } else if (event != null && hotel != null) {
            score += 0.1;
        }
        return BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private List<String> tags(List<Offer> group) {
        List<String> tags = new ArrayList<>();
        String type = group.stream().map(this::typeName).collect(Collectors.joining(" + "));
        tags.add(type);
        TransportOffer transport = find(group, TransportOffer.class);
        if (transport != null && transport.isDirect()) {
            tags.add("direct");
        }
        HotelOffer hotel = find(group, HotelOffer.class);
        if (hotel != null && hotel.getRating() >= 4) {
            tags.add("top rated");
        }
        return List.copyOf(tags);
    }

    private String typeName(Offer offer) {
        if (offer instanceof TransportOffer transport) {
            return transport.getDomain() == null ? "TRANSPORT" : transport.getDomain().name();
        }
        if (offer instanceof EventOffer) {
            return "EVENT";
        }
        if (offer instanceof HotelOffer) {
            return "HOTEL";
        }
        return "OFFER";
    }

    private String id(List<Offer> group) {
        String key = group.stream()
                .map(this::offerId)
                .filter(Objects::nonNull)
                .sorted()
                .collect(Collectors.joining("|"));
        if (key.isEmpty()) {
            return UUID.randomUUID().toString();
        }
        return UUID.nameUUIDFromBytes(key.getBytes(StandardCharsets.UTF_8)).toString();
    }

    private String offerId(Offer offer) {
        if (offer instanceof TransportOffer transport) {
            return transport.getId();
        }
        if (offer instanceof EventOffer event) {
            return event.getId();
        }
        if (offer instanceof HotelOffer hotel) {
            return hotel.getId();
        }
        return null;
    }

    private Price price(Offer offer) {
        if (offer instanceof TransportOffer transport) {
            return transport.getPrice();
        }
        if (offer instanceof EventOffer event) {
            return event.getPrice();
        }
        if (offer instanceof HotelOffer hotel) {
            return hotel.getPrice();
        }
        return null;
    }

    private <T> List<T> filter(List<Offer> offers, Class<T> type) {
        return offers.stream().filter(type::isInstance).map(type::cast).toList();
    }

    private <T> T find(List<Offer> group, Class<T> type) {
        return group.stream().filter(type::isInstance).map(type::cast).findFirst().orElse(null);
    }
}
