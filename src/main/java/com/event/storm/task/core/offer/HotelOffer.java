package com.event.storm.task.core.offer;

import com.event.storm.task.core.offer.enums.Source;
import com.event.storm.task.core.route.Location;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class HotelOffer implements Offer {

    private final String id;
    private final Source source;
    private final String title;
    private final Location location;
    private final int rating;
    private final Price price;
    private final String url;
}
