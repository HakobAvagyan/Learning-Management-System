package com.lms.progressservice.integration;

import com.lms.progressservice.client.CourseServiceClient;
import com.lms.progressservice.document.Progress;
import com.lms.progressservice.dto.CourseStructureDto;
import com.lms.progressservice.dto.StudentEnrolledEvent;
import com.lms.progressservice.repository.ProgressRepository;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;


@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class KafkaEnrollmentIntegrationTest {


    @Container
    static final KafkaContainer KAFKA =
            new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

    @Container
    static final MongoDBContainer MONGO =
            new MongoDBContainer(DockerImageName.parse("mongo:7.0"));



    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.kafka.bootstrap-servers", KAFKA::getBootstrapServers);
        registry.add("spring.data.mongodb.uri",        MONGO::getReplicaSetUrl);

        registry.add("management.tracing.sampling.probability", () -> "0.0");
        registry.add("spring.kafka.consumer.group-id",          () -> "progress-service-test");
    }


    @Autowired
    private ProgressRepository progressRepository;


    @MockBean
    private CourseServiceClient courseServiceClient;


    private KafkaTemplate<String, StudentEnrolledEvent> testProducer;

    @BeforeEach
    void setUp() {
        Map<String, Object> producerProps = Map.of(
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,      KAFKA.getBootstrapServers(),
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,   StringSerializer.class,
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class,
                JsonSerializer.ADD_TYPE_INFO_HEADERS,         false
        );

        testProducer = new KafkaTemplate<>(
                new DefaultKafkaProducerFactory<>(producerProps)
        );

        CourseStructureDto courseStructure = new CourseStructureDto(
                "course-backend",
                "Backend-разработка на Spring Boot",
                List.of(
                        new CourseStructureDto.ModuleDto("m1", "Модуль 1", 1,
                                List.of(
                                        new CourseStructureDto.LessonDto("l1", "Введение", 1),
                                        new CourseStructureDto.LessonDto("l2", "Основы", 2)
                                )
                        )
                )
        );
        given(courseServiceClient.getCourse(anyString())).willReturn(courseStructure);
    }

    @AfterEach
    void tearDown() {
        progressRepository.deleteAll();
        testProducer.destroy();
    }


    @Test
    @DisplayName("Kafka → ProgressService: событие записи создаёт progress-документ в MongoDB")
    void whenStudentEnrolledEventPublished_thenProgressDocumentCreatedInMongo() {

        Long userId   = 5L;
        String courseId = "course-backend";

        StudentEnrolledEvent event = new StudentEnrolledEvent(
                1L,
                userId,
                courseId,
                OffsetDateTime.now(),
                OffsetDateTime.now()
        );

        testProducer.send(
                new ProducerRecord<>("course-enrollments", String.valueOf(userId), event)
        );

        Awaitility.await()
                .atMost(15, TimeUnit.SECONDS)
                .pollInterval(500, TimeUnit.MILLISECONDS)
                .untilAsserted(() -> {
                    Optional<Progress> progress =
                            progressRepository.findByUserIdAndCourseId(userId, courseId);

                    assertThat(progress).isPresent();
                    assertThat(progress.get().getUserId()).isEqualTo(userId);
                    assertThat(progress.get().getCourseId()).isEqualTo(courseId);
                    assertThat(progress.get().getTotalLessons()).isEqualTo(2);
                    assertThat(progress.get().getProgressPercent()).isEqualTo(0.0);
                    assertThat(progress.get().getStatus())
                            .isEqualTo(Progress.ProgressStatus.NOT_STARTED);
                });
    }

    @Test
    @DisplayName("Kafka → ProgressService: повторное событие не создаёт дублирующий документ (идемпотентность)")
    void whenDuplicateEventPublished_thenProgressDocumentNotDuplicated() {

        Long userId   = 6L;
        String courseId = "course-frontend";

        StudentEnrolledEvent event = new StudentEnrolledEvent(
                2L, userId, courseId, OffsetDateTime.now(), OffsetDateTime.now()
        );

        testProducer.send(new ProducerRecord<>("course-enrollments", String.valueOf(userId), event));
        testProducer.send(new ProducerRecord<>("course-enrollments", String.valueOf(userId), event));

        Awaitility.await()
                .atMost(15, TimeUnit.SECONDS)
                .pollInterval(500, TimeUnit.MILLISECONDS)
                .untilAsserted(() -> {
                    List<Progress> all = progressRepository.findByUserId(userId);
                    assertThat(all)
                            .hasSize(1)
                            .allMatch(p -> p.getCourseId().equals(courseId));
                });
    }

    @Test
    @DisplayName("Kafka → ProgressService: два разных курса создают два документа")
    void whenTwoCoursesEnrolled_thenTwoProgressDocumentsCreated() {

        Long userId = 7L;

        StudentEnrolledEvent event1 = new StudentEnrolledEvent(
                3L, userId, "course-backend", OffsetDateTime.now(), OffsetDateTime.now()
        );
        StudentEnrolledEvent event2 = new StudentEnrolledEvent(
                4L, userId, "course-frontend", OffsetDateTime.now(), OffsetDateTime.now()
        );

        testProducer.send(new ProducerRecord<>("course-enrollments", String.valueOf(userId), event1));
        testProducer.send(new ProducerRecord<>("course-enrollments", String.valueOf(userId), event2));

        Awaitility.await()
                .atMost(15, TimeUnit.SECONDS)
                .pollInterval(500, TimeUnit.MILLISECONDS)
                .untilAsserted(() -> {
                    List<Progress> all = progressRepository.findByUserId(userId);
                    assertThat(all).hasSize(2);
                    assertThat(all).extracting(Progress::getCourseId)
                            .containsExactlyInAnyOrder("course-backend", "course-frontend");
                });
    }
}
