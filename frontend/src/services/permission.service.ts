/**
 * 权限管理服务
 */
import { http } from '@/utils/request'
import type {
  Permission,
  Role,
  PermissionApplication,
  ProjectMemberDetail,
  AuditLog,
  PermissionApplyRequest,
  ApproveRequest,
  AddProjectMemberRequest,
  PaginatedResponse,
} from '@/types'

export const permissionService = {
  /**
   * 获取所有权限点
   */
  getPermissions: async (): Promise<Permission[]> => {
    const response = await http.get<Permission[]>('/api/v1/permissions/points')
    return response.data
  },

  /**
   * 获取所有角色
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await http.get<Role[]>('/api/v1/permissions/roles')
    return response.data
  },

  /**
   * 获取用户在项目中的权限
   */
  getUserPermissionsInProject: async (
    projectId: number,
    userId: number
  ): Promise<{
    userId: number
    projectId: number
    permissions: string[]
    role: Role | null
  }> => {
    const response = await http.get<{
      userId: number
      projectId: number
      permissions: string[]
      role: Role | null
    }>(`/api/v1/permissions/projects/${projectId}?userId=${userId}`)
    return response.data
  },

  /**
   * 校验权限
   */
  checkPermission: async (
    userId: number,
    projectId: number,
    permissionCodename: string
  ): Promise<{ hasPermission: boolean }> => {
    const response = await http.post<{ hasPermission: boolean }>(
      '/api/v1/permissions/check',
      {
        userId,
        projectId,
        permissionCodename,
      }
    )
    return response.data
  },

  /**
   * 提交权限申请
   */
  applyPermission: async (params: PermissionApplyRequest): Promise<PermissionApplication> => {
    const response = await http.post<PermissionApplication>(
      '/api/v1/permission-applications',
      params
    )
    return response.data
  },

  /**
   * 获取我的申请历史
   */
  getMyApplications: async (): Promise<PermissionApplication[]> => {
    const response = await http.get<PermissionApplication[]>(
      '/api/v1/permission-applications/my'
    )
    return response.data
  },

  /**
   * 获取待审批申请列表
   */
  getPendingApplications: async (projectId?: number): Promise<PermissionApplication[]> => {
    const url = projectId
      ? `/api/v1/permission-applications/pending?projectId=${projectId}`
      : '/api/v1/permission-applications/pending'
    const response = await http.get<PermissionApplication[]>(url)
    return response.data
  },

  /**
   * 获取申请详情
   */
  getApplication: async (id: number): Promise<PermissionApplication> => {
    const response = await http.get<PermissionApplication>(
      `/api/v1/permission-applications/${id}`
    )
    return response.data
  },

  /**
   * 批准申请
   */
  approveApplication: async (id: number, params: ApproveRequest): Promise<PermissionApplication> => {
    const response = await http.post<PermissionApplication>(
      `/api/v1/permission-applications/${id}/approve`,
      params
    )
    return response.data
  },

  /**
   * 拒绝申请
   */
  rejectApplication: async (id: number, params: ApproveRequest): Promise<PermissionApplication> => {
    const response = await http.post<PermissionApplication>(
      `/api/v1/permission-applications/${id}/reject`,
      params
    )
    return response.data
  },

  /**
   * 获取项目成员列表
   */
  getProjectMembers: async (projectId: number): Promise<ProjectMemberDetail[]> => {
    const response = await http.get<ProjectMemberDetail[]>(
      `/api/v1/projects/${projectId}/members`
    )
    return response.data
  },

  /**
   * 添加项目成员
   */
  addProjectMember: async (
    projectId: number,
    params: AddProjectMemberRequest
  ): Promise<ProjectMemberDetail> => {
    const response = await http.post<ProjectMemberDetail>(
      `/api/v1/projects/${projectId}/members`,
      params
    )
    return response.data
  },

  /**
   * 更新成员角色
   */
  updateMemberRole: async (
    projectId: number,
    userId: number,
    roleId: number
  ): Promise<ProjectMemberDetail> => {
    const response = await http.put<ProjectMemberDetail>(
      `/api/v1/projects/${projectId}/members/${userId}`,
      { userId, roleId }
    )
    return response.data
  },

  /**
   * 移除项目成员
   */
  removeMember: async (projectId: number, userId: number): Promise<void> => {
    await http.delete(`/api/v1/projects/${projectId}/members/${userId}`)
  },

  /**
   * 获取审计日志列表
   */
  getAuditLogs: async (params?: {
    operatorId?: number
    targetUserId?: number
    targetProjectId?: number
    action?: string
    page?: number
    size?: number
  }): Promise<PaginatedResponse<AuditLog>> => {
    const queryParams = new URLSearchParams()
    if (params?.operatorId) queryParams.append('operatorId', params.operatorId.toString())
    if (params?.targetUserId) queryParams.append('targetUserId', params.targetUserId.toString())
    if (params?.targetProjectId)
      queryParams.append('targetProjectId', params.targetProjectId.toString())
    if (params?.action) queryParams.append('action', params.action)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.size) queryParams.append('size', params.size.toString())

    const response = await http.get<PaginatedResponse<AuditLog>>(
      `/api/v1/audit-logs?${queryParams.toString()}`
    )
    return response.data
  },

  /**
   * 获取审计日志详情
   */
  getAuditLog: async (id: number): Promise<AuditLog> => {
    const response = await http.get<AuditLog>(`/api/v1/audit-logs/${id}`)
    return response.data
  },
}
