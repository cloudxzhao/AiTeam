/**
 * 注册页面 - 极简主义风格
 * Exaggerated Minimalism + Professional Design
 */
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, CheckOutlined, TeamOutlined, DashboardOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store'

const { Title, Text } = Typography

export const RegisterPage = () => {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [form] = Form.useForm()

  const handleSubmit = async (values: {
    username: string
    email: string
    password: string
    full_name?: string
  }) => {
    try {
      await register(values.username, values.email, values.password, values.full_name)
      message.success('注册成功！')
      navigate('/dashboard', { replace: true })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '注册失败，请稍后重试'
      message.error(errorMessage)
    }
  }

  return (
    <div style={styles.container}>
      {/* 背景装饰 */}
      <div style={styles.bgDecoration}>
        <div style={{ ...styles.bgBlob, top: '-10%', right: '-5%', animationDelay: '0s' }} />
        <div style={{ ...styles.bgBlob, bottom: '-10%', left: '-5%', animationDelay: '2s', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(239, 68, 68, 0.15))' }} />
        <div style={{ ...styles.bgBlob, top: '40%', left: '60%', animationDelay: '4s', width: '250px', height: '250px', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(245, 158, 11, 0.12))' }} />
      </div>

      {/* 左侧品牌区域 */}
      <div style={styles.brandContainer} className="animate-slide-up">
        <div style={styles.brandContent}>
          <div style={styles.brandLogo}>
            <span>A</span>
          </div>
          <Title level={1} style={styles.brandTitle}>
            <span className="text-gradient">AiTeam</span>
          </Title>
          <Text style={styles.brandSlogan}>
            开始你的智能协作之旅
          </Text>
          <Text style={styles.brandDescription}>
            免费创建账户，体验智能协作的魅力。
            无需信用卡，立即开始。
          </Text>

          {/* 特性亮点 */}
          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={{ ...styles.featureIcon, background: 'var(--gradient-primary)' }}>
                <CheckOutlined style={{ fontSize: '18px', color: 'white' }} />
              </div>
              <div>
                <Text strong style={{ color: 'white', display: 'block' }}>无限项目</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>无限制创建和管理</Text>
              </div>
            </div>
            <div style={styles.feature}>
              <div style={{ ...styles.featureIcon, background: 'var(--gradient-gold)' }}>
                <TeamOutlined style={{ fontSize: '18px', color: 'white' }} />
              </div>
              <div>
                <Text strong style={{ color: 'white', display: 'block' }}>团队协作</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>邀请团队成员</Text>
              </div>
            </div>
            <div style={styles.feature}>
              <div style={{ ...styles.featureIcon, background: '#DC2626' }}>
                <DashboardOutlined style={{ fontSize: '18px', color: 'white' }} />
              </div>
              <div>
                <Text strong style={{ color: 'white', display: 'block' }}>智能看板</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>可视化任务管理</Text>
              </div>
            </div>
          </div>

          {/* 信任标识 */}
          <div style={styles.trustBadges}>
            <div style={styles.trustItem}>
              <div style={{ ...styles.trustIcon, background: 'var(--gradient-primary)' }}>🛡️</div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>企业级安全</Text>
            </div>
            <div style={styles.trustItem}>
              <div style={{ ...styles.trustIcon, background: 'var(--gradient-gold)' }}>⚡</div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>快速部署</Text>
            </div>
            <div style={styles.trustItem}>
              <div style={{ ...styles.trustIcon, background: '#DC2626' }}>💬</div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>24/7 支持</Text>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div style={styles.formContainer} className="animate-scale-in">
        <div style={styles.formWrapper}>
          <div style={styles.formHeader}>
            <Title level={2} style={styles.formTitle}>创建账户</Title>
            <Text type="secondary" style={styles.formSubtitle}>
              已有账号？<Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>立即登录</Link>
            </Text>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="full_name"
              label={<Text style={styles.formLabel}>姓名</Text>}
              rules={[{ required: false }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'var(--gray-400)' }} />}
                placeholder="请输入您的姓名（可选）"
                style={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="username"
              label={<Text style={styles.formLabel}>用户名</Text>}
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少 3 个字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'var(--gray-400)' }} />}
                placeholder="请输入用户名"
                style={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<Text style={styles.formLabel}>邮箱</Text>}
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: 'var(--gray-400)' }} />}
                placeholder="name@example.com"
                style={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text style={styles.formLabel}>密码</Text>}
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少 6 个字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--gray-400)' }} />}
                placeholder="••••••••"
                style={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<Text style={styles.formLabel}>确认密码</Text>}
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--gray-400)' }} />}
                placeholder="••••••••"
                style={styles.input}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
                style={styles.submitButton}
              >
                免费注册
              </Button>
            </Form.Item>
          </Form>

          <Text type="secondary" style={styles.footer}>
            注册即表示你同意我们的
            <Link to="#terms" style={{ color: 'var(--color-primary)' }}>服务条款</Link>
            和
            <Link to="#privacy" style={{ color: 'var(--color-primary)' }}>隐私政策</Link>
          </Text>
        </div>
      </div>
    </div>
  )
}

// CSS-in-JS 样式
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg-gradient)',
  },
  bgDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgBlob: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'float 6s ease-in-out infinite',
    opacity: 0.15,
  } as React.CSSProperties,
  brandContainer: {
    width: '50%',
    background: 'var(--gradient-primary)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    padding: '4rem',
    position: 'relative',
    overflow: 'hidden',
  },
  brandContent: {
    position: 'relative',
    zIndex: 1,
    color: 'white',
  },
  brandLogo: {
    width: '64px',
    height: '64px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 800,
    color: 'white',
    marginBottom: '2rem',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  brandTitle: {
    color: 'white',
    marginBottom: '0.5rem',
    fontSize: '3rem',
    fontWeight: 800,
  },
  brandSlogan: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: '1.25rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  brandDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1rem',
    lineHeight: 1.8,
    display: 'block',
    marginBottom: '2.5rem',
  },
  features: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    marginBottom: '2rem',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  featureIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  trustBadges: {
    display: 'flex',
    gap: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  trustIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  formContainer: {
    width: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-2xl)',
    boxShadow: 'var(--shadow-xl)',
    border: '1px solid rgba(220, 38, 38, 0.1)',
  },
  formHeader: {
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  formTitle: {
    marginBottom: '0.5rem',
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  formSubtitle: {
    fontSize: '14px',
  },
  formLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    marginBottom: '6px',
    display: 'block',
  },
  input: {
    height: '48px',
    borderRadius: 'var(--radius-md)',
    border: '2px solid var(--gray-200)',
    fontSize: '14px',
    transition: 'all var(--transition-base)',
  },
  submitButton: {
    height: '50px',
    borderRadius: 'var(--radius-md)',
    fontSize: '15px',
    fontWeight: 600,
    background: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    boxShadow: 'var(--shadow-md)',
    transition: 'all var(--transition-base)',
    width: '100%',
    marginTop: '0.5rem',
  },
  footer: {
    display: 'block',
    marginTop: '1.5rem',
    textAlign: 'center' as const,
    fontSize: '12px',
  },
}

export default RegisterPage
