package com.lms.assessmentservice.dto;

import java.util.List;


public record QuizStudentResponse(
        String id,
        String courseId,
        String lessonId,
        String title,
        String description,
        List<QuestionStudentResponse> questions,
        Integer timeLimitMinutes,
        int passingScore,
        int totalQuestions,
        int totalPoints
) {}