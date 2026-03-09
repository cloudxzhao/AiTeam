package com.aiteam.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * 项目成员 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberDTO {

    private Long id;
    private Long projectId;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String photo;
    private Long roleId;
    private String roleName;
    private Boolean isOwner;
    private String joinedAt;

    public static ProjectMemberDTO fromEntity(com.aiteam.backend.entity.ProjectMember entity) {
        ProjectMemberDTO dto = new ProjectMemberDTO();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProjectId());
        dto.setUserId(entity.getUserId());
        dto.setRoleId(entity.getRoleId());
        dto.setIsOwner(entity.getIsOwner());

        if (entity.getUser() != null) {
            dto.setUsername(entity.getUser().getUsername());
            dto.setEmail(entity.getUser().getEmail());
            dto.setFullName(entity.getUser().getFullName());
            dto.setPhoto(entity.getUser().getPhoto());
        }
        if (entity.getRole() != null) {
            dto.setRoleName(entity.getRole().getName());
        }

        return dto;
    }

    public static ProjectMemberDTO fromEntityWithDetails(com.aiteam.backend.entity.ProjectMember entity) {
        return fromEntity(entity);
    }
}
