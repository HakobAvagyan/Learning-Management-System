package com.lms.progressservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CompleteLessonRequest(

        @NotNull @Positive
        Long userId,

        @NotBlank
        String courseId,

        @NotBlank
        String lessonId
) {}