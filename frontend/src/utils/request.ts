/**
 * HTTP 请求工具类
 */
import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios'
import { config } from '@/config'

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: config.apiBase,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(config.authTokenKey)
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }
    return requestConfig
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // 如果是 401 错误且没有重试过
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem(config.refreshTokenKey)
      if (refreshToken) {
        try {
          // 尝试刷新 token
          const response = await axios.post(`${config.apiBase}/auth/refresh`, {
            refresh: refreshToken,
          })

          const { auth_token, refresh } = response.data
          localStorage.setItem(config.authTokenKey, auth_token)
          localStorage.setItem(config.refreshTokenKey, refresh)

          // 重试原请求
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${auth_token}`
          }
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          // 刷新失败，清除登录信息
          localStorage.removeItem(config.authTokenKey)
          localStorage.removeItem(config.refreshTokenKey)
          localStorage.removeItem(config.userKey)
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // 没有 refresh token，直接跳转登录
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// 封装请求方法
export const http = {
  get<T = unknown>(url: string, requestConfig?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.get<T>(url, requestConfig)
  },

  post<T = unknown>(
    url: string,
    data?: unknown,
    requestConfig?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return axiosInstance.post<T>(url, data, requestConfig)
  },

  put<T = unknown>(
    url: string,
    data?: unknown,
    requestConfig?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return axiosInstance.put<T>(url, data, requestConfig)
  },

  patch<T = unknown>(
    url: string,
    data?: unknown,
    requestConfig?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return axiosInstance.patch<T>(url, data, requestConfig)
  },

  delete<T = unknown>(url: string, requestConfig?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.delete<T>(url, requestConfig)
  },
}

export default axiosInstance
