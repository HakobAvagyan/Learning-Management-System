package com.lms.chatservice.controller;

import com.lms.chatservice.dto.ChatMessagePayload;
import com.lms.chatservice.dto.ConversationSummary;
import com.lms.chatservice.entity.ChatMessage;
import com.lms.chatservice.repository.ChatMessageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.Instant;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messaging;
    private final ChatMessageRepository repository;


    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessagePayload payload, Principal principal) {
        Long senderId = Long.parseLong(principal.getName());
        payload.setSenderId(senderId);
        payload.setTimestamp(Instant.now());

        repository.save(ChatMessage.builder()
                .senderId(senderId)
                .recipientId(payload.getRecipientId())
                .content(payload.getContent())
                .build());

        messaging.convertAndSendToUser(
                payload.getRecipientId().toString(),
                "/queue/messages",
                payload
        );
        messaging.convertAndSendToUser(
                senderId.toString(),
                "/queue/messages",
                payload
        );

        log.debug("Message {} → {}: {}", senderId, payload.getRecipientId(), payload.getContent());
    }


    @GetMapping("/api/chat/history/{recipientId}")
    public List<ChatMessagePayload> history(@PathVariable Long recipientId,
                                            Principal principal) {
        Long myId = Long.parseLong(principal.getName());
        return repository.findConversation(myId, recipientId).stream()
                .map(m -> ChatMessagePayload.builder()
                        .senderId(m.getSenderId())
                        .recipientId(m.getRecipientId())
                        .content(m.getContent())
                        .timestamp(m.getCreatedAt())
                        .build())
                .toList();
    }


    @GetMapping("/api/chat/conversations")
    public List<ConversationSummary> conversations(Principal principal) {
        Long myId = Long.parseLong(principal.getName());
        return repository.findConversationsWithUnreadCount(myId);
    }

    @PostMapping("/api/chat/read/{userId}")
    @Transactional
    public void markAsRead(@PathVariable Long userId, Principal principal) {
        Long adminId = Long.parseLong(principal.getName());
        repository.markAsRead(userId, adminId);
        log.debug("Marked messages from {} as read by {}", userId, adminId);
    }
}