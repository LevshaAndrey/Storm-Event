package com.event.storm.task.application;

import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.port.SearchHistoryRepository;
import com.event.storm.task.core.port.SessionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ChatApplicationServiceTest {

    @Autowired
    private ChatApplicationService chatService;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private SearchHistoryRepository historyRepository;

    @Test
    void fullUserFlow() {
        UUID user = UUID.randomUUID();

        String first = chatService.handle(user, "автобус из Минска в Гомель завтра");
        assertThat(first).contains("Найдено предложений");
        assertThat(first).contains("ATLAS");
        assertThat(sessionRepository.find(user)).isPresent();
        assertThat(historyRepository.findLast(user)).isPresent();

        String refined = chatService.handle(user, "ещё ребёнок");
        assertThat(refined).contains("Найдено предложений");
        SearchIntent intent = sessionRepository.find(user).orElseThrow().getIntent();
        assertThat(intent.getPassenger().getChildren()).isEqualTo(1);
        assertThat(intent.getDomains()).contains(
                com.event.storm.task.core.models.intent.enums.DomainType.BUS);

        String previous = chatService.handle(user, "предыдущий");
        assertThat(previous).contains("Найдено предложений");

        String reset = chatService.handle(user, "сброс");
        assertThat(reset).contains("сброшен");
        assertThat(sessionRepository.find(user).orElseThrow().getIntent()).isNull();

        String afterReset = chatService.handle(user, "ещё ребёнок");
        assertThat(afterReset).contains("Найдено предложений");
        assertThat(sessionRepository.find(user).orElseThrow().getIntent()).isNotNull();
    }

    @Test
    void failedSourceDoesNotBreakSearch() {
        UUID user = UUID.randomUUID();

        String response = chatService.handle(user, "поезд из Гомеля в Минск");

        assertThat(response).contains("BZD");
        assertThat(response).contains("Найдено предложений");
    }
}
