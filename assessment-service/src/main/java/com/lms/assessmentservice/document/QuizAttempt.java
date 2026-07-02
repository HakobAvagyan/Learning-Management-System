package com.lms.assessmentservice.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "quiz_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttempt {

    @Id
    private String id;

    @Indexed
    private String quizId;

    @Indexed
    private String studentId;

    private String courseId;

    private int earnedPoints;
    private int totalPoints;
    private int percentage;
    private boolean passed;

    private List<AnswerRecord> answers;

    @CreatedDate
    private Instant submittedAt;
}