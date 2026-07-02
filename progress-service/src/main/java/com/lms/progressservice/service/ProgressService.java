package com.lms.progressservice.service;

import com.lms.progressservice.client.CourseServiceClient;
import com.lms.progressservice.document.LessonProgress;
import com.lms.progressservice.document.Progress;
import com.lms.progressservice.dto.CompleteLessonRequest;
import com.lms.progressservice.dto.CourseStructureDto;
import com.lms.progressservice.dto.ProgressResponse;
import com.lms.progressservice.exception.ProgressNotFoundException;
import com.lms.progressservice.repository.ProgressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final CourseServiceClient courseServiceClient;

    public void initializeProgress(Long userId, String courseId) {
        if (progressRepository.existsByUserIdAndCourseId(userId, courseId)) {
            log.debug("Прогресс уже существует (idempotent skip): userId={}, courseId={}",
                    userId, courseId);
            return;
        }

        CourseStructureDto course = courseServiceClient.getCourse(courseId);

        Map<String, LessonProgress> lessonProgressMap = buildLessonProgressMap(course.modules());

        Progress progress = Progress.builder()
                .userId(userId)
                .courseId(courseId)
                .status(Progress.ProgressStatus.NOT_STARTED)
                .totalLessons(lessonProgressMap.size())
                .lessonProgress(lessonProgressMap)
                .progressPercent(0.0)
                .build();

        progressRepository.save(progress);

        log.info("Прогресс инициализирован: userId={}, courseId={}, уроков={}",
                userId, courseId, lessonProgressMap.size());
    }

    /** Отметить урок как пройденный и пересчитать процент прохождения */
    public ProgressResponse completeLesson(CompleteLessonRequest request) {
        Progress progress = progressRepository
                .findByUserIdAndCourseId(request.userId(), request.courseId())
                .orElseThrow(() -> new ProgressNotFoundException(request.userId(), request.courseId()));

        LessonProgress lesson = progress.getLessonProgress().get(request.lessonId());
        if (lesson == null) {
            throw new IllegalArgumentException(
                    "Урок не найден в прогрессе курса: lessonId=" + request.lessonId());
        }

        if (lesson.getStatus() == LessonProgress.LessonStatus.COMPLETED) {
            log.debug("Урок уже пройден, повтор игнорируется: lessonId={}", request.lessonId());
            return toResponse(progress);
        }

        lesson.setStatus(LessonProgress.LessonStatus.COMPLETED);
        lesson.setCompletedAt(Instant.now());

        recalculate(progress);
        progressRepository.save(progress);

        log.info("Урок пройден: userId={}, courseId={}, lessonId={}, прогресс={}%",
                request.userId(), request.courseId(), request.lessonId(),
                String.format("%.1f", progress.getProgressPercent()));

        return toResponse(progress);
    }

    public ProgressResponse getProgress(Long userId, String courseId) {
        return progressRepository.findByUserIdAndCourseId(userId, courseId)
                .map(this::toResponse)
                .orElseThrow(() -> new ProgressNotFoundException(userId, courseId));
    }

    public List<ProgressResponse> getAllProgressForUser(Long userId) {
        return progressRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    // ── private ──────────────────────────────────────────────────────────────

    private Map<String, LessonProgress> buildLessonProgressMap(
            List<CourseStructureDto.ModuleDto> modules
    ) {
        Map<String, LessonProgress> map = new LinkedHashMap<>();

        if (modules == null) return map;

        for (CourseStructureDto.ModuleDto module : modules) {
            if (module.lessons() == null) continue;
            for (CourseStructureDto.LessonDto lesson : module.lessons()) {
                map.put(lesson.id(), LessonProgress.builder()
                        .lessonId(lesson.id())
                        .moduleId(module.id())
                        .lessonTitle(lesson.title())
                        .moduleTitle(module.title())
                        .order(lesson.order())
                        .status(LessonProgress.LessonStatus.NOT_STARTED)
                        .build());
            }
        }
        return map;
    }

    private void recalculate(Progress progress) {
        long completed = progress.getLessonProgress().values().stream()
                .filter(lp -> lp.getStatus() == LessonProgress.LessonStatus.COMPLETED)
                .count();

        int total = progress.getTotalLessons();

        if (total > 0) {
            progress.setProgressPercent(Math.min((double) completed / total * 100.0, 100.0));
        }

        if (progress.getStatus() == Progress.ProgressStatus.NOT_STARTED && completed > 0) {
            progress.setStatus(Progress.ProgressStatus.IN_PROGRESS);
        }

        if (completed >= total && total > 0) {
            progress.setStatus(Progress.ProgressStatus.COMPLETED);
            progress.setCompletedAt(Instant.now());
            log.info("Курс завершён: userId={}, courseId={}",
                    progress.getUserId(), progress.getCourseId());
        }
    }

    private ProgressResponse toResponse(Progress p) {
        long completed = p.getLessonProgress().values().stream()
                .filter(lp -> lp.getStatus() == LessonProgress.LessonStatus.COMPLETED)
                .count();

        return new ProgressResponse(
                p.getId(),
                p.getUserId(),
                p.getCourseId(),
                p.getStatus(),
                (int) completed,
                p.getTotalLessons(),
                p.getProgressPercent(),
                p.getLessonProgress(),
                p.getStartedAt(),
                p.getLastActivityAt(),
                p.getCompletedAt()
        );
    }
}