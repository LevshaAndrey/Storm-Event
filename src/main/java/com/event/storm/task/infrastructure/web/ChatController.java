package com.event.storm.task.infrastructure.web;

import com.event.storm.task.application.ChatApplicationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
public class ChatController {

    private static final UUID DEFAULT_USER = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private final ChatApplicationService chatService;

    public ChatController(ChatApplicationService chatService) {
        this.chatService = chatService;
    }

    @PostMapping(value = "/api/chat", produces = "text/plain;charset=UTF-8")
    public String chat(@RequestParam String message,
                       @RequestParam(required = false) String userId) {
        return reply(userId, message);
    }

    @GetMapping(value = "/api/chat", produces = "text/plain;charset=UTF-8")
    public String chatGet(@RequestParam String message,
                          @RequestParam(required = false) String userId) {
        return reply(userId, message);
    }

    private String reply(String userId, String message) {
        return chatService.handle(user(userId), message);
    }

    private UUID user(String userId) {
        if (userId == null || userId.isBlank()) {
            return DEFAULT_USER;
        }
        try {
            return UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(userId.getBytes(StandardCharsets.UTF_8));
        }
    }
}
