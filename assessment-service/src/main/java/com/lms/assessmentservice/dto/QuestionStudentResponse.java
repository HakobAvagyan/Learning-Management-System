package com.lms.assessmentservice.dto;

import com.lms.assessmentservice.document.Question;

import java.util.List;

public record QuestionStudentResponse(
        String id,
        String text,
        Question.QuestionType type,
        List<OptionStudentResponse> options,
        int order,
        int points
) {}