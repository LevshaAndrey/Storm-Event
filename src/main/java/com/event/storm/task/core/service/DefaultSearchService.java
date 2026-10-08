package com.event.storm.task.core.service;

import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.offer.Offer;
import com.event.storm.task.core.models.result.Combination;
import com.event.storm.task.core.models.result.SearchResult;
import com.event.storm.task.core.models.result.SourceResult;
import com.event.storm.task.core.models.result.SourceStatus;
import com.event.storm.task.core.port.SearchProvider;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class DefaultSearchService implements SearchService {

    private final List<SearchProvider> providers;
    private final CombinationService combinationService;

    public DefaultSearchService(List<SearchProvider> providers,
                                CombinationService combinationService) {
        this.providers = providers;
        this.combinationService = combinationService;
    }

    @Override
    public SearchResult search(SearchIntent intent) {
        Set<DomainType> domains = intent.getDomains() == null ? Set.of() : intent.getDomains();

        List<Offer> offers = new ArrayList<>();
        List<SourceResult> sources = new ArrayList<>();

        for (SearchProvider provider : providers) {
            if (!domains.isEmpty() && domains.stream().noneMatch(provider::supports)) {
                continue;
            }
            try {
                List<Offer> found = provider.search(intent);
                if (found == null || found.isEmpty()) {
                    sources.add(new SourceResult(provider.source(), SourceStatus.EMPTY, 0, null));
                } else {
                    offers.addAll(found);
                    sources.add(new SourceResult(provider.source(), SourceStatus.SUCCESS, found.size(), null));
                }
            } catch (Exception e) {
                sources.add(new SourceResult(provider.source(), SourceStatus.FAILED, 0, e.getMessage()));
            }
        }

        List<Combination> combinations = combinationService.build(intent, offers);
        return new SearchResult(intent, offers, combinations, sources);
    }
}
