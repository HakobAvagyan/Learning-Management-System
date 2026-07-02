package com.lms.enrollmentservice.dto;

import java.time.OffsetDateTime;

public record EnrollmentEventDto(
        Long enrollmentId,
        Long userId,
        String courseId,
        OffsetDateTime enrolledAt
) {}