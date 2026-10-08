package com.event.storm.task.core.models.session;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class ConversationMessage {

    private final MessageRole role;
    private final String text;
    private final Instant createdAt;
}
