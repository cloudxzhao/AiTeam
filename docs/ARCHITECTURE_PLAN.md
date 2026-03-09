# AiTeam 项目重构架构规划文档

**文档版本：** 1.0
**创建日期：** 2026年3月9日
**架构师：** Architect Agent
**项目名称：** AiTeam 项目管理系统重构

---

## 1. 项目概述

### 1.1 背景

当前项目基于 Taiga（Python/Django）开源项目管理系统，包含完整的项目管理、看板、权限、Wiki 等功能。现需要将技术栈完全重构为：
- **后端：** Spring Boot 3 + JDK 21 + PostgreSQL
- **前端：** React 18 + TypeScript + Vite + Ant Design 5.x
- **中间件：** RabbitMQ, Redis

### 1.2 核心目标

1. 保持现有功能完整性，实现平滑迁移
2. 提升系统可维护性和扩展性
3. 优化性能和用户体验
4. 采用现代化的技术栈和开发模式

---

## 2. 现有系统功能模块分析

### 2.1 核心模块清单

| 模块名称 | 功能描述 | 复杂度 | 优先级 |
|---------|---------|--------|--------|
| **用户认证** | 用户注册、登录、JWT Token、密码管理 | 高 | P0 |
| **项目管理** | 项目CRUD、成员管理、项目设置 | 高 | P0 |
| **用户故事** | 用户故事CRUD、状态管理、分配 | 高 | P0 |
| **任务管理** | 任务CRUD、关联用户故事、状态管理 | 中 | P0 |
| **问题单** | 问题单CRUD、严重程度、优先级 | 中 | P0 |
| **看板系统** | 看板视图、拖拽、状态流转约束 | 高 | P1 |
| **权限系统** | 角色、权限点、申请/审批流程 | 高 | P0 |
| **Wiki文档** | Wiki页面CRUD、版本历史 | 中 | P1 |
| **里程碑** | Sprint管理、燃尽图 | 中 | P1 |
| **附件管理** | 文件上传、图片管理 | 低 | P2 |
| **通知系统** | 站内通知、邮件通知 | 中 | P2 |
| **历史记录** | 操作历史、变更追踪 | 中 | P2 |

### 2.2 数据模型分析

#### 2.2.1 核心实体关系

