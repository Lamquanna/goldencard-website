// RBAC Middleware for Next.js
// Protects routes based on user role and module permissions

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Module to path mapping
const MODULE_ROUTES: Record<string, string[]> = {
  dashboard: ['/crm'],
  leads: ['/crm/leads'],
  projects: ['/crm/projects'],
  inventory: ['/crm/inventory'],
  analytics: ['/crm/analytics'],
  chat: ['/crm/chat', '/chat'],
  maps: ['/crm/maps'],
  users: ['/crm/users'],
  settings: ['/crm/settings'],
};

// Minimum role required for each module
const MODULE_MIN_ROLE: Record<string, string[]> = {
  dashboard: ['admin', 'manager', 'sale'], // Staff can't access
  leads: ['admin', 'manager', 'sale'],
  projects: ['admin', 'manager', 'sale', 'staff'],
  inventory: ['admin', 'manager', 'sale', 'staff'],
  analytics: ['admin', 'manager'],
  chat: ['admin', 'manager', 'sale', 'staff'],
  maps: ['admin', 'manager', 'sale', 'staff'],
  users: ['admin', 'manager'],
  settings: ['admin', 'manager'],
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/crm/login',
  '/api/crm/auth/login',
  '/api/crm/auth/verify',
];

// API routes that need role checking
const PROTECTED_API_ROUTES = [
  '/api/crm/users',
  '/api/crm/analytics',
  '/api/crm/inventory',
  '/api/crm/projects',
];

export function checkRouteAccess(pathname: string, userRole: string | null): {
  allowed: boolean;
  redirect?: string;
  reason?: string;
} {
  // Public routes - always allowed
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return { allowed: true };
  }

  // Not authenticated
  if (!userRole) {
    return { 
      allowed: false, 
      redirect: '/crm/login',
      reason: 'Not authenticated'
    };
  }

  // Find which module this route belongs to
  for (const [module, routes] of Object.entries(MODULE_ROUTES)) {
    const matchesRoute = routes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (matchesRoute) {
      const allowedRoles = MODULE_MIN_ROLE[module] || [];
      
      if (!allowedRoles.includes(userRole)) {
        // Staff trying to access CRM dashboard
        if (userRole === 'staff' && module === 'dashboard') {
          return {
            allowed: false,
            redirect: '/crm/chat',
            reason: 'Staff users can only access chat'
          };
        }
        
        return {
          allowed: false,
          redirect: '/crm',
          reason: `Role ${userRole} cannot access ${module}`
        };
      }
      
      return { allowed: true };
    }
  }

  // Default: allow if authenticated
  return { allowed: true };
}

// React hook for client-side permission checking
export function useRouteGuard() {
  // This will be used in client components
  return {
    checkAccess: checkRouteAccess,
    MODULE_ROUTES,
    MODULE_MIN_ROLE,
    PUBLIC_ROUTES,
  };
}
