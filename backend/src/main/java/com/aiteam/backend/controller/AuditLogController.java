package com.aiteam.backend.controller;

import com.aiteam.backend.dto.AuditLogDTO;
import com.aiteam.backend.entity.AuditLog;
import com.aiteam.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 审计日志控制器
 */
@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Slf4j
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    /**
     * 获取审计日志列表（仅超级管理员）
     */
    @GetMapping
    public ResponseEntity<Page<Map<String, Object>>> getAuditLogs(
            @RequestParam(required = false) Long operatorId,
            @RequestParam(required = false) Long targetUserId,
            @RequestParam(required = false) Long targetProjectId,
            @RequestParam(required = false) String action,
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {

        // TODO: 校验是否是超级管理员

        Page<AuditLog> logs;
        if (operatorId != null) {
            logs = auditLogRepository.findByOperatorId(operatorId, pageable);
        } else if (targetUserId != null) {
            logs = auditLogRepository.findByTargetUserId(targetUserId, pageable);
        } else if (targetProjectId != null) {
            logs = auditLogRepository.findByTargetProjectId(targetProjectId, pageable);
        } else if (action != null) {
            logs = auditLogRepository.findByAction(AuditLog.AuditAction.valueOf(action), pageable);
        } else {
            logs = auditLogRepository.findAll(pageable);
        }

        return ResponseEntity.ok(logs.map(log -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", log.getId());
            dto.put("logId", log.getLogId());
            dto.put("operatorId", log.getOperatorId());
            dto.put("operatorIp", log.getOperatorIp());
            dto.put("action", log.getAction().name());
            dto.put("targetUserId", log.getTargetUserId());
            dto.put("targetProjectId", log.getTargetProjectId());
            dto.put("targetRoleId", log.getTargetRoleId());
            dto.put("detail", log.getDetail());
            dto.put("result", log.getResult().name());
            dto.put("errorMsg", log.getErrorMsg());
            dto.put("createdAt", log.getCreatedAt());
            return dto;
        }));
    }

    /**
     * 获取审计日志详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getAuditLog(@PathVariable Long id) {
        return auditLogRepository.findById(id)
                .map(log -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", log.getId());
                    response.put("logId", log.getLogId());
                    response.put("operatorId", log.getOperatorId());
                    response.put("operatorIp", log.getOperatorIp());
                    response.put("action", log.getAction().name());
                    response.put("targetUserId", log.getTargetUserId());
                    response.put("targetProjectId", log.getTargetProjectId());
                    response.put("targetRoleId", log.getTargetRoleId());
                    response.put("detail", log.getDetail());
                    response.put("result", log.getResult().name());
                    response.put("errorMsg", log.getErrorMsg());
                    response.put("createdAt", log.getCreatedAt());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
