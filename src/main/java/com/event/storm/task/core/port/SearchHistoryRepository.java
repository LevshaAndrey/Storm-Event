package com.event.storm.task.core.port;

import com.event.storm.task.core.models.result.SearchResult;

import java.util.Optional;
import java.util.UUID;

public interface SearchHistoryRepository {

    void save(UUID sessionId, SearchResult result);

    Optional<SearchResult> findLast(UUID sessionId);
}
