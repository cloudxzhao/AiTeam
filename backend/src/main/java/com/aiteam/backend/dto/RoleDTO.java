package com.aiteam.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 角色 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private Boolean isSystem;
    private Boolean isAdmin;
    private List<PermissionDTO> permissions;

    public static RoleDTO fromEntity(com.aiteam.backend.entity.Role entity) {
        return RoleDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .slug(entity.getSlug())
                .description(entity.getDescription())
                .isSystem(entity.getIsSystem())
                .isAdmin(entity.getIsAdmin())
                .permissions(entity.getPermissions() != null
                        ? entity.getPermissions().stream().map(PermissionDTO::fromEntity).collect(Collectors.toList())
                        : null)
                .build();
    }

    public static List<RoleDTO> fromEntities(List<com.aiteam.backend.entity.Role> entities) {
        return entities.stream().map(RoleDTO::fromEntity).collect(Collectors.toList());
    }
}
