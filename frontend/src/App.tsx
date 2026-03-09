/**
 * AiTeam 前端应用入口
 */
import './styles/global.css'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import themeConfig from '@/config/theme'
import AppRouter from '@/router'

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={themeConfig}
      componentSize="middle"
    >
      <AppRouter />
    </ConfigProvider>
  )
}

export default App
