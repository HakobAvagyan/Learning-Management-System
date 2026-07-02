package com.lms.apigateway.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.apigateway.health.DownstreamHealthChecker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.time.Instant;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class HealthCheckGlobalFilter implements GlobalFilter, Ordered {

    
    private static final int ORDER = 10_001;

    private final DownstreamHealthChecker healthChecker;
    private final ObjectMapper            objectMapper;

    @Override
    public int getOrder() {
        return ORDER;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        Route route = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR);
        if (route == null) {
            return chain.filter(exchange);
        }

        String baseUrl = extractBaseUrl(route.getUri());
        if (!healthChecker.isHealthy(baseUrl)) {
            log.warn("Blocking request to {} — service is DOWN (path={})",
                    baseUrl, exchange.getRequest().getPath());
            return writeServiceUnavailable(exchange, route.getId(), baseUrl);
        }

        return chain.filter(exchange);
    }

    private String extractBaseUrl(URI uri) {
        int port = uri.getPort();
        if (port < 0) {
            port = "https".equals(uri.getScheme()) ? 443 : 80;
        }
        return uri.getScheme() + "://" + uri.getHost() + ":" + port;
    }

    private Mono<Void> writeServiceUnavailable(ServerWebExchange exchange,
                                                String routeId,
                                                String serviceUrl) {
        var response = exchange.getResponse();
        response.setStatusCode(HttpStatus.SERVICE_UNAVAILABLE);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "timestamp", Instant.now().toString(),
                "status",    503,
                "error",     "Service Unavailable",
                "message",   "Downstream service is currently DOWN",
                "service",   routeId,
                "url",       serviceUrl
        );

        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(body);
        } catch (JsonProcessingException e) {
            bytes = "{\"error\":\"Service Unavailable\"}".getBytes();
        }

        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }
}