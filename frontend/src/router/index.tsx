/**
 * 应用路由配置
 */
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PrivateRoute, PublicRoute } from '@/components'
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProjectListPage,
  ProjectDetailPage,
  KanbanPage,
  TasksPage,
  PermissionsPage,
  SettingsPage,
  NotFoundPage,
} from '@/pages'
import MainLayout from '@/components/MainLayout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: (
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'projects',
        element: (
          <PrivateRoute>
            <ProjectListPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'projects/:id',
        element: (
          <PrivateRoute>
            <ProjectDetailPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'kanban',
        element: (
          <PrivateRoute>
            <KanbanPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'tasks',
        element: (
          <PrivateRoute>
            <TasksPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'permissions',
        element: (
          <PrivateRoute>
            <PermissionsPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export const AppRouter = () => {
  return <RouterProvider router={router} />
}

export default AppRouter
