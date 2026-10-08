package com.event.storm.task.core.models.offer;

import com.event.storm.task.core.models.offer.enums.Currency;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class Price {

    private final BigDecimal amount;
    private final Currency currency;
}
