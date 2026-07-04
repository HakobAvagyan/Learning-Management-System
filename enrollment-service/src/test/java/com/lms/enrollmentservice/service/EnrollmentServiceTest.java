package com.lms.enrollmentservice.service;

import com.lms.enrollmentservice.dto.EnrollmentResponse;
import com.lms.enrollmentservice.dto.SubscribeRequest;
import com.lms.enrollmentservice.entity.Enrollment;
import com.lms.enrollmentservice.event.EnrollmentCreatedEvent;
import com.lms.enrollmentservice.exception.AlreadyEnrolledException;
import com.lms.enrollmentservice.repository.EnrollmentRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;


@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {


    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private EnrollmentService enrollmentService;


    private static final Long   USER_ID   = 5L;
    private static final String COURSE_ID = "course-backend";


    @Test
    @DisplayName("subscribe: успешная запись сохраняет enrollment и публикует Spring-событие")
    void subscribe_whenNotEnrolled_savesAndPublishesEvent() {

        SubscribeRequest request = new SubscribeRequest(USER_ID, COURSE_ID);

        Enrollment savedEnrollment = Enrollment.builder()
                .id(1L)
                .userId(USER_ID)
                .courseId(COURSE_ID)
                .status(Enrollment.EnrollmentStatus.ACTIVE)
                .enrolledAt(OffsetDateTime.now())
                .build();

        given(enrollmentRepository.existsByUserIdAndCourseId(USER_ID, COURSE_ID))
                .willReturn(false);
        given(enrollmentRepository.save(any(Enrollment.class)))
                .willReturn(savedEnrollment);

        EnrollmentResponse response = enrollmentService.subscribe(request);

        assertThat(response).isNotNull();
        assertThat(response.userId()).isEqualTo(USER_ID);
        assertThat(response.courseId()).isEqualTo(COURSE_ID);
        assertThat(response.status()).isEqualTo(Enrollment.EnrollmentStatus.ACTIVE);

        then(enrollmentRepository).should().save(any(Enrollment.class));

        ArgumentCaptor<EnrollmentCreatedEvent> eventCaptor =
                ArgumentCaptor.forClass(EnrollmentCreatedEvent.class);
        then(eventPublisher).should().publishEvent(eventCaptor.capture());

        EnrollmentCreatedEvent capturedEvent = eventCaptor.getValue();
        assertThat(capturedEvent.getEnrollment().getUserId()).isEqualTo(USER_ID);
        assertThat(capturedEvent.getEnrollment().getCourseId()).isEqualTo(COURSE_ID);
    }


    @Test
    @DisplayName("subscribe: бросает AlreadyEnrolledException если студент уже записан")
    void subscribe_whenAlreadyEnrolled_throwsException() {

        SubscribeRequest request = new SubscribeRequest(USER_ID, COURSE_ID);

        given(enrollmentRepository.existsByUserIdAndCourseId(USER_ID, COURSE_ID))
                .willReturn(true);

        assertThatThrownBy(() -> enrollmentService.subscribe(request))
                .isInstanceOf(AlreadyEnrolledException.class)
                .hasMessageContaining(String.valueOf(USER_ID))
                .hasMessageContaining(COURSE_ID);

        then(enrollmentRepository).should(never()).save(any(Enrollment.class));

        then(eventPublisher).should(never()).publishEvent(any());
    }


    @Test
    @DisplayName("subscribe: сохраняемый Enrollment содержит userId и courseId из запроса")
    void subscribe_persistsCorrectEnrollmentFields() {

        SubscribeRequest request = new SubscribeRequest(USER_ID, COURSE_ID);

        Enrollment savedEnrollment = Enrollment.builder()
                .id(42L)
                .userId(USER_ID)
                .courseId(COURSE_ID)
                .status(Enrollment.EnrollmentStatus.ACTIVE)
                .enrolledAt(OffsetDateTime.now())
                .build();

        given(enrollmentRepository.existsByUserIdAndCourseId(USER_ID, COURSE_ID))
                .willReturn(false);
        given(enrollmentRepository.save(any(Enrollment.class)))
                .willReturn(savedEnrollment);

        enrollmentService.subscribe(request);

        ArgumentCaptor<Enrollment> enrollmentCaptor =
                ArgumentCaptor.forClass(Enrollment.class);
        then(enrollmentRepository).should().save(enrollmentCaptor.capture());

        Enrollment toSave = enrollmentCaptor.getValue();
        assertThat(toSave.getUserId()).isEqualTo(USER_ID);
        assertThat(toSave.getCourseId()).isEqualTo(COURSE_ID);
    }

    @Test
    @DisplayName("findByUser: возвращает пустой список если enrollments нет")
    void findByUser_whenNone_returnsEmptyList() {

        given(enrollmentRepository.findByUserId(USER_ID))
                .willReturn(java.util.List.of());

        var result = enrollmentService.findByUser(USER_ID);

        assertThat(result).isEmpty();
        then(enrollmentRepository).should().findByUserId(USER_ID);
    }
}
