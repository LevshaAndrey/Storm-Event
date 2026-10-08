package com.event.storm.task.core.port;

import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.offer.Offer;
import com.event.storm.task.core.models.offer.enums.Source;

import java.util.List;

public interface SearchProvider {

    boolean supports(DomainType domain);

    Source source();

    List<Offer> search(SearchIntent intent);
}
