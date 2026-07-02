package com.lms.assessmentservice.exception;

public class QuizNotFoundException extends RuntimeException {
    public QuizNotFoundException(String id) {
        super("Quiz not found: " + id);
    }
}