```
┌─────────────────────────────────────────────────────────────────────┐
│                           用户与权限                                  │
├─────────────────────────────────────────────────────────────────────┤
│  User ──┬── Membership ── Project                                    │
│         └── Role ── RolePermission ── Permission                     │
│  PermissionApplication ── AuditLog                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           项目内容                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Project ──┬── UserStory ──┬── Task                                 │
│            ├── Issue       └── RolePoints ── Points                  │
│            ├── WikiPage                                             │
│            ├── Milestone                                            │
│            └── Epic (可选)                                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           状态与配置                                  │
├─────────────────────────────────────────────────────────────────────┤
│  Project ──┬── UserStoryStatus                                      │
│            ├── TaskStatus                                           │
│            ├── IssueStatus                                          │
│            ├── Priority                                             │
│            ├── Severity                                             │
│            ├── Swimlane                                             │
│            └── Role (项目级角色)                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 2.2.2 关键数据表估算

| 表名 | 预估数据量 | 增长速度 | 索引策略 |
|------|-----------|---------|---------|
| users | 1,000-10,000 | 慢 | username, email |
| projects | 100-500 | 慢 | owner, slug |
| user_stories | 10,000-100,000 | 中 | project, status, assigned_to |
| tasks | 50,000-500,000 | 快 | project, user_story, status |
| issues | 10,000-100,000 | 中 | project, status, severity |
| wiki_pages | 1,000-10,000 | 慢 | project, slug |
| audit_logs | 100,000-1,000,000 | 快 | operator, time, action |

---

## 3. 后端技术架构

### 3.1 技术选型

#### 3.1.1 核心框架

| 组件 | 选型 | 版本 | 选型理由 |
|------|------|------|---------|
| **运行时** | JDK | 21 LTS | 长期支持，虚拟线程，性能优化 |
| **框架** | Spring Boot | 3.2.x | 现代化、生态丰富、企业级 |
| **ORM** | Spring Data JPA | 3.2.x | 成熟稳定，与Spring集成好 |
| **数据库** | PostgreSQL | 15+ | 开源、功能强大、JSON支持 |
| **缓存** | Redis | 7.x | 高性能缓存、分布式支持 |
| **消息队列** | RabbitMQ | 3.12+ | 可靠消息传递、异步处理 |
| **认证** | Spring Security + JWT | - | 安全认证、无状态Token |

#### 3.1.2 开发工具

| 组件 | 选型 | 用途 |
|------|------|------|
| **构建工具** | Maven 3.9+ | 依赖管理、构建 |
| **API文档** | SpringDoc OpenAPI 3 | Swagger文档生成 |
| **代码生成** | Lombok | 减少样板代码 |
| **数据库迁移** | Flyway | 版本化数据库迁移 |
| **测试** | JUnit 5 + Mockito | 单元测试、Mock |

### 3.2 项目结构

```
AiTeam/
├── backend/
│   ├── pom.xml                          # 父POM
│   ├── aiteam-common/                   # 公共模块
│   │   ├── src/main/java/com/aiteam/common/
│   │   │   ├── config/                  # 公共配置
│   │   │   ├── exception/               # 全局异常处理
│   │   │   ├── response/                # 统一响应封装
│   │   │   ├── utils/                   # 工具类
│   │   │   └── annotation/              # 自定义注解
│   │   └── src/main/resources/
│   │       └── application-common.yml
│   │
│   ├── aiteam-auth/                     # 认证模块
│   │   ├── src/main/java/com/aiteam/auth/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── security/
│   │   │   └── dto/
│   │   └── src/main/resources/
│   │
│   ├── aiteam-project/                  # 项目管理模块
│   │   ├── src/main/java/com/aiteam/project/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   └── src/main/resources/
│   │
│   ├── aiteam-story/                    # 用户故事模块
│   │   └── ...
│   │
│   ├── aiteam-task/                     # 任务模块
│   │   └── ...
│   │
│   ├── aiteam-issue/                    # 问题单模块
│   │   └── ...
│   │
│   ├── aiteam-kanban/                   # 看板模块
│   │   └── ...
│   │
│   ├── aiteam-permission/               # 权限模块
│   │   └── ...
│   │
│   ├── aiteam-wiki/                     # Wiki模块
│   │   └── ...
│   │
│   ├── aiteam-notification/             # 通知模块
│   │   └── ...
│   │
│   └── aiteam-gateway/                  # API网关/启动模块
│       ├── src/main/java/com/aiteam/
│       │   └── AiTeamApplication.java
│       └── src/main/resources/
│           ├── application.yml
│           └── db/migration/            # Flyway迁移脚本
│
├── frontend/                            # 前端项目
│   └── ...
│
└── docs/                                # 文档
    └── ...
```

### 3.3 分层架构设计

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Controller Layer                            │
│  - REST API 端点定义                                                 │
│  - 请求参数校验 (@Valid)                                             │
│  - 响应封装                                                          │
│  - API 文档注解 (@Operation)                                         │
├─────────────────────────────────────────────────────────────────────┤
│                          Service Layer                               │
│  - 业务逻辑处理                                                      │
│  - 事务管理 (@Transactional)                                         │
│  - 权限校验                                                          │
│  - 缓存处理                                                          │
├─────────────────────────────────────────────────────────────────────┤
│                        Repository Layer                              │
│  - 数据访问接口 (JpaRepository)                                      │
│  - 自定义查询 (@Query)                                               │
│  - 批量操作                                                          │
├─────────────────────────────────────────────────────────────────────┤
│                          Entity Layer                                │
│  - JPA 实体定义                                                      │
│  - 实体关系映射                                                      │
│  - 审计字段 (@CreatedDate, @LastModifiedDate)                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 核心模块设计

#### 3.4.1 认证模块 (aiteam-auth)

```java
// 核心组件
com.aiteam.auth/
├── controller/
│   ├── AuthController.java          # 登录、注册、刷新Token
│   └── UserController.java          # 用户信息管理
├── service/
│   ├── AuthService.java             # 认证业务逻辑
│   ├── JwtService.java              # JWT生成与验证
│   └── UserDetailsServiceImpl.java  # 用户详情加载
├── security/
│   ├── JwtAuthenticationFilter.java # JWT过滤器
│   ├── SecurityConfig.java          # 安全配置
│   └── PermissionEvaluator.java     # 权限评估器
└── dto/
    ├── LoginRequest.java
    ├── RegisterRequest.java
    └── AuthResponse.java
```

**API 端点设计：**

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/v1/auth/login` | POST | 用户登录 |
| `/api/v1/auth/register` | POST | 用户注册 |
| `/api/v1/auth/refresh` | POST | 刷新Token |
| `/api/v1/auth/logout` | POST | 登出 |
| `/api/v1/users/me` | GET | 获取当前用户信息 |
| `/api/v1/users/me` | PUT | 更新用户信息 |

#### 3.4.2 项目模块 (aiteam-project)

