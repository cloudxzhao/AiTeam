package com.aiteam.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanbanStatusDTO {

    private Long id;
    private Long project;
    private String name;
    private String slug;
    private String color;
    private Integer position;
    private Boolean isArchived;
}