package com.event.storm.task.core.service;

import com.event.storm.task.core.command.RefineCommand;
import com.event.storm.task.core.models.intent.SearchIntent;

public interface RefineService {

    SearchIntent refine(SearchIntent current, RefineCommand command);
}
