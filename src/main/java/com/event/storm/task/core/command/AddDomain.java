package com.event.storm.task.core.command;

import com.event.storm.task.core.models.intent.enums.DomainType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AddDomain implements RefineCommand {

    private final DomainType domain;
}
