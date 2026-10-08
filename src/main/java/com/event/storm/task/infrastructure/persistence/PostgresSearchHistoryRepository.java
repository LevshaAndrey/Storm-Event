package com.event.storm.task.infrastructure.persistence;

import com.event.storm.task.core.models.result.SearchResult;
import com.event.storm.task.core.port.SearchHistoryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class PostgresSearchHistoryRepository implements SearchHistoryRepository {

    private final SearchHistoryJpaRepository repository;
    private final ObjectMapper objectMapper;

    public PostgresSearchHistoryRepository(SearchHistoryJpaRepository repository,
                                           ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void save(UUID sessionId, SearchResult result) {
        repository.save(SearchHistoryEntity.of(sessionId, write(result)));
    }

    @Override
    public Optional<SearchResult> findLast(UUID sessionId) {
        return repository.findFirstBySessionIdOrderByCreatedAtDesc(sessionId)
                .flatMap(entity -> {
                    try {
                        return Optional.of(
                                objectMapper.readValue(entity.getPayload(), SearchResult.class));
                    } catch (JsonProcessingException e) {
                        throw new IllegalStateException(
                                "Не удалось прочитать историю сессии " + sessionId, e);
                    }
                });
    }

    private String write(SearchResult result) {
        try {
            return objectMapper.writeValueAsString(result);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Не удалось сериализовать результат поиска", e);
        }
    }
}
