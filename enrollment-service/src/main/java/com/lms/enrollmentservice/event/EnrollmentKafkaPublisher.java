package com.lms.enrollmentservice.event;

import com.lms.enrollmentservice.dto.StudentEnrolledEvent;
import com.lms.enrollmentservice.entity.Enrollment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class EnrollmentKafkaPublisher {

    static final String TOPIC = "course-enrollments";

    private final KafkaTemplate<String, StudentEnrolledEvent> kafkaTemplate;

    
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEnrollmentCreated(EnrollmentCreatedEvent springEvent) {
        Enrollment enrollment = springEvent.getEnrollment();

        StudentEnrolledEvent kafkaEvent = StudentEnrolledEvent.of(
                enrollment.getId(),
                enrollment.getUserId(),
                enrollment.getCourseId(),
                enrollment.getEnrolledAt()
        );

        kafkaTemplate.send(TOPIC, String.valueOf(enrollment.getUserId()), kafkaEvent)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish StudentEnrolledEvent: enrollmentId={}, error={}",
                                enrollment.getId(), ex.getMessage(), ex);
                    } else {
                        log.info("StudentEnrolledEvent published: enrollmentId={}, topic={}, partition={}, offset={}",
                                enrollment.getId(),
                                result.getRecordMetadata().topic(),
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset());
                    }
                });
    }
}