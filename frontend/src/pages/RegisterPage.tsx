/**
 * 注册页面
 */
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
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
      {/* 左侧品牌区域 */}
      <div style={styles.brandContainer}>
        <div style={styles.brand}>
          <div style={styles.brandLogo}>A</div>
          <Title level={2} style={styles.brandTitle}>开始你的 AiTeam 之旅</Title>
          <Text style={styles.brandSubtitle}>
            免费创建账户，体验智能协作的魅力。
            无需信用卡，立即开始。
          </Text>
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <span>无限项目</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <span>团队成员协作</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <span>看板和敏捷功能</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div style={styles.formContainer}>
        <div style={styles.form}>
          <div style={styles.formHeader}>
            <Title level={2} style={styles.formTitle}>创建账户</Title>
            <Text type="secondary">
              已有账号？<Link to="/login" style={{ color: '#8B5CF6' }}>立即登录</Link>
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
              label="姓名"
              rules={[{ required: false }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入您的姓名（可选）"
              />
            </Form.Item>

            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少 3 个字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="请输入邮箱"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少 6 个字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
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
                prefix={<LockOutlined />}
                placeholder="请再次输入密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
                style={{ width: '100%', marginTop: '1rem' }}
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <Text type="secondary" style={styles.footer}>
            注册即表示你同意我们的<Link to="#terms">服务条款</Link>和<Link to="#privacy">隐私政策</Link>
          </Text>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  brandContainer: {
    width: '50%',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
    width: '100%',
    maxWidth: '400px',
  },
  brandLogo: {
    width: '48px',
    height: '48px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '800',
    backdropFilter: 'blur(10px)',
    marginBottom: '2rem',
  },
  brandTitle: {
    color: 'white',
    marginBottom: '1rem',
  },
  brandSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1.125rem',
    lineHeight: 1.7,
    marginBottom: '2rem',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '2rem',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
  },
  featureIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    fontSize: '0.875rem',
  },
  formContainer: {
    width: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    background: '#F9FAFB',
  },
  form: {
    width: '100%',
    maxWidth: '400px',
  },
  formHeader: {
    marginBottom: '2rem',
  },
  formTitle: {
    marginBottom: '0.5rem',
  },
  footer: {
    display: 'block',
    marginTop: '1rem',
    textAlign: 'center',
  },
}

export default RegisterPage
