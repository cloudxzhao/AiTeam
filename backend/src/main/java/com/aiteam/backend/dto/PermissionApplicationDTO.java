package com.aiteam.backend.dto;

import com.aiteam.backend.entity.PermissionApplication;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 权限申请 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionApplicationDTO {

    private Long id;
    private String applyId;
    private Long applicantId;
    private String applicantName;
    private String applicantEmail;
    private Long projectId;
    private String projectName;
    private Long roleId;
    private String roleName;
    private String reason;
    private ApplicationStatus status;
    private LocalDateTime submittedAt;
    private Long approverId;
    private String approverName;
    private LocalDateTime approvedAt;
    private String approveNote;

    public enum ApplicationStatus {
        PENDING, APPROVED, REJECTED
    }

    public static PermissionApplicationDTO fromEntity(com.aiteam.backend.entity.PermissionApplication entity) {
        PermissionApplicationDTO dto = new PermissionApplicationDTO();
        dto.setId(entity.getId());
        dto.setApplyId(entity.getApplyId());
        dto.setApplicantId(entity.getApplicantId());
        dto.setProjectId(entity.getProjectId());
        dto.setRoleId(entity.getRoleId());
        dto.setReason(entity.getReason());
        dto.setStatus(entity.getStatus() != null
                ? ApplicationStatus.valueOf(entity.getStatus().name())
                : null);
        dto.setSubmittedAt(entity.getSubmittedAt());
        dto.setApproverId(entity.getApproverId());
        dto.setApprovedAt(entity.getApprovedAt());
        dto.setApproveNote(entity.getApproveNote());

        // 设置关联数据
        if (entity.getApplicant() != null) {
            dto.setApplicantName(entity.getApplicant().getUsername());
            dto.setApplicantEmail(entity.getApplicant().getEmail());
        }
        if (entity.getProject() != null) {
            dto.setProjectName(entity.getProject().getName());
        }
        if (entity.getRole() != null) {
            dto.setRoleName(entity.getRole().getName());
        }
        if (entity.getApprover() != null) {
            dto.setApproverName(entity.getApprover().getUsername());
        }

        return dto;
    }

    public static PermissionApplication toEntity(PermissionApplicationDTO dto) {
        return com.aiteam.backend.entity.PermissionApplication.builder()
                .id(dto.getId())
                .applyId(dto.getApplyId())
                .applicantId(dto.getApplicantId())
                .projectId(dto.getProjectId())
                .roleId(dto.getRoleId())
                .reason(dto.getReason())
                .status(dto.getStatus() != null
                        ? PermissionApplication.ApplicationStatus.valueOf(dto.getStatus().name())
                        : PermissionApplication.ApplicationStatus.PENDING)
                .submittedAt(dto.getSubmittedAt())
                .approverId(dto.getApproverId())
                .approvedAt(dto.getApprovedAt())
                .approveNote(dto.getApproveNote())
                .build();
    }
}
