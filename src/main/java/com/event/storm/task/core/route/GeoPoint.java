package com.event.storm.task.core.route;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GeoPoint {

    private final double latitude;
    private final double longitude;
}
