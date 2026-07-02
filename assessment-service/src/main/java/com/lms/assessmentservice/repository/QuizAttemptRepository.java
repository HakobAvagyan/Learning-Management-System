package com.lms.assessmentservice.repository;

import com.lms.assessmentservice.document.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    List<QuizAttempt> findByStudentIdAndQuizId(String studentId, String quizId);
    List<QuizAttempt> findByStudentIdAndCourseId(String studentId, String courseId);
}