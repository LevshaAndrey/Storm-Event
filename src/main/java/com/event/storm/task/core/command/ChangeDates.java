package com.event.storm.task.core.command;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChangeDates implements RefineCommand {

    private final LocalDate from;
    private final LocalDate to;
}
