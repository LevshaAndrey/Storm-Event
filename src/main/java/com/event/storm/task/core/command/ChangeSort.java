package com.event.storm.task.core.command;

import com.event.storm.task.core.models.intent.enums.SortType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChangeSort implements RefineCommand {

    private final SortType sort;
}
