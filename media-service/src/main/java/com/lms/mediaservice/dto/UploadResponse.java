package com.lms.mediaservice.dto;

public record UploadResponse(
        String key,
        String bucket,
        String originalFilename,
        long sizeBytes,
        String contentType
) {}