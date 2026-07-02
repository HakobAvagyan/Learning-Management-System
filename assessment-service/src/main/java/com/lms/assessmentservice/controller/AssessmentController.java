package com.lms.assessmentservice.controller;

import com.lms.assessmentservice.document.Quiz;
import com.lms.assessmentservice.dto.QuizRequest;
import com.lms.assessmentservice.dto.QuizResponse;
import com.lms.assessmentservice.service.AssessmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping
    public ResponseEntity<QuizResponse> create(
            @Valid @RequestBody QuizRequest request,
            HttpServletRequest httpRequest) {
        String username = httpRequest.getHeader("X-User-Name");
        if (username == null) username = "unknown";
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(assessmentService.create(request, username));
    }

    @GetMapping("/{id}")
    public QuizResponse getById(@PathVariable String id) {
        return assessmentService.findById(id);
    }

    @GetMapping
    public Page<QuizResponse> listByCourse(
            @RequestParam String courseId,
            @RequestParam(required = false) Quiz.QuizStatus status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return assessmentService.findByCourse(courseId, status, pageable);
    }

    @GetMapping("/by-lesson")
    public List<QuizResponse> listByLesson(@RequestParam String lessonId) {
        return assessmentService.findByLesson(lessonId);
    }

    @PutMapping("/{id}")
    public QuizResponse update(
            @PathVariable String id,
            @Valid @RequestBody QuizRequest request) {
        return assessmentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        assessmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
