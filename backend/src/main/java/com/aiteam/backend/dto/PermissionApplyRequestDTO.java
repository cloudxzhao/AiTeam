package com.aiteam.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * 权限申请请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionApplyRequestDTO {

    @NotNull(message = "项目 ID 不能为空")
    private Long projectId;

    @NotNull(message = "角色 ID 不能为空")
    private Long roleId;

    private String reason;
}
