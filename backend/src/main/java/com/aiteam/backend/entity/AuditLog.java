package com.aiteam.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 审计日志实体
 */
@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "log_id", unique = true, nullable = false, length = 32)
    private String logId;

    @Column(name = "operator_id")
    private Long operatorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id", insertable = false, updatable = false)
    private User operator;

    @Column(name = "operator_ip", length = 45)
    private String operatorIp;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AuditAction action;

    @Column(name = "target_user_id")
    private Long targetUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id", insertable = false, updatable = false)
    private User targetUser;

    @Column(name = "target_project_id")
    private Long targetProjectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_project_id", insertable = false, updatable = false)
    private Project targetProject;

    @Column(name = "target_role_id")
    private Long targetRoleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_role_id", insertable = false, updatable = false)
    private Role targetRole;

    @Column(columnDefinition = "jsonb")
    private String detail;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AuditResult result;

    @Column(name = "error_msg", columnDefinition = "TEXT")
    private String errorMsg;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum AuditAction {
        GRANT("授予权限"),
        REVOKE("回收权限"),
        APPLY("申请权限"),
        APPROVE("批准申请"),
        REJECT("拒绝申请"),
        CREATE_PROJECT("创建项目");

        private final String description;

        AuditAction(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum AuditResult {
        SUCCESS("成功"),
        FAILURE("失败");

        private final String description;

        AuditResult(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
