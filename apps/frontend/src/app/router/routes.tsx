import { Navigate, type RouteObject } from 'react-router-dom';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage';
import { AuthLayout } from '@/shared/components/layouts/AuthLayout';
import { MainLayout } from '@/shared/components/layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import UsersPage from '@/modules/users/pages/UsersPage';
import OrganizationsTypePage from '@/modules/organizations-type/pages/OrganizationsTypePage';
import OrganizationsPage from '@/modules/organizations/pages/OrganizationsPage';
import OrganizationCrossAccessPage from '@/modules/organization-cross/pages/OrganizationCrossAccessPage';
import OrganizationsTypePositionPage from '@/modules/organizations-type-position/pages/OrganizationsTypePositionPage';

export const routes: RouteObject[] = [
  // Public routes - Auth
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },

  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to='/dashboard' replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'organizations-type',
        element: <OrganizationsTypePage />,
      },
      {
        path: 'organizations',
        element: <OrganizationsPage />,
      },
      {
        path: 'organization-cross',
        element: <OrganizationCrossAccessPage />,
      },
      {
        path: 'organizations-type-position',
        element: <OrganizationsTypePositionPage />,
      },
    ],
  },

  // 404 - Redirect to dashboard or login
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
];
