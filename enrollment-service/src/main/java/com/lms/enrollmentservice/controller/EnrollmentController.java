package com.lms.enrollmentservice.controller;

import com.lms.enrollmentservice.dto.EnrollmentResponse;
import com.lms.enrollmentservice.dto.SubscribeRequest;
import com.lms.enrollmentservice.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/subscribe")
    public ResponseEntity<EnrollmentResponse> subscribe(@Valid @RequestBody SubscribeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentService.subscribe(request));
    }

    @GetMapping("/user/{userId}")
    public List<EnrollmentResponse> getByUser(@PathVariable Long userId) {
        return enrollmentService.findByUser(userId);
    }

    @GetMapping("/course/{courseId}")
    public List<EnrollmentResponse> getByCourse(@PathVariable String courseId) {
        return enrollmentService.findByCourse(courseId);
    }
}