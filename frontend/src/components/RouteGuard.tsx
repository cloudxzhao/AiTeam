/**
 * 路由守卫组件
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import type { ReactNode } from 'react'

interface PrivateRouteProps {
  children: ReactNode
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    // 重定向到登录页，并保存当前路径
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

/**
 * 公共路由守卫（已登录用户访问登录/注册页时重定向到仪表盘）
 */
export const PublicRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (isAuthenticated) {
    // 获取重定向前路径或默认到仪表盘
    const from = (location.state as { from?: Location })?.from || { pathname: '/dashboard' }
    return <Navigate to={from} replace />
  }

  return <>{children}</>
}
