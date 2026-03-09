/**
 * 全局类型定义
 */

// 用户类型
export interface User {
  id: number
  username: string
  full_name?: string
  email: string
  photo?: string
  is_active?: boolean
}

// 认证响应
export interface AuthResponse {
  id: number
  username: string
  full_name?: string
  email: string
  auth_token: string
  refresh: string
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

// 权限点
export interface Permission {
  id: number
  codename: string
  name: string
  module: string
  description?: string
  is_active: boolean
}

// 角色定义
export interface Role {
  id: number
  name: string
  slug: string
  description?: string
  is_system: boolean
  is_admin: boolean
  permissions: Permission[]
}

// 权限申请
export interface PermissionApplication {
  id: number
  apply_id: string
  applicant_id: number
  applicant_name?: string
  applicant_email?: string
  project_id: number
  project_name?: string
  role_id: number
  role_name?: string
  reason?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submitted_at: string
  approver_id?: number
  approver_name?: string
  approved_at?: string
  approve_note?: string
}

// 项目成员详情
export interface ProjectMemberDetail {
  id: number
  project_id: number
  user_id: number
  username: string
  email: string
  full_name?: string
  photo?: string
  role_id: number
  role_name: string
  is_owner: boolean
  joined_at: string
}

// 权限申请请求
export interface PermissionApplyRequest {
  projectId: number
  roleId: number
  reason?: string
}

// 审批请求
export interface ApproveRequest {
  note: string
}

// 添加项目成员请求
export interface AddProjectMemberRequest {
  userId: number
  roleId: number
}

// 审计日志
export interface AuditLog {
  id: number
  log_id: string
  operator_id: number
  operator_username?: string
  operator_ip?: string
  action: 'GRANT' | 'REVOKE' | 'APPLY' | 'APPROVE' | 'REJECT' | 'CREATE_PROJECT'
  target_user_id?: number
  target_username?: string
  target_project_id?: number
  target_project_name?: string
  target_role_id?: number
  target_role_name?: string
  detail?: string
  result: 'SUCCESS' | 'FAILURE'
  error_msg?: string
  created_at: string
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
