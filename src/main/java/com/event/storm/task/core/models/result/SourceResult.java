package com.event.storm.task.core.models.result;

import com.event.storm.task.core.models.offer.enums.Source;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SourceResult {

    private final Source source;
    private final SourceStatus status;
    private final int resultCount;
    private final String error;
}
