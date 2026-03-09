/**
 * 权限历史页面
 */
import { useEffect, useState } from 'react'
import { Card, Table, Typography } from 'antd'
import { permissionService } from '@/services'
import type { PermissionApplication } from '@/types'

const { Title, Text } = Typography

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: 'orange', text: '待审批' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已拒绝' },
  }
  const { Text: AntText } = Typography
  return <AntText type={status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'}>{statusMap[status]?.text || status}</AntText>
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
    render: (date?: string) => date ? new Date(date).toLocaleDateString() : '-',
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
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ marginBottom: '0.25rem' }}>权限历史</Title>
        <Text type="secondary">查看所有权限申请记录</Text>
      </div>

      <Card>
        <Table
          dataSource={applications}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
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
    marginBottom: '1.5rem',
  },
}

export default PermissionsHistoryPage
