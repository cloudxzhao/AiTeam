package com.aiteam.backend.controller;

import com.aiteam.backend.dto.IssueDTO;
import com.aiteam.backend.dto.KanbanStatusDTO;
import com.aiteam.backend.dto.UserStoryDTO;
import com.aiteam.backend.service.IssueService;
import com.aiteam.backend.service.KanbanService;
import com.aiteam.backend.service.KanbanStatusService;
import com.aiteam.backend.service.UserStoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/kanban")
@RequiredArgsConstructor
public class KanbanController {

    private final KanbanStatusService kanbanStatusService;
    private final UserStoryService userStoryService;
    private final IssueService issueService;
    private final KanbanService kanbanService;

    /**
     * 获取统一看板视图 (包含UserStory和Issue)
     */
    @GetMapping("/board")
    public ResponseEntity<Map<String, Object>> getKanbanBoard(@RequestParam Long project) {
        Map<String, Object> board = kanbanService.getKanbanBoard(project);
        return ResponseEntity.ok(board);
    }

    /**
     * 移动UserStory卡片
     */
    @PostMapping("/userstories/{id}/move")
    public ResponseEntity<Map<String, Object>> moveUserStory(
            @PathVariable Long id,
            @RequestParam Long project,
            @RequestParam Long toStatusId,
            @RequestParam(required = false) String reason) {
        Map<String, Object> result = kanbanService.moveUserStory(id, project, toStatusId, reason);
        return ResponseEntity.ok(result);
    }

    /**
     * 移动Issue卡片
     */
    @PostMapping("/issues/{id}/move")
    public ResponseEntity<Map<String, Object>> moveIssue(
            @PathVariable Long id,
            @RequestParam Long project,
            @RequestParam Long toStatusId,
            @RequestParam(required = false) String reason) {
        Map<String, Object> result = kanbanService.moveIssue(id, project, toStatusId, reason);
        return ResponseEntity.ok(result);
    }

    /**
     * 重新排序卡片
     */
    @PostMapping("/reorder")
    public ResponseEntity<Map<String, Object>> reorderCards(
            @RequestParam Long project,
            @RequestBody List<Map<String, Object>> order) {
        kanbanService.reorderCards(project, order);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * 验证是否可以移动到目标状态
     */
    @GetMapping("/validate-move")
    public ResponseEntity<Map<String, Object>> validateMove(
            @RequestParam Long project,
            @RequestParam String type, // "userstory" or "issue"
            @RequestParam Long itemId,
            @RequestParam Long toStatusId) {
        Map<String, Object> result = kanbanService.validateMove(project, type, itemId, toStatusId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/statuses")
    public ResponseEntity<List<KanbanStatusDTO>> getStatuses(@RequestParam Long project) {
        return ResponseEntity.ok(kanbanStatusService.getStatuses(project));
    }

    @PostMapping("/statuses")
    public ResponseEntity<KanbanStatusDTO> createStatus(
            @RequestParam Long project,
            @RequestBody KanbanStatusDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(kanbanStatusService.createStatus(project, dto));
    }

    @PutMapping("/statuses/{id}")
    public ResponseEntity<KanbanStatusDTO> updateStatus(
            @RequestParam Long project,
            @PathVariable Long id,
            @RequestBody KanbanStatusDTO dto) {
        return ResponseEntity.ok(kanbanStatusService.updateStatus(project, id, dto));
    }

    @DeleteMapping("/statuses/{id}")
    public ResponseEntity<Void> deleteStatus(
            @RequestParam Long project,
            @PathVariable Long id) {
        kanbanStatusService.deleteStatus(project, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/items")
    public ResponseEntity<Map<String, Object>> getKanbanItems(@RequestParam Long project) {
        List<UserStoryDTO> stories = userStoryService.getUserStories(project);
        List<IssueDTO> issues = issueService.getIssues(project);

        Map<String, Object> result = new HashMap<>();
        result.put("user_stories", stories);
        result.put("issues", issues);

        return ResponseEntity.ok(result);
    }
}