```java
com.aiteam.project/
├── controller/
│   ├── ProjectController.java       # 项目CRUD
│   └── MemberController.java        # 成员管理
├── service/
│   ├── ProjectService.java
│   ├── MemberService.java
│   └── ProjectPermissionService.java
├── entity/
│   ├── Project.java
│   ├── Membership.java
│   ├── ProjectDefaults.java
│   └── ProjectTemplate.java
├── repository/
│   ├── ProjectRepository.java
│   └── MembershipRepository.java
└── dto/
    ├── ProjectCreateRequest.java
    ├── ProjectUpdateRequest.java
    └── ProjectResponse.java
```

#### 3.4.3 权限模块 (aiteam-permission)

```java
com.aiteam.permission/
├── controller/
│   ├── RoleController.java          # 角色管理
│   ├── PermissionController.java    # 权限查询
│   ├── ApplicationController.java    # 权限申请
│   └── AuditController.java         # 审计日志
├── service/
│   ├── RoleService.java
│   ├── PermissionService.java
│   ├── ApplicationService.java      # 申请审批流程
│   └── AuditService.java
├── entity/
│   ├── Permission.java
│   ├── Role.java
│   ├── RolePermission.java
│   ├── ProjectMember.java
│   ├── PermissionApplication.java
│   └── AuditLog.java
├── annotation/
│   └── RequirePermission.java       # 权限注解
└── aspect/
    └── PermissionAspect.java        # 权限切面
```

**权限校验机制：**

```java
// 使用注解方式进行权限校验
@RequirePermission("story:create")
@PostMapping
public ResponseEntity<StoryResponse> createStory(@RequestBody StoryCreateRequest request) {
    // 业务逻辑
}

// 权限切面处理
@Aspect
@Component
public class PermissionAspect {
    @Around("@annotation(requirePermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, RequirePermission requirePermission) {
        String permission = requirePermission.value();
        Long projectId = extractProjectId(joinPoint);
        if (!permissionService.hasPermission(getCurrentUser(), projectId, permission)) {
            throw new ForbiddenException("No permission: " + permission);
        }
        return joinPoint.proceed();
    }
}
```

#### 3.4.4 看板模块 (aiteam-kanban)

```java
com.aiteam.kanban/
├── controller/
│   ├── KanbanController.java        # 看板数据获取
│   └── CardMoveController.java      # 卡片移动
├── service/
│   ├── KanbanService.java
│   ├── CardMoveService.java
│   └── ConstraintService.java       # 状态流转约束
├── dto/
│   ├── KanbanBoardResponse.java
│   ├── ColumnData.java
│   ├── CardData.java
│   └── CardMoveRequest.java
└── strategy/
    ├── MoveValidator.java           # 移动验证接口
    ├── UserStoryMoveValidator.java  # 用户故事移动验证
    └── IssueMoveValidator.java      # 问题单移动验证
```

### 3.5 数据库设计

#### 3.5.1 核心表结构

