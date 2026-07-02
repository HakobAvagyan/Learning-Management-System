package com.lms.userservice.dto;

import java.util.Set;

public record AuthResponse(
        Long id,
        String token,
        String username,
        String email,
        Set<String> roles
) {}