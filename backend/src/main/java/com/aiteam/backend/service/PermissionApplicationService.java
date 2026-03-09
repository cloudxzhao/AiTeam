package com.aiteam.backend.service;

import com.aiteam.backend.dto.AuditLogDTO;
import com.aiteam.backend.entity.AuditLog;
import com.aiteam.backend.entity.PermissionApplication;
import com.aiteam.backend.entity.Project;
import com.aiteam.backend.entity.Role;
import com.aiteam.backend.entity.User;
import com.aiteam.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 权限申请服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionApplicationService {

    private final PermissionApplicationRepository applicationRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final RoleRepository roleRepository;
    private final ProjectRepository projectRepository;
    private final AuditLogService auditLogService;
    private final PermissionService permissionService;

    /**
     * 提交权限申请
     */
    @Transactional
    public PermissionApplication submitApplication(Long applicantId, Long projectId, Long roleId, String reason) {
        // 验证项目和角色
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("项目不存在"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("角色不存在"));

        // 检查是否已有申请
        List<PermissionApplication> pendingApplications = applicationRepository
                .findPendingByProjectIdAndApplicantId(projectId, applicantId);
        if (!pendingApplications.isEmpty()) {
            throw new IllegalStateException("已有待审批的申请");
        }

        // 检查用户是否已有该角色
        boolean alreadyHasRole = projectMemberRepository.existsByProjectIdAndUserId(projectId, applicantId);
        if (alreadyHasRole) {
            throw new IllegalStateException("用户已是项目成员");
        }

        // 创建申请
        PermissionApplication application = PermissionApplication.builder()
                .applyId(generateApplyId())
                .applicantId(applicantId)
                .projectId(projectId)
                .roleId(roleId)
                .reason(reason)
                .status(PermissionApplication.ApplicationStatus.PENDING)
                .build();

        PermissionApplication saved = applicationRepository.save(application);

        // 记录审计日志
        auditLogService.logApplication(saved, null);

        log.info("Permission application submitted: {}", saved.getApplyId());
        return saved;
    }

    /**
     * 获取用户的申请历史
     */
    @Transactional(readOnly = true)
    public List<PermissionApplication> getApplicationsByApplicant(Long applicantId) {
        return applicationRepository.findByApplicantId(applicantId);
    }

    /**
     * 获取待审批的申请列表
     */
    @Transactional(readOnly = true)
    public List<PermissionApplication> getPendingApplicationsForApprover(Long approverId, boolean isSuperuser) {
        if (isSuperuser) {
            // 超级管理员可以看到所有待审批申请
            return applicationRepository.findAllPendingWithDetails();
        } else {
            // 项目管理员只能看到自己项目的待审批申请
            return applicationRepository.findAllPendingByProjectId(null); // 需要进一步过滤
        }
    }

    /**
     * 获取待项目审批的申请
     */
    @Transactional(readOnly = true)
    public List<PermissionApplication> getPendingApplicationsForProject(Long projectId) {
        return applicationRepository.findAllPendingByProjectId(projectId);
    }

    /**
     * 批准申请
     */
    @Transactional
    public PermissionApplication approveApplication(Long applicationId, Long approverId, String note) {
        PermissionApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("申请不存在"));

        if (application.getStatus() != PermissionApplication.ApplicationStatus.PENDING) {
            throw new IllegalStateException("申请状态不是待审批");
        }

        // 更新申请状态
        application.setStatus(PermissionApplication.ApplicationStatus.APPROVED);
        application.setApproverId(approverId);
        application.setApprovedAt(LocalDateTime.now());
        application.setApproveNote(note);

        // 添加用户到项目
        projectMemberRepository.findByProjectIdAndUserId(application.getProjectId(), application.getApplicantId())
                .ifPresentOrElse(
                        existing -> {
                            existing.setRoleId(application.getRoleId());
                            projectMemberRepository.save(existing);
                        },
                        () -> {
                            var member = com.aiteam.backend.entity.ProjectMember.builder()
                                    .projectId(application.getProjectId())
                                    .userId(application.getApplicantId())
                                    .roleId(application.getRoleId())
                                    .isOwner(false)
                                    .build();
                            projectMemberRepository.save(member);
                        }
                );

        PermissionApplication saved = applicationRepository.save(application);

        // 清除权限缓存
        permissionService.clearUserPermissionCache(application.getApplicantId(), application.getProjectId());

        // 记录审计日志
        auditLogService.logApprove(saved, approverId, null);

        log.info("Permission application approved: {}", application.getApplyId());
        return saved;
    }

    /**
     * 拒绝申请
     */
    @Transactional
    public PermissionApplication rejectApplication(Long applicationId, Long approverId, String reason) {
        PermissionApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("申请不存在"));

        if (application.getStatus() != PermissionApplication.ApplicationStatus.PENDING) {
            throw new IllegalStateException("申请状态不是待审批");
        }

        application.setStatus(PermissionApplication.ApplicationStatus.REJECTED);
        application.setApproverId(approverId);
        application.setApprovedAt(LocalDateTime.now());
        application.setApproveNote(reason);

        PermissionApplication saved = applicationRepository.save(application);

        // 记录审计日志
        auditLogService.logReject(saved, approverId, null);

        log.info("Permission application rejected: {}", application.getApplyId());
        return saved;
    }

    /**
     * 获取申请详情
     */
    @Transactional(readOnly = true)
    public Optional<PermissionApplication> getApplication(Long applicationId) {
        return applicationRepository.findById(applicationId);
    }

    /**
     * 生成申请 ID
     */
    private String generateApplyId() {
        return "APP" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
