package com.aiteam.backend.config;

import com.aiteam.backend.entity.KanbanStatus;
import com.aiteam.backend.repository.KanbanStatusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * 看板状态初始化配置
 * 创建4个标准状态：分析中、开发中、测试中、测试完成
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KanbanStatusInitializer implements CommandLineRunner {

    private final KanbanStatusRepository kanbanStatusRepository;

    // 标准状态定义 (用于UserStory)
    private static final List<StatusConfig> USER_STORY_STATUSES = Arrays.asList(
        new StatusConfig("分析中", "analysis", "#3B82F6", 1),    // 蓝色 - Architect
        new StatusConfig("开发中", "development", "#F59E0B", 2), // 黄色 - Builder
        new StatusConfig("测试中", "testing", "#F97316", 3),     // 橙色 - Validator
        new StatusConfig("测试完成", "done", "#10B981", 4)       // 绿色 - Validator
    );

    // 标准状态定义 (用于Issue)
    private static final List<StatusConfig> ISSUE_STATUSES = Arrays.asList(
        new StatusConfig("分析", "issue-analysis", "#3B82F6", 1),    // 蓝色 - Validator
        new StatusConfig("开发", "issue-development", "#F59E0B", 2), // 黄色 - Builder
        new StatusConfig("测试", "issue-testing", "#F97316", 3),    // 橙色 - Validator
        new StatusConfig("测试完成", "issue-done", "#10B981", 4)      // 绿色 - Validator
    );

    @Override
    public void run(String... args) {
        try {
            initializeStatuses();
            log.info("看板状态初始化完成");
        } catch (Exception e) {
            log.warn("看板状态初始化失败: {}", e.getMessage());
        }
    }

    @Transactional
    public void initializeStatuses() {
        Long projectId = 1L;

        // 初始化UserStory状态
        initializeStatuses(projectId, "userstory", USER_STORY_STATUSES, "UserStory");

        // 初始化Issue状态
        initializeStatuses(projectId, "issue", ISSUE_STATUSES, "Issue");
    }

    private void initializeStatuses(Long projectId, String typePrefix, List<StatusConfig> statuses, String entityType) {
        for (StatusConfig config : statuses) {
            String slug = typePrefix + "-" + config.slug;
            try {
                if (!kanbanStatusRepository.existsByProjectIdAndSlug(projectId, slug)) {
                    KanbanStatus status = KanbanStatus.builder()
                        .projectId(projectId)
                        .name(config.name)
                        .slug(slug)
                        .color(config.color)
                        .position(config.order)
                        .isArchived(false)
                        .isDeleted(false)
                        .build();
                    kanbanStatusRepository.save(status);
                    log.info("创建{}状态: {} (slug: {})", entityType, config.name, slug);
                }
            } catch (DataIntegrityViolationException e) {
                log.debug("状态已存在或外键约束: {}", slug);
            }
        }
    }

    private static class StatusConfig {
        String name;
        String slug;
        String color;
        Integer order;

        StatusConfig(String name, String slug, String color, Integer order) {
            this.name = name;
            this.slug = slug;
            this.color = color;
            this.order = order;
        }
    }
}