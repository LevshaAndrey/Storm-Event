package com.event.storm.task.core.result;

import com.event.storm.task.core.intent.SearchIntent;
import com.event.storm.task.core.offer.Offer;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class SearchResult {

    private final SearchIntent intent;
    private final List<Offer> offers;
    private final List<Combination> combinations;
    private final List<SourceResult> sources;
}
