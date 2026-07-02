package com.lms.progressservice.dto;

import java.time.OffsetDateTime;

public record StudentEnrolledEvent(
        Long enrollmentId,
        Long userId,
        String courseId,
        OffsetDateTime enrolledAt,
        OffsetDateTime occurredAt
) {}