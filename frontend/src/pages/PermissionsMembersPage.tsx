/**
 * 项目成员权限管理页面
 */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Table, Button, Typography, Modal, Select, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { permissionService } from '@/services'
import type { User, Role } from '@/types'

const { Title, Text } = Typography

export const PermissionsMembersPage = () => {
  const { id } = useParams<{ id: string }>()
  const [members, setMembers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadMembers()
      loadRoles()
    }
  }, [id])

  const loadMembers = async () => {
    try {
      setLoading(true)
      if (!id) return
      const data = await permissionService.getProjectMembers(parseInt(id, 10))
      setMembers(data)
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const data = await permissionService.getRoles()
      setRoles(data)
    } catch (error) {
      console.error('Failed to load roles:', error)
    }
  }

  const handleRemoveMember = (userId: number) => {
    Modal.confirm({
      title: '确认移除',
      content: '确定要移除该成员吗？',
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        if (!id) return
        try {
          await permissionService.removeMember(parseInt(id, 10), userId)
          message.success('成员已移除')
          loadMembers()
        } catch (error) {
          message.error('移除失败')
        }
      },
    })
  }

  const handleRoleChange = async (userId: number, roleId: number) => {
    if (!id) return
    try {
      await permissionService.updateMemberRole(parseInt(id, 10), userId, roleId)
      message.success('角色已更新')
    } catch (error) {
      message.error('更新失败')
    }
  }

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      key: 'role',
      render: (_: unknown, record: User) => (
        <Select
          defaultValue={(record as unknown as { role?: number }).role || 1}
          size="small"
          onChange={(value) => handleRoleChange(record.id, value)}
        >
          {roles.map((role) => (
            <Select.Option key={role.id} value={role.id}>
              {role.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveMember(record.id)}
        >
          移除
        </Button>
      ),
    },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Title level={2} style={{ marginBottom: '0.25rem' }}>项目成员</Title>
          <Text type="secondary">管理项目成员和权限</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          添加成员
        </Button>
      </div>

      <Card>
        <Table
          dataSource={members}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
}

export default PermissionsMembersPage
