/**
 * 看板服务
 */
import { http } from '@/utils/request'
import type { KanbanColumn, KanbanCard } from '@/types'

export interface CreateColumnParams {
  name: string
  color: string
  order: number
}

export interface CreateCardParams {
  title: string
  description?: string
  type: 'userstory' | 'task' | 'issue'
  status: number
}

export interface MoveCardParams {
  type: 'userstory' | 'issue'
  id: number
  to_status: string
  new_order?: number
}

export interface KanbanConstraint {
  can_move_to: string[]
  blocked_by?: {
    issue_id: number
    issue_subject: string
  }[]
  userstory?: Record<string, string[]>
  issue?: Record<string, string[]>
}

export interface UserTransitions {
  allowed_transitions: Record<string, string[]>
  constraints?: {
    userstory: Record<string, string[]>
    issue: Record<string, string[]>
  }
}

// 后端兼容的状态 slug 映射
export const STATUS_SLUG_MAP: Record<string, string> = {
  'analysis': 'analysis',       // 分析阶段
  'development': 'development', // 开发阶段
  'testing': 'testing',         // 测试阶段
  'done': 'done',               // 完成阶段
}

export const kanbanService = {
  /**
   * 获取看板列
   */
  getColumns: async (projectId: number): Promise<KanbanColumn[]> => {
    const response = await http.get<KanbanColumn[]>(`/kanban/${projectId}/columns`)
    return response.data
  },

  /**
   * 创建看板列
   */
  createColumn: async (projectId: number, params: CreateColumnParams): Promise<KanbanColumn> => {
    const response = await http.post<KanbanColumn>(
      `/kanban/${projectId}/columns`,
      params
    )
    return response.data
  },

  /**
   * 更新看板列顺序
   */
  updateColumnOrder: async (
    projectId: number,
    columns: { id: number; order: number }[]
  ): Promise<void> => {
    await http.put(`/kanban/${projectId}/columns/order`, { columns })
  },

  /**
   * 删除看板列
   */
  deleteColumn: async (projectId: number, columnId: number): Promise<void> => {
    await http.delete(`/kanban/${projectId}/columns/${columnId}`)
  },

  /**
   * 获取看板卡片
   */
  getCards: async (projectId: number, columnId?: number): Promise<KanbanCard[]> => {
    const url = columnId
      ? `/kanban/${projectId}/columns/${columnId}/cards`
      : `/kanban/${projectId}/cards`
    const response = await http.get<KanbanCard[]>(url)
    return response.data
  },

  /**
   * 创建看板卡片
   */
  createCard: async (projectId: number, params: CreateCardParams): Promise<KanbanCard> => {
    const response = await http.post<KanbanCard>(`/kanban/${projectId}/cards`, params)
    return response.data
  },

  /**
   * 移动卡片 (使用专用 move 端点 - BUG-003 修复)
   * POST /api/v1/kanban/{project_id}/move
   */
  moveCard: async (projectId: number, params: MoveCardParams): Promise<{
    success: boolean
    card?: KanbanCard
    error?: string
    blocking_issues?: { id: number; subject: string }[]
  }> => {
    try {
      const response = await http.post(`/kanban/${projectId}/move`, params)
      return response.data as {
        success: boolean
        card?: KanbanCard
        error?: string
        blocking_issues?: { id: number; subject: string }[]
      }
    } catch (error) {
      console.error('Failed to move card:', error)
      return {
        success: false,
        error: '移动卡片失败',
      }
    }
  },

  /**
   * 获取用户权限约束 (BUG-005 修复)
   * GET /api/v1/kanban/{project_id}/constraints/
   */
  getConstraints: async (projectId: number): Promise<KanbanConstraint> => {
    const response = await http.get<KanbanConstraint>(`/kanban/${projectId}/constraints`)
    return response.data
  },

  /**
   * 获取用户允许的转换 (BUG-005 修复)
   * GET /api/v1/kanban/{project_id}/transitions/
   */
  getUserTransitions: async (projectId: number): Promise<UserTransitions> => {
    const response = await http.get<UserTransitions>(`/kanban/${projectId}/transitions`)
    return response.data
  },

  /**
   * 更新卡片位置
   */
  updateCardPosition: async (
    projectId: number,
    cardId: number,
    columnId: number,
    order: number
  ): Promise<void> => {
    await http.put(`/kanban/${projectId}/cards/${cardId}/position`, {
      column_id: columnId,
      order,
    })
  },

  /**
   * 更新卡片
   */
  updateCard: async (
    projectId: number,
    cardId: number,
    params: Partial<CreateCardParams>
  ): Promise<KanbanCard> => {
    const response = await http.put<KanbanCard>(
      `/kanban/${projectId}/cards/${cardId}`,
      params
    )
    return response.data
  },

  /**
   * 删除卡片
   */
  deleteCard: async (projectId: number, cardId: number): Promise<void> => {
    await http.delete(`/kanban/${projectId}/cards/${cardId}`)
  },
}
