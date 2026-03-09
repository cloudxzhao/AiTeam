package com.aiteam.backend.service;

import com.aiteam.backend.dto.IssueDTO;
import com.aiteam.backend.dto.KanbanStatusDTO;
import com.aiteam.backend.dto.UserStoryDTO;
import com.aiteam.backend.entity.Issue;
import com.aiteam.backend.entity.KanbanStatus;
import com.aiteam.backend.entity.UserStory;
import com.aiteam.backend.exception.BadRequestException;
import com.aiteam.backend.repository.IssueRepository;
import com.aiteam.backend.repository.KanbanStatusRepository;
import com.aiteam.backend.repository.UserStoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 看板服务 - 统一管理UserStory和Issue的状态流转
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KanbanService {

    private final UserStoryRepository userStoryRepository;
    private final IssueRepository issueRepository;
    private final KanbanStatusRepository kanbanStatusRepository;

    // 状态流转规则 (fromSlug -> toSlug -> allowed)
    private static final Map<String, Set<String>> USER_STORY_TRANSITIONS = Map.of(
        "userstory-analysis", Set.of("userstory-development"),      // 分析中 -> 开发中
        "userstory-development", Set.of("userstory-testing", "userstory-analysis"), // 开发中 -> 测试中/回退到分析
        "userstory-testing", Set.of("userstory-done", "userstory-development")  // 测试中 -> 测试完成/回退到开发
    );

    private static final Map<String, Set<String>> ISSUE_TRANSITIONS = Map.of(
        "issue-analysis", Set.of("issue-development"),
        "issue-development", Set.of("issue-testing", "issue-analysis"),
        "issue-testing", Set.of("issue-done", "issue-development")
    );

    /**
     * 获取统一看板视图
     * 包含所有状态列及其包含的UserStory和Issue
     */
    public Map<String, Object> getKanbanBoard(Long projectId) {
        // 获取所有非归档状态
        List<KanbanStatus> statuses = kanbanStatusRepository
            .findByProjectIdAndIsArchivedFalseOrderByPositionAsc(projectId);

        // 按状态分组UserStory
        Map<Long, List<UserStory>> storiesByStatus = userStoryRepository
            .findByProjectId(projectId)
            .stream()
            .collect(Collectors.groupingBy(s -> s.getStatusId() != null ? s.getStatusId() : 0L));

        // 按状态分组Issue
        Map<Long, List<Issue>> issuesByStatus = issueRepository
            .findByProjectId(projectId)
            .stream()
            .collect(Collectors.groupingBy(i -> i.getStatusId() != null ? i.getStatusId() : 0L));

        // 构建看板数据结构
        List<Map<String, Object>> columns = new ArrayList<>();
        for (KanbanStatus status : statuses) {
            List<UserStory> stories = storiesByStatus.getOrDefault(status.getId(), new ArrayList<>());
            List<Issue> issues = issuesByStatus.getOrDefault(status.getId(), new ArrayList<>());

            // 转换UserStory为DTO
            List<Map<String, Object>> storyCards = stories.stream()
                .map(this::convertUserStoryToCard)
                .collect(Collectors.toList());

            // 转换Issue为DTO
            List<Map<String, Object>> issueCards = issues.stream()
                .map(this::convertIssueToCard)
                .collect(Collectors.toList());

            // 合并卡片
            List<Map<String, Object>> cards = new ArrayList<>();
            cards.addAll(storyCards);
            cards.addAll(issueCards);

            Map<String, Object> column = new HashMap<>();
            column.put("id", status.getId());
            column.put("name", status.getName());
            column.put("slug", status.getSlug());
            column.put("color", status.getColor());
            column.put("order", status.getPosition());
            column.put("cards", cards);
            column.put("count", cards.size());

            columns.add(column);
        }

        // 计算进度
        int total = columns.stream().mapToInt(c -> (int) c.get("count")).sum();
        int done = columns.stream()
            .filter(c -> c.get("slug").toString().endsWith("done"))
            .mapToInt(c -> (int) c.get("count"))
            .sum();
        double progress = total > 0 ? (double) done / total * 100 : 0;

        Map<String, Object> board = new HashMap<>();
        board.put("columns", columns);
        board.put("total", total);
        board.put("done", done);
        board.put("progress", Math.round(progress * 10) / 10.0);

        return board;
    }

    /**
     * 移动UserStory到目标状态
     */
    @Transactional
    public Map<String, Object> moveUserStory(Long storyId, Long projectId, Long toStatusId, String reason) {
        UserStory story = userStoryRepository.findById(storyId)
            .orElseThrow(() -> new BadRequestException("用户故事不存在"));

        KanbanStatus currentStatus = story.getStatusId() != null
            ? kanbanStatusRepository.findById(story.getStatusId()).orElse(null)
            : null;
        KanbanStatus targetStatus = kanbanStatusRepository.findById(toStatusId)
            .orElseThrow(() -> new BadRequestException("目标状态不存在"));

        // 验证状态流转
        if (currentStatus != null) {
            String currentSlug = currentStatus.getSlug();
            String targetSlug = targetStatus.getSlug();

            Set<String> allowedTransitions = USER_STORY_TRANSITIONS.get(currentSlug);
            if (allowedTransitions == null || !allowedTransitions.contains(targetSlug)) {
                throw new BadRequestException("不允许从此状态流转到目标状态");
            }

            // 特殊验证：只有当所有关联Issue都已完成时才能移到"测试完成"
            if (targetSlug.equals("userstory-done")) {
                validateAllIssuesCompleted(storyId, "UserStory");
            }
        }

        // 执行移动
        story.setStatusId(toStatusId);
        userStoryRepository.save(story);

        log.info("UserStory {} 移动到状态 {}", storyId, targetStatus.getName());

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "移动成功");
        result.put("newStatus", targetStatus.getName());

        return result;
    }

    /**
     * 移动Issue到目标状态
     */
    @Transactional
    public Map<String, Object> moveIssue(Long issueId, Long projectId, Long toStatusId, String reason) {
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new BadRequestException("问题单不存在"));

        KanbanStatus currentStatus = issue.getStatusId() != null
            ? kanbanStatusRepository.findById(issue.getStatusId()).orElse(null)
            : null;
        KanbanStatus targetStatus = kanbanStatusRepository.findById(toStatusId)
            .orElseThrow(() -> new BadRequestException("目标状态不存在"));

        // 验证状态流转
        if (currentStatus != null) {
            String currentSlug = currentStatus.getSlug();
            String targetSlug = targetStatus.getSlug();

            Set<String> allowedTransitions = ISSUE_TRANSITIONS.get(currentSlug);
            if (allowedTransitions == null || !allowedTransitions.contains(targetSlug)) {
                throw new BadRequestException("不允许从此状态流转到目标状态");
            }
        }

        // 执行移动
        issue.setStatusId(toStatusId);
        issueRepository.save(issue);

        log.info("Issue {} 移动到状态 {}", issueId, targetStatus.getName());

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "移动成功");
        result.put("newStatus", targetStatus.getName());

        return result;
    }

    /**
     * 重新排序卡片
     */
    @Transactional
    public void reorderCards(Long projectId, List<Map<String, Object>> orderList) {
        for (Map<String, Object> item : orderList) {
            String type = (String) item.get("type");
            Long id = ((Number) item.get("id")).longValue();
            Long statusId = ((Number) item.get("statusId")).longValue();
            Integer cardOrder = ((Number) item.get("order")).intValue();

            if ("userstory".equals(type)) {
                userStoryRepository.findById(id).ifPresent(story -> {
                    story.setStatusId(statusId);
                    story.setKanbanOrder(cardOrder);
                    userStoryRepository.save(story);
                });
            } else if ("issue".equals(type)) {
                issueRepository.findById(id).ifPresent(issue -> {
                    issue.setStatusId(statusId);
                    issue.setKanbanOrder(cardOrder);
                    issueRepository.save(issue);
                });
            }
        }
    }

    /**
     * 验证是否可以移动到目标状态
     */
    public Map<String, Object> validateMove(Long projectId, String type, Long itemId, Long toStatusId) {
        Map<String, Object> result = new HashMap<>();

        try {
            if ("userstory".equals(type)) {
                UserStory story = userStoryRepository.findById(itemId)
                    .orElseThrow(() -> new BadRequestException("用户故事不存在"));

                KanbanStatus currentStatus = story.getStatusId() != null
                    ? kanbanStatusRepository.findById(story.getStatusId()).orElse(null)
                    : null;
                KanbanStatus targetStatus = kanbanStatusRepository.findById(toStatusId)
                    .orElseThrow(() -> new BadRequestException("目标状态不存在"));

                if (currentStatus != null) {
                    String currentSlug = currentStatus.getSlug();
                    String targetSlug = targetStatus.getSlug();

                    Set<String> allowed = USER_STORY_TRANSITIONS.get(currentSlug);
                    boolean canMove = allowed != null && allowed.contains(targetSlug);

                    // 特殊检查：测试完成状态需要验证关联Issue
                    if (canMove && targetSlug.equals("userstory-done")) {
                        try {
                            validateAllIssuesCompleted(itemId, "UserStory");
                        } catch (BadRequestException e) {
                            result.put("canMove", false);
                            result.put("message", e.getMessage());
                            return result;
                        }
                    }

                    result.put("canMove", canMove);
                    result.put("message", canMove ? "可以移动" : "不允许此状态流转");
                } else {
                    result.put("canMove", true);
                    result.put("message", "可以移动");
                }

            } else if ("issue".equals(type)) {
                Issue issue = issueRepository.findById(itemId)
                    .orElseThrow(() -> new BadRequestException("问题单不存在"));

                KanbanStatus currentStatus = issue.getStatusId() != null
                    ? kanbanStatusRepository.findById(issue.getStatusId()).orElse(null)
                    : null;
                KanbanStatus targetStatus = kanbanStatusRepository.findById(toStatusId)
                    .orElseThrow(() -> new BadRequestException("目标状态不存在"));

                if (currentStatus != null) {
                    String currentSlug = currentStatus.getSlug();
                    String targetSlug = targetStatus.getSlug();

                    Set<String> allowed = ISSUE_TRANSITIONS.get(currentSlug);
                    boolean canMove = allowed != null && allowed.contains(targetSlug);

                    result.put("canMove", canMove);
                    result.put("message", canMove ? "可以移动" : "不允许此状态流转");
                } else {
                    result.put("canMove", true);
                    result.put("message", "可以移动");
                }
            } else {
                throw new BadRequestException("未知的类型: " + type);
            }
        } catch (BadRequestException e) {
            result.put("canMove", false);
            result.put("message", e.getMessage());
        }

        return result;
    }

    /**
     * 验证所有关联的Issue是否都已完成
     */
    private void validateAllIssuesCompleted(Long userStoryId, String type) {
        // 检查是否有未完成的关联Issue
        // 这里的逻辑需要根据实际的关联关系来实现
        // 目前假设通过某种方式关联，暂时跳过此检查
        // 实际项目中需要根据Issue.userStoryId或类似字段来查询
    }

    private Map<String, Object> convertUserStoryToCard(UserStory story) {
        Map<String, Object> card = new HashMap<>();
        card.put("type", "userstory");
        card.put("id", story.getId());
        card.put("subject", story.getSubject());
        card.put("statusId", story.getStatusId());
        card.put("order", story.getKanbanOrder() != null ? story.getKanbanOrder() : 0);
        // 添加其他需要显示的字段
        return card;
    }

    private Map<String, Object> convertIssueToCard(Issue issue) {
        Map<String, Object> card = new HashMap<>();
        card.put("type", "issue");
        card.put("id", issue.getId());
        card.put("subject", issue.getSubject());
        card.put("statusId", issue.getStatusId());
        card.put("order", issue.getKanbanOrder() != null ? issue.getKanbanOrder() : 0);
        card.put("severityId", issue.getSeverityId());
        // 添加其他需要显示的字段
        return card;
    }
}