/**
 * 权限管理服务
 */
import { http } from '@/utils/request'
import type { PermissionApplication, Role, User } from '@/types'

export interface ApplyPermissionParams {
  project_id: number
  role_id: number
  reason?: string
}

export interface ReviewPermissionParams {
  status: 'approved' | 'rejected'
  review_note?: string
}

export const permissionService = {
  /**
   * 申请项目权限
   */
  applyPermission: async (params: ApplyPermissionParams): Promise<PermissionApplication> => {
    const response = await http.post<PermissionApplication>('/permissions/apply', params)
    return response.data
  },

  /**
   * 获取我的权限申请
   */
  getMyApplications: async (): Promise<PermissionApplication[]> => {
    const response = await http.get<PermissionApplication[]>('/permissions/applications')
    return response.data
  },

  /**
   * 获取项目的权限申请列表（管理员）
   */
  getProjectApplications: async (projectId: number): Promise<PermissionApplication[]> => {
    const response = await http.get<PermissionApplication[]>(
      `/permissions/projects/${projectId}/applications`
    )
    return response.data
  },

  /**
   * 审批权限申请
   */
  reviewApplication: async (
    applicationId: number,
    params: ReviewPermissionParams
  ): Promise<PermissionApplication> => {
    const response = await http.post<PermissionApplication>(
      `/permissions/applications/${applicationId}/review`,
      params
    )
    return response.data
  },

  /**
   * 获取可用角色列表
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await http.get<Role[]>('/permissions/roles')
    return response.data
  },

  /**
   * 获取项目成员列表
   */
  getProjectMembers: async (projectId: number): Promise<User[]> => {
    const response = await http.get<User[]>(`/permissions/projects/${projectId}/members`)
    return response.data
  },

  /**
   * 移除成员权限
   */
  removeMember: async (projectId: number, userId: number): Promise<void> => {
    await http.delete(`/permissions/projects/${projectId}/members/${userId}`)
  },

  /**
   * 更新成员角色
   */
  updateMemberRole: async (
    projectId: number,
    userId: number,
    roleId: number
  ): Promise<void> => {
    await http.put(`/permissions/projects/${projectId}/members/${userId}`, {
      role_id: roleId,
    })
  },
}
