package com.event.storm.task.infrastructure.parser;

import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.offer.Offer;
import com.event.storm.task.core.models.offer.enums.Source;
import com.event.storm.task.core.port.SearchProvider;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TicketProProvider implements SearchProvider {

    @Override
    public Source source() {
        return Source.TICKET_PRO;
    }

    @Override
    public boolean supports(DomainType domain) {
        return domain == DomainType.EVENT;
    }

    @Override
    public List<Offer> search(SearchIntent intent) {
        return List.of();
    }
}
