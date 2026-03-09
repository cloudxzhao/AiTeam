/**
 * 项目列表页面
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Button,
  Empty,
  Typography,
  Spin,
  message,
  Modal,
  Form,
  Input,
  Switch,
  Space,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { projectService } from '@/services'
import type { Project } from '@/types'

const { Title, Text, Paragraph } = Typography

export const ProjectListPage = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [form] = Form.useForm()

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

  const handleCreate = () => {
    setEditingProject(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    form.setFieldsValue({
      name: project.name,
      description: project.description,
      is_private: project.is_private,
    })
    setModalVisible(true)
  }

  const handleDelete = (project: Project) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目 "${project.name}" 吗？此操作不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await projectService.deleteProject(project.id)
          message.success('项目已删除')
          loadProjects()
        } catch (error) {
          console.error('Failed to delete project:', error)
          message.error('删除项目失败')
        }
      },
    })
  }

  const handleSubmit = async (values: {
    name: string
    description?: string
    is_private: boolean
  }) => {
    try {
      if (editingProject) {
        await projectService.updateProject(editingProject.id, values)
        message.success('项目已更新')
      } else {
        const newProject = await projectService.createProject(values)
        message.success('项目创建成功')
        navigate(`/projects/${newProject.id}`)
      }
      setModalVisible(false)
      loadProjects()
    } catch (error) {
      console.error('Failed to save project:', error)
      message.error(editingProject ? '更新项目失败' : '创建项目失败')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Title level={2} style={{ marginBottom: '0.25rem' }}>项目列表</Title>
          <Text type="secondary">管理和查看所有项目</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
          新建项目
        </Button>
      </div>

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
                style={styles.projectCard}
                actions={[
                  <EyeOutlined
                    key="view"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    title="查看详情"
                  />,
                  <EditOutlined
                    key="edit"
                    onClick={() => handleEdit(project)}
                    title="编辑"
                  />,
                  <DeleteOutlined
                    key="delete"
                    onClick={() => handleDelete(project)}
                    title="删除"
                    style={{ color: '#EF4444' }}
                  />,
                ]}
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
                      {!project.is_private && (
                        <span style={styles.publicTag}>🌍 公开</span>
                      )}
                    </div>
                  }
                  description={
                    <>
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: '0.75rem', color: '#6B7280' }}
                      >
                        {project.description || '暂无描述'}
                      </Paragraph>
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
                        {project.is_issue_activated && (
                          <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                            🐛 问题
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
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary">还没有项目</Text>
                <div style={{ marginTop: '1rem' }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    创建项目
                  </Button>
                </div>
              </div>
            }
          />
        </Card>
      )}

      {/* 创建/编辑项目模态框 */}
      <Modal
        title={editingProject ? '编辑项目' : '创建新项目'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_private: false }}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="输入项目名称" size="large" />
          </Form.Item>

          <Form.Item name="description" label="项目描述">
            <Input.TextArea
              placeholder="简要描述项目的目标和内容"
              rows={4}
              size="large"
            />
          </Form.Item>

          <Form.Item name="is_private" label="可见性" valuePropName="checked">
            <Switch
              checkedChildren="🔒 私有"
              unCheckedChildren="🌍 公开"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingProject ? '保存' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
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
  publicTag: {
    fontSize: '0.75rem',
    padding: '0.125rem 0.5rem',
    background: '#F3F0FF',
    color: '#8B5CF6',
    borderRadius: '4px',
  },
  projectMeta: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
}

export default ProjectListPage
