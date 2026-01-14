import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateToken } from "@/lib/auth/jwt";

// Simple authentication endpoint - All users stored in database
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate inputs
    if (!username || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu" },
        { status: 400 }
      );
    }

    try {
      // Query database for user (case-insensitive username)
      const userResult = await sql`
        SELECT * FROM erp_users 
        WHERE LOWER(username) = LOWER(${username}) 
          AND password = ${password} 
          AND is_active = true
      `;

      if (userResult.length === 0) {
        return NextResponse.json(
          { error: "Tên đăng nhập hoặc mật khẩu không đúng" },
          { status: 401 }
        );
      }

      const user = userResult[0];
      const requiresPasswordChange = user.requires_password_change ?? true;
      
      console.log(`Login successful: ${user.username} (${user.employee_code})`);
      
      // Update last login timestamp
      await sql`
        UPDATE erp_users 
        SET last_login = NOW() 
        WHERE username = ${username}
      `;

      // Generate JWT token with user_id, email, role
      const token = generateToken({
        userId: user.id.toString(),
        email: user.email,
        username: user.username,
        role: user.role
      });

      return NextResponse.json({
        success: true,
        token,
        requires_password_change: requiresPasswordChange,
        user: {
          username: user.username,
          role: user.role,
          email: user.email,
          full_name: user.full_name,
          employee_code: user.employee_code,
        },
      });

    } catch (dbError) {
      console.error("Database error during login:", dbError);
      return NextResponse.json(
        { error: "Không thể kết nối cơ sở dữ liệu. Vui lòng liên hệ quản trị viên." },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đăng nhập" },
      { status: 500 }
    );
  }
}
