package com.event.storm.task.core.command;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChangeBudget implements RefineCommand {

    private final BigDecimal budgetMax;
}
