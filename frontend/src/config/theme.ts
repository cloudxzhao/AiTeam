/**
 * Ant Design 主题配置
 * 与现有 Taiga 紫色渐变风格保持一致
 */
import type { ThemeConfig as AntdThemeConfig } from 'antd'

export const themeConfig: AntdThemeConfig = {
  token: {
    // 品牌色 - 紫色主题
    colorPrimary: '#8B5CF6',
    colorPrimaryHover: '#A78BFA',
    colorPrimaryActive: '#7C3AED',
    colorPrimaryBg: '#F3F0FF',
    colorPrimaryBgHover: '#EDE9FE',
    colorPrimaryBorder: '#DDD6FE',
    colorPrimaryTextHover: '#A78BFA',
    colorPrimaryText: '#8B5CF6',
    colorPrimaryTextActive: '#6D28D9',

    // 成功色
    colorSuccess: '#10B981',
    colorSuccessBg: '#D1FAE5',
    colorSuccessBorder: '#6EE7B7',
    colorSuccessHover: '#34D399',
    colorSuccessActive: '#059669',
    colorSuccessText: '#059669',
    colorSuccessTextActive: '#047857',

    // 警告色
    colorWarning: '#F59E0B',
    colorWarningBg: '#FEF3C7',
    colorWarningBorder: '#FCD34D',
    colorWarningHover: '#FBBF24',
    colorWarningActive: '#D97706',
    colorWarningText: '#D97706',
    colorWarningTextActive: '#B45309',

    // 错误色
    colorError: '#EF4444',
    colorErrorBg: '#FEE2E2',
    colorErrorBorder: '#FCA5A5',
    colorErrorHover: '#F87171',
    colorErrorActive: '#DC2626',
    colorErrorText: '#DC2626',
    colorErrorTextActive: '#B91C1C',

    // 信息色
    colorInfo: '#3B82F6',
    colorInfoBg: '#DBEAFE',
    colorInfoBorder: '#93C5FD',
    colorInfoHover: '#60A5FA',
    colorInfoActive: '#2563EB',
    colorInfoText: '#1D4ED8',
    colorInfoTextActive: '#1E40AF',

    // 字体
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    fontFamilyCode: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',

    // 字体大小
    fontSize: 14,
    fontSizeSM: 13,
    fontSizeLG: 15,
    fontSizeXL: 16,

    // 圆角
    borderRadius: 8,
    borderRadiusSM: 6,
    borderRadiusLG: 10,
    borderRadiusXS: 4,

    // 线宽
    lineWidth: 1,
    lineWidthBold: 2,

    // 阴影
    boxShadow:
      '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    boxShadowSecondary:
      '0 4px 12px 0 rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02), 0 4px 8px 0 rgba(0, 0, 0, 0.02)',

    // 控制高度
    controlHeight: 36,
    controlHeightSM: 30,
    controlHeightLG: 42,
    controlHeightXS: 24,
    controlItemBgHover: '#F9FAFB',
    controlItemBgActive: '#F3F0FF',
    controlItemBgActiveHover: '#EDE9FE',

    // 其他
    wireframe: false,
  },
  components: {
    Button: {
      algorithm: true,
      primaryShadow: 'rgba(139, 92, 246, 0.3)',
    },
    Input: {
      colorBorder: '#D1D5DB',
      colorInfoBorderHover: '#8B5CF6',
    },
    Card: {
      colorBorder: '#E5E7EB',
    },
    Modal: {
      colorBorder: '#E5E7EB',
    },
    Table: {
      colorBorder: '#E5E7EB',
    },
    Menu: {
      colorItemText: '#4B5563',
      colorItemTextHover: '#8B5CF6',
      colorItemBgHover: '#F3F0FF',
      colorItemBgActive: '#F3F0FF',
      colorItemBgSelected: '#F3F0FF',
    },
    Layout: {
      headerHeight: 60,
      headerBg: '#FFFFFF',
      headerColor: '#111827',
      siderBg: '#FFFFFF',
    },
    Select: {
      colorBorder: '#D1D5DB',
      colorInfoBorderHover: '#8B5CF6',
    },
  },
}

export default themeConfig
