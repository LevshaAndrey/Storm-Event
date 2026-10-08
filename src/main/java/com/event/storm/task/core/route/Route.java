package com.event.storm.task.core.route;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class Route {

    private final Location from;
    private final Location to;
}
