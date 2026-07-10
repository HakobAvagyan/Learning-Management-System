package com.lms.courseservice.repository;

import com.lms.courseservice.document.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CourseRepository extends MongoRepository<Course, String> {

    Page<Course> findByStatus(Course.CourseStatus status, Pageable pageable);

    Page<Course> findByInstructorId(String instructorId, Pageable pageable);

}