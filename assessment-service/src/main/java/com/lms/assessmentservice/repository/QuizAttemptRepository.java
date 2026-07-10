package com.lms.assessmentservice.repository;

import com.lms.assessmentservice.document.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
}