package com.event.storm.task.core.models.route;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class Location {

    private final String id;
    private final String name;
    private final GeoPoint coordinates;
}
