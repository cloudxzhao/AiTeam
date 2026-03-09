/**
 * 登录页面
 */
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message, Typography } from 'antd'
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
      {/* 左侧品牌区域 */}
      <div style={styles.brandContainer}>
        <div style={styles.brand}>
          <div style={styles.brandLogo}>A</div>
          <Title level={2} style={styles.brandTitle}>让协作更智能</Title>
          <Text style={styles.brandSubtitle}>
            加入数千个团队，体验全新的项目管理方式。
            简洁、高效、愉悦。
          </Text>
          <div style={styles.testimonial}>
            <Text italic style={styles.quote}>
              "AiTeam 彻底改变了我们团队的工作方式。现在我们的效率提高了 40%！"
            </Text>
            <Text style={styles.author}>— 张明，某科技公司技术总监</Text>
          </div>
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div style={styles.formContainer}>
        <div style={styles.form}>
          <div style={styles.formHeader}>
            <Title level={2} style={styles.formTitle}>欢迎回来</Title>
            <Text type="secondary">
              还没有账号？<Link to="/register" style={{ color: '#8B5CF6' }}>免费注册</Link>
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名或邮箱' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名或邮箱"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <div style={styles.formOptions}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
                <Link to="/forgot-password" style={{ color: '#8B5CF6' }}>忘记密码？</Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
                style={{ width: '100%' }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div style={styles.divider}>
            <Text type="secondary">或使用以下方式登录</Text>
          </div>

          <div style={styles.social}>
            <Button icon={<GoogleOutlined />} size="large" style={{ flex: 1 }}>
              Google
            </Button>
          </div>

          <Text type="secondary" style={styles.footer}>
            登录即表示你同意我们的<Link to="#terms">服务条款</Link>和<Link to="#privacy">隐私政策</Link>
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
    position: 'relative',
    zIndex: 1,
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
  testimonial: {
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
  },
  quote: {
    display: 'block',
    marginBottom: '1rem',
  },
  author: {
    display: 'block',
    opacity: 0.7,
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
  formOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1.5rem 0',
    color: '#9CA3AF',
    fontSize: '0.875rem',
  },
  social: {
    display: 'flex',
    gap: '0.75rem',
  },
  footer: {
    display: 'block',
    marginTop: '2rem',
    textAlign: 'center',
  },
}

export default LoginPage
