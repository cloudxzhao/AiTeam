/**
 * 权限审批后台页面
 */
import { useEffect, useState } from 'react'
import { Card, Table, Button, Typography, Space, message, Modal, Input, Tag } from 'antd'
import { permissionService } from '@/services/permission.service'
import type { PermissionApplication } from '@/types'

const { Title, Text } = Typography
const { TextArea } = Input

export const PermissionsAdminPage = () => {
  const [applications, setApplications] = useState<PermissionApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      const data = await permissionService.getPendingApplications()
      setApplications(data)
    } catch (error: any) {
      console.error('Failed to load applications:', error)
      message.error('加载申请列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (applicationId: number, action: 'approve' | 'reject') => {
    setSelectedAppId(applicationId)
    setReviewAction(action)
    setReviewNote('')
    setReviewModalVisible(true)
  }

  const handleReviewConfirm = async () => {
    if (!selectedAppId || !reviewAction) return

    try {
      if (reviewAction === 'approve') {
        await permissionService.approveApplication(selectedAppId, { note: reviewNote || '同意' })
        message.success('已通过申请')
      } else {
        await permissionService.rejectApplication(selectedAppId, { note: reviewNote || '拒绝' })
        message.success('已拒绝申请')
      }
      setReviewModalVisible(false)
      loadApplications()
    } catch (error: any) {
      console.error('Review failed:', error)
      message.error(error.response?.data?.message || '审批操作失败')
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
      title: '申请人',
      dataIndex: 'applicant_name',
      key: 'applicant_name',
      render: (name: string, record: PermissionApplication) => (
        <div>
          <div>{name || record.applicant_email}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.applicant_id}</Text>
        </div>
      ),
    },
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
      title: '操作',
      key: 'action',
      render: (_: unknown, record: PermissionApplication) => (
        <Space>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => handleReviewClick(record.id, 'approve')}
              >
                通过
              </Button>
              <Button
                danger
                size="small"
                onClick={() => handleReviewClick(record.id, 'reject')}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status !== 'PENDING' && (
            <Text type="secondary">已处理</Text>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Title level={2} style={{ marginBottom: '0.25rem' }}>权限审批</Title>
          <Text type="secondary">管理和审批用户的权限申请</Text>
        </div>
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

      <Modal
        title={reviewAction === 'approve' ? '批准申请' : '拒绝申请'}
        open={reviewModalVisible}
        onOk={handleReviewConfirm}
        onCancel={() => setReviewModalVisible(false)}
        okText="确认"
        cancelText="取消"
        okButtonProps={{
          danger: reviewAction === 'reject',
          type: reviewAction === 'approve' ? 'primary' : 'default'
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          {reviewAction === 'approve'
            ? '确认批准该权限申请？'
            : '请输入拒绝原因：'}
        </div>
        {reviewAction === 'reject' && (
          <TextArea
            placeholder="请输入拒绝原因（选填）"
            rows={4}
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            autoFocus
          />
        )}
      </Modal>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1400px',
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

export default PermissionsAdminPage
