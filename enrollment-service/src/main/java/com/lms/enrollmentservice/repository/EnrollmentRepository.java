package com.lms.enrollmentservice.repository;

import com.lms.enrollmentservice.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    boolean existsByUserIdAndCourseId(Long userId, String courseId);

    List<Enrollment> findByUserId(Long userId);

    List<Enrollment> findByCourseId(String courseId);

    Optional<Enrollment> findByUserIdAndCourseId(Long userId, String courseId);
}