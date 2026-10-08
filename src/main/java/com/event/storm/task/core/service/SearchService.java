package com.event.storm.task.core.service;

import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.result.SearchResult;

public interface SearchService {
    SearchResult search(SearchIntent intent);
}
