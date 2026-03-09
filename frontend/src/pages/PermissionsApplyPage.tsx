/**
 * 权限申请页面
 */
import { useState, useEffect } from 'react'
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
  Empty,
  Spin,
} from 'antd'
import { permissionService } from '@/services/permission.service'
import type { PermissionApplication, Role } from '@/types'
import { LockOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input

export const PermissionsApplyPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [applications, setApplications] = useState<PermissionApplication[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // 加载角色列表
  const loadRoles = async () => {
    try {
      const data = await permissionService.getRoles()
      setRoles(data)
    } catch (error) {
      console.error('Failed to load roles:', error)
    }
  }

  // 加载申请历史
  const loadApplications = async () => {
    try {
      const data = await permissionService.getMyApplications()
      setApplications(data)
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    loadRoles()
    loadApplications()
  }, [])

  const handleSubmit = async (values: {
    projectId: number
    roleId: number
    reason?: string
  }) => {
    try {
      setLoading(true)
      await permissionService.applyPermission(values)
      message.success('权限申请已提交，请等待审批')
      form.resetFields()
      loadApplications()
    } catch (error: any) {
      console.error('Failed to apply permission:', error)
      message.error(error.response?.data?.message || '申请失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'orange', text: '待审批' },
      APPROVED: { color: 'green', text: '已通过' },
      REJECTED: { color: 'red', text: '已拒绝' },
    }
    const { color, text } = statusMap[status] || { color: 'default', text: status }
    return <Tag color={color}>{text}</Tag>
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'project_name',
      key: 'project_name',
    },
    {
      title: '申请角色',
      dataIndex: 'role_name',
      key: 'role_name',
    },
    {
      title: '申请理由',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '申请时间',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '审批意见',
      dataIndex: 'approve_note',
      key: 'approve_note',
      render: (note?: string) => note || '-',
    },
  ]

  if (loadingData) {
    return (
      <div style={styles.center}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

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
              name="projectId"
              label="选择项目"
              rules={[{ required: true, message: '请选择项目' }]}
            >
              <Select placeholder="请选择要加入的项目" size="large">
                <Select.Option value={1}>项目 A</Select.Option>
                <Select.Option value={2}><LockOutlined style={{ marginRight: 4 }} /> 项目 B</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="roleId"
              label="申请角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="请选择希望担任的角色" size="large">
                {roles.map((role) => (
                  <Select.Option key={role.id} value={role.id}>
                    {role.name} - {role.description}
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
          {applications.length === 0 ? (
            <Empty description="暂无申请记录" />
          ) : (
            <Table
              dataSource={applications}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              scroll={{ y: 400 }}
              size="small"
            />
          )}
        </Card>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  header: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
}

export default PermissionsApplyPage
