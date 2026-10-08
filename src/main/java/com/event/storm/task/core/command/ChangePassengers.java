package com.event.storm.task.core.command;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChangePassengers implements RefineCommand {

    private final int adults;
    private final int children;
}
