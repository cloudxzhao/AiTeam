/**
 * 登录页面 - 极简主义风格
 * Exaggered Minimalism + Professional Design
 */
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message, Typography, Divider } from 'antd'
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons'
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
      {/* 背景装饰 */}
      <div style={styles.bgDecoration}>
        <div style={{ ...styles.bgBlob, top: '-10%', right: '-5%', animationDelay: '0s' }} />
        <div style={{ ...styles.bgBlob, bottom: '-10%', left: '-5%', animationDelay: '2s', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(239, 68, 68, 0.15))' }} />
        <div style={{ ...styles.bgBlob, top: '50%', left: '50%', animationDelay: '4s', width: '200px', height: '200px', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(245, 158, 11, 0.12))' }} />
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
            让协作更智能，让效率更卓越
          </Text>
          <Text style={styles.brandDescription}>
            加入数千个团队，体验全新的项目管理方式。
            简洁、高效、愉悦。
          </Text>

          {/* 特性亮点 */}
          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={{ ...styles.featureIcon, background: 'var(--gradient-primary)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <Text strong style={{ color: 'white', display: 'block' }}>智能看板</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>可视化任务管理</Text>
              </div>
            </div>
            <div style={styles.feature}>
              <div style={{ ...styles.featureIcon, background: 'var(--gradient-gold)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div>
                <Text strong style={{ color: 'white', display: 'block' }}>实时追踪</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>进度一目了然</Text>
              </div>
            </div>
            <div style={styles.feature}>
              <div style={{ ...styles.featureIcon, background: '#DC2626' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <Text strong style={{ color: 'white', display: 'block' }}>团队协作</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>多人实时协作</Text>
              </div>
            </div>
          </div>

          {/* 用户评价 */}
          <div style={styles.testimonial}>
            <div style={styles.testimonialContent}>
              <Text italic style={styles.quote}>
                "AiTeam 彻底改变了我们团队的工作方式。现在我们的效率提高了 40%！"
              </Text>
              <div style={styles.testimonialAuthor}>
                <div style={styles.authorAvatar}>张</div>
                <div>
                  <Text strong style={{ color: 'white', display: 'block', fontSize: '13px' }}>张明</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>某科技公司技术总监</Text>
                </div>
              </div>
            </div>
          </div>

          {/* 信任徽章 */}
          <div style={styles.trustBadges}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>受到全球 1000+ 团队信赖</Text>
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
                  <Checkbox style={{ color: 'var(--gray-600)' }}>记住我</Checkbox>
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

          <Divider style={{ color: 'var(--gray-400)', fontSize: '12px' }}>或使用以下方式登录</Divider>

          <div style={styles.social}>
            <Button
              icon={<GoogleOutlined />}
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
    marginBottom: '1rem',
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
    marginBottom: '2.5rem',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  featureIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  testimonial: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  testimonialContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  quote: {
    color: 'white',
    fontSize: '1rem',
    lineHeight: 1.7,
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  authorAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    color: 'white',
  },
  trustBadges: {
    textAlign: 'center' as const,
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
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
  formOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    gap: '0.75rem',
  },
  socialButton: {
    flex: 1,
    height: '48px',
    borderRadius: 'var(--radius-md)',
    border: '2px solid var(--gray-200)',
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
  },
}

export default LoginPage
