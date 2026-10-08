package com.event.storm.task.core.command;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChangeHotelCriteria implements RefineCommand {

    private final Integer minRating;
    private final Integer maxRating;
    private final Boolean nearVenue;
    private final Boolean center;
}
