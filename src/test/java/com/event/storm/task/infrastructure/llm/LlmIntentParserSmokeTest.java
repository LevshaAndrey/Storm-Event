package com.event.storm.task.infrastructure.llm;

import com.event.storm.task.application.ChatApplicationService;
import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.port.IntentParser;
import com.event.storm.task.core.port.SessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "app.llm.enabled=true")
@EnabledIfEnvironmentVariable(named = "OPENROUTER_API_KEY", matches = ".+")
class LlmIntentParserSmokeTest {

    @Autowired
    private ChatApplicationService chatService;

    @Autowired
    private IntentParser intentParser;

    @Autowired
    private SessionRepository sessionRepository;

    @Test
    void llmParserIsActive() {
        assertThat(intentParser).isInstanceOf(LlmIntentParser.class);
    }

    @Test
    void newSearchAndRefineThroughOpenRouter() {
        UUID user = UUID.randomUUID();

        String first = chatService.handle(user, "автобус из Минска в Гомель завтра, бюджет 200");
        System.out.println("SMOKE 1:\n" + first);
        assertThat(first).contains("Найдено предложений");
        SearchIntent intent = sessionRepository.find(user).orElseThrow().getIntent();
        assertThat(intent.getRoute()).isNotNull();
        assertThat(intent.getRoute().getFrom().getName()).containsIgnoringCase("Минск");

        String refined = chatService.handle(user, "ещё ребёнок");
        System.out.println("SMOKE 2:\n" + refined);
        assertThat(refined).contains("Найдено предложений");
        assertThat(sessionRepository.find(user).orElseThrow().getIntent()
                .getPassenger().getChildren()).isEqualTo(1);
    }
}
