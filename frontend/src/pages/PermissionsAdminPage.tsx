/**
 * 权限管理后台页面
 */
import { useEffect, useState } from 'react'
import { Card, Table, Button, Typography, Space, message } from 'antd'
import { permissionService } from '@/services'
import type { PermissionApplication } from '@/types'

const { Title, Text } = Typography

export const PermissionsAdminPage = () => {
  const [applications, setApplications] = useState<PermissionApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      // TODO: 调用 API 获取待审批的申请
      setApplications([])
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (applicationId: number, status: 'approved' | 'rejected') => {
    try {
      await permissionService.reviewApplication(applicationId, { status })
      message.success(status === 'approved' ? '已通过申请' : '已拒绝申请')
      loadApplications()
    } catch (error) {
      message.error('审批操作失败')
    }
  }

  const columns = [
    {
      title: '申请人',
      dataIndex: ['user', 'username'],
      key: 'user',
    },
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
      title: '申请理由',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date?: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: PermissionApplication) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleReview(record.id, 'approved')}
          >
            通过
          </Button>
          <Button
            danger
            size="small"
            onClick={() => handleReview(record.id, 'rejected')}
          >
            拒绝
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ marginBottom: '0.25rem' }}>权限审批</Title>
        <Text type="secondary">管理和审批用户的权限申请</Text>
      </div>

      <Card>
        {applications.length > 0 ? (
          <Table
            dataSource={applications}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        ) : (
          <div style={styles.empty}>
            <Text type="secondary">暂无待审批的申请</Text>
          </div>
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
    marginBottom: '1.5rem',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
  },
}

export default PermissionsAdminPage
