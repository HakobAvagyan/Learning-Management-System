package com.lms.assessmentservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record OptionRequest(
        @NotBlank(message = "Option text must not be blank")
        String text,

        @JsonProperty("isCorrect")
        boolean correct
) {}