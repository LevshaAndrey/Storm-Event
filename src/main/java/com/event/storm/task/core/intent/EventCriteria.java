package com.event.storm.task.core.intent;

import com.event.storm.task.core.intent.enums.TimeWindow;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EventCriteria {

    private final String query;
    private final TimeWindow window;
}
