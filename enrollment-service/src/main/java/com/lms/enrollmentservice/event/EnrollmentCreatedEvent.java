package com.lms.enrollmentservice.event;

import com.lms.enrollmentservice.entity.Enrollment;
import org.springframework.context.ApplicationEvent;

public class EnrollmentCreatedEvent extends ApplicationEvent {

    private final Enrollment enrollment;

    public EnrollmentCreatedEvent(Object source, Enrollment enrollment) {
        super(source);
        this.enrollment = enrollment;
    }

    public Enrollment getEnrollment() {
        return enrollment;
    }
}