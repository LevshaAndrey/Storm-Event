package com.event.storm.task.core.service;

import com.event.storm.task.core.command.AddDomain;
import com.event.storm.task.core.command.ChangeBudget;
import com.event.storm.task.core.command.ChangeDates;
import com.event.storm.task.core.command.ChangeHotelCriteria;
import com.event.storm.task.core.command.ChangePassengers;
import com.event.storm.task.core.command.ChangeSort;
import com.event.storm.task.core.command.ChangeTransportCriteria;
import com.event.storm.task.core.command.RefineCommand;
import com.event.storm.task.core.command.RemoveDomain;
import com.event.storm.task.core.models.intent.DateRange;
import com.event.storm.task.core.models.intent.HotelCriteria;
import com.event.storm.task.core.models.intent.Passenger;
import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.intent.SearchPreferences;
import com.event.storm.task.core.models.intent.TransportCriteria;
import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.intent.enums.SortType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Service
public class DefaultRefineService implements RefineService {

    @Override
    public SearchIntent refine(SearchIntent current, RefineCommand command) {
        if (current == null) {
            throw new IllegalArgumentException("Нет активного запроса для уточнения");
        }
        if (command instanceof ChangeDates dates) {
            return changeDates(current, dates);
        }
        if (command instanceof ChangeBudget budget) {
            return changeBudget(current, budget);
        }
        if (command instanceof ChangeSort sort) {
            return changeSort(current, sort);
        }
        if (command instanceof AddDomain addDomain) {
            return addDomain(current, addDomain);
        }
        if (command instanceof RemoveDomain removeDomain) {
            return removeDomain(current, removeDomain);
        }
        if (command instanceof ChangePassengers passengers) {
            return changePassengers(current, passengers);
        }
        if (command instanceof ChangeTransportCriteria criteria) {
            return changeTransportCriteria(current, criteria);
        }
        if (command instanceof ChangeHotelCriteria criteria) {
            return changeHotelCriteria(current, criteria);
        }
        return current;
    }

    private SearchIntent changeDates(SearchIntent current, ChangeDates command) {
        DateRange dates = current.getDates();
        LocalDate from = command.getFrom() != null
                ? command.getFrom()
                : dates != null ? dates.getFrom() : null;
        if (from == null) {
            return current;
        }
        LocalDate to = command.getTo() != null ? command.getTo() : from;
        return rebuild(current, new DateRange(from, to));
    }

    private SearchIntent changeBudget(SearchIntent current, ChangeBudget command) {
        SearchPreferences old = current.getPreferences();
        SearchPreferences updated = new SearchPreferences(
                old != null ? old.getSort() : null,
                command.getBudgetMax() != null ? command.getBudgetMax()
                        : old != null ? old.getBudgetMax() : null,
                old != null && old.isCompare(),
                old != null && old.isGeoView()
        );
        return rebuild(current, updated);
    }

    private SearchIntent changeSort(SearchIntent current, ChangeSort command) {
        SearchPreferences old = current.getPreferences();
        SortType sort = command.getSort() != null
                ? command.getSort()
                : old != null ? old.getSort() : null;
        SearchPreferences updated = new SearchPreferences(
                sort,
                old != null ? old.getBudgetMax() : null,
                old != null && old.isCompare(),
                old != null && old.isGeoView()
        );
        return rebuild(current, updated);
    }

    private SearchIntent addDomain(SearchIntent current, AddDomain command) {
        Set<DomainType> domains = current.getDomains() == null
                ? new LinkedHashSet<>()
                : new LinkedHashSet<>(current.getDomains());
        domains.add(command.getDomain());
        return new SearchIntent(
                Set.copyOf(domains),
                current.getRoute(),
                current.getDates(),
                current.getPassenger(),
                current.getTransport(),
                current.getEvent(),
                current.getHotel(),
                current.getPreferences()
        );
    }

    private SearchIntent removeDomain(SearchIntent current, RemoveDomain command) {
        Set<DomainType> domains = current.getDomains() == null
                ? new LinkedHashSet<>()
                : new LinkedHashSet<>(current.getDomains());
        domains.remove(command.getDomain());
        return new SearchIntent(
                Set.copyOf(domains),
                current.getRoute(),
                current.getDates(),
                current.getPassenger(),
                current.getTransport(),
                current.getEvent(),
                current.getHotel(),
                current.getPreferences()
        );
    }

    private SearchIntent changePassengers(SearchIntent current, ChangePassengers command) {
        return rebuild(current, new Passenger(command.getAdults(), command.getChildren()));
    }

    private SearchIntent changeTransportCriteria(SearchIntent current, ChangeTransportCriteria command) {
        TransportCriteria old = current.getTransport();
        TransportCriteria updated = new TransportCriteria(
                command.getDirectOnly() != null ? command.getDirectOnly()
                        : old != null && old.isDirectOnly(),
                command.getWindow() != null ? command.getWindow()
                        : old != null ? old.getWindow() : null,
                command.getExcludeWindow() != null ? command.getExcludeWindow()
                        : old != null ? old.getExcludeWindow() : null
        );
        return new SearchIntent(
                current.getDomains(),
                current.getRoute(),
                current.getDates(),
                current.getPassenger(),
                updated,
                current.getEvent(),
                current.getHotel(),
                current.getPreferences()
        );
    }

    private SearchIntent changeHotelCriteria(SearchIntent current, ChangeHotelCriteria command) {
        HotelCriteria old = current.getHotel();
        HotelCriteria updated = new HotelCriteria(
                command.getMinRating() != null ? command.getMinRating()
                        : old != null ? old.getMinRating() : null,
                command.getMaxRating() != null ? command.getMaxRating()
                        : old != null ? old.getMaxRating() : null,
                command.getNearVenue() != null ? command.getNearVenue()
                        : old != null && old.isNearVenue(),
                command.getCenter() != null ? command.getCenter()
                        : old != null && old.isCenter()
        );
        return new SearchIntent(
                current.getDomains(),
                current.getRoute(),
                current.getDates(),
                current.getPassenger(),
                current.getTransport(),
                current.getEvent(),
                updated,
                current.getPreferences()
        );
    }

    private SearchIntent rebuild(SearchIntent current, DateRange dates) {
        return new SearchIntent(
                current.getDomains(), current.getRoute(), dates, current.getPassenger(),
                current.getTransport(), current.getEvent(), current.getHotel(),
                current.getPreferences()
        );
    }

    private SearchIntent rebuild(SearchIntent current, Passenger passenger) {
        return new SearchIntent(
                current.getDomains(), current.getRoute(), current.getDates(), passenger,
                current.getTransport(), current.getEvent(), current.getHotel(),
                current.getPreferences()
        );
    }

    private SearchIntent rebuild(SearchIntent current, SearchPreferences preferences) {
        return new SearchIntent(
                current.getDomains(), current.getRoute(), current.getDates(), current.getPassenger(),
                current.getTransport(), current.getEvent(), current.getHotel(), preferences
        );
    }
}
