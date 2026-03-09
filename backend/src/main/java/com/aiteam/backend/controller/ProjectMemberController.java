package com.aiteam.backend.controller;

import com.aiteam.backend.dto.AddProjectMemberRequestDTO;
import com.aiteam.backend.dto.ProjectMemberDTO;
import com.aiteam.backend.entity.ProjectMember;
import com.aiteam.backend.service.ProjectMemberService;
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

/**
 * 项目成员控制器
 */
@RestController
@RequestMapping("/api/v1/projects/{projectId}/members")
@RequiredArgsConstructor
@Slf4j
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    /**
     * 获取项目成员列表
     */
    @GetMapping
    public ResponseEntity<List<ProjectMemberDTO>> getMembers(@PathVariable Long projectId) {
        List<ProjectMemberDTO> members = projectMemberService.getMembersByProject(projectId);
        return ResponseEntity.ok(members);
    }

    /**
     * 添加项目成员
     */
    @PostMapping
    public ResponseEntity<ProjectMemberDTO> addMember(
            @PathVariable Long projectId,
            @Valid @RequestBody AddProjectMemberRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long currentUserId = Long.valueOf(userDetails.getUsername());
        // TODO: 校验当前用户是否有权限添加成员

        ProjectMember member = projectMemberService.addMember(
                projectId,
                request.getUserId(),
                request.getRoleId(),
                currentUserId,
                null // TODO: 获取 IP 地址
        );

        return ResponseEntity.ok(ProjectMemberDTO.fromEntity(member));
    }

    /**
     * 更新成员角色
     */
    @PutMapping("/{userId}")
    public ResponseEntity<ProjectMemberDTO> updateMemberRole(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @Valid @RequestBody AddProjectMemberRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long currentUserId = Long.valueOf(userDetails.getUsername());
        // TODO: 校验当前用户是否有权限更新成员

        ProjectMember member = projectMemberService.updateMemberRole(
                projectId,
                userId,
                request.getRoleId(),
                currentUserId,
                null // TODO: 获取 IP 地址
        );

        return ResponseEntity.ok(ProjectMemberDTO.fromEntity(member));
    }

    /**
     * 移除项目成员
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long currentUserId = Long.valueOf(userDetails.getUsername());
        // TODO: 校验当前用户是否有权限移除成员

        projectMemberService.removeMember(projectId, userId, currentUserId, null);
        return ResponseEntity.ok().build();
    }

    /**
     * 获取单个成员信息
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ProjectMemberDTO> getMember(
            @PathVariable Long projectId,
            @PathVariable Long userId) {

        return projectMemberService.getMemberByProjectAndUser(projectId, userId)
                .map(member -> ResponseEntity.ok(ProjectMemberDTO.fromEntity(member)))
                .orElse(ResponseEntity.notFound().build());
    }
}