```sql
-- 用户表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(32) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(256),
    bio TEXT,
    photo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 项目表
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(250) UNIQUE NOT NULL,
    name VARCHAR(250) NOT NULL,
    description TEXT NOT NULL,
    logo_url VARCHAR(500),
    owner_id BIGINT REFERENCES users(id),
    is_private BOOLEAN DEFAULT TRUE,
    is_kanban_activated BOOLEAN DEFAULT FALSE,
    is_wiki_activated BOOLEAN DEFAULT TRUE,
    is_issues_activated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 角色表（系统级）
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 权限点表
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    codename VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 角色权限关联表
CREATE TABLE role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- 项目成员表
CREATE TABLE project_members (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- 用户故事表
CREATE TABLE user_stories (
    id BIGSERIAL PRIMARY KEY,
    ref BIGINT,
    subject TEXT NOT NULL,
    description TEXT,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status_id BIGINT REFERENCES user_story_statuses(id) ON DELETE SET NULL,
    milestone_id BIGINT REFERENCES milestones(id) ON DELETE SET NULL,
    swimlane_id BIGINT REFERENCES swimlanes(id) ON DELETE SET NULL,
    backlog_order BIGINT,
    kanban_order BIGINT,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
);

-- 问题单表
CREATE TABLE issues (
    id BIGSERIAL PRIMARY KEY,
    ref BIGINT,
    subject TEXT NOT NULL,
    description TEXT,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status_id BIGINT REFERENCES issue_statuses(id) ON DELETE SET NULL,
    severity_id BIGINT REFERENCES severities(id) ON DELETE SET NULL,
    priority_id BIGINT REFERENCES priorities(id) ON DELETE SET NULL,
    milestone_id BIGINT REFERENCES milestones(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
);

-- 权限申请表
CREATE TABLE permission_applications (
    id BIGSERIAL PRIMARY KEY,
    apply_id VARCHAR(32) UNIQUE NOT NULL,
    applicant_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approver_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    approve_note TEXT
);

-- 审计日志表
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    log_id VARCHAR(32) UNIQUE NOT NULL,
    operator_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    operator_ip VARCHAR(45),
    action VARCHAR(20) NOT NULL,
    target_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    target_project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    target_role_id BIGINT REFERENCES roles(id) ON DELETE SET NULL,
    detail JSONB,
    result VARCHAR(20) NOT NULL,
    error_msg TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_user_stories_project ON user_stories(project_id);
CREATE INDEX idx_user_stories_status ON user_stories(status_id);
CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_issues_status ON issues(status_id);
CREATE INDEX idx_audit_logs_operator ON audit_logs(operator_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 3.6 缓存策略

```java
// Redis缓存配置
@Configuration
@EnableCaching
public class RedisConfig {
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        // 用户权限缓存 - 30分钟
        cacheConfigurations.put("userPermissions", config.entryTtl(Duration.ofMinutes(30)));
        // 项目信息缓存 - 1小时
        cacheConfigurations.put("projectInfo", config.entryTtl(Duration.ofHours(1)));
        // 看板数据缓存 - 5分钟
        cacheConfigurations.put("kanbanBoard", config.entryTtl(Duration.ofMinutes(5)));

        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .withInitialCacheConfigurations(cacheConfigurations)
            .build();
    }
}
```

---

## 4. 前端技术架构

### 4.1 技术选型

| 组件 | 选型 | 版本 | 选型理由 |
|------|------|------|---------|
| **框架** | React | 18.x | 生态丰富、组件化开发 |
| **语言** | TypeScript | 5.x | 类型安全、开发体验好 |
| **构建工具** | Vite | 5.x | 快速构建、HMR |
| **UI组件库** | Ant Design | 5.x | 企业级组件、完整生态 |
| **状态管理** | Zustand | 4.x | 轻量、易用 |
| **路由** | React Router | 6.x | 标准路由方案 |
| **HTTP客户端** | Axios | 1.x | 成熟稳定 |
| **样式方案** | CSS Modules + Less | - | Ant Design 兼容 |
| **拖拽** | @dnd-kit | 6.x | 现代拖拽库 |

### 4.2 项目结构

```
frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx                        # 入口文件
│   ├── App.tsx                         # 根组件
│   ├── vite-env.d.ts
│   │
│   ├── api/                            # API层
│   │   ├── request.ts                  # Axios封装
│   │   ├── auth.api.ts                 # 认证API
│   │   ├── project.api.ts              # 项目API
│   │   ├── story.api.ts                # 用户故事API
│   │   ├── task.api.ts                 # 任务API
│   │   ├── issue.api.ts                # 问题单API
│   │   ├── kanban.api.ts               # 看板API
│   │   ├── permission.api.ts           # 权限API
│   │   └── wiki.api.ts                 # Wiki API
│   │
│   ├── components/                     # 通用组件
│   │   ├── Layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── PermissionGuard/            # 权限守卫组件
│   │   ├── LoadingSpinner/
│   │   ├── ErrorBoundary/
│   │   └── ConfirmModal/
│   │
│   ├── pages/                          # 页面组件
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── project/
│   │   │   ├── ProjectListPage.tsx
│   │   │   ├── ProjectDetailPage.tsx
│   │   │   └── ProjectSettingsPage.tsx
│   │   ├── story/
│   │   │   ├── StoryListPage.tsx
│   │   │   └── StoryDetailPage.tsx
│   │   ├── task/
│   │   │   └── TaskListPage.tsx
│   │   ├── issue/
│   │   │   └── IssueListPage.tsx
│   │   ├── kanban/
│   │   │   └── KanbanBoardPage.tsx
│   │   ├── permission/
│   │   │   ├── PermissionApplyPage.tsx
│   │   │   ├── PermissionApprovalPage.tsx
│   │   │   └── MyPermissionsPage.tsx
│   │   ├── wiki/
│   │   │   ├── WikiListPage.tsx
│   │   │   └── WikiEditPage.tsx
│   │   └── settings/
│   │       └── UserSettingsPage.tsx
│   │
│   ├── features/                       # 功能模块（状态+逻辑）
│   │   ├── auth/
│   │   │   ├── authStore.ts
│   │   │   └── useAuth.ts
│   │   ├── project/
│   │   │   ├── projectStore.ts
│   │   │   └── useProject.ts
│   │   ├── kanban/
│   │   │   ├── kanbanStore.ts
│   │   │   ├── useKanban.ts
│   │   │   └── useDragDrop.ts
│   │   └── permission/
│   │       ├── permissionStore.ts
│   │       └── usePermission.ts
│   │
│   ├── hooks/                          # 自定义Hooks
│   │   ├── useRequest.ts
│   │   ├── useModal.ts
│   │   ├── usePagination.ts
│   │   └── usePermissionCheck.ts
│   │
│   ├── stores/                         # 全局状态
│   │   ├── globalStore.ts
│   │   └── themeStore.ts
│   │
│   ├── types/                          # TypeScript类型
│   │   ├── user.ts
│   │   ├── project.ts
│   │   ├── story.ts
│   │   ├── task.ts
│   │   ├── issue.ts
│   │   ├── kanban.ts
│   │   ├── permission.ts
│   │   └── api.ts
│   │
│   ├── utils/                          # 工具函数
│   │   ├── format.ts
│   │   ├── storage.ts
│   │   └── validators.ts
│   │
│   ├── constants/                      # 常量定义
│   │   ├── routes.ts
│   │   ├── permissions.ts
│   │   └── status.ts
│   │
│   └── styles/                         # 全局样式
│       ├── variables.less
│       ├── global.less
│       └── themes/
│           └── purple-gradient.less    # 紫色渐变主题
│
└── public/
    ├── favicon.ico
    └── assets/
