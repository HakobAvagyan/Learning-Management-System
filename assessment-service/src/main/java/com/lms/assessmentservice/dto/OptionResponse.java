package com.lms.assessmentservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record OptionResponse(
        String id,
        String text,
        @JsonProperty("isCorrect") boolean correct
) {}