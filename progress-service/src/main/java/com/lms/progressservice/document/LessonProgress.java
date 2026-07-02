package com.lms.progressservice.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonProgress {

    private String lessonId;
    private String moduleId;

    private String lessonTitle;
    private String moduleTitle;

    private int order;

    @Builder.Default
    private LessonStatus status = LessonStatus.NOT_STARTED;

    private Instant completedAt;

    public enum LessonStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED
    }
}