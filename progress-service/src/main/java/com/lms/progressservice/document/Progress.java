package com.lms.progressservice.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Document(collection = "progress")
@CompoundIndex(name = "idx_user_course", def = "{'userId': 1, 'courseId': 1}", unique = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Progress {

    @Id
    private String id;

    private Long userId;
    private String courseId;

    @Builder.Default
    private ProgressStatus status = ProgressStatus.NOT_STARTED;
    
    @Builder.Default
    private Map<String, LessonProgress> lessonProgress = new LinkedHashMap<>();

    @Builder.Default
    private int totalLessons = 0;

    @Builder.Default
    private double progressPercent = 0.0;

    @CreatedDate
    private Instant startedAt;

    @LastModifiedDate
    private Instant lastActivityAt;

    private Instant completedAt;

    public enum ProgressStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED
    }
}