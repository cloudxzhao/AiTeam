package com.aiteam.backend.service;

import com.aiteam.backend.dto.ProjectMemberDTO;
import com.aiteam.backend.entity.Project;
import com.aiteam.backend.entity.ProjectMember;
import com.aiteam.backend.entity.Role;
import com.aiteam.backend.entity.User;
import com.aiteam.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 项目成员服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final PermissionService permissionService;

    /**
     * 获取项目成员列表
     */
    @Transactional(readOnly = true)
    public List<ProjectMemberDTO> getMembersByProject(Long projectId) {
        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        return members.stream()
                .map(ProjectMemberDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 获取用户参与的项目列表
     */
    @Transactional(readOnly = true)
    public List<ProjectMember> getProjectsByUser(Long userId) {
        return projectMemberRepository.findByUserId(userId);
    }

    /**
     * 获取用户在项目中的成员信息
     */
    @Transactional(readOnly = true)
    public Optional<ProjectMember> getMemberByProjectAndUser(Long projectId, Long userId) {
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId);
    }

    /**
     * 添加项目成员
     */
    @Transactional
    public ProjectMember addMember(Long projectId, Long userId, Long roleId, Long operatorId, String ip) {
        // 验证项目
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("项目不存在"));

        // 验证用户
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        // 验证角色
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("角色不存在"));

        // 检查是否已是成员
        Optional<ProjectMember> existing = projectMemberRepository.findByProjectIdAndUserId(projectId, userId);
        if (existing.isPresent()) {
            // 更新角色
            ProjectMember member = existing.get();
            member.setRoleId(roleId);
            ProjectMember saved = projectMemberRepository.save(member);

            // 清除权限缓存
            permissionService.clearUserPermissionCache(userId, projectId);

            // 记录审计日志
            auditLogService.logGrant(operatorId, userId, projectId, roleId, ip);

            log.info("Project member role updated: userId={}, projectId={}, roleId={}", userId, projectId, roleId);
            return saved;
        }

        // 创建新成员
        ProjectMember member = ProjectMember.builder()
                .projectId(projectId)
                .userId(userId)
                .roleId(roleId)
                .isOwner(false)
                .build();

        ProjectMember saved = projectMemberRepository.save(member);

        // 清除权限缓存
        permissionService.clearUserPermissionCache(userId, projectId);

        // 记录审计日志
        auditLogService.logGrant(operatorId, userId, projectId, roleId, ip);

        log.info("Project member added: userId={}, projectId={}, roleId={}", userId, projectId, roleId);
        return saved;
    }

    /**
     * 更新成员角色
     */
    @Transactional
    public ProjectMember updateMemberRole(Long projectId, Long userId, Long roleId, Long operatorId, String ip) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不是项目成员"));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("角色不存在"));

        Long oldRoleId = member.getRoleId();
        member.setRoleId(roleId);
        ProjectMember saved = projectMemberRepository.save(member);

        // 清除权限缓存
        permissionService.clearUserPermissionCache(userId, projectId);

        // 记录审计日志
        Map<String, Object> detail = new HashMap<>();
        detail.put("oldRoleId", oldRoleId);
        detail.put("newRoleId", roleId);
        auditLogService.logGrant(operatorId, userId, projectId, roleId, ip);

        log.info("Project member role updated: userId={}, projectId={}, oldRoleId={}, newRoleId={}",
                userId, projectId, oldRoleId, roleId);

        return saved;
    }

    /**
     * 移除项目成员
     */
    @Transactional
    public void removeMember(Long projectId, Long userId, Long operatorId, String ip) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不是项目成员"));

        Long roleId = member.getRoleId();

        projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);

        // 清除权限缓存
        permissionService.clearUserPermissionCache(userId, projectId);

        // 记录审计日志
        auditLogService.logRevoke(operatorId, userId, projectId, ip);

        log.info("Project member removed: userId={}, projectId={}", userId, projectId);
    }

    /**
     * 检查用户是否是项目成员
     */
    @Transactional(readOnly = true)
    public boolean isMember(Long projectId, Long userId) {
        return projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
    }

    /**
     * 检查用户是否是项目管理员
     */
    @Transactional(readOnly = true)
    public boolean isProjectAdmin(Long projectId, Long userId) {
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .map(member -> member.getRole().getIsAdmin())
                .orElse(false);
    }
}
