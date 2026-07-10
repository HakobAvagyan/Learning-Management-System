package com.lms.chatservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ConversationSummary {
    private Long userId;
    private Long unreadCount;
}