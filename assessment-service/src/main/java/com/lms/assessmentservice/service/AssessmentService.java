package com.lms.assessmentservice.service;

import com.lms.assessmentservice.document.AnswerRecord;
import com.lms.assessmentservice.document.Option;
import com.lms.assessmentservice.document.Question;
import com.lms.assessmentservice.document.Quiz;
import com.lms.assessmentservice.document.QuizAttempt;
import com.lms.assessmentservice.dto.AnswerResultDto;
import com.lms.assessmentservice.dto.QuizPassedEvent;
import com.lms.assessmentservice.dto.QuizRequest;
import com.lms.assessmentservice.dto.QuizResponse;
import com.lms.assessmentservice.dto.QuizResultResponse;
import com.lms.assessmentservice.dto.QuizStudentResponse;
import com.lms.assessmentservice.dto.StudentAnswerRequest;
import com.lms.assessmentservice.dto.SubmitQuizRequest;
import com.lms.assessmentservice.exception.QuizNotFoundException;
import com.lms.assessmentservice.mapper.QuizMapper;
import com.lms.assessmentservice.repository.QuizAttemptRepository;
import com.lms.assessmentservice.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssessmentService {

    private static final String QUIZ_PASSED_TOPIC = "quiz-passed";

    private final QuizRepository                      quizRepository;
    private final QuizAttemptRepository               quizAttemptRepository;
    private final QuizMapper                          quizMapper;
    private final KafkaTemplate<String, QuizPassedEvent> kafkaTemplate;


    public QuizResponse create(QuizRequest req, String createdBy) {
        Quiz quiz = quizMapper.toDocument(req, createdBy);
        return quizMapper.toResponse(quizRepository.save(quiz));
    }

    public QuizResponse findById(String id) {
        return quizMapper.toResponse(getOrThrow(id));
    }

    public QuizResponse update(String id, QuizRequest req) {
        Quiz quiz = getOrThrow(id);
        quizMapper.updateDocument(quiz, req);
        return quizMapper.toResponse(quizRepository.save(quiz));
    }

    public void delete(String id) {
        if (!quizRepository.existsById(id)) throw new QuizNotFoundException(id);
        quizRepository.deleteById(id);
    }


    public Page<QuizResponse> findByCourse(String courseId, Quiz.QuizStatus status, Pageable pageable) {
        Page<Quiz> page = (status != null)
                ? quizRepository.findByCourseIdAndStatus(courseId, status, pageable)
                : quizRepository.findByCourseId(courseId, pageable);
        return page.map(quizMapper::toResponse);
    }

    public List<QuizResponse> findByLesson(String lessonId) {
        return quizRepository.findByLessonId(lessonId)
                .stream().map(quizMapper::toResponse).toList();
    }



    public QuizStudentResponse getQuizForStudent(String quizId) {
        Quiz quiz = getOrThrow(quizId);
        if (quiz.getStatus() != Quiz.QuizStatus.PUBLISHED) {
            throw new QuizNotFoundException(quizId);
        }
        return quizMapper.toStudentResponse(quiz);
    }

    public QuizResultResponse submitQuiz(String quizId, Long userId, String studentName, SubmitQuizRequest request) {
        Quiz quiz = getOrThrow(quizId);
        if (quiz.getStatus() != Quiz.QuizStatus.PUBLISHED) {
            throw new QuizNotFoundException(quizId);
        }

        Map<String, Question> questionMap = quiz.getQuestions().stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        List<AnswerRecord> records = new ArrayList<>();
        List<AnswerResultDto> answerResults = new ArrayList<>();
        int earnedPoints = 0;
        int totalPoints  = quiz.getQuestions().stream().mapToInt(Question::getPoints).sum();

        for (StudentAnswerRequest ans : request.answers()) {
            Question question = questionMap.get(ans.questionId());
            if (question == null) continue;

            Set<String> correctIds = question.getOptions().stream()
                    .filter(Option::isCorrect)
                    .map(Option::getId)
                    .collect(Collectors.toSet());

            Set<String> selectedIds = new HashSet<>(
                    ans.selectedOptionIds() != null ? ans.selectedOptionIds() : List.of());

            boolean correct = correctIds.equals(selectedIds);
            int pts = correct ? question.getPoints() : 0;
            earnedPoints += pts;

            records.add(AnswerRecord.builder()
                    .questionId(question.getId())
                    .selectedOptionIds(List.copyOf(selectedIds))
                    .correct(correct)
                    .pointsEarned(pts)
                    .build());

            answerResults.add(new AnswerResultDto(
                    question.getId(),
                    question.getText(),
                    List.copyOf(selectedIds),
                    List.copyOf(correctIds),
                    correct,
                    pts,
                    question.getPoints()
            ));
        }

        final int finalEarnedPoints = earnedPoints;
        int percentage = totalPoints > 0 ? (earnedPoints * 100 / totalPoints) : 0;
        boolean passed = percentage >= quiz.getPassingScore();

        QuizAttempt attempt = QuizAttempt.builder()
                .quizId(quizId)
                .studentId(studentName)
                .courseId(quiz.getCourseId())
                .earnedPoints(earnedPoints)
                .totalPoints(totalPoints)
                .percentage(percentage)
                .passed(passed)
                .answers(records)
                .build();

        attempt = quizAttemptRepository.save(attempt);

        if (passed && quiz.getLessonId() != null && userId != null) {
            QuizPassedEvent event = new QuizPassedEvent(
                    userId,
                    quiz.getCourseId(),
                    quiz.getLessonId(),
                    quizId,
                    earnedPoints,
                    totalPoints,
                    percentage,
                    Instant.now()
            );
            try {
                kafkaTemplate.send(QUIZ_PASSED_TOPIC, quizId, event)
                        .whenComplete((result, ex) -> {
                            if (ex != null) {
                                log.error("Не удалось отправить quiz-passed: userId={}, courseId={}, error={}",
                                        userId, quiz.getCourseId(), ex.getMessage());
                            } else {
                                log.info("quiz-passed отправлен: userId={}, courseId={}, lessonId={}, score={}/{}",
                                        userId, quiz.getCourseId(), quiz.getLessonId(), finalEarnedPoints, totalPoints);
                            }
                        });
            } catch (Exception ex) {
                log.error("Ошибка при отправке события quiz-passed в Kafka: {}", ex.getMessage());
            }
        }

        return new QuizResultResponse(
                attempt.getId(),
                quizId,
                quiz.getTitle(),
                earnedPoints,
                totalPoints,
                percentage,
                passed,
                quiz.getPassingScore(),
                answerResults,
                attempt.getSubmittedAt()
        );
    }


    private Quiz getOrThrow(String id) {
        return quizRepository.findById(id).orElseThrow(() -> new QuizNotFoundException(id));
    }
}