```

### 4.3 路由设计

```typescript
// src/constants/routes.ts
export const ROUTES = {
  // 公开路由
  LOGIN: '/login',
  REGISTER: '/register',

  // 需要登录的路由
  DASHBOARD: '/',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:projectId',
  PROJECT_SETTINGS: '/projects/:projectId/settings',

  // 项目内功能
  STORIES: '/projects/:projectId/stories',
  STORY_DETAIL: '/projects/:projectId/stories/:storyId',
  TASKS: '/projects/:projectId/tasks',
  ISSUES: '/projects/:projectId/issues',
  KANBAN: '/projects/:projectId/kanban',
  WIKI: '/projects/:projectId/wiki',
  WIKI_PAGE: '/projects/:projectId/wiki/:slug',

  // 权限相关
  MY_PERMISSIONS: '/my-permissions',
  PERMISSION_APPLY: '/permissions/apply',
  PERMISSION_APPROVAL: '/permissions/approval',  // 管理员使用

  // 用户设置
  SETTINGS: '/settings',
};

// src/App.tsx 路由配置
const router = createBrowserRouter([
  // 公开路由
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // 需要登录的路由
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'projects', element: <ProjectListPage /> },
      {
        path: 'projects/:projectId',
        element: <ProjectLayout />,
        children: [
          { index: true, element: <ProjectDetailPage /> },
          { path: 'stories', element: <StoryListPage /> },
          { path: 'stories/:storyId', element: <StoryDetailPage /> },
          { path: 'tasks', element: <TaskListPage /> },
          { path: 'issues', element: <IssueListPage /> },
          { path: 'kanban', element: <KanbanBoardPage /> },
          { path: 'wiki', element: <WikiListPage /> },
          { path: 'wiki/:slug', element: <WikiEditPage /> },
          { path: 'settings', element: <ProjectSettingsPage /> },
        ],
      },
      { path: 'my-permissions', element: <MyPermissionsPage /> },
      { path: 'permissions/apply', element: <PermissionApplyPage /> },
      { path: 'permissions/approval', element: <PermissionApprovalPage /> },
      { path: 'settings', element: <UserSettingsPage /> },
    ],
  },
]);
```

### 4.4 状态管理设计

```typescript
// src/features/auth/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// src/features/permission/permissionStore.ts
interface PermissionState {
  // 用户在各项目的权限缓存
  projectPermissions: Map<number, Set<string>>;
  // 当前激活的项目
  currentProjectId: number | null;

  hasPermission: (projectId: number, permission: string) => boolean;
  setProjectPermissions: (projectId: number, permissions: string[]) => void;
  clearPermissions: () => void;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  projectPermissions: new Map(),
  currentProjectId: null,

  hasPermission: (projectId, permission) => {
    const permissions = get().projectPermissions.get(projectId);
    return permissions?.has(permission) ?? false;
  },

  setProjectPermissions: (projectId, permissions) => {
    set((state) => {
      const newMap = new Map(state.projectPermissions);
      newMap.set(projectId, new Set(permissions));
      return { projectPermissions: newMap };
    });
  },

