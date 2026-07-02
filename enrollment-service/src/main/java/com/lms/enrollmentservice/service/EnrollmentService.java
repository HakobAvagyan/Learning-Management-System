package com.lms.enrollmentservice.service;

import com.lms.enrollmentservice.dto.EnrollmentResponse;
import com.lms.enrollmentservice.dto.SubscribeRequest;
import com.lms.enrollmentservice.entity.Enrollment;
import com.lms.enrollmentservice.event.EnrollmentCreatedEvent;
import com.lms.enrollmentservice.exception.AlreadyEnrolledException;
import com.lms.enrollmentservice.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public EnrollmentResponse subscribe(SubscribeRequest request) {
        if (enrollmentRepository.existsByUserIdAndCourseId(request.userId(), request.courseId())) {
            throw new AlreadyEnrolledException(request.userId(), request.courseId());
        }

        Enrollment enrollment = enrollmentRepository.save(
                Enrollment.builder()
                        .userId(request.userId())
                        .courseId(request.courseId())
                        .build()
        );

        
        eventPublisher.publishEvent(new EnrollmentCreatedEvent(this, enrollment));

        log.info("Enrollment created: id={}, userId={}, courseId={}",
                enrollment.getId(), enrollment.getUserId(), enrollment.getCourseId());

        return toResponse(enrollment);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> findByUser(Long userId) {
        return enrollmentRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> findByCourse(String courseId) {
        return enrollmentRepository.findByCourseId(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    private EnrollmentResponse toResponse(Enrollment e) {
        return new EnrollmentResponse(
                e.getId(),
                e.getUserId(),
                e.getCourseId(),
                e.getStatus(),
                e.getEnrolledAt()
        );
    }
}