/**
 * Authentication Middleware
 * Protects API routes and extracts authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthenticatedUser } from './jwt';
import { createErrorResponse, ErrorCodes, generateRequestId } from '@/lib/api/error-handler';
import { logger } from '@/lib/logger';

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

/**
 * Require authentication for route
 * Returns 401 if no valid token
 */
export function requireAuth(request: NextRequest): { user: AuthenticatedUser } | NextResponse {
  const requestId = generateRequestId();
  const user = getAuthenticatedUser(request);
  
  if (!user) {
    logger.warn('Unauthorized access attempt', { 
      url: request.url,
      requestId 
    });
    
    return createErrorResponse(
      'Authentication required. Please provide a valid JWT token in Authorization header.',
      ErrorCodes.UNAUTHORIZED,
      401,
      'Missing or invalid token',
      requestId
    );
  }
  
  return { user };
}

/**
 * Optional authentication - allows both authenticated and unauthenticated access
 * Returns user if authenticated, null otherwise
 */
export function optionalAuth(request: NextRequest): AuthenticatedUser | null {
  return getAuthenticatedUser(request);
}

/**
 * Require specific role(s) for route
 * Returns 403 if user doesn't have required role
 */
export function requireRole(
  request: NextRequest, 
  requiredRole: string | string[]
): { user: AuthenticatedUser } | NextResponse {
  const authResult = requireAuth(request);
  
  // If requireAuth returned error, pass it through
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  if (!user.role || !roles.includes(user.role)) {
    const requestId = generateRequestId();
    logger.warn('Forbidden access attempt', { 
      userId: user.userId,
      userRole: user.role,
      requiredRoles: roles,
      url: request.url,
      requestId 
    });
    
    return createErrorResponse(
      'Access denied. You do not have permission to perform this action.',
      ErrorCodes.FORBIDDEN,
      403,
      `Required role: ${roles.join(' or ')}`,
      requestId
    );
  }
  
  return { user };
}

/**
 * Helper to extract user from auth middleware result
 * Usage: const user = extractUser(requireAuth(request));
 */
export function extractUser(authResult: { user: AuthenticatedUser } | NextResponse): AuthenticatedUser | null {
  if (authResult instanceof NextResponse) {
    return null;
  }
  return authResult.user;
}