  clearPermissions: () => {
    set({ projectPermissions: new Map() });
  },
}));
```

### 4.5 看板组件设计

```typescript
// src/pages/kanban/KanbanBoardPage.tsx
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { useKanbanStore } from '@/features/kanban/kanbanStore';
import { KanbanColumn } from './components/KanbanColumn';
import { KanbanCard } from './components/KanbanCard';
import { FilterBar } from './components/FilterBar';
import { ProgressStats } from './components/ProgressStats';

export function KanbanBoardPage() {
  const { projectId } = useParams();
  const { board, moveCard, isLoading } = useKanbanStore();
  const { hasPermission } = usePermissionStore();

  const canMoveCard = hasPermission(Number(projectId), 'kanban:moveCard');

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !canMoveCard) return;

    const cardId = active.id as string;
    const targetStatus = over.id as string;

    try {
      await moveCard(cardId, targetStatus);
    } catch (error) {
      // 显示错误并回滚UI
      message.error('移动失败，请稍后重试');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="kanban-container">
      <FilterBar />
      <ProgressStats />

      <DndContext onDragEnd={handleDragEnd}>
        <div className="kanban-columns">
          {board.columns.map((column) => (
            <KanbanColumn
              key={column.status}
              column={column}
              canMove={canMoveCard}
            />
          ))}
        </div>
        <DragOverlay>
          {/* 拖拽时的视觉反馈 */}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// src/pages/kanban/components/KanbanColumn.tsx
interface KanbanColumnProps {
  column: KanbanColumn;
  canMove: boolean;
}

export function KanbanColumn({ column, canMove }: KanbanColumnProps) {
  const { status, title, color, cards } = column;

  return (
    <div className="kanban-column" style={{ '--column-color': color }}>
      <div className="column-header">
        <span className="column-title">{title}</span>
        <span className="column-count">{cards.length}</span>
      </div>

      <Droppable id={status} disabled={!canMove}>
        <SortableContext items={cards.map(c => c.id)}>
          <div className="column-content">
            {cards.map((card) => (
              <KanbanCard key={card.id} card={card} />
            ))}
          </div>
        </SortableContext>
      </Droppable>
    </div>
  );
}
```

### 4.6 主题设计

```less
// src/styles/themes/purple-gradient.less

// 品牌色系
@brand-primary: #8B5CF6;
@brand-primary-hover: #7C3AED;
@brand-primary-light: #F3F0FF;
@brand-gradient: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);

// 状态颜色
@status-analysis: #3B82F6;    // 分析中 - 蓝色
@status-development: #F59E0B; // 开发中 - 黄色
@status-testing: #F97316;     // 测试中 - 橙色
@status-done: #10B981;        // 测试完成 - 绿色

// 看板样式
.kanban-container {
  padding: 24px;
  background: #F3F4F6;
  min-height: 100vh;
}

.kanban-columns {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}

.kanban-column {
  flex: 0 0 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);

  .column-header {
    padding: 16px;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--column-color);
    border-radius: 12px 12px 0 0;
    color: white;

    .column-title {
      font-weight: 600;
      font-size: 14px;
    }

    .column-count {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 100px;
      font-size: 12px;
    }
  }

  .column-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.kanban-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-left: 3px solid @brand-primary;
  cursor: grab;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &.dragging {
    opacity: 0.5;
    cursor: grabbing;
  }

  &--story {
    border-left-color: @brand-primary;
  }

  &--issue {
    border-left-color: #EF4444;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .card-id {
    font-size: 12px;
    color: #9CA3AF;
    font-weight: 600;
  }

  .card-title {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
    margin-bottom: 8px;
  }

  .card-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
    color: #6B7280;
  }

  .card-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .tag {
    padding: 2px 8px;
    background: @brand-primary-light;
    color: @brand-primary;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 500;
  }
}
```

---

## 5. 开发计划

### 5.1 里程碑规划

```
Phase 1: 基础架构搭建 (第1-2周)
├── 后端项目初始化
│   ├── 创建Maven多模块项目
│   ├── 配置Spring Boot基础架构
│   ├── 集成PostgreSQL + Flyway
│   ├── 实现JWT认证
│   └── 编写基础CRUD脚手架
├── 前端项目初始化
│   ├── 创建Vite + React项目
│   ├── 配置Ant Design主题
│   ├── 实现登录注册页面
│   └── 配置路由和状态管理
└── 交付物: 可运行的基础框架

Phase 2: 核心功能开发 (第3-5周)
├── 用户认证模块
├── 项目管理模块
├── 权限系统
├── 用户故事模块
└── 交付物: 可用的项目管理系统原型

