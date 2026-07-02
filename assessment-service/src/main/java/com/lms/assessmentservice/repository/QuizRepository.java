package com.lms.assessmentservice.repository;

import com.lms.assessmentservice.document.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuizRepository extends MongoRepository<Quiz, String> {

    Page<Quiz> findByCourseId(String courseId, Pageable pageable);

    Page<Quiz> findByCourseIdAndStatus(String courseId, Quiz.QuizStatus status, Pageable pageable);

    List<Quiz> findByLessonId(String lessonId);

    Page<Quiz> findByCreatedBy(String createdBy, Pageable pageable);
}