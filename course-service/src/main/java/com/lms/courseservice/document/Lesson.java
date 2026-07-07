package com.lms.courseservice.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Field("id")
    private String id;

    private String title;

    private String content;

    private String videoUrl;

    @Builder.Default
    private List<String> attachmentUrls = new java.util.ArrayList<>();

    private Integer durationMinutes;

    private int order;
}