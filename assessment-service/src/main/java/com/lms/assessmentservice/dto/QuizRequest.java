package com.lms.assessmentservice.dto;

import com.lms.assessmentservice.document.Quiz;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record QuizRequest(
        @NotBlank(message = "courseId is required")
        String courseId,

        String lessonId,

        @NotBlank(message = "Quiz title is required")
        String title,

        String description,

        @Valid
        List<QuestionRequest> questions,

        Integer timeLimitMinutes,

        @Min(value = 0, message = "passingScore must be >= 0")
        @Max(value = 100, message = "passingScore must be <= 100")
        int passingScore,

        Quiz.QuizStatus status
) {}