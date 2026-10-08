package com.event.storm.task.core.intent;

import com.event.storm.task.core.intent.enums.TimeWindow;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TransportCriteria {

    private final boolean directOnly;
    private final TimeWindow window;
    private final TimeWindow excludeWindow;
}
