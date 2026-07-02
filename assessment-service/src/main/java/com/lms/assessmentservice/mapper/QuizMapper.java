package com.lms.assessmentservice.mapper;

import com.lms.assessmentservice.document.Option;
import com.lms.assessmentservice.document.Question;
import com.lms.assessmentservice.document.Quiz;
import com.lms.assessmentservice.dto.OptionRequest;
import com.lms.assessmentservice.dto.OptionResponse;
import com.lms.assessmentservice.dto.OptionStudentResponse;
import com.lms.assessmentservice.dto.QuestionRequest;
import com.lms.assessmentservice.dto.QuestionResponse;
import com.lms.assessmentservice.dto.QuestionStudentResponse;
import com.lms.assessmentservice.dto.QuizRequest;
import com.lms.assessmentservice.dto.QuizResponse;
import com.lms.assessmentservice.dto.QuizStudentResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class QuizMapper {

    public Quiz toDocument(QuizRequest req, String createdBy) {
        return Quiz.builder()
                .courseId(req.courseId())
                .lessonId(req.lessonId())
                .title(req.title())
                .description(req.description())
                .questions(toQuestionList(req.questions()))
                .timeLimitMinutes(req.timeLimitMinutes())
                .passingScore(req.passingScore())
                .status(req.status() != null ? req.status() : Quiz.QuizStatus.DRAFT)
                .createdBy(createdBy)
                .build();
    }

    public void updateDocument(Quiz quiz, QuizRequest req) {
        quiz.setTitle(req.title());
        quiz.setDescription(req.description());
        quiz.setTimeLimitMinutes(req.timeLimitMinutes());
        quiz.setPassingScore(req.passingScore());
        if (req.status() != null) quiz.setStatus(req.status());
        if (req.questions() != null) quiz.setQuestions(toQuestionList(req.questions()));
    }

    public QuizResponse toResponse(Quiz quiz) {
        List<QuestionResponse> questions = toQuestionResponseList(quiz.getQuestions());
        int totalPoints = questions.stream().mapToInt(QuestionResponse::points).sum();

        return new QuizResponse(
                quiz.getId(),
                quiz.getCourseId(),
                quiz.getLessonId(),
                quiz.getTitle(),
                quiz.getDescription(),
                questions,
                quiz.getTimeLimitMinutes(),
                quiz.getPassingScore(),
                quiz.getStatus(),
                quiz.getCreatedBy(),
                questions.size(),
                totalPoints,
                quiz.getCreatedAt(),
                quiz.getUpdatedAt()
        );
    }


    private List<Question> toQuestionList(List<QuestionRequest> reqs) {
        if (reqs == null) return List.of();
        return reqs.stream().map(this::toQuestion).toList();
    }

    private Question toQuestion(QuestionRequest req) {
        return Question.builder()
                .id(UUID.randomUUID().toString())
                .text(req.text())
                .type(req.type())
                .options(toOptionList(req.options()))
                .order(req.order())
                .points(req.points() > 0 ? req.points() : 1)
                .build();
    }

    private List<QuestionResponse> toQuestionResponseList(List<Question> questions) {
        if (questions == null) return List.of();
        return questions.stream().map(this::toQuestionResponse).toList();
    }

    private QuestionResponse toQuestionResponse(Question q) {
        return new QuestionResponse(
                q.getId(),
                q.getText(),
                q.getType(),
                toOptionResponseList(q.getOptions()),
                q.getOrder(),
                q.getPoints()
        );
    }


    private List<Option> toOptionList(List<OptionRequest> reqs) {
        if (reqs == null) return List.of();
        return reqs.stream().map(this::toOption).toList();
    }

    private Option toOption(OptionRequest req) {
        return Option.builder()
                .id(UUID.randomUUID().toString())
                .text(req.text())
                .correct(req.correct())
                .build();
    }

    private List<OptionResponse> toOptionResponseList(List<Option> options) {
        if (options == null) return List.of();
        return options.stream().map(this::toOptionResponse).toList();
    }

    private OptionResponse toOptionResponse(Option o) {
        return new OptionResponse(o.getId(), o.getText(), o.isCorrect());
    }

    public QuizStudentResponse toStudentResponse(Quiz quiz) {
        List<QuestionStudentResponse> questions = toQuestionStudentResponseList(quiz.getQuestions());
        int totalPoints = quiz.getQuestions().stream().mapToInt(Question::getPoints).sum();

        return new QuizStudentResponse(
                quiz.getId(),
                quiz.getCourseId(),
                quiz.getLessonId(),
                quiz.getTitle(),
                quiz.getDescription(),
                questions,
                quiz.getTimeLimitMinutes(),
                quiz.getPassingScore(),
                questions.size(),
                totalPoints
        );
    }

    private List<QuestionStudentResponse> toQuestionStudentResponseList(List<Question> questions) {
        if (questions == null) return List.of();
        return questions.stream().map(this::toQuestionStudentResponse).toList();
    }

    private QuestionStudentResponse toQuestionStudentResponse(Question q) {
        List<OptionStudentResponse> options = q.getOptions() == null ? List.of()
                : q.getOptions().stream()
                        .map(o -> new OptionStudentResponse(o.getId(), o.getText()))
                        .toList();
        return new QuestionStudentResponse(q.getId(), q.getText(), q.getType(), options, q.getOrder(), q.getPoints());
    }
}