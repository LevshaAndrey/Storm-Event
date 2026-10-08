package com.event.storm.task.core.models.intent;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DateRange {

    private final LocalDate from;
    private final LocalDate to;
}
