/**
 * 可排序的看板列组件
 *
 * BUG-005 修复：支持锁定状态显示
 */
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, Button, Typography, Dropdown, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import { MoreOutlined, PlusOutlined, LockOutlined } from '@ant-design/icons'
import type { KanbanColumn, KanbanCard } from '@/types'
import SortableCard from './SortableCard'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

const { Title, Text } = Typography

interface SortableColumnProps {
  column: KanbanColumn
  cards: KanbanCard[]
  onEditCard?: (card: KanbanCard) => void
  onDeleteCard?: (card: KanbanCard) => void
  locked?: boolean
}

export const SortableColumn = ({
  column,
  cards,
  onEditCard,
  onDeleteCard,
  locked = false,
}: SortableColumnProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `column-${column.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...styles.column,
    ...(locked ? styles.columnLocked : {}),
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: '编辑列',
    },
    {
      key: 'delete',
      label: '删除列',
      danger: true,
    },
  ]

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        size="small"
        style={{
          ...styles.card,
          ...(locked ? styles.cardLocked : {}),
        }}
        title={
          <div style={styles.columnHeader}>
            <div
              style={{
                ...styles.columnColor,
                backgroundColor: locked ? '#9CA3AF' : column.color,
              }}
            />
            <Title level={5} style={styles.columnTitle}>
              {locked && <LockOutlined style={{ marginRight: '0.25rem', color: '#9CA3AF' }} />}
              {column.name}
            </Title>
            <Tooltip title={locked ? '此列当前不可用 (权限限制)' : undefined}>
              <Text type="secondary" style={styles.cardCount}>
                {cards.length}
              </Text>
            </Tooltip>
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button
                type="text"
                icon={<MoreOutlined />}
                style={{ marginLeft: 'auto' }}
              />
            </Dropdown>
          </div>
        }
      >
        <div style={{
          ...styles.cardList,
          ...(locked ? styles.cardListLocked : {}),
        }}>
          <SortableContext
            items={cards.map((card) => `card-${column.id}-${card.order}`)}
            strategy={verticalListSortingStrategy}
          >
            {cards.map((card, index) => (
              <SortableCard
                key={card.id}
                card={card}
                columnId={column.id}
                index={index}
                onClick={() => onEditCard?.(card)}
                onDelete={() => onDeleteCard?.(card)}
                disabled={locked}
              />
            ))}
          </SortableContext>
          <Tooltip title={locked ? '此列当前不可用 (权限限制)' : undefined}>
            <Button
              type="dashed"
              block
              icon={locked ? <LockOutlined /> : <PlusOutlined />}
              style={{
                ...styles.addButton,
                ...(locked ? styles.addButtonLocked : {}),
              }}
              disabled={locked}
            >
              {locked ? '权限受限' : '添加卡片'}
            </Button>
          </Tooltip>
        </div>
      </Card>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  column: {
    minWidth: '300px',
    maxWidth: '300px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  columnLocked: {
    opacity: 0.6,
    filter: 'grayscale(50%)',
  },
  card: {
    height: 'fit-content',
    borderRadius: '12px',
  },
  cardLocked: {
    background: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  columnColor: {
    width: '4px',
    height: '16px',
    borderRadius: '2px',
  },
  columnTitle: {
    margin: 0,
    flex: 1,
  },
  cardCount: {
    fontSize: '0.75rem',
    padding: '0.125rem 0.5rem',
    background: '#F3F4F6',
    borderRadius: '10px',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minHeight: '50px',
  },
  cardListLocked: {
    pointerEvents: 'none',
  },
  addButton: {
    marginTop: '0.5rem',
    borderColor: '#E5E7EB',
    color: '#6B7280',
  },
  addButtonLocked: {
    borderColor: '#D1D5DB',
    color: '#9CA3AF',
    cursor: 'not-allowed',
  },
}

export default SortableColumn
