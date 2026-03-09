/**
 * 用户认证 Store
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authService } from '@/services'

interface AuthState {
  user: User | null
  authToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (username: string, password: string) => Promise<void>
  register: (
    username: string,
    email: string,
    password: string,
    fullName?: string
  ) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      authToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login({
            type: 'normal',
            username,
            password,
          })

          // 存储 token 到 localStorage
          localStorage.setItem('auth_token', response.auth_token)
          localStorage.setItem('refresh_token', response.refresh)

          const user: User = {
            id: response.id,
            username: response.username,
            full_name: response.full_name,
            email: response.email,
          }
          localStorage.setItem('user', JSON.stringify(user))

          set({
            user,
            authToken: response.auth_token,
            refreshToken: response.refresh,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : '登录失败，请稍后重试'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      register: async (
        username: string,
        email: string,
        password: string,
        fullName?: string
      ) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.register({
            username,
            email,
            password,
            full_name: fullName,
          })

          localStorage.setItem('auth_token', response.auth_token)
          localStorage.setItem('refresh_token', response.refresh)

          const user: User = {
            id: response.id,
            username: response.username,
            full_name: response.full_name,
            email: response.email,
          }
          localStorage.setItem('user', JSON.stringify(user))

          set({
            user,
            authToken: response.auth_token,
            refreshToken: response.refresh,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : '注册失败，请稍后重试'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          authToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      updateUser: (user: Partial<User>) => {
        const currentState = get()
        const updatedUser = currentState.user
          ? { ...currentState.user, ...user }
          : (user as User)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        set({ user: updatedUser })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        authToken: state.authToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
