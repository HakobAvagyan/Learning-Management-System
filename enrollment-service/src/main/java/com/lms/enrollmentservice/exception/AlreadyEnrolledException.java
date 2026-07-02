package com.lms.enrollmentservice.exception;

public class AlreadyEnrolledException extends RuntimeException {
    public AlreadyEnrolledException(Long userId, String courseId) {
        super("User %d is already enrolled in course %s".formatted(userId, courseId));
    }
}