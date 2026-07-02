package com.lms.apigateway.health;

import com.lms.apigateway.config.HealthCheckProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class DownstreamHealthChecker {

    private final HealthCheckProperties properties;
    private final WebClient.Builder webClientBuilder;

    
    private final ConcurrentHashMap<String, Boolean> statusCache = new ConcurrentHashMap<>();

    public boolean isHealthy(String baseUrl) {
        Boolean status = statusCache.get(baseUrl);
        return status == null || status;
    }

    public Map<String, Boolean> getStatusSnapshot() {
        return Map.copyOf(statusCache);
    }

    @Scheduled(fixedDelayString = "${downstream.health-check.interval-ms:15000}",
               initialDelayString = "5000")
    public void checkAll() {
        properties.getServices().forEach(this::checkOne);
    }

    private void checkOne(String name, String baseUrl) {
        webClientBuilder.build()
                .get()
                .uri(baseUrl + "/actuator/health")
                .retrieve()
                .bodyToMono(HealthResponse.class)
                .timeout(Duration.ofSeconds(3))
                .onErrorResume(ex -> {
                    updateStatus(name, baseUrl, false,
                            "unreachable: " + ex.getClass().getSimpleName());
                    return Mono.empty();
                })
                .subscribe(resp -> {
                    boolean up = resp != null && "UP".equalsIgnoreCase(resp.status());
                    updateStatus(name, baseUrl, up, resp != null ? resp.status() : "null");
                });
    }

    private void updateStatus(String name, String baseUrl, boolean up, String detail) {
        Boolean prev = statusCache.put(baseUrl, up);
        if (!Boolean.valueOf(up).equals(prev)) {
            if (up) {
                log.info("Service RECOVERED  [{} → {}]", name, baseUrl);
            } else {
                log.warn("Service DOWN       [{} → {}] — {}", name, baseUrl, detail);
            }
        }
    }

    record HealthResponse(String status) {}
}