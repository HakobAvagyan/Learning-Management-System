package com.lms.enrollmentservice.dto;

import java.time.OffsetDateTime;

public record StudentEnrolledEvent(
        Long enrollmentId,
        Long userId,
        String courseId,
        OffsetDateTime enrolledAt,
        OffsetDateTime occurredAt
) {
    public static StudentEnrolledEvent of(
            Long enrollmentId, Long userId, String courseId, OffsetDateTime enrolledAt
    ) {
        return new StudentEnrolledEvent(enrollmentId, userId, courseId, enrolledAt, OffsetDateTime.now());
    }
}