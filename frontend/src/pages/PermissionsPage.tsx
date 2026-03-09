/**
 * 权限管理页面（主页面）
 */
import { Card, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

export const PermissionsPage = () => {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ marginBottom: '0.25rem' }}>权限管理</Title>
        <Text type="secondary">管理项目权限和成员</Text>
      </div>

      <div style={styles.grid}>
        <Card
          hoverable
          onClick={() => navigate('/permissions/apply')}
          style={styles.card}
        >
          <div style={styles.cardIcon}>📝</div>
          <Title level={4} style={styles.cardTitle}>权限申请</Title>
          <Text type="secondary">申请加入项目并获取权限</Text>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/permissions/history')}
          style={styles.card}
        >
          <div style={styles.cardIcon}>📋</div>
          <Title level={4} style={styles.cardTitle}>申请历史</Title>
          <Text type="secondary">查看我的权限申请记录</Text>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/permissions/admin')}
          style={styles.card}
        >
          <div style={styles.cardIcon}>✅</div>
          <Title level={4} style={styles.cardTitle}>权限审批</Title>
          <Text type="secondary">审批团队成员的权限申请</Text>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/permissions/members')}
          style={styles.card}
        >
          <div style={styles.cardIcon}>👥</div>
          <Title level={4} style={styles.cardTitle}>成员管理</Title>
          <Text type="secondary">管理项目成员和角色</Text>
        </Card>
      </div>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    textAlign: 'center',
    padding: '1rem',
  },
  cardIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  cardTitle: {
    marginBottom: '0.5rem',
  },
}

export default PermissionsPage
