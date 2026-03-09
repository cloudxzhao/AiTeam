/**
 * 可排序的看板卡片组件
 */
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, Tag, Button, Typography } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import type { KanbanCard } from '@/types'

const { Text, Paragraph } = Typography

interface SortableCardProps {
  card: KanbanCard
  columnId: number
  index: number
  onClick?: () => void
  onDelete?: () => void
  disabled?: boolean
}

export const SortableCard = ({
  card,
  columnId,
  index,
  onClick,
  onDelete,
  disabled = false,
}: SortableCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `card-${columnId}-${index}`,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: (isDragging ? 0.5 : 1) * (disabled ? 0.6 : 1),
    ...styles.card,
    ...(disabled ? styles.cardDisabled : {}),
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'userstory':
        return '📝'
      case 'task':
        return '✅'
      case 'issue':
        return '🐛'
      default:
        return '📌'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'userstory':
        return { bg: '#DBEAFE', color: '#1D4ED8' }
      case 'task':
        return { bg: '#D1FAE5', color: '#059669' }
      case 'issue':
        return { bg: '#FEF3C7', color: '#D97706' }
      default:
        return { bg: '#F3F4F6', color: '#4B5563' }
    }
  }

  const typeColors = getTypeColor(card.type)

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...(disabled ? {} : { ...attributes, ...listeners })}
      size="small"
      hoverable={!disabled}
      onClick={() => {
        if (!disabled) {
          onClick?.()
        }
      }}
    >
      <div style={styles.cardContent}>
        <div style={styles.cardHeader}>
          <Tag
            style={{
              backgroundColor: typeColors.bg,
              color: typeColors.color,
              border: 'none',
              padding: '0 0.5rem',
              ...(disabled ? styles.tagDisabled : {}),
            }}
          >
            {getTypeIcon(card.type)}
          </Tag>
          {card.priority && (
            <Tag color={card.priority > 5 ? 'red' : 'default'}>
              P{card.priority}
            </Tag>
          )}
        </div>
        <Text strong style={styles.cardTitle}>
          {card.title}
        </Text>
        {card.description && (
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 2 }}
            style={styles.cardDescription}
          >
            {card.description}
          </Paragraph>
        )}
        <div style={styles.cardFooter}>
          {card.assigned_to && (
            <div style={{
              ...styles.assignee,
              ...(disabled ? styles.assigneeDisabled : {}),
            }}>
              {card.assigned_to.full_name?.charAt(0) ||
                card.assigned_to.username.charAt(0)}
            </div>
          )}
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              if (!disabled) {
                onDelete?.()
              }
            }}
            style={{
              color: disabled ? '#D1D5DB' : '#EF4444',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            disabled={disabled}
          />
        </div>
      </div>
    </Card>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    marginBottom: '0.5rem',
    borderRadius: '10px',
    cursor: 'grab',
  },
  cardDisabled: {
    cursor: 'not-allowed',
    filter: 'grayscale(30%)',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cardTitle: {
    fontSize: '0.875rem',
    lineHeight: 1.4,
  },
  cardDescription: {
    fontSize: '0.75rem',
    marginBottom: 0,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.25rem',
  },
  assignee: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  assigneeDisabled: {
    background: '#D1D5DB',
  },
  tagDisabled: {
    filter: 'grayscale(50%)',
  },
}

export default SortableCard
