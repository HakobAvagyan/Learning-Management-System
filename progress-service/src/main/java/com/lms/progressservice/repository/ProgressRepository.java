package com.lms.progressservice.repository;

import com.lms.progressservice.document.Progress;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProgressRepository extends MongoRepository<Progress, String> {

    Optional<Progress> findByUserIdAndCourseId(Long userId, String courseId);

    List<Progress> findByUserId(Long userId);

    boolean existsByUserIdAndCourseId(Long userId, String courseId);
}