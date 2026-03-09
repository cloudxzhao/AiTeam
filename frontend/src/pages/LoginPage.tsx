/**
 * 登录页面 - Digital Banking App Style
 * Professional, Secure, Trustworthy
 */
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message, Typography, Divider } from 'antd'
import { UserOutlined, LockOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined, GooglePlusOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store'

const { Title, Text } = Typography

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [form] = Form.useForm()

  const from = (location.state as { from?: Location })?.from || { pathname: '/dashboard' }

  const handleSubmit = async (values: { username: string; password: string; remember?: boolean }) => {
    try {
      await login(values.username, values.password)
      message.success('登录成功！')
      navigate(from, { replace: true })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '登录失败，请检查用户名和密码'
      message.error(errorMessage)
    }
  }

  return (
    <div style={styles.container}>
      {/* 左侧品牌区域 */}
      <div style={styles.brandContainer} className="animate-slide-up">
        <div style={styles.brandContent}>
          <div style={styles.brandLogo}>
            <span>A</span>
          </div>
          <Title level={1} style={styles.brandTitle}>
            AiTeam
          </Title>
          <Text style={styles.brandSlogan}>
            让协作更智能，让效率更卓越
          </Text>
          <Text style={styles.brandDescription}>
            专业的项目管理平台，助力团队高效协作
          </Text>

          {/* 特性亮点 - 数字银行风格图标 */}
          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>
                <CheckCircleOutlined style={{ fontSize: '20px', color: 'white' }} />
              </div>
              <div>
                <Text strong style={{ color: 'white', display: 'block', fontSize: '14px' }}>安全可靠</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>企业级数据保护</Text>
              </div>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>
                <ClockCircleOutlined style={{ fontSize: '20px', color: 'white' }} />
              </div>
              <div>
                <Text strong style={{ color: 'white', display: 'block', fontSize: '14px' }}>实时协作</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>团队无缝配合</Text>
              </div>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>
                <TeamOutlined style={{ fontSize: '20px', color: 'white' }} />
              </div>
              <div>
                <Text strong style={{ color: 'white', display: 'block', fontSize: '14px' }}>智能管理</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>可视化任务追踪</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div style={styles.formContainer} className="animate-scale-in">
        <div style={styles.formWrapper}>
          <div style={styles.formHeader}>
            <Title level={2} style={styles.formTitle}>欢迎回来</Title>
            <Text type="secondary" style={styles.formSubtitle}>
              还没有账号？<Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>免费注册</Link>
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="username"
              label={<Text style={styles.formLabel}>用户名 / 邮箱</Text>}
              rules={[{ required: true, message: '请输入用户名或邮箱' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'var(--gray-400)' }} />}
                placeholder="name@example.com"
                style={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text style={styles.formLabel}>密码</Text>}
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--gray-400)' }} />}
                placeholder="••••••••"
                style={styles.input}
              />
            </Form.Item>

            <Form.Item>
              <div style={styles.formOptions}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ color: 'var(--text-secondary)' }}>记住我</Checkbox>
                </Form.Item>
                <Link to="/forgot-password" style={{ color: 'var(--color-primary)', fontSize: '13px' }}>忘记密码？</Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
                style={styles.submitButton}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ color: 'var(--gray-400)', fontSize: '12px', margin: '24px 0' }}>或使用以下方式登录</Divider>

          <div style={styles.social}>
            <Button
              icon={<GooglePlusOutlined />}
              size="large"
              style={styles.socialButton}
            >
              Google
            </Button>
          </div>

          <Text type="secondary" style={styles.footer}>
            登录即表示你同意我们的
            <Link to="#terms" style={{ color: 'var(--color-primary)' }}>服务条款</Link>
            和
            <Link to="#privacy" style={{ color: 'var(--color-primary)' }}>隐私政策</Link>
          </Text>
        </div>
      </div>
    </div>
  )
}

// CSS-in-JS 样式 - 数字银行风格
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg-gradient)',
  },
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
    width: '56px',
    height: '56px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 'var(--radius-xl)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 700,
    color: 'white',
    marginBottom: '2rem',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  brandTitle: {
    color: 'white',
    marginBottom: '0.75rem',
    fontSize: '2.5rem',
    fontWeight: 700,
  },
  brandSlogan: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: '1.125rem',
    display: 'block',
    marginBottom: '0.75rem',
  },
  brandDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.95rem',
    lineHeight: 1.7,
    display: 'block',
    marginBottom: '2.5rem',
  },
  features: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  featureIcon: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-lg)',
    background: 'rgba(255, 255, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  formContainer: {
    width: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    background: 'white',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-2xl)',
    boxShadow: 'var(--shadow-lg)',
    border: 'var(--border-default)',
  },
  formHeader: {
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  formTitle: {
    marginBottom: '0.5rem',
    fontSize: '1.75rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  formSubtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
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
    border: 'var(--border-default)',
    fontSize: '14px',
    transition: 'all var(--transition-base)',
  },
  formOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    height: '48px',
    borderRadius: 'var(--radius-md)',
    fontSize: '15px',
    fontWeight: 600,
    background: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all var(--transition-base)',
    width: '100%',
    marginTop: '0.5rem',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1.5rem 0',
    color: 'var(--gray-400)',
    fontSize: '12px',
  },
  social: {
    display: 'flex',
  },
  socialButton: {
    flex: 1,
    height: '48px',
    borderRadius: 'var(--radius-md)',
    border: 'var(--border-default)',
    background: 'var(--bg-secondary)',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all var(--transition-base)',
  },
  footer: {
    display: 'block',
    marginTop: '1.5rem',
    textAlign: 'center' as const,
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
}

export default LoginPage
