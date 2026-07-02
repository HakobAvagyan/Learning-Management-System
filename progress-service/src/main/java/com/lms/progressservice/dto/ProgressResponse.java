package com.lms.progressservice.dto;

import com.lms.progressservice.document.LessonProgress;
import com.lms.progressservice.document.Progress;

import java.time.Instant;
import java.util.Map;

public record ProgressResponse(
        String id,
        Long userId,
        String courseId,
        Progress.ProgressStatus status,
        int completedLessonsCount,
        int totalLessons,
        double progressPercent,
        Map<String, LessonProgress> lessonProgress,
        Instant startedAt,
        Instant lastActivityAt,
        Instant completedAt
) {}