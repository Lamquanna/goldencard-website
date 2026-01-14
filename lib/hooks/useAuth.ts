/**
 * React Hook for Authentication
 * Provides easy access to auth state and functions
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  full_name?: string;
  employee_code?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  /**
   * Load auth state from localStorage on mount
   */
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('erp_user') || localStorage.getItem('crm_user');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        
        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        const isExpired = Date.now() >= expiry;
        
        if (isExpired) {
          // Token expired, clear auth
          handleLogout();
        } else {
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Failed to parse auth data:', error);
        handleLogout();
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Login function
   */
  const login = useCallback(async (username: string, password: string, endpoint: '/api/erp/auth/login' | '/api/crm/auth/login' = '/api/erp/auth/login') => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token and user
      localStorage.setItem('auth_token', data.token);
      
      if (endpoint.includes('erp')) {
        localStorage.setItem('erp_token', data.token);
        localStorage.setItem('erp_user', JSON.stringify(data.user));
      } else {
        localStorage.setItem('crm_token', data.token);
        localStorage.setItem('crm_user', JSON.stringify(data.user));
      }

      // Update state
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Logout function
   */
  const handleLogout = useCallback(() => {
    // Clear all auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');

    // Update state
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Redirect to login
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/erp')) {
      router.push('/erp/login');
    } else if (currentPath.startsWith('/admin')) {
      router.push('/admin/login');
    }
  }, [router]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: string | string[]) => {
    if (!authState.user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(authState.user.role);
  }, [authState.user]);

  /**
   * Check if token is expiring soon (within 1 hour)
   */
  const isTokenExpiringSoon = useCallback(() => {
    if (!authState.token) return false;
    
    try {
      const payload = JSON.parse(atob(authState.token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const oneHourFromNow = Date.now() + (60 * 60 * 1000);
      
      return expiry < oneHourFromNow;
    } catch {
      return false;
    }
  }, [authState.token]);

  return {
    // State
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    
    // Functions
    login,
    logout: handleLogout,
    hasRole,
    isTokenExpiringSoon,
  };
}
