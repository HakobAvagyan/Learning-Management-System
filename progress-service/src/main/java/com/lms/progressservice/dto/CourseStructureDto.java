package com.lms.progressservice.dto;

import java.util.List;


public record CourseStructureDto(
        String id,
        String title,
        List<ModuleDto> modules
) {
    public record ModuleDto(
            String id,
            String title,
            int order,
            List<LessonDto> lessons
    ) {}

    public record LessonDto(
            String id,
            String title,
            int order
    ) {}
}