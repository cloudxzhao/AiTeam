/**
 * AiTeam 前端应用配置
 */
export const config = {
  // API 基础路径
  apiBase: '/api/v1',

  // 应用配置
  appName: 'AiTeam',
  appVersion: '1.0.0',

  // Token 存储键名
  authTokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user',

  // 默认分页大小
  defaultPageSize: 20,

  // Token 刷新阈值（秒）
  tokenRefreshThreshold: 300,
} as const

// 主题配置
export const themeConfig = {
  // 品牌色 - 紫色渐变主题
  brandPrimary: '#8B5CF6',
  brandPrimaryHover: '#7C3AED',
  brandPrimaryLight: '#F3F0FF',
  brandGradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',

  // 功能色
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // 中性色
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
} as const

export type Config = typeof config
export type ThemeConfig = typeof themeConfig
