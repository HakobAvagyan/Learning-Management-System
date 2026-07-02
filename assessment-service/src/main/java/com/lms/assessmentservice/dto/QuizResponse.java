package com.lms.assessmentservice.dto;

import com.lms.assessmentservice.document.Quiz;

import java.time.Instant;
import java.util.List;

public record QuizResponse(
        String id,
        String courseId,
        String lessonId,
        String title,
        String description,
        List<QuestionResponse> questions,
        Integer timeLimitMinutes,
        int passingScore,
        Quiz.QuizStatus status,
        String createdBy,
        int totalQuestions,
        int totalPoints,
        Instant createdAt,
        Instant updatedAt
) {}