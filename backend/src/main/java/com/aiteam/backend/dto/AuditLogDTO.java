package com.aiteam.backend.dto;

import com.aiteam.backend.entity.AuditLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 审计日志 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {

    private Long id;
    private String logId;
    private Long operatorId;
    private String operatorUsername;
    private String operatorIp;
    private String action;
    private Long targetUserId;
    private String targetUsername;
    private Long targetProjectId;
    private String targetProjectName;
    private Long targetRoleId;
    private String targetRoleName;
    private String detail;
    private String result;
    private String errorMsg;
    private LocalDateTime createdAt;

    public static AuditLogDTO fromEntity(com.aiteam.backend.entity.AuditLog entity) {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setId(entity.getId());
        dto.setLogId(entity.getLogId());
        dto.setOperatorId(entity.getOperatorId());
        dto.setOperatorIp(entity.getOperatorIp());
        dto.setAction(entity.getAction() != null ? entity.getAction().name() : null);
        dto.setTargetUserId(entity.getTargetUserId());
        dto.setTargetProjectId(entity.getTargetProjectId());
        dto.setTargetRoleId(entity.getTargetRoleId());
        dto.setDetail(entity.getDetail());
        dto.setResult(entity.getResult() != null ? entity.getResult().name() : null);
        dto.setErrorMsg(entity.getErrorMsg());
        dto.setCreatedAt(entity.getCreatedAt());

        // 设置关联数据
        if (entity.getOperator() != null) {
            dto.setOperatorUsername(entity.getOperator().getUsername());
        }
        if (entity.getTargetUser() != null) {
            dto.setTargetUsername(entity.getTargetUser().getUsername());
        }
        if (entity.getTargetProject() != null) {
            dto.setTargetProjectName(entity.getTargetProject().getName());
        }
        if (entity.getTargetRole() != null) {
            dto.setTargetRoleName(entity.getTargetRole().getName());
        }

        return dto;
    }
}
