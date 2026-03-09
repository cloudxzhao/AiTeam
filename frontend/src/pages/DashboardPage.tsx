/**
 * 仪表盘页面
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Button, Empty, Typography, Spin, message } from 'antd'
import {
  ProjectOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  BugOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { projectService } from '@/services'
import { useAuthStore } from '@/store'
import type { Project } from '@/types'

const { Title, Text } = Typography

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await projectService.getProjects()
      setProjects(data.results || [])
    } catch (error) {
      console.error('Failed to load projects:', error)
      message.error('加载项目失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* 欢迎区域 */}
      <div style={styles.header}>
        <div>
          <Title level={2} style={styles.welcomeTitle}>
            欢迎回来，{user?.full_name || user?.username}!
          </Title>
          <Text type="secondary">管理你的项目和任务</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/projects/new')}
          size="large"
        >
          新建项目
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '2rem' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="我的项目"
              value={projects.length}
              prefix={<ProjectOutlined style={{ color: '#8B5CF6' }} />}
              valueStyle={{ color: '#8B5CF6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待办任务"
              value={0}
              prefix={<CheckCircleOutlined style={{ color: '#10B981' }} />}
              valueStyle={{ color: '#10B981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="用户故事"
              value={0}
              prefix={<FileTextOutlined style={{ color: '#3B82F6' }} />}
              valueStyle={{ color: '#3B82F6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="问题追踪"
              value={0}
              prefix={<BugOutlined style={{ color: '#F59E0B' }} />}
              valueStyle={{ color: '#F59E0B' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 项目列表 */}
      <Card
        title="最近项目"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/projects/new')}>
            新建项目
          </Button>
        }
      >
        {loading ? (
          <div style={styles.loadingContainer}>
            <Spin size="large" />
          </div>
        ) : projects.length > 0 ? (
          <Row gutter={[16, 16]}>
            {projects.map((project) => (
              <Col xs={24} sm={12} lg={8} key={project.id}>
                <Card
                  hoverable
                  onClick={() => navigate(`/projects/${project.id}`)}
                  style={styles.projectCard}
                >
                  <Card.Meta
                    title={
                      <div style={styles.projectTitle}>
                        <Text strong style={{ fontSize: '1rem' }}>
                          {project.name}
                        </Text>
                        {project.is_private && (
                          <span style={styles.privateTag}>🔒 私有</span>
                        )}
                      </div>
                    }
                    description={
                      <>
                        <Text type="secondary" ellipsis style={{ display: 'block', marginBottom: '0.5rem' }}>
                          {project.description || '暂无描述'}
                        </Text>
                        <div style={styles.projectMeta}>
                          {project.is_kanban_activated && (
                            <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                              📊 看板
                            </Text>
                          )}
                          {project.is_backlog_activated && (
                            <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                              📋 Backlog
                            </Text>
                          )}
                        </div>
                      </>
                    }
                  />
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
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  welcomeTitle: {
    marginBottom: '0.25rem',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '3rem',
  },
  projectCard: {
    height: '100%',
  },
  projectTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  privateTag: {
    fontSize: '0.75rem',
    padding: '0.125rem 0.5rem',
    background: '#F3F4F6',
    borderRadius: '4px',
  },
  projectMeta: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
}

export default DashboardPage
