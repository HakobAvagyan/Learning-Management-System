package com.lms.assessmentservice.dto;

import java.time.Instant;
import java.util.List;

public record QuizResultResponse(
        String attemptId,
        String quizId,
        String quizTitle,
        int earnedPoints,
        int totalPoints,
        int percentage,
        boolean passed,
        int passingScore,
        List<AnswerResultDto> answers,
        Instant submittedAt
) {}