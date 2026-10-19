package com.event.storm.task.core.command;

import com.event.storm.task.core.models.intent.enums.TimeWindow;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChangeTransportCriteria implements RefineCommand {

    private final Boolean directOnly;
    private final TimeWindow window;
    private final TimeWindow excludeWindow;
}
