package com.lms.courseservice.dto;

import com.lms.courseservice.document.Course;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CourseRequest(
        @NotBlank String title,
        String description,
        @NotBlank String instructorId,
        String category,
        Course.CourseStatus status,
        @Valid List<ModuleRequest> modules
) {}