package com.event.storm.task.infrastructure.persistence;

import com.event.storm.task.core.models.session.SearchSession;
import com.event.storm.task.core.port.SessionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PostgresSessionRepository implements SessionRepository {

    private final SessionJpaRepository repository;
    private final ObjectMapper objectMapper;

    public PostgresSessionRepository(SessionJpaRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Override
    public Optional<SearchSession> find(UUID id) {
        return repository.findById(id).flatMap(entity -> {
            try {
                return Optional.of(objectMapper.readValue(entity.getPayload(), SearchSession.class));
            } catch (JsonProcessingException e) {
                throw new IllegalStateException("Не удалось прочитать сессию " + id, e);
            }
        });
    }

    @Override
    public SearchSession save(SearchSession session) {
        repository.save(new SessionEntity(session.getId(), write(session), Instant.now()));
        return session;
    }

    private String write(SearchSession session) {
        try {
            return objectMapper.writeValueAsString(session);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Не удалось сериализовать сессию " + session.getId(), e);
        }
    }
}
