package com.lms.apigateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.LinkedHashMap;
import java.util.Map;

@ConfigurationProperties(prefix = "downstream.health-check")
public class HealthCheckProperties {

    /** How often to poll each service, in milliseconds. */
    private long intervalMs = 15_000;

    /** service-name → base URL (e.g. "user-service" → "http://localhost:8081"). */
    private Map<String, String> services = new LinkedHashMap<>();

    public long getIntervalMs() { return intervalMs; }
    public void setIntervalMs(long intervalMs) { this.intervalMs = intervalMs; }

    public Map<String, String> getServices() { return services; }
    public void setServices(Map<String, String> services) { this.services = services; }
}