package com.lms.courseservice.dto;

import com.lms.courseservice.document.Course;

import java.time.Instant;
import java.util.List;

public record CourseResponse(
        String id,
        String title,
        String description,
        String instructorId,
        String category,
        Course.CourseStatus status,
        List<ModuleResponse> modules,
        Instant createdAt,
        Instant updatedAt
) {}