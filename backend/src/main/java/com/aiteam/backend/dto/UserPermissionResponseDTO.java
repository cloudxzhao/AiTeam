package com.aiteam.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * 用户权限响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPermissionResponseDTO {

    private Long userId;
    private String username;
    private Boolean isSuperuser;
    private ProjectPermission projectPermissions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectPermission {
        private Long projectId;
        private String projectName;
        private Long roleId;
        private String roleName;
        private Set<String> permissions;
    }

    public static UserPermissionResponseDTO basic(Long userId, String username, Boolean isSuperuser) {
        return new UserPermissionResponseDTO(userId, username, isSuperuser, null);
    }
}
