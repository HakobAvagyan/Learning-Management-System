package com.lms.progressservice.exception;

public class ProgressNotFoundException extends RuntimeException {
    public ProgressNotFoundException(Long userId, String courseId) {
        super("Progress not found for userId=%d, courseId=%s".formatted(userId, courseId));
    }
}