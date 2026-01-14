import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { logger } from "@/lib/logger";
import { generateToken } from "@/lib/auth/jwt";
import {
  createSuccessResponse,
  createErrorResponse,
  generateRequestId,
  ErrorCodes,
} from "@/lib/api/error-handler";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple authentication endpoint - Database only
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const { username, password } = await request.json();

    // Validate inputs
    if (!username || !password) {
      const duration = Date.now() - startTime;
      logger.apiRequest({ method: 'POST', url: '/api/crm/auth/login', statusCode: 400, duration, requestId });
      
      return createErrorResponse(
        "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu",
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }

    try {
      // Query database for user
      const userResult = await sql`
        SELECT * FROM crm_users 
        WHERE username = ${username} AND password = ${password}
      `;

      if (userResult.length === 0) {
        logger.warn("Failed CRM login attempt", {
          username,
          requestId,
          reason: "Invalid credentials",
        });
        
        logger.auth("failed_login", username, {
          reason: "Invalid credentials",
        });

        const duration = Date.now() - startTime;
        logger.apiRequest({ method: 'POST', url: '/api/crm/auth/login', statusCode: 401, duration, requestId });
        
        return createErrorResponse(
          "Tên đăng nhập hoặc mật khẩu không đúng",
          ErrorCodes.UNAUTHORIZED,
          401,
          undefined,
          requestId
        );
      }

      const user = userResult[0];
      
      logger.auth("login", user.username, {
        role: user.role,
      });

      // Generate JWT token with user_id, email, role
      const token = generateToken({
        userId: user.id.toString(),
        email: user.email,
        username: user.username,
        role: user.role
      });

      const duration = Date.now() - startTime;
      logger.apiRequest({ method: 'POST', url: '/api/crm/auth/login', statusCode: 200, duration, requestId });

      return createSuccessResponse(
        {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        },
        requestId
      );

    } catch (dbError) {
      logger.error("Database error during CRM login", {
        error: dbError,
        username,
        requestId,
      });

      const duration = Date.now() - startTime;
      logger.apiRequest({ method: 'POST', url: '/api/crm/auth/login', statusCode: 503, duration, requestId });
      
      return createErrorResponse(
        "Không thể kết nối cơ sở dữ liệu. Vui lòng liên hệ quản trị viên.",
        ErrorCodes.DATABASE_ERROR,
        503,
        undefined,
        requestId
      );
    }
  } catch (error) {
    logger.error("CRM login error", {
      error,
      requestId,
    });

    const duration = Date.now() - startTime;
    logger.apiRequest({ method: 'POST', url: '/api/crm/auth/login', statusCode: 500, duration, requestId });
    
    return createErrorResponse(
      "Có lỗi xảy ra khi đăng nhập",
      ErrorCodes.INTERNAL_ERROR,
      500,
      undefined,
      requestId
    );
  }
}
