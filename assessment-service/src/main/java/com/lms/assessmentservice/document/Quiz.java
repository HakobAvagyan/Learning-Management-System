package com.lms.assessmentservice.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;


@Document(collection = "quizzes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    private String id;

    @Indexed
    private String courseId;

  
    @Indexed
    private String lessonId;

    private String title;

    private String description;

    @Builder.Default
    private List<Question> questions = new ArrayList<>();

   
    private Integer timeLimitMinutes;

   
    @Builder.Default
    private int passingScore = 70;

    @Builder.Default
    private QuizStatus status = QuizStatus.DRAFT;

    @Indexed
    private String createdBy;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum QuizStatus {
        DRAFT,
        PUBLISHED
    }
}