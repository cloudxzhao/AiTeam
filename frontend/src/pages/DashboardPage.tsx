/**
 * 仪表盘页面 - 项目管理平台
 * Exaggerated Minimalism + Professional Dashboard
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Empty, Typography, Progress, Badge, Skeleton } from 'antd'
import {
  ProjectOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  RiseOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  BellOutlined,
  AimOutlined,
  FallOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import { projectService } from '@/services'
import { useAuthStore } from '@/store'
import type { Project } from '@/types'

const { Title, Text } = Typography

// 模拟实时数据
const mockAnalytics = {
  totalTasks: 156,
  completedTasks: 89,
  inProgressTasks: 45,
  pendingTasks: 22,
  teamVelocity: 87,
  sprintProgress: 68,
  avgCompletionTime: '2.4 天',
  productivityChange: 12.5,
}

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [animatedStats, setAnimatedStats] = useState(mockAnalytics)

  // 数据过滤状态
  const [filterType, setFilterType] = useState<'all' | 'active' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadProjects()
    const interval = setInterval(() => {
      setAnimatedStats(prev => ({
        ...prev,
        totalTasks: prev.totalTasks + Math.floor(Math.random() * 3) - 1,
        completedTasks: Math.min(prev.completedTasks + 1, prev.totalTasks),
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await projectService.getProjects()
      setProjects(data.results || [])
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // 过滤项目数据
  const filteredProjects = projects.filter(project => {
    // 类型过滤 - 使用 is_kanban_activated 作为活跃项目的标志
    if (filterType === 'active' && !project.is_kanban_activated) return false
    if (filterType === 'archived' && project.is_kanban_activated) return false

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return project.name.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query))
    }

    return true
  })

  // 获取过滤后的项目数量
  const getFilteredCount = () => {
    if (filterType === 'active') return projects.filter(p => p.is_kanban_activated).length
    if (filterType === 'archived') return projects.filter(p => !p.is_kanban_activated).length
    return projects.length
  }

  // 统计数据卡片配置
  const statCards = [
    {
      title: '总任务数',
      value: animatedStats.totalTasks,
      icon: <CheckCircleOutlined />,
      gradient: 'var(--gradient-primary)',
      lightBg: 'var(--color-primary-light)',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: '已完成',
      value: animatedStats.completedTasks,
      icon: <RiseOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      lightBg: 'linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 100%)',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: '进行中',
      value: animatedStats.inProgressTasks,
      icon: <ClockCircleOutlined />,
      gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
      lightBg: 'linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%)',
      trend: '-3.1%',
      trendUp: false,
    },
    {
      title: '团队效率',
      value: `${animatedStats.teamVelocity}%`,
      icon: <ThunderboltOutlined />,
      gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
      lightBg: 'linear-gradient(135deg, #FEF3C7 0%, #FCD34D 100%)',
      trend: '+15.3%',
      trendUp: true,
    },
  ]

  // 最近活动数据
  const recentActivities = [
    { user: '张明', action: '完成了任务', target: '用户认证模块', time: '5 分钟前', type: 'success' },
    { user: '李华', action: '创建了用户故事', target: '支付系统集成', time: '12 分钟前', type: 'info' },
    { user: '王芳', action: '报告了 Bug', target: '数据导出功能', time: '1 小时前', type: 'warning' },
    { user: '赵强', action: '评论了', target: 'API 设计文档', time: '2 小时前', type: 'info' },
  ]

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* 英雄区域 - 欢迎头部 */}
        <div style={styles.heroSection} className="animate-slide-up">
          <div style={styles.heroContent}>
            <div style={styles.heroText}>
              <Title level={1} style={styles.heroTitle}>
                <span className="text-gradient">欢迎回来</span>
                <span style={{ color: 'var(--text-primary)' }}>，{user?.full_name || user?.username}!</span>
              </Title>
              <Text style={styles.heroSubtitle}>
                管理你的项目和团队，创造卓越成果
              </Text>
              <div style={styles.heroStats}>
                <div style={styles.heroStatItem}>
                  <Text strong style={{ color: 'var(--color-success)' }}>+24</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>本周完成任务</Text>
                </div>
                <div style={styles.heroStatItem}>
                  <Text strong style={{ color: 'var(--color-primary)' }}>89%</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>冲刺完成率</Text>
                </div>
                <div style={styles.heroStatItem}>
                  <Text strong style={{ color: 'var(--color-warning)' }}>#1</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>团队排名</Text>
                </div>
              </div>
            </div>
            <div style={styles.heroAction}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/projects/new')}
                size="large"
                style={styles.heroButton}
                className="btn btn-primary"
              >
                新建项目
              </Button>
            </div>
          </div>
          {/* Hero 区域的装饰图表 */}
          <div style={styles.heroChart}>
            <div style={styles.miniChart}>
              {[60, 75, 50, 80, 65, 90, 75, 85, 70, 95].map((value, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.miniBar,
                    height: `${value}%`,
                    background: `linear-gradient(180deg, rgba(220, 38, 38, ${0.3 + (value / 200)}), rgba(220, 38, 38, ${0.6 + (value / 200)}))`,
                  }}
                />
              ))}
            </div>
            <Text style={styles.chartLabel}>近 7 日任务完成率</Text>
          </div>
        </div>

        {/* 统计卡片行 */}
        <Row gutter={[20, 20]} style={{ marginTop: '1.5rem' }}>
          {statCards.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={stat.title}>
              <div
                className="minimal-card animate-scale-in"
                style={{
                  ...styles.statCard,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div style={styles.statCardTop}>
                  <div style={{ ...styles.statIconWrapper, background: stat.lightBg }}>
                    <div style={{ ...styles.statIconGradient, background: stat.gradient }}>
                      {stat.icon}
                    </div>
                  </div>
                  <div style={{
                    ...styles.statTrendBadge,
                    color: stat.trendUp ? 'var(--color-success)' : 'var(--color-error)',
                    background: stat.trendUp ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                  }}>
                    {stat.trendUp ? <RiseOutlined style={{ fontSize: '12px' }} /> : <FallOutlined style={{ fontSize: '12px' }} />}
                    <Text style={{ fontSize: '12px', fontWeight: 600 }}>{stat.trend}</Text>
                  </div>
                </div>
                <div style={styles.statCardBottom}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.title}</Text>
                </div>
                <div style={{ ...styles.statCardAccent, background: stat.gradient }} />
              </div>
            </Col>
          ))}
        </Row>

        {/* 主要内容区域 */}
        <Row gutter={[20, 20]} style={{ marginTop: '1.5rem' }}>
          {/* 项目列表 */}
          <Col xs={24} xl={16}>
            <Card
              title={<span style={styles.cardTitle}><BarChartOutlined style={{ marginRight: 8, color: 'var(--color-primary)' }} /> 最近项目</span>}
              className="minimal-card animate-slide-up"
              style={styles.contentCard}
              extra={
                <div style={styles.cardExtra}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/projects/new')}
                    size="small"
                    className="btn btn-primary btn-sm"
                  >
                    新建项目
                  </Button>
                </div>
              }
            >
              {/* 过滤和搜索栏 */}
              <div style={styles.filterBar}>
                <div style={styles.filterTabs}>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setFilterType('all')}
                    style={{
                      ...styles.filterTab,
                      color: filterType === 'all' ? 'var(--color-primary)' : 'var(--text-muted)',
                      borderBottomColor: filterType === 'all' ? 'var(--color-primary)' : 'transparent',
                      fontWeight: filterType === 'all' ? 600 : 500,
                    }}
                  >
                    全部 {getFilteredCount()}
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setFilterType('active')}
                    style={{
                      ...styles.filterTab,
                      color: filterType === 'active' ? 'var(--color-primary)' : 'var(--text-muted)',
                      borderBottomColor: filterType === 'active' ? 'var(--color-primary)' : 'transparent',
                      fontWeight: filterType === 'active' ? 600 : 500,
                    }}
                  >
                    进行中
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setFilterType('archived')}
                    style={{
                      ...styles.filterTab,
                      color: filterType === 'archived' ? 'var(--color-primary)' : 'var(--text-muted)',
                      borderBottomColor: filterType === 'archived' ? 'var(--color-primary)' : 'transparent',
                      fontWeight: filterType === 'archived' ? 600 : 500,
                    }}
                  >
                    已归档
                  </Button>
                </div>
                <input
                  type="text"
                  placeholder="搜索项目..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              {loading ? (
                <div style={styles.skeletonContainer}>
                  <Skeleton avatar paragraph={{ rows: 4 }} active />
                  <Skeleton paragraph={{ rows: 4 }} active style={{ marginTop: '1rem' }} />
                </div>
              ) : filteredProjects.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {filteredProjects.map((project) => (
                    <Col xs={24} sm={12} key={project.id}>
                      <Card
                        hoverable
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="minimal-card"
                        style={styles.projectCard}
                      >
                        <div style={styles.projectHeader}>
                          <div style={styles.projectIcon}>
                            <ProjectOutlined />
                          </div>
                          <div style={styles.projectBadges}>
                            {project.is_private && (
                              <Badge count="私有" style={{ backgroundColor: 'var(--gray-500)' }} />
                            )}
                            {project.is_kanban_activated && (
                              <Badge count="看板" style={{ backgroundColor: 'var(--color-primary)' }} />
                            )}
                            {project.is_backlog_activated && (
                              <Badge count="Backlog" style={{ backgroundColor: 'var(--color-info)' }} />
                            )}
                          </div>
                        </div>
                        <Title level={5} style={styles.projectName}>{project.name}</Title>
                        <Text type="secondary" style={styles.projectDesc}>
                          {project.description || '暂无描述'}
                        </Text>
                        <div style={styles.projectProgress}>
                          <div style={styles.progressInfo}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>完成度</Text>
                            <Text strong style={{ fontSize: '12px' }}>{Math.floor(Math.random() * 60 + 20)}%</Text>
                          </div>
                          <Progress
                            percent={Math.floor(Math.random() * 60 + 20)}
                            showInfo={false}
                            size="small"
                            strokeColor={{
                              '0%': '#DC2626',
                              '100%': '#EF4444',
                            }}
                          />
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text type="secondary">还没有项目</Text>
                      <div style={{ marginTop: '1rem' }}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => navigate('/projects/new')}
                        >
                          创建项目
                        </Button>
                      </div>
                    </div>
                  }
                />
              )}
            </Card>
          </Col>

          {/* 右侧边栏 */}
          <Col xs={24} xl={8}>
            {/* 冲刺进度卡片 */}
            <Card
              className="minimal-card animate-slide-up"
              style={{ ...styles.contentCard, marginBottom: '20px' }}
              title={<span style={styles.cardTitle}><AimOutlined style={{ marginRight: 8, color: 'var(--color-primary)' }} /> 当前冲刺</span>}
            >
              <div style={styles.sprintContent}>
                <div style={styles.sprintHeader}>
                  <div>
                    <Title level={5} style={{ marginBottom: '4px' }}>Sprint 24</Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>剩余 8 天</Text>
                  </div>
                  <Badge count="进行中" style={{ backgroundColor: 'var(--color-primary)' }} />
                </div>
                <div style={styles.sprintStats}>
                  <div style={styles.sprintStat}>
                    <Text strong style={{ fontSize: '24px', color: 'var(--color-primary)' }}>
                      {animatedStats.sprintProgress}%
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>完成率</Text>
                  </div>
                  <div style={styles.sprintStat}>
                    <Text strong style={{ fontSize: '24px', color: 'var(--color-success)' }}>
                      {animatedStats.completedTasks}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>已完成</Text>
                  </div>
                  <div style={styles.sprintStat}>
                    <Text strong style={{ fontSize: '24px', color: 'var(--color-warning)' }}>
                      {animatedStats.pendingTasks}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>待处理</Text>
                  </div>
                </div>
                <Progress
                  percent={animatedStats.sprintProgress}
                  strokeColor={{
                    '0%': '#DC2626',
                    '100%': '#EF4444',
                  }}
                  size="small"
                />
                <div style={styles.sprintVelocity}>
                  <TeamOutlined />
                  <Text type="secondary" style={{ fontSize: '12px', marginLeft: '4px' }}>
                    平均速度：{animatedStats.avgCompletionTime}/任务
                  </Text>
                </div>
              </div>
            </Card>

            {/* 最近活动 */}
            <Card
              className="minimal-card animate-slide-up"
              style={styles.contentCard}
              title={<span style={styles.cardTitle}><BellOutlined style={{ marginRight: 8, color: 'var(--color-primary)' }} /> 最近活动</span>}
            >
              <div style={styles.activityList}>
                {recentActivities.map((activity, index) => (
                  <div key={index} style={styles.activityItem}>
                    <div style={{
                      ...styles.activityDot,
                      backgroundColor: activity.type === 'success' ? 'var(--color-success)' :
                                      activity.type === 'warning' ? 'var(--color-warning)' :
                                      'var(--color-info)',
                    }} />
                    <div style={styles.activityContent}>
                      <Text style={styles.activityText}>
                        <Text strong>{activity.user}</Text>{' '}
                        {activity.action}{' '}
                        <Text type="secondary">{activity.target}</Text>
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {activity.time}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="link" block style={{ textAlign: 'center', marginTop: '12px' }}>
                查看全部活动 <ArrowUpOutlined rotate={90} />
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

// CSS-in-JS 样式 - 数字银行风格
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    minHeight: '100vh',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1.5rem',
  },
  // Hero Section - 现代银行风格
  heroSection: {
    padding: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '2rem',
    background: 'white',
    borderRadius: 'var(--radius-2xl)',
    boxShadow: 'var(--shadow-md)',
    border: 'var(--border-default)',
  },
  heroContent: {
    flex: 1,
    minWidth: '300px',
  },
  heroTitle: {
    marginBottom: '0.5rem',
    fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  heroSubtitle: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: '1rem',
  },
  heroStats: {
    display: 'flex',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  heroStatItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  heroAction: {
    flexShrink: 0,
  },
  heroButton: {
    height: '44px',
    padding: '0 20px',
    fontSize: '14px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-primary)',
    border: 'none',
    boxShadow: 'var(--shadow-sm)',
    fontWeight: 600,
  },
  heroChart: {
    width: '160px',
    padding: '1rem',
    background: 'var(--color-primary-light)',
    borderRadius: 'var(--radius-xl)',
    textAlign: 'center',
    border: 'var(--border-light)',
  },
  miniChart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '6px',
    height: '70px',
    marginBottom: '8px',
  },
  miniBar: {
    flex: 1,
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s ease',
  },
  chartLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  // Stat Cards
  statCard: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid rgba(220, 38, 38, 0.08)',
    transition: 'all var(--transition-base)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  statCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  statCardBottom: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  statIconWrapper: {
    width: '52px',
    height: '52px',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3px',
  },
  statIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '22px',
  },
  statTrendBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    fontSize: '12px',
    fontWeight: 600,
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '13px',
    color: 'var(--gray-500)',
    fontWeight: 500,
  },
  statCardAccent: {
    position: 'absolute' as const,
    bottom: '0',
    left: '0',
    right: '0',
    height: '3px',
  },
  // Content Cards
  contentCard: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-xl)',
    boxShadow: 'var(--shadow-md)',
    border: 'var(--border-default)',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-heading)',
  },
  cardExtra: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  // Filter Bar
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: 'var(--border-default)',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  filterTabs: {
    display: 'flex',
    gap: '0',
  },
  filterTab: {
    borderColor: 'transparent',
    borderBottomColor: 'transparent',
    borderBottomWidth: '2px',
    borderRadius: '0',
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all var(--transition-base)',
    background: 'transparent',
    boxShadow: 'none',
  },
  searchInput: {
    padding: '8px 14px',
    border: 'var(--border-default)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    outline: 'none',
    transition: 'all var(--transition-base)',
    width: '200px',
    color: 'var(--text-primary)',
    background: 'var(--bg-secondary)',
  },
  skeletonContainer: {
    padding: '0.5rem 0',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '3rem',
  },
  // Project Cards
  projectCard: {
    background: 'white',
    transition: 'all var(--transition-base)',
    border: 'var(--border-default)',
    cursor: 'pointer',
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  projectIcon: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--color-primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-primary)',
    fontSize: '18px',
  },
  projectBadges: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  projectName: {
    marginBottom: '6px',
    fontSize: '15px',
    fontFamily: 'var(--font-heading)',
    fontWeight: 600,
  },
  projectDesc: {
    fontSize: '13px',
    display: 'block',
    marginBottom: '12px',
    color: 'var(--text-secondary)',
  },
  projectProgress: {
    marginTop: 'auto',
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  // Sprint Content
  sprintContent: {
    padding: '8px 0',
  },
  sprintHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sprintStats: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
  },
  sprintStat: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  sprintVelocity: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '12px',
    fontSize: '12px',
  },
  // Activity List
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  activityItem: {
    display: 'flex',
    gap: '12px',
    padding: '10px 0',
    borderBottom: 'var(--border-light)',
  },
  activityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    alignSelf: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: '13px',
    display: 'block',
    lineHeight: 1.5,
  },
}

export default DashboardPage
