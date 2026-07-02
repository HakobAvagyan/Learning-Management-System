package com.lms.courseservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record ModuleRequest(
        @NotBlank String title,
        String description,
        int order,
        @Valid List<LessonRequest> lessons
) {}