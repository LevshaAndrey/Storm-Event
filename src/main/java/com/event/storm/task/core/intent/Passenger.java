package com.event.storm.task.core.intent;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class Passenger {

    private final int adults;
    private final int children;
}
