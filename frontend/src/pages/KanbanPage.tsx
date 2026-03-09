/**
 * 看板页面
 *
 * BUG 修复记录:
 * - BUG-003: 使用专用 move 端点进行卡片移动
 * - BUG-005: 添加权限检查和约束验证
 * - BUG-001: 状态 slug 与后端对齐
 */
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Button,
  Input,
  Modal,
  Form,
  Select,
  message,
  Empty,
  Typography,
  Spin,
  Alert,
  Tag,
} from 'antd'
import { PlusOutlined, WarningOutlined } from '@ant-design/icons'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { kanbanService, STATUS_SLUG_MAP } from '@/services/kanban.service'
import type { KanbanColumn, KanbanCard } from '@/types'
import type { KanbanConstraint, UserTransitions, MoveCardParams } from '@/services/kanban.service'
import SortableColumn from '@/components/Kanban/SortableColumn'

const { Title } = Typography
const { TextArea } = Input

export const KanbanPage = () => {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project')

  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [cardsByColumn, setCardsByColumn] = useState<Record<number, KanbanCard[]>>({})
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null)
  const [form] = Form.useForm()

  // BUG-005: 权限约束状态
  const [constraints, setConstraints] = useState<KanbanConstraint | null>(null)
  const [userTransitions, setUserTransitions] = useState<UserTransitions | null>(null)
  const [allowedColumns, setAllowedColumns] = useState<string[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (projectId) {
      loadKanbanData(parseInt(projectId, 10))
    }
  }, [projectId])

  const loadKanbanData = async (pid: number) => {
    try {
      setLoading(true)
      const [columnsData, cardsData] = await Promise.all([
        kanbanService.getColumns(pid),
        kanbanService.getCards(pid),
      ])

      setColumns(columnsData.sort((a, b) => a.order - b.order))

      // 按列分组卡片
      const cardsMap: Record<number, KanbanCard[]> = {}
      columnsData.forEach((col) => {
        cardsMap[col.id] = cardsData
          .filter((card) => card.column === col.id || card.status === col.status)
          .sort((a, b) => a.order - b.order)
      })
      setCardsByColumn(cardsMap)

      // BUG-005: 加载权限约束
      await loadConstraints(pid)
    } catch (error) {
      console.error('Failed to load kanban data:', error)
      message.error('加载看板数据失败')
    } finally {
      setLoading(false)
    }
  }

  // BUG-005: 加载用户权限约束
  const loadConstraints = async (pid: number) => {
    try {
      const [constraintsData, transitionsData] = await Promise.all([
        kanbanService.getConstraints(pid),
        kanbanService.getUserTransitions(pid),
      ])
      setConstraints(constraintsData)
      setUserTransitions(transitionsData)

      // 从转换权限中提取允许的列 (按卡片类型分别处理)
      const allowedStatuses: string[] = []

      // 处理 userstory 的允许转换
      if (transitionsData.constraints?.userstory) {
        const storyTransitions = transitionsData.constraints.userstory
        Object.values(storyTransitions).forEach((targets) => {
          allowedStatuses.push(...targets)
        })
      } else if (transitionsData.allowed_transitions) {
        // 兼容旧格式
        Object.values(transitionsData.allowed_transitions).forEach((targets) => {
          allowedStatuses.push(...targets)
        })
      }

      setAllowedColumns([...new Set(allowedStatuses)])
    } catch (error) {
      console.error('Failed to load constraints:', error)
      // 如果无法加载约束，默认允许所有操作 (降级处理)
      setAllowedColumns(['analysis', 'development', 'testing', 'done'])
    }
  }

  // BUG-003 & BUG-005: 使用专用 move 端点并检查权限
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || !projectId) return

    const activeId = active.id.toString()
    const overId = over.id.toString()
    const pid = parseInt(projectId, 10)

    // 卡片拖拽
    if (activeId.startsWith('card-')) {
      const parts = activeId.split('-')
      const cardId = parseInt(parts[2], 10)
      const sourceColumnId = parseInt(parts[1], 10)

      // 获取目标列 ID
      let destColumnId: number
      if (overId.startsWith('card-')) {
        destColumnId = parseInt(overId.split('-')[1], 10)
      } else if (overId.startsWith('column-')) {
        destColumnId = parseInt(overId.split('-')[1], 10)
      } else {
        return
      }

      // 获取源列和目标列信息
      const sourceColumn = columns.find((col) => col.id === sourceColumnId)
      const destColumn = columns.find((col) => col.id === destColumnId)

      if (!sourceColumn || !destColumn) return

      // BUG-005: 检查权限约束
      if (constraints && userTransitions) {
        const sourceSlug = STATUS_SLUG_MAP[sourceColumn.name.toLowerCase()] || sourceColumn.name
        const destSlug = STATUS_SLUG_MAP[destColumn.name.toLowerCase()] || destColumn.name

        // 检查是否允许此转换
        const allowedFromSource = userTransitions.allowed_transitions[sourceSlug] || []
        if (!allowedFromSource.includes(destSlug)) {
          message.error(`没有权限将卡片移动到"${destColumn.name}"列`)
          return
        }

        // 检查是否有阻塞的问题
        if (constraints.blocked_by && constraints.blocked_by.length > 0) {
          const blockingIssues = constraints.blocked_by
            .map((b) => `- ${b.issue_subject} (#${b.issue_id})`)
            .join('\n')
          message.error(`无法移动卡片，以下关联问题尚未完成:\n${blockingIssues}`)
          return
        }
      }

      // BUG-003: 使用专用 move 端点
      try {
        const moveParams: MoveCardParams = {
          type: 'issue', // 默认使用 issue 类型
          id: cardId,
          to_status: destColumn.name.toLowerCase(),
        }

        const result = await kanbanService.moveCard(pid, moveParams)

        if (result.success) {
          // 更新本地状态
          if (sourceColumnId !== destColumnId) {
            setCardsByColumn((prev) => {
              const sourceCards = prev[sourceColumnId] || []
              const cardIndex = sourceCards.findIndex((c) => c.id === cardId)
              if (cardIndex === -1) return prev

              const card = sourceCards[cardIndex]
              const newSourceCards = sourceCards.filter((_, i) => i !== cardIndex)
              const newDestCards = [...(prev[destColumnId] || []), card]

              return {
                ...prev,
                [sourceColumnId]: newSourceCards,
                [destColumnId]: newDestCards,
              }
            })
          }
          message.success('卡片已移动')
        } else if (result.error) {
          if (result.blocking_issues && result.blocking_issues.length > 0) {
            const blockingList = result.blocking_issues
              .map((issue) => `- ${issue.subject}`)
              .join('\n')
            Modal.error({
              title: '无法移动卡片',
              content: (
                <div>
                  <p>以下关联问题尚未完成，无法移动到此状态:</p>
                  <div style={{ marginTop: '1rem' }}>{blockingList}</div>
                </div>
              ),
            })
          } else {
            message.error(result.error)
          }
        }
      } catch (error) {
        console.error('Failed to move card:', error)
        message.error('移动卡片失败')
      }
    }
  }

  const handleCreateCard = () => {
    setEditingCard(null)
    form.resetFields()
    form.setFieldsValue({
      type: 'task',
    })
    setModalVisible(true)
  }

  const handleEditCard = (card: KanbanCard) => {
    setEditingCard(card)
    form.setFieldsValue({
      title: card.title,
      description: card.description,
      type: card.type,
    })
    setModalVisible(true)
  }

  const handleDeleteCard = async (card: KanbanCard) => {
    if (!projectId) return

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除卡片 "${card.title}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await kanbanService.deleteCard(parseInt(projectId, 10), card.id)
          message.success('卡片已删除')
          loadKanbanData(parseInt(projectId, 10))
        } catch (error) {
          message.error('删除卡片失败')
        }
      },
    })
  }

  const handleSubmit = async (values: {
    title: string
    description?: string
    type: 'userstory' | 'task' | 'issue'
  }) => {
    if (!projectId) return

    try {
      if (editingCard) {
        await kanbanService.updateCard(parseInt(projectId, 10), editingCard.id, values)
        message.success('卡片已更新')
      } else {
        // 默认添加到第一列
        const firstColumn = columns[0]
        if (firstColumn) {
          await kanbanService.createCard(parseInt(projectId, 10), {
            ...values,
            status: firstColumn.status || firstColumn.id,
          })
          message.success('卡片已创建')
        }
      }
      setModalVisible(false)
      loadKanbanData(parseInt(projectId, 10))
    } catch (error) {
      message.error(editingCard ? '更新卡片失败' : '创建卡片失败')
    }
  }

  // BUG-005: 检查列是否被锁定 (用户无权限)
  const isColumnLocked = (columnName: string): boolean => {
    if (allowedColumns.length === 0) return false
    const slug = STATUS_SLUG_MAP[columnName.toLowerCase()] || columnName
    return !allowedColumns.includes(slug)
  }

  if (!projectId) {
    return (
      <Empty
        description="请选择要查看的项目"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={() => window.history.back()}>
          返回
        </Button>
      </Empty>
    )
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Title level={2}>项目看板</Title>
          {constraints && (
            <div style={{ marginTop: '0.5rem' }}>
              <Tag color={allowedColumns.length > 0 ? 'green' : 'orange'}>
                {allowedColumns.length > 0 ? '✓ 已验证权限' : '! 权限受限'}
              </Tag>
            </div>
          )}
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCard}>
          新建卡片
        </Button>
      </div>

      {/* BUG-005: 权限提示 */}
      {constraints && allowedColumns.length > 0 && allowedColumns.length < 4 && (
        <Alert
          message="权限提示"
          description="根据您当前的角色，部分列的移动操作可能受到限制"
          type="info"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div style={styles.board}>
          {columns.length > 0 ? (
            columns.map((column) => (
              <SortableColumn
                key={column.id}
                column={column}
                cards={cardsByColumn[column.id] || []}
                onEditCard={handleEditCard}
                onDeleteCard={handleDeleteCard}
                locked={isColumnLocked(column.name)}
              />
            ))
          ) : (
            <Empty
              description="看板暂无列"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </DndContext>

      {/* 创建/编辑卡片模态框 */}
      <Modal
        title={editingCard ? '编辑卡片' : '创建新卡片'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入卡片标题' }]}
          >
            <Input placeholder="输入卡片标题" size="large" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea
              placeholder="输入卡片描述"
              rows={4}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择卡片类型' }]}
          >
            <Select size="large">
              <Select.Option value="userstory">📝 用户故事</Select.Option>
              <Select.Option value="task">✅ 任务</Select.Option>
              <Select.Option value="issue">🐛 问题</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingCard ? '保存' : '创建'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: 'calc(100vh - 140px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #E5E7EB',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  board: {
    display: 'flex',
    gap: '1rem',
    overflowX: 'auto',
    height: '100%',
    paddingBottom: '1rem',
  },
}

export default KanbanPage
