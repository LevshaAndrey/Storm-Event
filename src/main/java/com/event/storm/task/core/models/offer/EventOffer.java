package com.event.storm.task.core.models.offer;

import com.event.storm.task.core.models.offer.enums.Source;
import com.event.storm.task.core.models.route.Location;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@NoArgsConstructor(force = true)
@AllArgsConstructor
public class EventOffer implements Offer {

    private final String id;
    private final Source source;
    private final String title;
    private final Location venue;
    private final Instant start;
    private final Instant end;
    private final Price price;
    private final String category;
    private final String url;
}
