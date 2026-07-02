package com.lms.mediaservice.dto;

import java.time.Instant;

public record PresignedUrlResponse(
        String url,
        String key,
        Instant expiresAt
) {}