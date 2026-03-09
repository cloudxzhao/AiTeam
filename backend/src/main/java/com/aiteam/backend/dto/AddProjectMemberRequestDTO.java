package com.aiteam.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * 添加项目成员请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddProjectMemberRequestDTO {

    @NotNull(message = "用户 ID 不能为空")
    private Long userId;

    @NotNull(message = "角色 ID 不能为空")
    private Long roleId;
}
