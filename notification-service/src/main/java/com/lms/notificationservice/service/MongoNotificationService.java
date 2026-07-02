package com.lms.notificationservice.service;

import com.lms.notificationservice.document.Notification;
import com.lms.notificationservice.dto.NotificationResponse;
import com.lms.notificationservice.dto.QuizPassedEvent;
import com.lms.notificationservice.dto.StudentEnrolledEvent;
import com.lms.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Primary
@Service
@RequiredArgsConstructor
public class MongoNotificationService implements NotificationService {

    private final NotificationRepository repository;

    @Override
    public void sendEnrollmentConfirmation(StudentEnrolledEvent event) {
        Notification n = Notification.builder()
                .userId(event.userId())
                .type("ENROLLMENT")
                .title("Запись на курс")
                .message("Вы успешно записаны на курс " + event.courseId())
                .build();
        repository.save(n);
        log.info("Уведомление о записи сохранено: userId={}, courseId={}", event.userId(), event.courseId());
    }

    @Override
    public void sendQuizPassedNotification(QuizPassedEvent event) {
        Notification n = Notification.builder()
                .userId(event.userId())
                .type("QUIZ_PASSED")
                .title("Квиз сдан!")
                .message("Вы сдали квиз с результатом " + event.percentage() + "% (" + event.score() + "/" + event.maxScore() + " баллов)")
                .build();
        repository.save(n);
        log.info("Уведомление о сдаче квиза сохранено: userId={}, quizId={}, score={}%",
                event.userId(), event.quizId(), event.percentage());
    }

    @Override
    public List<NotificationResponse> getForUser(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Override
    public long getUnreadCount(Long userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }

    @Override
    public NotificationResponse markRead(String notificationId) {
        Notification n = repository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        n.setRead(true);
        return NotificationResponse.from(repository.save(n));
    }

    @Override
    public void markAllRead(Long userId) {
        List<Notification> unread = repository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> !n.isRead())
                .toList();
        unread.forEach(n -> n.setRead(true));
        repository.saveAll(unread);
    }
}