package com.lms.apigateway.filter;

import com.lms.apigateway.security.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class JwtAuthenticationGatewayFilterFactory
        extends AbstractGatewayFilterFactory<JwtAuthenticationGatewayFilterFactory.Config> {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationGatewayFilterFactory(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return reject(exchange, HttpStatus.UNAUTHORIZED, "Missing or malformed Authorization header");
            }

            String token = authHeader.substring(7);
            if (!jwtUtil.isValid(token)) {
                return reject(exchange, HttpStatus.UNAUTHORIZED, "Invalid or expired JWT token");
            }

            Claims claims = jwtUtil.extractAllClaims(token);
            String username = claims.getSubject();
            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);
            List<String> userRoles = roles != null ? roles : Collections.emptyList();
            Object userIdClaim = claims.get("userId");
            String userId = userIdClaim != null ? userIdClaim.toString() : "";

            if (!config.getRequiredRoles().isEmpty()) {
                boolean hasRole = userRoles.stream().anyMatch(config.getRequiredRoles()::contains);
                if (!hasRole) {
                    log.warn("Access denied for user '{}': required roles {}, has {}",
                            username, config.getRequiredRoles(), userRoles);
                    return reject(exchange, HttpStatus.FORBIDDEN,
                            "Insufficient permissions: required " + config.getRequiredRoles());
                }
            }

            ServerWebExchange mutatedExchange = exchange.mutate()
                    .request(r -> r
                            .header("X-User-Name", username)
                            .header("X-User-Roles", String.join(",", userRoles))
                            .header("X-User-Id", userId)
                    )
                    .build();

            return chain.filter(mutatedExchange);
        };
    }

    private Mono<Void> reject(ServerWebExchange exchange, HttpStatus status, String reason) {
        log.warn("Request rejected [{}]: {}", status, reason);
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        private List<String> requiredRoles = Collections.emptyList();

        public List<String> getRequiredRoles() { return requiredRoles; }
        public void setRequiredRoles(List<String> requiredRoles) { this.requiredRoles = requiredRoles; }
    }
}