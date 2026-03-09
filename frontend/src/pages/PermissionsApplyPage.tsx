/**
 * 权限申请页面
 */
import { useState } from 'react'
import {
  Card,
  Form,
  Select,
  Input,
  Button,
  Typography,
  message,
  Table,
  Tag,
} from 'antd'
import { permissionService } from '@/services'
import type { PermissionApplication, Project, Role } from '@/types'

const { Title, Text } = Typography
const { TextArea } = Input

export const PermissionsApplyPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [projects] = useState<Project[]>([
    { id: 1, name: '项目 A', is_private: false } as Project,
    { id: 2, name: '项目 B', is_private: true } as Project,
  ])
  const [roles] = useState<Role[]>([
    { id: 1, name: '开发者', slug: 'developer', permissions: [] } as Role,
    { id: 2, name: '产品经理', slug: 'product-owner', permissions: [] } as Role,
    { id: 3, name: '设计师', slug: 'designer', permissions: [] } as Role,
  ])
  const [applications, setApplications] = useState<PermissionApplication[]>([])

  const loadApplications = async () => {
    try {
      const data = await permissionService.getMyApplications()
      setApplications(data)
    } catch (error) {
      console.error('Failed to load applications:', error)
    }
  }

  const handleSubmit = async (values: {
    project_id: number
    role_id: number
    reason?: string
  }) => {
    try {
      setLoading(true)
      await permissionService.applyPermission(values)
      message.success('权限申请已提交，请等待审批')
      form.resetFields()
      loadApplications()
    } catch (error) {
      console.error('Failed to apply permission:', error)
      message.error('申请失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: '待审批' },
      approved: { color: 'green', text: '已通过' },
      rejected: { color: 'red', text: '已拒绝' },
    }
    const { color, text } = statusMap[status] || { color: 'default', text: status }
    return <Tag color={color}>{text}</Tag>
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: ['project', 'name'],
      key: 'project',
    },
    {
      title: '申请角色',
      dataIndex: 'requested_role',
      key: 'role',
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '审批意见',
      dataIndex: 'review_note',
      key: 'review_note',
      render: (note?: string) => note || '-',
    },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Title level={2} style={{ marginBottom: '0.25rem' }}>权限申请</Title>
          <Text type="secondary">申请加入项目并获得相应权限</Text>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* 申请表单 */}
        <Card title="申请项目权限">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="project_id"
              label="选择项目"
              rules={[{ required: true, message: '请选择项目' }]}
            >
              <Select placeholder="请选择要加入的项目" size="large">
                {projects.map((project) => (
                  <Select.Option key={project.id} value={project.id}>
                    {project.name} {project.is_private && '🔒'}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="role_id"
              label="申请角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="请选择希望担任的角色" size="large">
                {roles.map((role) => (
                  <Select.Option key={role.id} value={role.id}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="reason" label="申请理由">
              <TextArea
                placeholder="请简要说明申请理由（可选）"
                rows={4}
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{ width: '100%' }}
              >
                提交申请
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* 申请历史 */}
        <Card title="我的申请记录">
          <Table
            dataSource={applications}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ y: 400 }}
          />
        </Card>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '1.5rem',
  },
}

export default PermissionsApplyPage
