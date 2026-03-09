/**
 * 权限申请历史页面
 */
import { useEffect, useState } from 'react'
import { Card, Table, Typography, Tag, Empty } from 'antd'
import { permissionService } from '@/services/permission.service'
import type { PermissionApplication } from '@/types'

const { Title, Text } = Typography

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
  {
    title: '审批时间',
    dataIndex: 'approved_at',
    key: 'approved_at',
    render: (text?: string) => text ? new Date(text).toLocaleString('zh-CN') : '-',
  },
]

export const PermissionsHistoryPage = () => {
  const [applications, setApplications] = useState<PermissionApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      const data = await permissionService.getMyApplications()
      setApplications(data)
    } catch (error: any) {
      console.error('Failed to load applications:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Title level={2} style={{ marginBottom: '0.25rem' }}>申请历史</Title>
          <Text type="secondary">查看我的权限申请记录</Text>
        </div>
      </div>

      <Card>
        {applications.length === 0 ? (
          <Empty description="暂无申请记录" />
        ) : (
          <Table
            dataSource={applications}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
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
    padding: '24px',
  },
  header: {
    marginBottom: '1.5rem',
  },
}

export default PermissionsHistoryPage
