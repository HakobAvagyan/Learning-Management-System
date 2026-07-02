package com.lms.notificationservice.listener;

import com.lms.notificationservice.dto.QuizPassedEvent;
import com.lms.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuizPassedNotificationListener {

    private final NotificationService notificationService;

    @KafkaListener(
            topics = "quiz-passed",
            groupId = "notification-service-quiz",
            containerFactory = "quizPassedListenerContainerFactory"
    )
    public void onQuizPassed(
            ConsumerRecord<String, QuizPassedEvent> record,
            Acknowledgment acknowledgment
    ) {
        QuizPassedEvent event = record.value();
        log.debug("Получено событие quiz-passed: userId={}, quizId={}, score={}%",
                event.userId(), event.quizId(), event.percentage());
        try {
            notificationService.sendQuizPassedNotification(event);
            acknowledgment.acknowledge();
        } catch (Exception ex) {
            log.error("Ошибка создания уведомления о сдаче квиза: userId={}, quizId={}: {}",
                    event.userId(), event.quizId(), ex.getMessage(), ex);
            throw ex;
        }
    }
}