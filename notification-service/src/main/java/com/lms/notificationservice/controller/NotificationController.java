package com.lms.notificationservice.controller;

import com.lms.notificationservice.dto.NotificationResponse;
import com.lms.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationResponse> getMyNotifications(
            @RequestHeader("X-User-Id") Long userId) {
        return notificationService.getForUser(userId);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(
            @RequestHeader("X-User-Id") Long userId) {
        return Map.of("count", notificationService.getUnreadCount(userId));
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable String id) {
        return notificationService.markRead(id);
    }

    @PatchMapping("/read-all")
    public void markAllRead(@RequestHeader("X-User-Id") Long userId) {
        notificationService.markAllRead(userId);
    }
}