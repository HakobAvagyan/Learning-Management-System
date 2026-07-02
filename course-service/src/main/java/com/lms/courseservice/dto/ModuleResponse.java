package com.lms.courseservice.dto;

import java.util.List;

public record ModuleResponse(
        String id,
        String title,
        String description,
        int order,
        List<LessonResponse> lessons
) {}