package com.lms.notificationservice.dto;

import com.lms.notificationservice.document.Notification;

import java.time.Instant;

public record NotificationResponse(
        String id,
        String type,
        String title,
        String message,
        boolean read,
        Instant createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(),
                n.getTitle(), n.getMessage(), n.isRead(), n.getCreatedAt());
    }
}