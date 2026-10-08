package com.event.storm.task.core.session;

import com.event.storm.task.core.intent.SearchIntent;
import com.event.storm.task.core.result.SearchResult;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class SearchSession {

    private final UUID id;
    private final SearchIntent intent;
    private final SearchResult lastResult;
    private final List<ConversationMessage> messages;
}
