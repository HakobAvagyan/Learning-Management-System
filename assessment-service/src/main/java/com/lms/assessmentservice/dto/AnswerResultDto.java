package com.lms.assessmentservice.dto;

import java.util.List;

public record AnswerResultDto(
        String questionId,
        String questionText,
        List<String> selectedOptionIds,
        List<String> correctOptionIds,
        boolean correct,
        int pointsEarned,
        int pointsPossible
) {}