Phase 3: 高级功能开发 (第6-8周)
├── 任务管理模块
├── 问题单模块
├── 看板系统 (拖拽、状态流转)
├── Wiki模块
└── 交付物: 功能完整的系统

Phase 4: 完善与优化 (第9-10周)
├── 通知系统
├── 审计日志
├── 性能优化
├── 测试覆盖
└── 交付物: 生产就绪的系统

Phase 5: 部署与文档 (第11周)
├── Docker部署配置
├── API文档完善
├── 用户手册编写
└── 交付物: 完整交付物
```

### 5.2 详细任务分解

#### Phase 1: 基础架构搭建

| 任务ID | 任务描述 | 负责模块 | 预计工时 | 依赖 |
|--------|---------|---------|---------|------|
| 1.1 | 创建Maven多模块项目结构 | backend | 4h | - |
| 1.2 | 配置Spring Boot基础依赖 | backend | 2h | 1.1 |
| 1.3 | 配置PostgreSQL数据源 | backend | 2h | 1.2 |
| 1.4 | 集成Flyway数据库迁移 | backend | 4h | 1.3 |
| 1.5 | 设计并创建核心数据表 | backend | 8h | 1.4 |
| 1.6 | 实现JWT认证模块 | backend | 16h | 1.5 |
| 1.7 | 实现全局异常处理 | backend | 4h | 1.2 |
| 1.8 | 实现统一响应封装 | backend | 2h | 1.7 |
| 1.9 | 创建前端Vite项目 | frontend | 2h | - |
| 1.10 | 配置Ant Design主题 | frontend | 4h | 1.9 |
| 1.11 | 实现登录注册页面 | frontend | 8h | 1.10, 1.6 |
| 1.12 | 配置React Router | frontend | 2h | 1.9 |
| 1.13 | 配置Zustand状态管理 | frontend | 2h | 1.9 |
| 1.14 | 实现Axios封装 | frontend | 2h | 1.9 |

#### Phase 2: 核心功能开发

| 任务ID | 任务描述 | 负责模块 | 预计工时 | 依赖 |
|--------|---------|---------|---------|------|
| 2.1 | 用户管理API | backend | 8h | 1.6 |
| 2.2 | 项目管理API | backend | 16h | 2.1 |
| 2.3 | 角色权限API | backend | 16h | 2.2 |
| 2.4 | 权限申请审批API | backend | 12h | 2.3 |
| 2.5 | 审计日志API | backend | 8h | 2.4 |
| 2.6 | 用户故事API | backend | 16h | 2.2 |
| 2.7 | 项目管理页面 | frontend | 16h | 2.2 |
| 2.8 | 权限申请页面 | frontend | 8h | 2.4 |
| 2.9 | 权限审批页面 | frontend | 8h | 2.4 |
| 2.10 | 用户故事列表页面 | frontend | 12h | 2.6 |
| 2.11 | 用户故事详情页面 | frontend | 8h | 2.10 |

#### Phase 3: 高级功能开发

| 任务ID | 任务描述 | 负责模块 | 预计工时 | 依赖 |
|--------|---------|---------|---------|------|
| 3.1 | 任务管理API | backend | 12h | 2.6 |
| 3.2 | 问题单API | backend | 12h | 2.2 |
| 3.3 | 看板数据API | backend | 8h | 3.1, 3.2 |
| 3.4 | 卡片移动API | backend | 8h | 3.3 |
| 3.5 | 状态流转约束服务 | backend | 8h | 3.4 |
| 3.6 | Wiki API | backend | 12h | 2.2 |
| 3.7 | 任务管理页面 | frontend | 8h | 3.1 |
| 3.8 | 问题单管理页面 | frontend | 8h | 3.2 |
| 3.9 | 看板基础布局 | frontend | 12h | 3.3 |
| 3.10 | 看板拖拽功能 | frontend | 16h | 3.9 |
| 3.11 | 看板筛选功能 | frontend | 8h | 3.9 |
| 3.12 | Wiki页面 | frontend | 12h | 3.6 |

### 5.3 资源需求

| 角色 | 人数 | 技能要求 | 参与阶段 |
|------|------|---------|---------|
| 后端开发工程师 | 2 | Java, Spring Boot, PostgreSQL | Phase 1-4 |
| 前端开发工程师 | 2 | React, TypeScript, Ant Design | Phase 1-4 |
| DevOps工程师 | 1 | Docker, CI/CD | Phase 1, 5 |
| 测试工程师 | 1 | 自动化测试, 性能测试 | Phase 4-5 |
| 产品经理 | 1 | 需求管理, 验收测试 | 全程 |

---

## 6. 技术选型报告

### 6.1 后端技术选型分析

#### 6.1.1 Spring Boot vs 其他框架

| 对比项 | Spring Boot 3 | Django | Node.js/Express |
|--------|---------------|--------|-----------------|
| **性能** | 高（JVM优化） | 中 | 高 |
| **类型安全** | 强类型（Java） | 动态类型 | 动态类型 |
| **企业支持** | 优秀 | 良好 | 一般 |
| **生态丰富度** | 非常丰富 | 丰富 | 丰富 |
| **学习曲线** | 中等 | 低 | 低 |
| **长期维护** | LTS支持 | 社区维护 | 社区维护 |
| **团队熟悉度** | 需评估 | 高（现有） | 需评估 |

**推荐：Spring Boot 3**

理由：
1. 企业级应用成熟度高
2. 强类型系统提高代码质量
3. 虚拟线程（JDK 21）提供高性能并发
4. Spring生态完善（Security, Data, Cache等）
5. 符合技术栈要求

#### 6.1.2 数据库选型

| 对比项 | PostgreSQL | MySQL | MongoDB |
|--------|------------|-------|---------|
| **数据完整性** | 优秀 | 良好 | 一般 |
| **JSON支持** | 优秀 | 良好 | 原生 |
| **全文搜索** | 内置 | 需插件 | 需扩展 |
| **并发处理** | 优秀 | 良好 | 良好 |
| **开源协议** | PostgreSQL | GPL | SSPL |

**推荐：PostgreSQL**

理由：
1. 与现有系统一致，便于数据迁移
2. JSON/JSONB支持灵活
3. 强大的查询能力
4. 开源协议友好

### 6.2 前端技术选型分析

#### 6.2.1 React vs Vue vs Angular

| 对比项 | React 18 | Vue 3 | Angular 17 |
|--------|----------|-------|------------|
| **学习曲线** | 中 | 低 | 高 |
| **灵活性** | 高 | 中 | 低 |
| **生态丰富度** | 非常丰富 | 丰富 | 丰富 |
| **TypeScript支持** | 优秀 | 优秀 | 原生 |
| **性能** | 优秀 | 优秀 | 良好 |
| **企业采用率** | 最高 | 高 | 中 |
| **组件库选择** | Ant Design等 | Element Plus | Angular Material |

**推荐：React 18**

理由：
1. 符合技术栈要求
2. 生态最丰富
3. 灵活性高
4. Ant Design 5.x 完美支持

#### 6.2.2 UI组件库选型

| 对比项 | Ant Design 5 | Material UI | Chakra UI |
|--------|--------------|-------------|-----------|
| **企业级组件** | 非常丰富 | 丰富 | 中等 |
| **设计风格** | 企业风 | Material | 现代 |
| **国际化** | 完善 | 需配置 | 需配置 |
| **主题定制** | 强大 | 强大 | 强大 |
| **中文社区** | 活跃 | 一般 | 一般 |

**推荐：Ant Design 5**

理由：
1. 符合技术栈要求
2. 企业级组件完善（Table, Form, Tree等）
3. 中文社区活跃
4. 主题定制能力强
5. 与现有前端风格一致

---

## 7. 风险评估与缓解策略

### 7.1 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| Spring Boot学习曲线 | 高 | 中 | 安排技术培训，参考最佳实践 |
| 数据迁移复杂度 | 高 | 中 | 编写迁移脚本，分批迁移验证 |
| 性能问题 | 中 | 低 | 设计阶段考虑缓存策略，进行性能测试 |
| 前后端接口对齐 | 中 | 中 | 使用OpenAPI规范，先定义接口文档 |

### 7.2 项目风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| 需求变更 | 高 | 中 | 采用敏捷开发，小步迭代 |
| 人员变动 | 高 | 低 | 完善文档，知识分享 |
| 进度延期 | 中 | 中 | 预留缓冲时间，及时调整 |

---

## 8. 附录

### 8.1 参考资料

- Spring Boot 3 官方文档: https://spring.io/projects/spring-boot
- React 18 官方文档: https://react.dev
- Ant Design 5 官方文档: https://ant.design
- PostgreSQL 官方文档: https://www.postgresql.org/docs/

### 8.2 术语表

| 术语 | 解释 |
|------|------|
| JWT | JSON Web Token，用于无状态认证 |
| DnD | Drag and Drop，拖拽功能 |
| Flyway | 数据库版本迁移工具 |
| Zustand | React状态管理库 |
| Vite | 新一代前端构建工具 |

---

**文档结束**

*此架构规划文档将作为后续开发的指导文件，如有变更需要及时更新。*