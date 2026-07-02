package com.lms.courseservice.dto;

import java.util.List;

public record LessonResponse(
        String id,
        String title,
        String content,
        String videoUrl,
        List<String> attachmentUrls,
        Integer durationMinutes,
        int order
) {}