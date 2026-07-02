package com.lms.progressservice.client;

import com.lms.progressservice.dto.CourseStructureDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class CourseServiceClient {

    private final RestClient restClient;

    public CourseServiceClient(
            RestClient.Builder builder,
            @Value("${services.course-service.url}") String courseServiceUrl
    ) {
        this.restClient = builder
                .baseUrl(courseServiceUrl)
                .build();
    }

    
    public CourseStructureDto getCourse(String courseId) {
        log.debug("Запрос структуры курса: courseId={}", courseId);

        return restClient.get()
                .uri("/api/courses/{id}", courseId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                    throw new CourseNotFoundException(
                            "Курс не найден в course-service: " + courseId);
                })
                .onStatus(HttpStatusCode::is5xxServerError, (request, response) -> {
                    throw new RuntimeException(
                            "course-service недоступен при запросе курса: " + courseId);
                })
                .body(CourseStructureDto.class);
    }

    public static class CourseNotFoundException extends RuntimeException {
        public CourseNotFoundException(String message) {
            super(message);
        }
    }
}