package com.event.storm.task.core.intent;

import com.event.storm.task.core.intent.enums.SortType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class SearchPreferences {

    private final SortType sort;
    private final BigDecimal budgetMax;
    private final boolean compare;
    private final boolean geoView;
}
