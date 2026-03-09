package com.aiteam.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {

    private Long id;

    @NotBlank(message = "项目名称不能为空")
    private String name;

    private String slug;

    private String description;

    private String logo;

    private Long ownerId;

    private String ownerName;

    private Boolean isPrivate;

    private Boolean isArchived;

    private Boolean isBacklogActivated;

    private Boolean isKanbanActivated;

    private Boolean isWikiActivated;

    private Boolean isIssuesActivated;

    private Integer totalMilestones;

    private Integer totalStories;

    private Integer totalTasks;

    private Integer totalIssues;
}