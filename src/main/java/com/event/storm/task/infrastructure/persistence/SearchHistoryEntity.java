package com.event.storm.task.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "search_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class SearchHistoryEntity {

    @Id
    private UUID id;

    private UUID sessionId;

    @Column(length = 1_000_000)
    private String payload;

    private Instant createdAt;

    public static SearchHistoryEntity of(UUID sessionId, String payload) {
        return new SearchHistoryEntity(UUID.randomUUID(), sessionId, payload, Instant.now());
    }
}
