package com.event.storm.task.application;

import com.event.storm.task.core.command.NewSearchCommand;
import com.event.storm.task.core.command.PreviousResultCommand;
import com.event.storm.task.core.command.RefineCommand;
import com.event.storm.task.core.command.ResetCommand;
import com.event.storm.task.core.command.UserCommand;
import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.offer.Offer;
import com.event.storm.task.core.models.result.SearchResult;
import com.event.storm.task.core.models.result.SourceResult;
import com.event.storm.task.core.models.session.ConversationMessage;
import com.event.storm.task.core.models.session.MessageRole;
import com.event.storm.task.core.models.session.SearchSession;
import com.event.storm.task.core.port.IntentParser;
import com.event.storm.task.core.port.SearchHistoryRepository;
import com.event.storm.task.core.port.SessionRepository;
import com.event.storm.task.core.service.RefineService;
import com.event.storm.task.core.service.SearchService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ChatApplicationService {

    private static final int MAX_MESSAGES = 50;

    private final SessionRepository sessionRepository;
    private final IntentParser intentParser;
    private final SearchService searchService;
    private final RefineService refineService;
    private final SearchHistoryRepository historyRepository;

    public ChatApplicationService(SessionRepository sessionRepository,
                                  IntentParser intentParser,
                                  SearchService searchService,
                                  RefineService refineService,
                                  SearchHistoryRepository historyRepository) {
        this.sessionRepository = sessionRepository;
        this.intentParser = intentParser;
        this.searchService = searchService;
        this.refineService = refineService;
        this.historyRepository = historyRepository;
    }

    public String handle(UUID userId, String text) {
        SearchSession session = sessionRepository.find(userId)
                .orElseGet(() -> new SearchSession(userId, null, null, new ArrayList<>()));

        UserCommand command;
        try {
            command = intentParser.parse(text, session);
        } catch (Exception e) {
            return "Не удалось разобрать запрос: " + e.getMessage();
        }

        if (command instanceof ResetCommand) {
            String response = "Поиск сброшен. Отправьте новый запрос.";
            sessionRepository.save(withMessages(session, null, null, text, response));
            return response;
        }

        if (command instanceof PreviousResultCommand) {
            if (session.getLastResult() == null) {
                return "Предыдущих результатов нет.";
            }
            String response = format(session.getLastResult());
            sessionRepository.save(withMessages(
                    session, session.getIntent(), session.getLastResult(), text, response));
            return response;
        }

        SearchIntent intent;
        if (command instanceof NewSearchCommand newSearch) {
            intent = newSearch.getIntent();
        } else if (command instanceof RefineCommand refine) {
            if (session.getIntent() == null) {
                return "Активного поиска нет. Отправьте новый запрос.";
            }
            try {
                intent = refineService.refine(session.getIntent(), refine);
            } catch (IllegalArgumentException e) {
                return e.getMessage();
            }
        } else {
            return "Неизвестная команда.";
        }

        SearchResult result = searchService.search(intent);
        historyRepository.save(userId, result);

        String response = format(result);
        sessionRepository.save(withMessages(session, intent, result, text, response));
        return response;
    }

    private SearchSession withMessages(SearchSession session,
                                       SearchIntent intent,
                                       SearchResult result,
                                       String userText,
                                       String response) {
        List<ConversationMessage> messages = session.getMessages() == null
                ? new ArrayList<>()
                : new ArrayList<>(session.getMessages());
        Instant now = Instant.now();
        if (userText != null && !userText.isBlank()) {
            messages.add(new ConversationMessage(MessageRole.USER, userText, now));
        }
        messages.add(new ConversationMessage(MessageRole.ASSISTANT, response, now));
        if (messages.size() > MAX_MESSAGES) {
            messages = new ArrayList<>(messages.subList(messages.size() - MAX_MESSAGES, messages.size()));
        }
        return new SearchSession(session.getId(), intent, result, messages);
    }

    private String format(SearchResult result) {
        StringBuilder sb = new StringBuilder();
        sb.append("Найдено предложений: ").append(result.getOffers().size());
        sb.append(", комбинаций: ").append(result.getCombinations().size()).append(".\n");

        for (SourceResult source : result.getSources()) {
            sb.append("- ").append(source.getSource()).append(": ").append(source.getStatus());
            if (source.getStatus() != null && source.getStatus().name().equals("FAILED")
                    && source.getError() != null) {
                sb.append(" (").append(source.getError()).append(")");
            } else {
                sb.append(" (").append(source.getResultCount()).append(")");
            }
            sb.append("\n");
        }

        int limit = Math.min(5, result.getOffers().size());
        for (int i = 0; i < limit; i++) {
            Offer offer = result.getOffers().get(i);
            sb.append(formatOffer(offer)).append("\n");
        }
        if (result.getOffers().size() > limit) {
            sb.append("... и ещё ").append(result.getOffers().size() - limit).append("\n");
        }
        return sb.toString().strip();
    }

    private String formatOffer(Offer offer) {
        String title;
        String price = "";
        if (offer instanceof com.event.storm.task.core.models.offer.TransportOffer transport) {
            title = transport.getTitle() + ": " + transport.getFrom().getName()
                    + " → " + transport.getTo().getName();
            price = formatPrice(transport.getPrice());
        } else if (offer instanceof com.event.storm.task.core.models.offer.EventOffer event) {
            title = event.getTitle() + " @ " + event.getVenue().getName();
            price = formatPrice(event.getPrice());
        } else if (offer instanceof com.event.storm.task.core.models.offer.HotelOffer hotel) {
            title = hotel.getTitle() + " (" + hotel.getRating() + "*)";
            price = formatPrice(hotel.getPrice());
        } else {
            title = offer.toString();
        }

        return (price.isEmpty() ? title : title + " — " + price);
    }

    private String formatPrice(com.event.storm.task.core.models.offer.Price price) {
        if (price == null || price.getAmount() == null) {
            return "";
        }
        return price.getAmount().toPlainString() + " " + price.getCurrency();
    }
}
