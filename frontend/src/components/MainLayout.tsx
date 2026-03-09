/**
 * 主布局组件
 */
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space, Button, Drawer } from 'antd'
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
    <Layout style={{ minHeight: '100vh' }}>
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
        style={{
          background: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={styles.logo}>
          {!collapsed && <span style={styles.logoText}>AiTeam</span>}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* 移动端侧边栏抽屉 */}
      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={250}
        styles={{ body: { padding: 0 } }}
      >
        <div style={styles.logo}>
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
          marginLeft: collapsed ? 80 : 200,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px' }}
            />
            <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
              AiTeam
            </Link>
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <Space style={{ cursor: 'pointer', padding: '0.5rem' }}>
              <Avatar
                style={{
                  backgroundColor: user ? getUserAvatarColor(user.username) : '#8B5CF6',
                }}
                size={36}
              >
                {user ? getUserAvatarInitial(user.full_name || user.username) : 'U'}
              </Avatar>
              <span style={{ color: '#374151', fontWeight: 500 }}>
                {user?.full_name || user?.username || '用户'}
              </span>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: '1.5rem',
            padding: '1.5rem',
            background: '#F9FAFB',
            borderRadius: '12px',
            minHeight: 'calc(100vh - 140px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  logo: {
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #E5E7EB',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
}

export default MainLayout
