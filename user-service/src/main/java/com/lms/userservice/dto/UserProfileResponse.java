package com.lms.userservice.dto;

import java.time.OffsetDateTime;
import java.util.Set;

public record UserProfileResponse(
        Long id,
        String username,
        String email,
        String firstName,
        String lastName,
        Set<String> roles,
        boolean enabled,
        OffsetDateTime createdAt
) {}