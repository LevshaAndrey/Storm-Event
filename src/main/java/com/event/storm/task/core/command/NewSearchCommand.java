package com.event.storm.task.core.command;

import com.event.storm.task.core.models.intent.SearchIntent;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NewSearchCommand implements UserCommand {

    private final SearchIntent intent;
}
