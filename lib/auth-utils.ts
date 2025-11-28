// =====================================================
// AUTH UTILITIES
// =====================================================
// Shared authentication utilities for ERP modules

import { UserRole } from '@/lib/permissions';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

/**
 * Parse the auth token from localStorage and extract user info
 * @returns AuthUser object or null if not authenticated
 */
export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('crm_auth');
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length >= 2) {
      return {
        id: parts[0],
        username: parts[0],
        role: parts[1] as UserRole,
      };
    }
  } catch (e) {
    console.error('Error decoding auth token:', e);
  }
  
  return null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

/**
 * Get the current user's role
 */
export function getUserRole(): UserRole | null {
  const user = getAuthUser();
  return user?.role ?? null;
}

/**
 * Get the current user's ID
 */
export function getUserId(): string | null {
  const user = getAuthUser();
  return user?.id ?? null;
}
