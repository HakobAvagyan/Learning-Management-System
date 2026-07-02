package com.lms.enrollmentservice.dto;

import com.lms.enrollmentservice.entity.Enrollment;

import java.time.OffsetDateTime;

public record EnrollmentResponse(
        Long id,
        Long userId,
        String courseId,
        Enrollment.EnrollmentStatus status,
        OffsetDateTime enrolledAt
) {}