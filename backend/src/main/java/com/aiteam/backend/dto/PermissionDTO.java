package com.aiteam.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 权限 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionDTO {

    private Long id;
    private String codename;
    private String name;
    private String module;
    private String description;
    private Boolean isActive;

    public static PermissionDTO fromEntity(com.aiteam.backend.entity.Permission entity) {
        return PermissionDTO.builder()
                .id(entity.getId())
                .codename(entity.getCodename())
                .name(entity.getName())
                .module(entity.getModule())
                .description(entity.getDescription())
                .isActive(entity.getIsActive())
                .build();
    }

    public static List<PermissionDTO> fromEntities(List<com.aiteam.backend.entity.Permission> entities) {
        return entities.stream().map(PermissionDTO::fromEntity).toList();
    }
}
