package com.aiteam.backend.controller;

import com.aiteam.backend.dto.ApproveRequestDTO;
import com.aiteam.backend.dto.PermissionApplicationDTO;
import com.aiteam.backend.dto.PermissionApplyRequestDTO;
import com.aiteam.backend.entity.PermissionApplication;
import com.aiteam.backend.service.PermissionApplicationService;
import jakarta.validation.Valid;
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
 * 权限申请控制器
 */
@RestController
@RequestMapping("/api/v1/permission-applications")
@RequiredArgsConstructor
@Slf4j
public class PermissionApplicationController {

    private final PermissionApplicationService applicationService;

    /**
     * 提交权限申请
     */
    @PostMapping
    public ResponseEntity<PermissionApplicationDTO> submitApplication(
            @Valid @RequestBody PermissionApplyRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long currentUserId = Long.valueOf(userDetails.getUsername());
        PermissionApplication application = applicationService.submitApplication(
                currentUserId,
                request.getProjectId(),
                request.getRoleId(),
                request.getReason()
        );

        return ResponseEntity.ok(PermissionApplicationDTO.fromEntity(application));
    }

    /**
     * 获取我的申请历史
     */
    @GetMapping("/my")
    public ResponseEntity<List<PermissionApplicationDTO>> getMyApplications(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long currentUserId = Long.valueOf(userDetails.getUsername());
        List<PermissionApplication> applications = applicationService.getApplicationsByApplicant(currentUserId);

        return ResponseEntity.ok(applications.stream()
                .map(PermissionApplicationDTO::fromEntity)
                .collect(Collectors.toList()));
    }

    /**
     * 获取待审批申请列表
     */
    @GetMapping("/pending")
    public ResponseEntity<List<PermissionApplicationDTO>> getPendingApplications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long projectId) {

        Long currentUserId = Long.valueOf(userDetails.getUsername());
        // TODO: 判断用户是否是超级管理员或项目管理员
        boolean isSuperuser = true; // 临时实现

        List<PermissionApplication> applications;
        if (projectId != null) {
            applications = applicationService.getPendingApplicationsForProject(projectId);
        } else if (isSuperuser) {
            applications = applicationService.getPendingApplicationsForApprover(currentUserId, true);
        } else {
            applications = List.of();
        }

        return ResponseEntity.ok(applications.stream()
                .map(PermissionApplicationDTO::fromEntity)
                .collect(Collectors.toList()));
    }

    /**
     * 获取申请详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<PermissionApplicationDTO> getApplication(@PathVariable Long id) {
        return applicationService.getApplication(id)
                .map(app -> ResponseEntity.ok(PermissionApplicationDTO.fromEntity(app)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 批准申请
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<PermissionApplicationDTO> approveApplication(
            @PathVariable Long id,
            @Valid @RequestBody ApproveRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long currentUserId = Long.valueOf(userDetails.getUsername());
        PermissionApplication application = applicationService.approveApplication(
                id,
                currentUserId,
                request.getNote()
        );

        return ResponseEntity.ok(PermissionApplicationDTO.fromEntity(application));
    }

    /**
     * 拒绝申请
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<PermissionApplicationDTO> rejectApplication(
            @PathVariable Long id,
            @Valid @RequestBody ApproveRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long currentUserId = Long.valueOf(userDetails.getUsername());
        PermissionApplication application = applicationService.rejectApplication(
                id,
                currentUserId,
                request.getNote()
        );

        return ResponseEntity.ok(PermissionApplicationDTO.fromEntity(application));
    }
}
