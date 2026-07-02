package com.lms.courseservice.mapper;

import com.lms.courseservice.document.Course;
import com.lms.courseservice.document.Lesson;
import com.lms.courseservice.document.Module;
import com.lms.courseservice.dto.CourseRequest;
import com.lms.courseservice.dto.CourseResponse;
import com.lms.courseservice.dto.LessonRequest;
import com.lms.courseservice.dto.LessonResponse;
import com.lms.courseservice.dto.ModuleRequest;
import com.lms.courseservice.dto.ModuleResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class CourseMapper {

    public Course toDocument(CourseRequest request) {
        return Course.builder()
                .title(request.title())
                .description(request.description())
                .instructorId(request.instructorId())
                .category(request.category())
                .status(request.status() != null ? request.status() : Course.CourseStatus.DRAFT)
                .modules(toModuleList(request.modules()))
                .build();
    }

    public void updateDocument(Course course, CourseRequest request) {
        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setInstructorId(request.instructorId());
        course.setCategory(request.category());
        if (request.status() != null) {
            course.setStatus(request.status());
        }
        if (request.modules() != null) {
            course.setModules(toModuleList(request.modules()));
        }
    }

    public CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getInstructorId(),
                course.getCategory(),
                course.getStatus(),
                toModuleResponseList(course.getModules()),
                course.getCreatedAt(),
                course.getUpdatedAt()
        );
    }

    private List<Module> toModuleList(List<ModuleRequest> requests) {
        if (requests == null) return List.of();
        return requests.stream().map(this::toModule).toList();
    }

    private Module toModule(ModuleRequest request) {
        return Module.builder()
                .id(UUID.randomUUID().toString())
                .title(request.title())
                .description(request.description())
                .order(request.order())
                .lessons(toLessonList(request.lessons()))
                .build();
    }

    private List<Lesson> toLessonList(List<LessonRequest> requests) {
        if (requests == null) return List.of();
        return requests.stream().map(this::toLesson).toList();
    }

    private Lesson toLesson(LessonRequest request) {
        return Lesson.builder()
                .id(UUID.randomUUID().toString())
                .title(request.title())
                .content(request.content())
                .videoUrl(request.videoUrl())
                .attachmentUrls(request.attachmentUrls() != null ? request.attachmentUrls() : List.of())
                .durationMinutes(request.durationMinutes())
                .order(request.order())
                .build();
    }

    private List<ModuleResponse> toModuleResponseList(List<Module> modules) {
        if (modules == null) return List.of();
        return modules.stream().map(this::toModuleResponse).toList();
    }

    private ModuleResponse toModuleResponse(Module module) {
        return new ModuleResponse(
                module.getId(),
                module.getTitle(),
                module.getDescription(),
                module.getOrder(),
                toLessonResponseList(module.getLessons())
        );
    }

    private List<LessonResponse> toLessonResponseList(List<Lesson> lessons) {
        if (lessons == null) return List.of();
        return lessons.stream().map(this::toLessonResponse).toList();
    }

    private LessonResponse toLessonResponse(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getContent(),
                lesson.getVideoUrl(),
                lesson.getAttachmentUrls() != null ? lesson.getAttachmentUrls() : List.of(),
                lesson.getDurationMinutes(),
                lesson.getOrder()
        );
    }
}