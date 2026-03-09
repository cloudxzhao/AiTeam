package com.aiteam.backend.service;

import com.aiteam.backend.entity.*;
import com.aiteam.backend.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 审计日志服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    /**
     * 记录权限申请
     */
    @Transactional
    public void logApplication(PermissionApplication application, String ip) {
        AuditLog log = AuditLog.builder()
                .logId(generateLogId())
                .operatorId(application.getApplicantId())
                .operatorIp(ip)
                .action(AuditLog.AuditAction.APPLY)
                .targetProjectId(application.getProjectId())
                .targetRoleId(application.getRoleId())
                .detail(toJson(Map.of(
                        "applyId", application.getApplyId(),
                        "reason", application.getReason()
                )))
                .result(AuditLog.AuditResult.SUCCESS)
                .build();

        auditLogRepository.save(log);
    }

    /**
     * 记录审批通过
     */
    @Transactional
    public void logApprove(PermissionApplication application, Long approverId, String ip) {
        AuditLog log = AuditLog.builder()
                .logId(generateLogId())
                .operatorId(approverId)
                .operatorIp(ip)
                .action(AuditLog.AuditAction.APPROVE)
                .targetUserId(application.getApplicantId())
                .targetProjectId(application.getProjectId())
                .targetRoleId(application.getRoleId())
                .detail(toJson(Map.of(
                        "applyId", application.getApplyId(),
                        "note", application.getApproveNote()
                )))
                .result(AuditLog.AuditResult.SUCCESS)
                .build();

        auditLogRepository.save(log);
    }

    /**
     * 记录拒绝申请
     */
    @Transactional
    public void logReject(PermissionApplication application, Long approverId, String ip) {
        AuditLog log = AuditLog.builder()
                .logId(generateLogId())
                .operatorId(approverId)
                .operatorIp(ip)
                .action(AuditLog.AuditAction.REJECT)
                .targetUserId(application.getApplicantId())
                .targetProjectId(application.getProjectId())
                .targetRoleId(application.getRoleId())
                .detail(toJson(Map.of(
                        "applyId", application.getApplyId(),
                        "reason", application.getApproveNote()
                )))
                .result(AuditLog.AuditResult.SUCCESS)
                .build();

        auditLogRepository.save(log);
    }

    /**
     * 记录授予权限
     */
    @Transactional
    public void logGrant(Long operatorId, Long targetUserId, Long projectId, Long roleId, String ip) {
        AuditLog log = AuditLog.builder()
                .logId(generateLogId())
                .operatorId(operatorId)
                .operatorIp(ip)
                .action(AuditLog.AuditAction.GRANT)
                .targetUserId(targetUserId)
                .targetProjectId(projectId)
                .targetRoleId(roleId)
                .result(AuditLog.AuditResult.SUCCESS)
                .build();

        auditLogRepository.save(log);
    }

    /**
     * 记录回收权限
     */
    @Transactional
    public void logRevoke(Long operatorId, Long targetUserId, Long projectId, String ip) {
        AuditLog log = AuditLog.builder()
                .logId(generateLogId())
                .operatorId(operatorId)
                .operatorIp(ip)
                .action(AuditLog.AuditAction.REVOKE)
                .targetUserId(targetUserId)
                .targetProjectId(projectId)
                .result(AuditLog.AuditResult.SUCCESS)
                .build();

        auditLogRepository.save(log);
    }

    /**
     * 记录创建项目
     */
    @Transactional
    public void logCreateProject(Long operatorId, Long projectId, String ip) {
        AuditLog log = AuditLog.builder()
                .logId(generateLogId())
                .operatorId(operatorId)
                .operatorIp(ip)
                .action(AuditLog.AuditAction.CREATE_PROJECT)
                .targetProjectId(projectId)
                .result(AuditLog.AuditResult.SUCCESS)
                .build();

        auditLogRepository.save(log);
    }

    private String generateLogId() {
        return "AUD" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String toJson(Map<String, Object> data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize audit log detail", e);
            return "{}";
        }
    }
}
