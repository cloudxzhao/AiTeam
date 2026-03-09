package com.aiteam.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * 审批请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveRequestDTO {

    @NotNull(message = "审批备注")
    private String note;
}
