package com.event.storm.task.core.result;

import com.event.storm.task.core.offer.enums.Source;
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
