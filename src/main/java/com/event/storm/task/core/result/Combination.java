package com.event.storm.task.core.result;

import com.event.storm.task.core.offer.Offer;
import com.event.storm.task.core.offer.Price;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class Combination {

    private final String id;
    private final List<Offer> offers;
    private final Price totalPrice;
    private final double score;
    private final List<String> tags;
}
