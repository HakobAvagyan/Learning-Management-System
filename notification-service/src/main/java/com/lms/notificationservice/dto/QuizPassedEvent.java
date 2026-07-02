package com.lms.notificationservice.dto;

import java.time.Instant;

public record QuizPassedEvent(
        Long    userId,
        String  courseId,
        String  lessonId,
        String  quizId,
        int     score,
        int     maxScore,
        int     percentage,
        Instant occurredAt
) {}