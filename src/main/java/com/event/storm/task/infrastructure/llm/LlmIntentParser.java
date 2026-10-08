package com.event.storm.task.infrastructure.llm;

import com.event.storm.task.core.command.ChangeBudget;
import com.event.storm.task.core.command.ChangeDates;
import com.event.storm.task.core.command.ChangeHotelCriteria;
import com.event.storm.task.core.command.ChangePassengers;
import com.event.storm.task.core.command.ChangeSort;
import com.event.storm.task.core.command.AddDomain;
import com.event.storm.task.core.command.NewSearchCommand;
import com.event.storm.task.core.command.PreviousResultCommand;
import com.event.storm.task.core.command.RefineCommand;
import com.event.storm.task.core.command.ResetCommand;
import com.event.storm.task.core.command.UserCommand;
import com.event.storm.task.core.models.intent.DateRange;
import com.event.storm.task.core.models.intent.EventCriteria;
import com.event.storm.task.core.models.intent.Passenger;
import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.intent.SearchPreferences;
import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.intent.enums.SortType;
import com.event.storm.task.core.models.route.Location;
import com.event.storm.task.core.models.route.Route;
import com.event.storm.task.core.models.session.SearchSession;
import com.event.storm.task.core.port.IntentParser;
import com.event.storm.task.infrastructure.parser.RuleBasedIntentParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

@Slf4j
@Component
@Primary
@ConditionalOnProperty(prefix = "app.llm", name = "enabled", havingValue = "true")
public class LlmIntentParser implements IntentParser {

    private static final String SYSTEM_PROMPT = """
            Ты парсер команд поиска транспорта, событий и отелей.
            Ответь ТОЛЬКО JSON без пояснений:
            {
              "command": "new_search | refine_dates | refine_budget | refine_sort | add_domain | refine_passengers | refine_hotel | reset | previous",
              "domains": ["BUS", "TRAIN", "EVENT", "HOTEL"],
              "from": "YYYY-MM-DD",
              "to": "YYYY-MM-DD",
              "fromCity": "название",
              "toCity": "название",
              "adults": 1,
              "children": 0,
              "budget": 300,
              "sort": "CHEAPEST | FASTEST | BEST",
              "minRating": 4
            }
            Неизвестные поля опускай. Поля refine_* используй только для уточнения активного поиска.
            """;

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;
    private final RuleBasedIntentParser fallback;

    public LlmIntentParser(ChatClient.Builder chatClientBuilder,
                           ObjectMapper objectMapper,
                           RuleBasedIntentParser fallback) {
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
        this.fallback = fallback;
    }

    @Override
    public UserCommand parse(String text, SearchSession session) {
        try {
            String answer = chatClient.prompt()
                    .system(SYSTEM_PROMPT)
                    .user(text == null ? "" : text)
                    .call()
                    .content();
            log.debug("LLM raw answer: {}", answer);
            UserCommand command = map(objectMapper.readTree(extractJson(answer)), text);
            log.info("LLM parsed '{}' -> {}", text, command.getClass().getSimpleName());
            return command;
        } catch (Exception e) {
            log.warn("LLM parse failed for '{}': {} — fallback to rules", text, e.toString());
            return fallback.parse(text, session);
        }
    }

    private UserCommand map(JsonNode node, String text) {
        String command = node.path("command").asText("new_search").toLowerCase(Locale.ROOT);

        if (command.contains("reset")) {
            return new ResetCommand();
        }
        if (command.contains("previous")) {
            return new PreviousResultCommand();
        }
        if (command.contains("refine")) {
            RefineCommand refine = refine(node, command);
            if (refine != null) {
                return refine;
            }
        }
        return new NewSearchCommand(intent(node, text));
    }

    private RefineCommand refine(JsonNode node, String command) {
        if (command.contains("dates")) {
            LocalDate from = date(node, "from");
            LocalDate to = date(node, "to");
            if (from != null) {
                return new ChangeDates(from, to);
            }
        }
        if (command.contains("budget") && node.hasNonNull("budget")) {
            return new ChangeBudget(node.get("budget").decimalValue());
        }
        if (command.contains("sort") && node.hasNonNull("sort")) {
            return new ChangeSort(SortType.valueOf(node.get("sort").asText().toUpperCase(Locale.ROOT)));
        }
        if (command.contains("domain") && node.hasNonNull("domains") && node.get("domains").isArray()
                && !node.get("domains").isEmpty()) {
            return new AddDomain(
                    DomainType.valueOf(node.get("domains").get(0).asText().toUpperCase(Locale.ROOT)));
        }
        if (command.contains("passenger")) {
            return new ChangePassengers(node.path("adults").asInt(1), node.path("children").asInt(0));
        }
        if (command.contains("hotel")) {
            Integer minRating = node.hasNonNull("minRating") ? node.get("minRating").asInt() : null;
            return new ChangeHotelCriteria(minRating, minRating, null, null);
        }
        return null;
    }

    private SearchIntent intent(JsonNode node, String text) {
        Set<DomainType> domains = new LinkedHashSet<>();
        if (node.has("domains") && node.get("domains").isArray()) {
            for (JsonNode domain : node.get("domains")) {
                domains.add(DomainType.valueOf(domain.asText().toUpperCase(Locale.ROOT)));
            }
        }

        Route route = null;
        if (node.hasNonNull("fromCity") && node.hasNonNull("toCity")) {
            route = new Route(
                    new Location(null, node.get("fromCity").asText(), null),
                    new Location(null, node.get("toCity").asText(), null));
        }

        LocalDate from = date(node, "from");
        DateRange dates = from == null ? null : new DateRange(from, date(node, "to") == null ? from : date(node, "to"));

        Passenger passenger = node.has("adults") || node.has("children")
                ? new Passenger(node.path("adults").asInt(1), node.path("children").asInt(0))
                : null;

        SearchPreferences preferences = null;
        if (node.hasNonNull("budget") || node.hasNonNull("sort")) {
            preferences = new SearchPreferences(
                    node.hasNonNull("sort")
                            ? SortType.valueOf(node.get("sort").asText().toUpperCase(Locale.ROOT))
                            : null,
                    node.hasNonNull("budget") ? new BigDecimal(node.get("budget").asText()) : null,
                    false,
                    false
            );
        }

        EventCriteria event = domains.contains(DomainType.EVENT) ? new EventCriteria(text, null) : null;

        return new SearchIntent(
                Set.copyOf(domains), route, dates, passenger, null, event, null, preferences);
    }

    private LocalDate date(JsonNode node, String field) {
        if (!node.hasNonNull(field)) {
            return null;
        }
        try {
            return LocalDate.parse(node.get(field).asText());
        } catch (RuntimeException e) {
            return null;
        }
    }

    private String extractJson(String answer) {
        if (answer == null) {
            throw new IllegalArgumentException("пустой ответ LLM");
        }
        int start = answer.indexOf('{');
        int end = answer.lastIndexOf('}');
        if (start < 0 || end <= start) {
            throw new IllegalArgumentException("в ответе LLM нет JSON");
        }
        return answer.substring(start, end + 1);
    }
}
