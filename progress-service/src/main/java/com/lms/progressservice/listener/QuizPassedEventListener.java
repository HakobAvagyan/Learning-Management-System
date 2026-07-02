package com.lms.progressservice.listener;

import com.lms.progressservice.dto.CompleteLessonRequest;
import com.lms.progressservice.dto.QuizPassedEvent;
import com.lms.progressservice.service.ProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuizPassedEventListener {

    private final ProgressService progressService;

    @KafkaListener(
            topics = "quiz-passed",
            groupId = "progress-service-quiz",
            containerFactory = "quizPassedListenerContainerFactory"
    )
    public void onQuizPassed(
            ConsumerRecord<String, QuizPassedEvent> record,
            Acknowledgment acknowledgment
    ) {
        QuizPassedEvent event = record.value();
        log.info("Получено событие quiz-passed: userId={}, courseId={}, lessonId={}, score={}%",
                event.userId(), event.courseId(), event.lessonId(), event.percentage());
        try {
            progressService.completeLesson(new CompleteLessonRequest(
                    event.userId(),
                    event.courseId(),
                    event.lessonId()
            ));
            acknowledgment.acknowledge();
            log.info("Урок отмечен как пройден через тест: userId={}, lessonId={}",
                    event.userId(), event.lessonId());
        } catch (Exception ex) {
            log.error("Ошибка обработки quiz-passed: userId={}, lessonId={}, error={}",
                    event.userId(), event.lessonId(), ex.getMessage(), ex);
            throw ex;
        }
    }
}