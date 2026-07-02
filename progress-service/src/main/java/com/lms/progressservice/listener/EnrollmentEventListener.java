package com.lms.progressservice.listener;

import com.lms.progressservice.dto.StudentEnrolledEvent;
import com.lms.progressservice.service.ProgressService;
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

    private final ProgressService progressService;

    
    @KafkaListener(
            topics = "course-enrollments",
            groupId = "progress-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void onStudentEnrolled(
            ConsumerRecord<String, StudentEnrolledEvent> record,
            Acknowledgment acknowledgment
    ) {
        StudentEnrolledEvent event = record.value();
        log.info("Получено событие записи на курс: userId={}, courseId={}",
                event.userId(), event.courseId());
        try {
            progressService.initializeProgress(event.userId(), event.courseId());
            acknowledgment.acknowledge();
        } catch (Exception ex) {
            log.error("Ошибка инициализации прогресса: userId={}, courseId={}, error={}",
                    event.userId(), event.courseId(), ex.getMessage(), ex);
            throw ex;
        }
    }
}