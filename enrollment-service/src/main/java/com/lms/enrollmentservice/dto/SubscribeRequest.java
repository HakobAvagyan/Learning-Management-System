package com.lms.enrollmentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SubscribeRequest(

        @NotNull
        @Positive
        Long userId,

        @NotBlank
        String courseId
) {}