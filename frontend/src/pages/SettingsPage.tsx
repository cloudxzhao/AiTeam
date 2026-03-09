/**
 * 个人设置页面
 */
import { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Avatar,
  Upload,
  Space,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store'
import type { User } from '@/types'
import { getUserAvatarColor, getUserAvatarInitial } from '@/utils'

const { Title, Text } = Typography

export const SettingsPage = () => {
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [passwordForm] = Form.useForm()
  const [profileForm] = Form.useForm()

  const handleProfileUpdate = async (values: {
    full_name?: string
    email?: string
  }) => {
    try {
      setLoading(true)
      // TODO: 调用 API 更新用户信息
      updateUser(values as Partial<User>)
      message.success('个人资料已更新')
    } catch (error) {
      console.error('Failed to update profile:', error)
      message.error('更新失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (values: {
    old_password: string
    new_password: string
    confirm_password: string
  }) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的新密码不一致')
      return
    }

    try {
      setLoading(true)
      // TODO: 调用 API 修改密码
      message.success('密码已修改')
      passwordForm.resetFields()
    } catch (error) {
      console.error('Failed to change password:', error)
      message.error('修改失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = () => {
    // TODO: 调用 API 上传头像
    message.success('头像上传功能开发中')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ marginBottom: '0.25rem' }}>个人设置</Title>
        <Text type="secondary">管理你的个人资料和账户设置</Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* 个人资料 */}
        <Card title="个人资料">
          <div style={styles.avatarSection}>
            <Avatar
              size={80}
              style={{
                backgroundColor: user ? getUserAvatarColor(user.username) : '#8B5CF6',
              }}
            >
              {user ? getUserAvatarInitial(user.full_name || user.username) : 'U'}
            </Avatar>
            <Upload
              accept="image/*"
              showUploadList={false}
              onChange={(info) => {
                if (info.file) {
                  handleAvatarChange()
                }
              }}
            >
              <Button icon={<UploadOutlined />} style={{ marginTop: '0.5rem' }}>
                更换头像
              </Button>
            </Upload>
          </div>

          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileUpdate}
            initialValues={{
              full_name: user?.full_name,
              email: user?.email,
              username: user?.username,
            }}
          >
            <Form.Item label="用户名">
              <Input value={user?.username} disabled />
            </Form.Item>

            <Form.Item name="full_name" label="姓名">
              <Input placeholder="请输入姓名" />
            </Form.Item>

            <Form.Item name="email" label="邮箱">
              <Input placeholder="请输入邮箱" type="email" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* 修改密码 */}
        <Card title="修改密码">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item
              name="old_password"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password placeholder="请输入当前密码" size="large" />
            </Form.Item>

            <Form.Item
              name="new_password"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少 6 个字符' },
              ]}
            >
              <Input.Password placeholder="请输入新密码" size="large" />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label="确认新密码"
              dependencies={['new_password']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请再次输入新密码" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* 账户操作 */}
      <Card title="账户操作" style={{ marginTop: '1.5rem' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={styles.dangerZone}>
            <div>
              <Title level={5} style={{ marginBottom: '0.25rem' }}>注销账户</Title>
              <Text type="secondary">
                注销后你的所有数据将被删除，此操作不可恢复
              </Text>
            </div>
            <Button danger>注销账户</Button>
          </div>
        </Space>
      </Card>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '1.5rem',
  },
  avatarSection: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    padding: '1rem',
    background: '#F9FAFB',
    borderRadius: '12px',
  },
  dangerZone: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: '#FEF2F2',
    borderRadius: '8px',
    border: '1px solid #FEE2E2',
  },
}

export default SettingsPage
