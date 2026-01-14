/**
 * JWT Authentication Utilities
 * Handles JWT token verification and user extraction
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'default-secret-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  username?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  username?: string;
  role?: string;
}

/**
 * Extract JWT token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }
  
  // Support both "Bearer <token>" and direct token
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}

/**
 * Verify JWT token and extract payload
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error: any) {
    logger.warn('Invalid JWT token', { error: error.message });
    return null;
  }
}

/**
 * Get authenticated user from request
 * Returns user info if valid token exists, null otherwise
 */
export function getAuthenticatedUser(request: NextRequest): AuthenticatedUser | null {
  const token = extractToken(request);
  
  if (!token) {
    return null;
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    return null;
  }
  
  return {
    userId: payload.userId,
    email: payload.email,
    username: payload.username,
    role: payload.role,
  };
}

/**
 * Generate JWT token for user
 * Used in login endpoints
 */
export function generateToken(user: { userId: string; email: string; username?: string; role?: string }): string {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: '24h', // Token expires in 24 hours
    }
  );
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthenticatedUser | null, requiredRole: string | string[]): boolean {
  if (!user || !user.role) {
    return false;
  }
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(user.role);
}
