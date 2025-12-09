// ============================================================================
// USER MANAGEMENT MODULE - ROUTES
// GoldenEnergy HOME Platform - Route Configuration
// ============================================================================

// NOTE: This module is designed for react-router-dom based routing.
// For Next.js App Router, use the app/admin/users/ directory structure instead.

// Placeholder exports for type compatibility
export const userRoutes: unknown[] = [];

// TODO: Migrate to Next.js App Router structure
// - app/admin/users/page.tsx (UserListPage)
// - app/admin/users/create/page.tsx (UserCreatePage)
// - app/admin/users/[userId]/page.tsx (UserDetailPage)
// - app/admin/users/[userId]/edit/page.tsx (UserEditPage)
// - app/admin/roles/page.tsx (RolesPage)
// - app/admin/invitations/page.tsx (InvitationsPage)

// ============================================================================
// NAVIGATION CONFIG
// ============================================================================

export const userNavigation = {
  id: 'users',
  title: 'Quản lý người dùng',
  icon: 'users',
  path: '/admin/users',
  children: [
    {
      id: 'users-list',
      title: 'Danh sách người dùng',
      icon: 'users',
      path: '/admin/users',
    },
    {
      id: 'roles',
      title: 'Vai trò & Quyền',
      icon: 'shield',
      path: '/admin/roles',
    },
    {
      id: 'invitations',
      title: 'Lời mời',
      icon: 'mail',
      path: '/admin/invitations',
    },
  ],
};

// ============================================================================
// PERMISSION REQUIREMENTS
// ============================================================================

export const userPermissions = {
  'users': ['users.view'],
  'users/create': ['users.create'],
  'users/:userId': ['users.view'],
  'users/:userId/edit': ['users.edit'],
  'roles': ['roles.view'],
  'invitations': ['invitations.view'],
};
