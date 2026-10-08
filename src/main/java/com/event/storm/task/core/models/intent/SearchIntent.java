package com.event.storm.task.core.models.intent;

import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.route.Route;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Set;

@Getter
@AllArgsConstructor
public class SearchIntent {

    private final Set<DomainType> domains;
    private final Route route;
    private final DateRange dates;
    private final Passenger passenger;
    private final TransportCriteria transport;
    private final EventCriteria event;
    private final HotelCriteria hotel;
    private final SearchPreferences preferences;
}
