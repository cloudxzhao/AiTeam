/**
 * 认证服务
 */
import { http } from '@/utils/request'
import type { AuthResponse, User } from '@/types'

export interface LoginParams {
  type: 'normal'
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
  full_name?: string
}

export const authService = {
  /**
   * 登录
   */
  login: async (params: LoginParams): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>('/auth', params)
    return response.data
  },

  /**
   * 注册
   */
  register: async (params: RegisterParams): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>('/auth/register', params)
    return response.data
  },

  /**
   * 刷新 Token
   */
  refreshToken: async (refresh: string): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>('/auth/refresh', { refresh })
    return response.data
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await http.get<User>('/users/me')
    return response.data
  },

  /**
   * 退出登录
   */
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  /**
   * 检查是否已登录
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token')
  },

  /**
   * 获取存储的用户信息
   */
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
    return null
  },
}
