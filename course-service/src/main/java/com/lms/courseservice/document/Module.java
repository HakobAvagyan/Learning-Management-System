package com.lms.courseservice.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Module {

    @Field("id")
    private String id;

    private String title;

    private String description;

    private int order;

    @Builder.Default
    private List<Lesson> lessons = new ArrayList<>();
}