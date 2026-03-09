package com.aiteam.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueDTO {

    private Long id;
    private Long project;
    private String subject;
    private String description;
    private Long status;
    private String statusName;
    private Integer priority;
    private Integer severity;
    private Integer type;
    private Long assignedTo;
    private String assignedToName;
    private Long owner;
    private String ownerName;
    private Boolean isArchived;
}