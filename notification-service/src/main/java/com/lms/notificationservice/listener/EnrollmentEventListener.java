package com.lms.notificationservice.listener;

import com.lms.notificationservice.dto.StudentEnrolledEvent;
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
public class EnrollmentEventListener {

    private final NotificationService notificationService;

    @KafkaListener(
            topics = "course-enrollments",
            groupId = "notification-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void onStudentEnrolled(
            ConsumerRecord<String, StudentEnrolledEvent> record,
            Acknowledgment acknowledgment
    ) {
        StudentEnrolledEvent event = record.value();

        log.debug("Получено событие из Kafka: topic={}, partition={}, offset={}, key={}",
                record.topic(), record.partition(), record.offset(), record.key());

        try {
            notificationService.sendEnrollmentConfirmation(event);
            acknowledgment.acknowledge();
        } catch (Exception ex) {
            log.error("Ошибка обработки события enrollmentId={}: {}",
                    event.enrollmentId(), ex.getMessage(), ex);
            throw ex;
        }
    }
}