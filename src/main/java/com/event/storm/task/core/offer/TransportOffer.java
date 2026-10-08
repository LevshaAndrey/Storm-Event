package com.event.storm.task.core.offer;

import com.event.storm.task.core.intent.enums.DomainType;
import com.event.storm.task.core.offer.enums.Source;
import com.event.storm.task.core.route.Location;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class TransportOffer implements Offer {

    private final String id;
    private final DomainType domain;
    private final Source source;
    private final String title;
    private final Location from;
    private final Location to;
    private final Instant departure;
    private final Instant arrival;
    private final Price price;
    private final boolean direct;
    private final String url;
}
