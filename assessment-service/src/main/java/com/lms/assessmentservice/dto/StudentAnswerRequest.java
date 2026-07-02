package com.lms.assessmentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record StudentAnswerRequest(
        @NotBlank(message = "questionId is required")
        String questionId,

        @NotNull
        List<String> selectedOptionIds
) {}