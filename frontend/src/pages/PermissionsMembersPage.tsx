/**
 * 项目成员管理页面
 */
import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  message,
  Modal,
  Select,
  Form,
  Avatar,
  Tag,
} from 'antd'
import { permissionService } from '@/services/permission.service'
import type { ProjectMemberDetail, Role, AddProjectMemberRequest } from '@/types'
import { useParams } from 'react-router-dom'
import { UserAddOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export const PermissionsMembersPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [members, setMembers] = useState<ProjectMemberDetail[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadRoles()
    loadMembers()
  }, [projectId])

  const loadRoles = async () => {
    try {
      const data = await permissionService.getRoles()
      setRoles(data.filter(r => !r.is_admin)) // 排除管理员角色
    } catch (error) {
      console.error('Failed to load roles:', error)
    }
  }

  const loadMembers = async () => {
    try {
      if (!projectId) return
      setLoading(true)
      const data = await permissionService.getProjectMembers(Number(projectId))
      setMembers(data)
    } catch (error: any) {
      console.error('Failed to load members:', error)
      message.error(error.response?.data?.message || '加载成员列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (values: AddProjectMemberRequest) => {
    try {
      if (!projectId) return
      await permissionService.addProjectMember(Number(projectId), values)
      message.success('成员添加成功')
      setAddModalVisible(false)
      form.resetFields()
      loadMembers()
    } catch (error: any) {
      console.error('Failed to add member:', error)
      message.error(error.response?.data?.message || '添加成员失败')
    }
  }

  const handleUpdateRole = async (userId: number, roleId: number) => {
    try {
      if (!projectId) return
      await permissionService.updateMemberRole(Number(projectId), userId, roleId)
      message.success('角色更新成功')
      loadMembers()
    } catch (error: any) {
      console.error('Failed to update role:', error)
      message.error('更新角色失败')
    }
  }

  const handleRemoveMember = (record: ProjectMemberDetail) => {
    Modal.confirm({
      title: '确认移除',
      content: `确定要将用户 "${record.username}" 从项目中移除吗？`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          if (!projectId) return
          await permissionService.removeMember(Number(projectId), record.user_id)
          message.success('成员已移除')
          loadMembers()
        } catch (error: any) {
          console.error('Failed to remove member:', error)
          message.error('移除成员失败')
        }
      },
    })
  }

  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (_: unknown, record: ProjectMemberDetail) => (
        <Space>
          <Avatar src={record.photo} style={{ backgroundColor: '#1890ff' }}>
            {record.username.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.full_name || record.username}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role_name',
      key: 'role_name',
      render: (_: string, record: ProjectMemberDetail) => (
        <Select
          value={record.role_id}
          onChange={(value) => handleUpdateRole(record.user_id, value)}
          size="small"
          style={{ width: 120 }}
          disabled={record.is_owner}
        >
          {roles.filter(r => !r.is_admin).map((role) => (
            <Select.Option key={role.id} value={role.id}>
              {role.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '加入时间',
      dataIndex: 'joined_at',
      key: 'joined_at',
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ProjectMemberDetail) => (
        <Space>
          {!record.is_owner && (
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveMember(record)}
            >
              移除
            </Button>
          )}
          {record.is_owner && (
            <Tag color="red">项目拥有者</Tag>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Title level={2} style={{ marginBottom: '0.25rem' }}>成员管理</Title>
          <Text type="secondary">管理项目成员和角色</Text>
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setAddModalVisible(true)}
        >
          添加成员
        </Button>
      </div>

      <Card>
        <Table
          dataSource={members}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="添加项目成员"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddMember}
          autoComplete="off"
        >
          <Form.Item
            name="userId"
            label="选择用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select placeholder="请选择要添加的用户" size="large">
              <Select.Option value={1}>测试用户 1</Select.Option>
              <Select.Option value={2}>测试用户 2</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="roleId"
            label="分配角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色" size="large">
              {roles.filter(r => !r.is_admin).map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setAddModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">确认添加</Button>
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
    padding: '24px',
  },
  header: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}

export default PermissionsMembersPage
