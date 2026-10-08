package com.event.storm.task.core.port;

import com.event.storm.task.core.command.UserCommand;
import com.event.storm.task.core.models.session.SearchSession;

public interface IntentParser {

    UserCommand parse(String text, SearchSession session);
}
