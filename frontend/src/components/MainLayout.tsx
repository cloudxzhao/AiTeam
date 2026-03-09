/**
 * 主布局组件 - 极简主义风格
 * Exaggerated Minimalism + Professional Dashboard
 */
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, Drawer, Badge } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store'
import { getUserAvatarColor, getUserAvatarInitial } from '@/utils'

const { Header, Sider, Content } = Layout

// 菜单项配置
const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/projects',
    icon: <ProjectOutlined />,
    label: '项目',
  },
  {
    key: '/kanban',
    icon: <AppstoreOutlined />,
    label: '看板',
  },
  {
    key: '/tasks',
    icon: <CheckCircleOutlined />,
    label: '任务',
  },
  {
    key: '/permissions',
    icon: <SafetyOutlined />,
    label: '权限',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '设置',
  },
]

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  // 获取当前选中菜单项
  const selectedKeys = [location.pathname]

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-gradient)' }}>
      {/* 背景装饰 */}
      <div style={styles.bgDecoration}>
        <div style={{ ...styles.bgBlob, top: '-5%', right: '-5%', background: 'var(--gradient-primary)' }} />
        <div style={{ ...styles.bgBlob, bottom: '-5%', left: '-5%', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.08), rgba(239, 68, 68, 0.08))' }} />
      </div>

      {/* 桌面端侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={80}
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true)
          }
        }}
        style={styles.sider}
      >
        <div style={styles.logo}>
          <Link to="/" style={styles.logoLink}>
            <div style={styles.logoIcon}>
              <span>A</span>
            </div>
            {!collapsed && <span style={styles.logoText}>AiTeam</span>}
          </Link>
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={styles.sideMenu}
        />

        {/* 底部用户信息 */}
        {!collapsed && (
          <div style={styles.siderFooter}>
            <div style={styles.miniUser}>
              <Avatar
                style={{
                  backgroundColor: user ? getUserAvatarColor(user.username) : '#DC2626',
                }}
                size={32}
              >
                {user ? getUserAvatarInitial(user.full_name || user.username) : 'U'}
              </Avatar>
              <div style={styles.miniUserInfo}>
                <Text style={styles.miniUserName}>{user?.full_name || user?.username}</Text>
                <Text type="secondary" style={styles.miniUserEmail}>在线</Text>
              </div>
            </div>
          </div>
        )}
      </Sider>

      {/* 移动端侧边栏抽屉 */}
      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={280}
        styles={{
          body: { padding: 0 },
          mask: { background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' },
        }}
      >
        <div style={styles.drawerHeader}>
          <div style={styles.logoIcon}>A</div>
          <span style={styles.logoText}>AiTeam</span>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={(e) => {
            handleMenuClick(e)
            setDrawerOpen(false)
          }}
        />
      </Drawer>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 240,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'transparent',
        }}
      >
        <Header style={styles.header}>
          {/* 左侧：折叠按钮 */}
          <div style={styles.headerLeft}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={styles.menuTrigger}
            />
          </div>

          {/* 右侧：欢迎语 + 通知 + 头像 */}
          <div style={styles.headerRight}>
            {/* 欢迎语 */}
            <div style={styles.welcomeText}>
              <span>欢迎回来，{user?.full_name || user?.username || '用户'}</span>
            </div>

            {/* 通知按钮 */}
            <div style={styles.iconButton}>
              <Badge count={3} size="small" offset={[-8, 5]}>
                <Button type="text" icon={<BellOutlined />} />
              </Badge>
            </div>

            {/* 用户头像下拉菜单 */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div style={styles.userAvatar}>
                <Avatar
                  style={{
                    backgroundColor: user ? getUserAvatarColor(user.username) : '#DC2626',
                    cursor: 'pointer',
                  }}
                  size={32}
                >
                  {user ? getUserAvatarInitial(user.full_name || user.username) : 'U'}
                </Avatar>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={styles.content}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

import { Typography } from 'antd'

const { Text } = Typography

// CSS-in-JS 样式 - 数字银行风格
const styles: Record<string, React.CSSProperties> = {
  bgDecoration: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgBlob: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    filter: 'blur(100px)',
    animation: 'float 8s ease-in-out infinite',
    opacity: 0.05,
  } as React.CSSProperties,
  sider: {
    background: 'var(--bg-secondary)',
    borderRight: 'var(--border-default)',
    position: 'fixed' as const,
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  logo: {
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: 'var(--border-default)',
    padding: '0 1rem',
    background: 'var(--bg-secondary)',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 700,
    color: 'white',
    flexShrink: 0,
    boxShadow: 'var(--shadow-primary)',
  },
  logoText: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  sideMenu: {
    borderRight: 'none',
    background: 'transparent',
    padding: '0.75rem',
  },
  siderFooter: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: '1rem',
    borderTop: 'var(--border-default)',
    background: 'var(--bg-secondary)',
  },
  miniUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  miniUserInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  miniUserName: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    display: 'block',
  },
  miniUserEmail: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    display: 'block',
  },
  // 顶部导航栏 - 轻量化设计
  header: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: 'var(--border-default)',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 99,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
    height: '64px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  menuTrigger: {
    fontSize: '18px',
    color: 'var(--text-muted)',
    padding: '4px',
  },
  // 右侧区域
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  welcomeText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    paddingRight: '0.75rem',
    borderRight: 'var(--border-default)',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
  },
  userAvatar: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: '50%',
    transition: 'all var(--transition-base)',
  },
  content: {
    margin: '1.5rem',
    padding: '1.5rem',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-xl)',
    minHeight: 'calc(100vh - 94px)',
    boxShadow: 'var(--shadow-md)',
    border: 'var(--border-default)',
  },
  drawerHeader: {
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0 1.5rem',
    borderBottom: 'var(--border-default)',
    background: 'var(--gradient-primary)',
    color: 'white',
  },
}

export default MainLayout
