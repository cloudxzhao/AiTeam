# AiTeam 技术设计文档

**版本:** 1.0.0
**最后更新:** 2026年3月9日
**文档状态:** 正式发布

---

## 目录

1. [系统概述](#1-系统概述)
2. [技术架构](#2-技术架构)
3. [数据库设计](#3-数据库设计)
4. [API 设计](#4-api-设计)
5. [核心模块设计](#5-核心模块设计)
6. [安全设计](#6-安全设计)
7. [部署架构](#7-部署架构)
8. [性能优化](#8-性能优化)

---

## 1. 系统概述

### 1.1 项目背景

AiTeam 是一个现代化的项目管理系统，支持敏捷开发流程，提供看板、用户故事、任务管理、问题跟踪等核心功能。系统采用前后端分离架构，后端基于 Spring Boot 3 构建，前端使用 React 19 + TypeScript 开发。

### 1.2 系统目标

- 提供完整的项目管理功能，支持团队协作
- 实现可视化的看板系统，支持拖拽操作
- 构建灵活的权限体系，支持角色级别控制
- 确保系统的高可用性和可扩展性

### 1.3 技术栈概览

| 层级 | 技术选型 | 版本 |
|------|----------|------|
| 后端框架 | Spring Boot | 3.2.0 |
| 运行时 | JDK | 21 LTS |
| 数据库 | PostgreSQL | 15+ |
| 缓存 | Redis | 7.x |
| 消息队列 | RabbitMQ | 3.12+ |
| 前端框架 | React | 19.x |
| UI 组件库 | Ant Design | 6.x |
| 状态管理 | Zustand | 5.x |
| 构建工具 | Vite | 7.x |

---

## 2. 技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端层                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    React SPA 应用                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │ 页面组件 │ │ 状态管理 │ │ 路由控制 │ │ API 请求 │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         网关层                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Nginx 反向代理                        │   │
│  │              静态资源 / API 转发 / 负载均衡               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         后端服务层                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Spring Boot Application                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │Controller│ │ Service  │ │Repository│ │ Security │   │   │
│  │  │  Layer   │ │  Layer   │ │  Layer   │ │  Layer   │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  PostgreSQL   │   │    Redis      │   │   RabbitMQ    │
│   数据持久化   │   │   缓存服务    │   │   消息队列    │
└───────────────┘   └───────────────┘   └───────────────┘
```

### 2.2 后端分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Controller Layer                            │
│  - REST API 端点定义                                             │
│  - 请求参数校验 (@Valid)                                         │
│  - 响应封装                                                      │
│  - 统一异常处理                                                  │
├─────────────────────────────────────────────────────────────────┤
│                        Service Layer                             │
│  - 业务逻辑处理                                                  │
│  - 事务管理 (@Transactional)                                     │
│  - 权限校验                                                      │
│  - 缓存处理                                                      │
├─────────────────────────────────────────────────────────────────┤
│                      Repository Layer                            │
│  - 数据访问接口 (JpaRepository)                                  │
│  - 自定义查询 (@Query)                                           │
│  - 批量操作                                                      │
├─────────────────────────────────────────────────────────────────┤
│                        Entity Layer                              │
│  - JPA 实体定义                                                  │
│  - 实体关系映射                                                  │
│  - 审计字段 (@CreatedDate, @LastModifiedDate)                    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 前端架构设计

```
src/
├── main.tsx                 # 应用入口
├── App.tsx                  # 根组件
├── router/                  # 路由配置
│   └── index.tsx
├── components/              # 通用组件
│   ├── MainLayout.tsx       # 主布局
│   ├── RouteGuard.tsx       # 路由守卫
│   └── Kanban/              # 看板组件
├── pages/                   # 页面组件
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProjectListPage.tsx
│   ├── ProjectDetailPage.tsx
│   ├── KanbanPage.tsx
│   ├── PermissionsPage.tsx
│   └── SettingsPage.tsx
├── services/                # API 服务层
│   ├── auth.service.ts
│   ├── project.service.ts
│   ├── kanban.service.ts
│   └── permission.service.ts
├── store/                   # 状态管理
│   ├── index.ts
│   └── auth.store.ts
├── hooks/                   # 自定义 Hooks
├── types/                   # TypeScript 类型定义
│   └── index.ts
├── utils/                   # 工具函数
│   ├── index.ts
│   └── request.ts           # Axios 封装
├── config/                  # 配置文件
│   ├── index.ts
│   └── theme.ts
└── styles/                  # 样式文件
    └── global.css
```

---

## 3. 数据库设计

### 3.1 核心实体关系图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           用户与权限                                  │
├─────────────────────────────────────────────────────────────────────┤
│  User ──┬── ProjectMember ── Project                                │
│         └── Role ── Permission                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           项目内容                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Project ──┬── UserStory                                            │
│            ├── Issue                                                │
│            └── KanbanStatus                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 核心表结构

#### 3.2.1 用户表 (users)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PK | 主键 |
| username | VARCHAR(255) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（加密存储） |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱 |
| full_name | VARCHAR(500) | - | 全名 |
| phone | VARCHAR(20) | - | 手机号 |
| photo | VARCHAR(500) | - | 头像URL |
| bio | TEXT | - | 个人简介 |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | 是否激活 |
| is_superuser | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否超级管理员 |
| date_joined | TIMESTAMP | NOT NULL | 注册时间 |
| last_login | TIMESTAMP | - | 最后登录时间 |

#### 3.2.2 项目表 (projects)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PK | 主键 |
| name | VARCHAR(500) | NOT NULL | 项目名称 |
| slug | VARCHAR(500) | UNIQUE | URL 标识 |
| description | TEXT | - | 项目描述 |
| logo | VARCHAR(500) | - | 项目Logo |
| owner_id | BIGINT | FK | 项目所有者 |
| is_private | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否私有 |
| is_archived | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否归档 |
| is_backlog_activated | BOOLEAN | NOT NULL, DEFAULT TRUE | 是否启用Backlog |
| is_kanban_activated | BOOLEAN | NOT NULL, DEFAULT TRUE | 是否启用看板 |
| is_wiki_activated | BOOLEAN | NOT NULL, DEFAULT TRUE | 是否启用Wiki |
| is_issues_activated | BOOLEAN | NOT NULL, DEFAULT TRUE | 是否启用问题跟踪 |
| total_milestones | INTEGER | DEFAULT 0 | 里程碑总数 |
| total_stories | INTEGER | DEFAULT 0 | 用户故事总数 |
| total_tasks | INTEGER | DEFAULT 0 | 任务总数 |
| total_issues | INTEGER | DEFAULT 0 | 问题总数 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| modified_at | TIMESTAMP | NOT NULL | 修改时间 |

#### 3.2.3 用户故事表 (user_stories)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PK | 主键 |
| ref | BIGINT | - | 引用编号 |
| subject | TEXT | NOT NULL | 标题 |
| description | TEXT | - | 描述 |
| project_id | BIGINT | FK | 所属项目 |
| owner_id | BIGINT | FK | 创建者 |
| assigned_to_id | BIGINT | FK | 指派给 |
| status_id | BIGINT | FK | 状态 |
| priority | INTEGER | - | 优先级 |
| points | INTEGER | - | 故事点 |
| kanban_order | BIGINT | - | 看板排序 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| modified_at | TIMESTAMP | NOT NULL | 修改时间 |

#### 3.2.4 问题表 (issues)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PK | 主键 |
| ref | BIGINT | - | 引用编号 |
| subject | TEXT | NOT NULL | 标题 |
| description | TEXT | - | 描述 |
| project_id | BIGINT | FK | 所属项目 |
| owner_id | BIGINT | FK | 创建者 |
| assigned_to_id | BIGINT | FK | 指派给 |
| status_id | BIGINT | FK | 状态 |
| priority | INTEGER | - | 优先级 |
| severity | INTEGER | - | 严重程度 |
| type | INTEGER | - | 类型 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| modified_at | TIMESTAMP | NOT NULL | 修改时间 |

#### 3.2.5 项目成员表 (project_members)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PK | 主键 |
| project_id | BIGINT | FK, NOT NULL | 项目ID |
| user_id | BIGINT | FK, NOT NULL | 用户ID |
| role_id | BIGINT | FK | 角色ID |
| is_admin | BOOLEAN | DEFAULT FALSE | 是否管理员 |
| created_at | TIMESTAMP | NOT NULL | 加入时间 |

#### 3.2.6 看板状态表 (kanban_statuses)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PK | 主键 |
| project_id | BIGINT | FK | 所属项目 |
| name | VARCHAR(100) | NOT NULL | 状态名称 |
| slug | VARCHAR(100) | NOT NULL | 状态标识 |
| color | VARCHAR(20) | NOT NULL | 状态颜色 |
| order | INTEGER | NOT NULL | 排序 |
| is_closed | BOOLEAN | DEFAULT FALSE | 是否终态 |

### 3.3 索引设计

```sql
-- 用户表索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 项目表索引
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_slug ON projects(slug);

-- 用户故事表索引
CREATE INDEX idx_user_stories_project ON user_stories(project_id);
CREATE INDEX idx_user_stories_status ON user_stories(status_id);
CREATE INDEX idx_user_stories_assigned ON user_stories(assigned_to_id);

-- 问题表索引
CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_issues_status ON issues(status_id);

-- 项目成员表索引
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE UNIQUE INDEX idx_project_members_unique ON project_members(project_id, user_id);
```

---

## 4. API 设计

### 4.1 API 设计原则

- RESTful 风格设计
- 统一的响应格式
- 版本控制（/api/v1/）
- JWT Token 认证

### 4.2 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 4.3 API 端点列表

#### 4.3.1 认证模块

| 端点 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /api/v1/auth/login | POST | 用户登录 | 否 |
| /api/v1/auth/register | POST | 用户注册 | 否 |
| /api/v1/auth/refresh | POST | 刷新Token | 是 |

**登录请求示例:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**登录响应示例:**
```json
{
  "auth_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "id": 1,
  "username": "user",
  "full_name": "User Name",
  "email": "user@example.com"
}
```

#### 4.3.2 项目模块

| 端点 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /api/v1/projects | GET | 获取项目列表 | 是 |
| /api/v1/projects | POST | 创建项目 | 是 |
| /api/v1/projects/{id} | GET | 获取项目详情 | 是 |
| /api/v1/projects/{id} | PUT | 更新项目 | 是 |
| /api/v1/projects/{id} | DELETE | 删除项目 | 是 |
| /api/v1/projects/{id}/members | GET | 获取项目成员 | 是 |
| /api/v1/projects/{id}/members | POST | 添加项目成员 | 是 |

**项目创建请求示例:**
```json
{
  "name": "新项目",
  "description": "项目描述",
  "is_private": false
}
```

#### 4.3.3 用户故事模块

| 端点 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /api/v1/projects/{projectId}/stories | GET | 获取故事列表 | 是 |
| /api/v1/projects/{projectId}/stories | POST | 创建用户故事 | 是 |
| /api/v1/projects/{projectId}/stories/{id} | GET | 获取故事详情 | 是 |
| /api/v1/projects/{projectId}/stories/{id} | PUT | 更新用户故事 | 是 |
| /api/v1/projects/{projectId}/stories/{id} | DELETE | 删除用户故事 | 是 |

#### 4.3.4 问题模块

| 端点 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /api/v1/projects/{projectId}/issues | GET | 获取问题列表 | 是 |
| /api/v1/projects/{projectId}/issues | POST | 创建问题 | 是 |
| /api/v1/projects/{projectId}/issues/{id} | GET | 获取问题详情 | 是 |
| /api/v1/projects/{projectId}/issues/{id} | PUT | 更新问题 | 是 |
| /api/v1/projects/{projectId}/issues/{id} | DELETE | 删除问题 | 是 |

#### 4.3.5 看板模块

| 端点 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /api/v1/projects/{projectId}/kanban | GET | 获取看板数据 | 是 |
| /api/v1/projects/{projectId}/kanban/statuses | GET | 获取看板状态列表 | 是 |
| /api/v1/projects/{projectId}/kanban/move | POST | 移动卡片 | 是 |

**看板数据响应示例:**
```json
{
  "columns": [
    {
      "id": 1,
      "name": "待办",
      "color": "#1890ff",
      "order": 1,
      "cards": [
        {
          "id": 1,
          "type": "userstory",
          "title": "用户故事标题",
          "status": 1,
          "order": 1,
          "assigned_to": { ... }
        }
      ]
    }
  ]
}
```

---

## 5. 核心模块设计

### 5.1 认证模块

#### 5.1.1 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    认证流程                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  客户端 ──► AuthController ──► AuthService                  │
│                                │                            │
│                                ▼                            │
│                          JwtTokenProvider                   │
│                                │                            │
│                                ▼                            │
│                          SecurityContext                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.1.2 核心组件

- **AuthController**: 处理登录、注册请求
- **AuthService**: 认证业务逻辑
- **JwtTokenProvider**: JWT Token 生成与验证
- **JwtAuthenticationFilter**: JWT 认证过滤器
- **CustomUserDetailsService**: 用户详情加载服务

#### 5.1.3 Token 设计

- **Access Token**: 有效期 2 小时，用于 API 访问
- **Refresh Token**: 有效期 7 天，用于刷新 Access Token

### 5.2 看板模块

#### 5.2.1 数据流设计

```
┌─────────────────────────────────────────────────────────────┐
│                    看板数据流                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  前端 KanbanPage                                            │
│       │                                                     │
│       ▼                                                     │
│  KanbanService (API 请求)                                   │
│       │                                                     │
│       ▼                                                     │
│  后端 KanbanController                                      │
│       │                                                     │
│       ▼                                                     │
│  KanbanService (业务逻辑)                                   │
│       │                                                     │
│       ▼                                                     │
│  UserStoryRepository / IssueRepository                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.2 拖拽实现

前端使用 `@dnd-kit` 库实现拖拽功能：

```typescript
import { DndContext, DragEndEvent } from '@dnd-kit/core'

function KanbanBoard() {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    // 处理卡片移动逻辑
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* 看板列 */}
    </DndContext>
  )
}
```

### 5.3 权限模块

#### 5.3.1 权限模型

```
┌─────────────────────────────────────────────────────────────┐
│                    RBAC 权限模型                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User ──► Role ──► Permission                               │
│                                                             │
│  用户通过角色获得权限，支持项目级别权限控制                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.3.2 预设角色

| 角色名称 | 说明 | 权限范围 |
|----------|------|----------|
| Admin | 系统管理员 | 全部权限 |
| Project Admin | 项目管理员 | 项目全部权限 |
| Developer | 开发者 | 查看、编辑、创建 |
| Viewer | 查看者 | 仅查看 |

---

## 6. 安全设计

### 6.1 认证安全

- 密码使用 BCrypt 加密存储
- JWT Token 包含签名验证
- Token 存储在 Redis 中支持主动失效

### 6.2 接口安全

- 所有 API 请求需携带有效 Token
- 敏感操作记录审计日志
- 请求参数服务端校验

### 6.3 跨域配置

```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // ...
        return http.build();
    }
}
```

---

## 7. 部署架构

### 7.1 Docker 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Frontend   │  │   Backend   │  │  PostgreSQL │        │
│  │  (Nginx)    │  │(Spring Boot)│  │   (数据)    │        │
│  │   :9000     │  │   :8000     │  │   :5432     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                         │
│  │    Redis    │  │  RabbitMQ   │                         │
│  │   (缓存)    │  │  (消息)     │                         │
│  │   :6379     │  │   :5672     │                         │
│  └─────────────┘  └─────────────┘                         │
│                                                             │
│                    aiteam-net (桥接网络)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DATABASE_HOST | 数据库地址 | postgres |
| DATABASE_PORT | 数据库端口 | 5432 |
| DATABASE_NAME | 数据库名称 | aiteam |
| DATABASE_USER | 数据库用户 | aiteam |
| DATABASE_PASSWORD | 数据库密码 | - |
| REDIS_HOST | Redis地址 | redis |
| REDIS_PORT | Redis端口 | 6379 |
| RABBITMQ_HOST | RabbitMQ地址 | rabbitmq |
| JWT_SECRET | JWT密钥 | - |
| CORS_ORIGINS | 允许的跨域来源 | - |

### 7.3 启动命令

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend

# 停止服务
docker-compose down
```

---

## 8. 性能优化

### 8.1 后端优化

- **数据库连接池**: HikariCP 配置
- **缓存策略**: Redis 缓存热点数据
- **分页查询**: 大数据量分页处理
- **懒加载**: JPA 关联懒加载

### 8.2 前端优化

- **代码分割**: 路由级别懒加载
- **资源压缩**: Vite 构建压缩
- **缓存策略**: 静态资源 CDN 缓存
- **虚拟列表**: 大数据量列表优化

### 8.3 缓存配置

```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        // 缓存配置
    }
}
```

---

## 附录

### A. 参考文档

- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [React 官方文档](https://react.dev)
- [Ant Design 官方文档](https://ant.design)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)

### B. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-03-09 | 初始版本 |

---

**文档结束**