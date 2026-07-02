package com.lms.courseservice.service;

import com.lms.courseservice.document.Course;
import com.lms.courseservice.dto.CourseRequest;
import com.lms.courseservice.dto.CourseResponse;
import com.lms.courseservice.exception.CourseNotFoundException;
import com.lms.courseservice.mapper.CourseMapper;
import com.lms.courseservice.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    public Page<CourseResponse> findAll(Pageable pageable) {
        return courseRepository.findAll(pageable).map(courseMapper::toResponse);
    }

    public Page<CourseResponse> findByStatus(Course.CourseStatus status, Pageable pageable) {
        return courseRepository.findByStatus(status, pageable).map(courseMapper::toResponse);
    }

    public Page<CourseResponse> findByInstructor(String instructorId, Pageable pageable) {
        return courseRepository.findByInstructorId(instructorId, pageable).map(courseMapper::toResponse);
    }

    public CourseResponse findById(String id) {
        return courseRepository.findById(id)
                .map(courseMapper::toResponse)
                .orElseThrow(() -> new CourseNotFoundException(id));
    }

    public CourseResponse create(CourseRequest request) {
        Course course = courseMapper.toDocument(request);
        return courseMapper.toResponse(courseRepository.save(course));
    }

    public CourseResponse update(String id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id));
        courseMapper.updateDocument(course, request);
        return courseMapper.toResponse(courseRepository.save(course));
    }

    public void delete(String id) {
        if (!courseRepository.existsById(id)) {
            throw new CourseNotFoundException(id);
        }
        courseRepository.deleteById(id);
    }
}