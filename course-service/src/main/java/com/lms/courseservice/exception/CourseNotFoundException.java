package com.lms.courseservice.exception;

public class CourseNotFoundException extends RuntimeException {
    public CourseNotFoundException(String id) {
        super("Course not found: " + id);
    }
}