/**
 * 项目服务
 */
import { http } from '@/utils/request'
import type { Project, ProjectMember, PaginatedResponse } from '@/types'

export interface CreateProjectParams {
  name: string
  description?: string
  is_private: boolean
}

export interface UpdateProjectParams {
  name?: string
  description?: string
  is_private?: boolean
  is_backlog_activated?: boolean
  is_kanban_activated?: boolean
  is_issue_activated?: boolean
}

export const projectService = {
  /**
   * 获取项目列表
   */
  getProjects: async (params?: {
    page?: number
    page_size?: number
  }): Promise<PaginatedResponse<Project>> => {
    const response = await http.get<PaginatedResponse<Project>>('/projects', { params })
    return response.data
  },

  /**
   * 获取项目详情
   */
  getProject: async (id: number): Promise<Project> => {
    const response = await http.get<Project>(`/projects/${id}`)
    return response.data
  },

  /**
   * 创建项目
   */
  createProject: async (params: CreateProjectParams): Promise<Project> => {
    const response = await http.post<Project>('/projects', params)
    return response.data
  },

  /**
   * 更新项目
   */
  updateProject: async (id: number, params: UpdateProjectParams): Promise<Project> => {
    const response = await http.put<Project>(`/projects/${id}`, params)
    return response.data
  },

  /**
   * 删除项目
   */
  deleteProject: async (id: number): Promise<void> => {
    await http.delete(`/projects/${id}`)
  },

  /**
   * 获取项目成员
   */
  getProjectMembers: async (projectId: number): Promise<ProjectMember[]> => {
    const response = await http.get<ProjectMember[]>(`/projects/${projectId}/members`)
    return response.data
  },

  /**
   * 添加项目成员
   */
  addProjectMember: async (
    projectId: number,
    userId: number,
    roleId: number
  ): Promise<ProjectMember> => {
    const response = await http.post<ProjectMember>(`/projects/${projectId}/members`, {
      user_id: userId,
      role_id: roleId,
    })
    return response.data
  },

  /**
   * 移除项目成员
   */
  removeProjectMember: async (projectId: number, memberId: number): Promise<void> => {
    await http.delete(`/projects/${projectId}/members/${memberId}`)
  },

  /**
   * 更新成员角色
   */
  updateMemberRole: async (
    projectId: number,
    memberId: number,
    roleId: number
  ): Promise<ProjectMember> => {
    const response = await http.put<ProjectMember>(
      `/projects/${projectId}/members/${memberId}`,
      { role_id: roleId }
    )
    return response.data
  },
}
