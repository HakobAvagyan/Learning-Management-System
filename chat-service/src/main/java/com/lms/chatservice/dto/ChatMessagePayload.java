package com.lms.chatservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessagePayload {

    private Long senderId;
    private String senderName;
    private Long recipientId;
    private String content;
    private Instant timestamp;
}