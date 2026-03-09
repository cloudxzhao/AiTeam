/**
 * 全局类型定义
 */

// 用户类型
export interface User {
  id: number
  username: string
  full_name: string
  email: string
  photo?: string
  color?: string
  is_active?: boolean
}

// 认证响应
export interface AuthResponse {
  auth_token: string
  refresh: string
  id: number
  username: string
  full_name: string
  email: string
}

// 项目类型
export interface Project {
  id: number
  name: string
  slug: string
  description?: string
  is_private: boolean
  is_backlog_activated: boolean
  is_kanban_activated: boolean
  is_issue_activated: boolean
  created_at?: string
  modified_at?: string
  owner?: User
  members?: ProjectMember[]
}

// 项目成员
export interface ProjectMember {
  id: number
  user: User
  role: string
  is_admin: boolean
}

// 用户故事
export interface UserStory {
  id: number
  ref: number
  subject: string
  description?: string
  status: number
  status_name?: string
  status_color?: string
  priority?: number
  priority_name?: string
  points?: number
  sprint?: number
  sprint_name?: string
  assigned_to?: User
  owner?: User
  created_at?: string
  modified_at?: string
  total_points?: number
  project?: number
}

// 任务
export interface Task {
  id: number
  ref: number
  subject: string
  description?: string
  status: number
  status_name?: string
  status_color?: string
  priority?: number
  priority_name?: string
  assigned_to?: User
  owner?: User
  user_story?: number
  sprint?: number
  created_at?: string
  modified_at?: string
  project?: number
  is_blocked?: boolean
  blocked_note?: string
}

// 问题
export interface Issue {
  id: number
  ref: number
  subject: string
  description?: string
  status: number
  status_name?: string
  status_color?: string
  priority?: number
  priority_name?: string
  severity?: number
  severity_name?: string
  type?: number
  type_name?: string
  assigned_to?: User
  owner?: User
  created_at?: string
  modified_at?: string
  project?: number
  is_blocked?: boolean
  blocked_note?: string
}

// 看板列
export interface KanbanColumn {
  id: number
  name: string
  color: string
  order: number
  status?: number
}

// 看板卡片
export interface KanbanCard {
  id: number
  type: 'userstory' | 'task' | 'issue'
  title: string
  description?: string
  status: number
  column?: number
  order: number
  assigned_to?: User
  priority?: number
  points?: number
  tags?: string[]
}

// 权限申请
export interface PermissionApplication {
  id: number
  user: User
  project: Project
  requested_role: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at?: string
  reviewer?: User
  review_note?: string
}

// 角色定义
export interface Role {
  id: number
  name: string
  slug: string
  permissions: string[]
}

// API 响应基础类型
export interface ApiResponse<T = unknown> {
  _error_message?: string
  _error_code?: number
  data?: T
}

// 分页参数
export interface PaginationParams {
  page?: number
  page_size?: number
  ordering?: string
  search?: string
}

// 分页响应
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
