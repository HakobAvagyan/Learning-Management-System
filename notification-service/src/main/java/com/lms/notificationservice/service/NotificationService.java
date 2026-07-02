package com.lms.notificationservice.service;

import com.lms.notificationservice.dto.NotificationResponse;
import com.lms.notificationservice.dto.QuizPassedEvent;
import com.lms.notificationservice.dto.StudentEnrolledEvent;

import java.util.List;

public interface NotificationService {

    void sendEnrollmentConfirmation(StudentEnrolledEvent event);

    void sendQuizPassedNotification(QuizPassedEvent event);

    List<NotificationResponse> getForUser(Long userId);

    long getUnreadCount(Long userId);

    NotificationResponse markRead(String notificationId);

    void markAllRead(Long userId);
}