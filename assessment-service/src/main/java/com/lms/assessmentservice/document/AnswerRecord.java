package com.lms.assessmentservice.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerRecord {
    private String questionId;
    private List<String> selectedOptionIds;
    private boolean correct;
    private int pointsEarned;
}