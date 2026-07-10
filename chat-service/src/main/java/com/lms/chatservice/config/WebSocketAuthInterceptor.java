package com.lms.chatservice.config;

import com.lms.chatservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new org.springframework.messaging.MessageDeliveryException("Missing Authorization header");
            }
            String token = authHeader.substring(7);
            try {
                Long userId = jwtService.extractUserId(token);
                if (userId == null) {
                    throw new org.springframework.messaging.MessageDeliveryException("Invalid token: no userId");
                }
                final String principalName = userId.toString();
                accessor.setUser(() -> principalName);
                log.debug("WebSocket authenticated: userId={}", principalName);
            } catch (org.springframework.messaging.MessageDeliveryException e) {
                throw e;
            } catch (Exception e) {
                log.warn("WebSocket auth failed: {}", e.getMessage());
                throw new org.springframework.messaging.MessageDeliveryException("Auth failed: " + e.getMessage());
            }
        }
        return message;
    }
}