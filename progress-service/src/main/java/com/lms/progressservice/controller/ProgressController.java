package com.lms.progressservice.controller;

import com.lms.progressservice.dto.CompleteLessonRequest;
import com.lms.progressservice.dto.ProgressResponse;
import com.lms.progressservice.service.ProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @PostMapping("/init")
    public void initProgress(@RequestParam Long userId, @RequestParam String courseId) {
        progressService.initializeProgress(userId, courseId);
    }

    @PostMapping("/complete-lesson")
    public ProgressResponse completeLesson(@Valid @RequestBody CompleteLessonRequest request) {
        return progressService.completeLesson(request);
    }

    @GetMapping("/user/{userId}/course/{courseId}")
    public ProgressResponse getProgress(
            @PathVariable Long userId,
            @PathVariable String courseId
    ) {
        return progressService.getProgress(userId, courseId);
    }

    @GetMapping("/user/{userId}")
    public List<ProgressResponse> getAllProgressForUser(@PathVariable Long userId) {
        return progressService.getAllProgressForUser(userId);
    }
}