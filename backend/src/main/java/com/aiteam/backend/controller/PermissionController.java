package com.aiteam.backend.controller;

import com.aiteam.backend.dto.*;
import com.aiteam.backend.entity.Permission;
import com.aiteam.backend.entity.PermissionApplication;
import com.aiteam.backend.entity.Role;
import com.aiteam.backend.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 权限相关控制器
 */
@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
@Slf4j
public class PermissionController {

    private final PermissionService permissionService;
    private final PermissionApplicationService applicationService;
    private final ProjectMemberService projectMemberService;

    /**
     * 获取所有权限点
     */
    @GetMapping("/points")
    public ResponseEntity<List<PermissionDTO>> getAllPermissions() {
        List<Permission> permissions = permissionService.getAllPermissions();
        return ResponseEntity.ok(PermissionDTO.fromEntities(permissions));
    }

    /**
     * 获取所有系统角色
     */
    @GetMapping("/roles")
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        List<Role> roles = permissionService.getAllSystemRoles();
        return ResponseEntity.ok(RoleDTO.fromEntities(roles));
    }

    /**
     * 获取当前用户的权限列表
     */
    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyPermissions(@AuthenticationPrincipal UserDetails userDetails) {
        // 实现获取当前用户权限逻辑
        Map<String, Object> response = new HashMap<>();
        response.put("permissions", List.of());
        return ResponseEntity.ok(response);
    }

    /**
     * 获取用户在指定项目的权限
     */
    @GetMapping("/projects/{projectId}")
    public ResponseEntity<Map<String, Object>> getUserPermissionsInProject(
            @PathVariable Long projectId,
            @RequestParam Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {

        java.util.Set<String> permissions = permissionService.getUserPermissions(userId, projectId);
        Role role = permissionService.getUserRoleInProject(userId, projectId).orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("projectId", projectId);
        response.put("permissions", permissions);
        response.put("role", role != null ? RoleDTO.fromEntity(role) : null);

        return ResponseEntity.ok(response);
    }

    /**
     * 校验权限
     */
    @PostMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkPermission(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = Long.valueOf(request.get("userId").toString());
        Long projectId = Long.valueOf(request.get("projectId").toString());
        String permissionCodename = request.get("permissionCodename").toString();

        boolean hasPermission = permissionService.hasPermission(userId, projectId, permissionCodename);

        Map<String, Boolean> response = new HashMap<>();
        response.put("hasPermission", hasPermission);
        return ResponseEntity.ok(response);
    }
}
