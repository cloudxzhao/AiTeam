/**
 * 项目详情页面
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Tabs,
  Button,
  Spin,
  Empty,
  Typography,
  message,
  Tag,
  Space,
} from 'antd'
import {
  ArrowLeftOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  BugOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { projectService } from '@/services'
import type { Project } from '@/types'

const { Title, Text, Paragraph } = Typography

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('kanban')

  useEffect(() => {
    if (id) {
      loadProject(id)
    }
  }, [id])

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true)
      const data = await projectService.getProject(parseInt(projectId, 10))
      setProject(data)
    } catch (error) {
      console.error('Failed to load project:', error)
      message.error('加载项目详情失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    )
  }

  if (!project) {
    return (
      <Card>
        <Empty
          description="项目不存在或已被删除"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/projects')}>
            返回项目列表
          </Button>
        </Empty>
      </Card>
    )
  }

  return (
    <div style={styles.container}>
      {/* 项目头部 */}
      <Card style={styles.projectHeader}>
        <div style={styles.headerContent}>
          <div>
            <div style={styles.breadcrumb}>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/projects')}
                style={{ padding: 0 }}
              >
                返回
              </Button>
            </div>
            <Title level={2} style={styles.projectTitle}>
              <ProjectOutlined style={{ marginRight: '0.5rem', color: '#8B5CF6' }} />
              {project.name}
            </Title>
            <Paragraph type="secondary" style={styles.projectDescription}>
              {project.description || '暂无描述'}
            </Paragraph>
            <Space wrap style={{ marginTop: '0.75rem' }}>
              {project.is_private ? (
                <Tag color="default">🔒 私有</Tag>
              ) : (
                <Tag color="purple">🌍 公开</Tag>
              )}
              {project.is_kanban_activated && <Tag color="blue">📊 看板</Tag>}
              {project.is_backlog_activated && <Tag color="green">📋 Backlog</Tag>}
              {project.is_issue_activated && <Tag color="orange">🐛 问题</Tag>}
            </Space>
          </div>
        </div>
      </Card>

      {/* 功能选项卡 */}
      <Card style={{ marginTop: '1rem' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          items={[
            {
              key: 'kanban',
              label: (
                <span>
                  <AppstoreOutlined /> 看板
                </span>
              ),
              children: (
                <div style={styles.tabContent}>
                  {project.is_kanban_activated ? (
                    <div style={styles.kanbanPlaceholder}>
                      <div style={styles.kanbanIcon}>📊</div>
                      <Title level={4}>看板功能</Title>
                      <Text type="secondary">
                        点击下方按钮创建看板，管理你的任务流
                      </Text>
                      <Button
                        type="primary"
                        size="large"
                        style={{ marginTop: '1rem' }}
                        onClick={() => navigate(`/kanban?project=${project.id}`)}
                      >
                        进入看板
                      </Button>
                    </div>
                  ) : (
                    <Empty
                      description="看板功能未激活"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Text type="secondary">
                        请联系项目管理员激活看板功能
                      </Text>
                    </Empty>
                  )}
                </div>
              ),
            },
            {
              key: 'backlog',
              label: (
                <span>
                  <UnorderedListOutlined /> Backlog
                </span>
              ),
              children: (
                <div style={styles.tabContent}>
                  {project.is_backlog_activated ? (
                    <div style={styles.backlogPlaceholder}>
                      <div style={styles.backlogIcon}>📋</div>
                      <Title level={4}>Backlog 功能</Title>
                      <Text type="secondary">
                        管理和优先级排序用户故事
                      </Text>
                      <Button
                        type="primary"
                        size="large"
                        style={{ marginTop: '1rem' }}
                      >
                        查看 Backlog
                      </Button>
                    </div>
                  ) : (
                    <Empty
                      description="Backlog 功能未激活"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Text type="secondary">
                        请联系项目管理员激活 Backlog 功能
                      </Text>
                    </Empty>
                  )}
                </div>
              ),
            },
            {
              key: 'issues',
              label: (
                <span>
                  <BugOutlined /> 问题
                </span>
              ),
              children: (
                <div style={styles.tabContent}>
                  {project.is_issue_activated ? (
                    <div style={styles.issuesPlaceholder}>
                      <div style={styles.issuesIcon}>🐛</div>
                      <Title level={4}>问题追踪</Title>
                      <Text type="secondary">
                        追踪和管理项目中的问题和 Bug
                      </Text>
                      <Button
                        type="primary"
                        size="large"
                        style={{ marginTop: '1rem' }}
                      >
                        查看问题
                      </Button>
                    </div>
                  ) : (
                    <Empty
                      description="问题追踪功能未激活"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Text type="secondary">
                        请联系项目管理员激活问题追踪功能
                      </Text>
                    </Empty>
                  )}
                </div>
              ),
            },
            {
              key: 'settings',
              label: (
                <span>
                  <SettingOutlined /> 设置
                </span>
              ),
              children: (
                <div style={styles.tabContent}>
                  <Title level={5}>项目设置</Title>
                  <Text type="secondary">
                    管理项目成员、角色和配置
                  </Text>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '3rem',
  },
  projectHeader: {
    background: 'linear-gradient(135deg, #F3F0FF 0%, #EDE9FE 100%)',
    border: '1px solid #DDD6FE',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  breadcrumb: {
    marginBottom: '0.75rem',
  },
  projectTitle: {
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  projectDescription: {
    marginBottom: '0.5rem',
  },
  tabContent: {
    padding: '2rem 0',
    textAlign: 'center',
  },
  kanbanPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  kanbanIcon: {
    fontSize: '4rem',
    marginBottom: '0.5rem',
  },
  backlogPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  backlogIcon: {
    fontSize: '4rem',
    marginBottom: '0.5rem',
  },
  issuesPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  issuesIcon: {
    fontSize: '4rem',
    marginBottom: '0.5rem',
  },
}

export default ProjectDetailPage
