package com.aiteam.backend.service;

import com.aiteam.backend.entity.*;
import com.aiteam.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 权限服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionService {

    private final ProjectMemberRepository projectMemberRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String USER_PERMISSIONS_CACHE_KEY = "user:permissions:";
    private static final String ROLE_PERMISSIONS_CACHE_KEY = "role:permissions:";
    private static final long USER_PERMISSIONS_TTL = 30; // 分钟

    /**
     * 获取用户在项目中的权限点集合
     */
    @Transactional(readOnly = true)
    public Set<String> getUserPermissions(Long userId, Long projectId) {
        String cacheKey = USER_PERMISSIONS_CACHE_KEY + userId + ":" + projectId;

        // 尝试从缓存获取
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached instanceof Set) {
            log.debug("Cache hit for user permissions: userId={}, projectId={}", userId, projectId);
            return (Set<String>) cached;
        }

        // 从数据库查询
        Set<String> permissions = loadUserPermissionsFromDb(userId, projectId);

        // 写入缓存
        redisTemplate.opsForValue().set(cacheKey, permissions, USER_PERMISSIONS_TTL, TimeUnit.MINUTES);

        return permissions;
    }

    /**
     * 获取用户在项目中的角色
     */
    @Transactional(readOnly = true)
    public Optional<Role> getUserRoleInProject(Long userId, Long projectId) {
        return projectMemberRepository.findByProjectIdAndUserIdWithPermissions(projectId, userId)
                .map(ProjectMember::getRole);
    }

    /**
     * 检查用户是否有指定权限
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(Long userId, Long projectId, String permissionCodename) {
        Set<String> permissions = getUserPermissions(userId, projectId);
        return permissions.contains(permissionCodename);
    }

    /**
     * 检查用户是否是项目管理员
     */
    @Transactional(readOnly = true)
    public boolean isProjectAdmin(Long userId, Long projectId) {
        Optional<Role> role = getUserRoleInProject(userId, projectId);
        return role.map(Role::getIsAdmin).orElse(false);
    }

    /**
     * 检查用户是否是超级管理员
     */
    public boolean isSuperuser(User user) {
        return user != null && Boolean.TRUE.equals(user.getIsSuperuser());
    }

    /**
     * 获取所有预定义角色
     */
    @Transactional(readOnly = true)
    public List<Role> getAllSystemRoles() {
        return roleRepository.findAllByIsSystemTrue();
    }

    /**
     * 获取所有权限点
     */
    @Transactional(readOnly = true)
    public List<Permission> getAllPermissions() {
        return permissionRepository.findByIsActiveTrue();
    }

    /**
     * 清除用户权限缓存
     */
    public void clearUserPermissionCache(Long userId, Long projectId) {
        String cacheKey = USER_PERMISSIONS_CACHE_KEY + userId + ":" + projectId;
        redisTemplate.delete(cacheKey);
        log.debug("Cleared permission cache for userId={}, projectId={}", userId, projectId);
    }

    /**
     * 从数据库加载用户权限
     */
    private Set<String> loadUserPermissionsFromDb(Long userId, Long projectId) {
        // 检查是否是超级管理员
        Optional<ProjectMember> memberOpt = projectMemberRepository.findByProjectIdAndUserId(projectId, userId);
        if (memberOpt.isEmpty()) {
            return Collections.emptySet();
        }

        ProjectMember member = memberOpt.get();
        Role role = member.getRole();
        if (role == null) {
            return Collections.emptySet();
        }

        // 如果是项目管理员或超级管理员，返回所有权限
        if (Boolean.TRUE.equals(role.getIsAdmin())) {
            return getAllPermissionCodenames();
        }

        // 返回角色关联的权限点
        Set<Permission> permissions = role.getPermissions();
        if (permissions == null || permissions.isEmpty()) {
            // 从数据库加载角色权限
            Role roleWithPermissions = roleRepository.findBySlugWithPermissions(role.getSlug())
                    .orElse(role);
            return roleWithPermissions.getPermissions().stream()
                    .map(Permission::getCodename)
                    .collect(Collectors.toSet());
        }

        return permissions.stream()
                .map(Permission::getCodename)
                .collect(Collectors.toSet());
    }

    /**
     * 获取所有权限点标识
     */
    private Set<String> getAllPermissionCodenames() {
        List<Permission> allPermissions = permissionRepository.findAll();
        return allPermissions.stream()
                .map(Permission::getCodename)
                .collect(Collectors.toSet());
    }

    /**
     * 获取角色的权限点
     */
    @Transactional(readOnly = true)
    public Set<String> getRolePermissions(Long roleId) {
        String cacheKey = ROLE_PERMISSIONS_CACHE_KEY + roleId;

        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached instanceof Set) {
            return (Set<String>) cached;
        }

        Optional<Role> roleOpt = roleRepository.findById(roleId);
        if (roleOpt.isEmpty()) {
            return Collections.emptySet();
        }

        Role role = roleOpt.get();
        Set<String> permissions = role.getPermissions().stream()
                .map(Permission::getCodename)
                .collect(Collectors.toSet());

        redisTemplate.opsForValue().set(cacheKey, permissions, 2, TimeUnit.HOURS);

        return permissions;
    }
}
