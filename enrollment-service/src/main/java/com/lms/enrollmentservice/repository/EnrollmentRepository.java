package com.lms.enrollmentservice.repository;

import com.lms.enrollmentservice.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    boolean existsByUserIdAndCourseId(Long userId, String courseId);

    List<Enrollment> findByUserId(Long userId);

    List<Enrollment> findByCourseId(String courseId);

}