package com.event.storm.task.core.port;

import com.event.storm.task.core.models.session.SearchSession;

import java.util.Optional;
import java.util.UUID;

public interface SessionRepository {

    Optional<SearchSession> find(UUID id);

    SearchSession save(SearchSession session);
}
