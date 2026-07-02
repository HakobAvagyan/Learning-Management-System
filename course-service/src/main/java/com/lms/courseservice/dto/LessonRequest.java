package com.lms.courseservice.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record LessonRequest(
        @NotBlank String title,
        String content,
        String videoUrl,
        List<String> attachmentUrls,
        Integer durationMinutes,
        int order
) {}