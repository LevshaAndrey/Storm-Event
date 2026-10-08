package com.event.storm.task.core.intent;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class HotelCriteria {

    private final Integer minRating;
    private final Integer maxRating;
    private final boolean nearVenue;
    private final boolean center;
}
