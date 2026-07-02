package com.lms.assessmentservice.dto;

import com.lms.assessmentservice.document.Question;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record QuestionRequest(
        @NotBlank(message = "Question text must not be blank")
        String text,

        @NotNull(message = "Question type is required")
        Question.QuestionType type,

        @Valid
        @Size(min = 2, message = "At least 2 options are required")
        List<OptionRequest> options,

        int order,

        int points
) {}