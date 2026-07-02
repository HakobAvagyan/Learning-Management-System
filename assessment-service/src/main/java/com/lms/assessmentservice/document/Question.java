package com.lms.assessmentservice.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    private String id;

    private String text;

    private QuestionType type;

    @Builder.Default
    private List<Option> options = new ArrayList<>();

    private int order;

    @Builder.Default
    private int points = 1;

    public enum QuestionType {
        SINGLE_CHOICE,
        MULTIPLE_CHOICE
    }
}