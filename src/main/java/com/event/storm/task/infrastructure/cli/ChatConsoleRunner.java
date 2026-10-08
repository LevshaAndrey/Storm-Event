package com.event.storm.task.infrastructure.cli;

import com.event.storm.task.application.ChatApplicationService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
@ConditionalOnProperty(prefix = "app.console", name = "enabled", havingValue = "true")
public class ChatConsoleRunner implements CommandLineRunner {

    private static final UUID LOCAL_USER = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private final ChatApplicationService chatService;

    public ChatConsoleRunner(ChatApplicationService chatService) {
        this.chatService = chatService;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Чат-консоль. Пишите запрос, 'сброс' — очистить поиск, 'выход' — закрыть.");
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
        String line;
        while ((line = in.readLine()) != null) {
            line = line.strip();
            if (line.isEmpty()) {
                continue;
            }
            if (line.equalsIgnoreCase("выход") || line.equalsIgnoreCase("exit")) {
                break;
            }
            String response;
            try {
                response = chatService.handle(LOCAL_USER, line);
            } catch (Exception e) {
                response = "Ошибка: " + e.getMessage();
            }
            System.out.println(response);
            System.out.println();
        }
    }
}
