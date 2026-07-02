package com.lms.assessmentservice.controller;

import com.lms.assessmentservice.dto.QuizResultResponse;
import com.lms.assessmentservice.dto.QuizStudentResponse;
import com.lms.assessmentservice.dto.SubmitQuizRequest;
import com.lms.assessmentservice.service.AssessmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizStudentController {

    private final AssessmentService assessmentService;

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizStudentResponse> getQuiz(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(assessmentService.getQuizForStudent(id));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<QuizResultResponse> submit(
            @PathVariable String id,
            @RequestHeader("X-User-Name") String studentName,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody SubmitQuizRequest request
    ) {
        return ResponseEntity.ok(assessmentService.submitQuiz(id, userId, studentName, request));
    }
}