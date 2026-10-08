package com.event.storm.task.core.service;

import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.offer.Offer;
import com.event.storm.task.core.models.result.Combination;

import java.util.List;

public interface CombinationService {

    List<Combination> build(SearchIntent intent, List<Offer> offers);
}
