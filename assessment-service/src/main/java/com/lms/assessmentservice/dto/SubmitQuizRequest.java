package com.lms.assessmentservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SubmitQuizRequest(
        @Valid
        @NotEmpty(message = "At least one answer is required")
        List<StudentAnswerRequest> answers
) {}