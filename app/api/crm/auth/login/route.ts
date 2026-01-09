import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Simple authentication endpoint - Database only
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
      // Query database for user
      const userResult = await sql`
        SELECT * FROM crm_users 
        WHERE username = ${username} AND password = ${password}
      `;

      if (userResult.length === 0) {
        return NextResponse.json(
          { error: "Tên đăng nhập hoặc mật khẩu không đúng" },
          { status: 401 }
        );
      }

      const user = userResult[0];
      
      console.log(`CRM login successful: ${user.username}`);

      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(
        `${user.username}:${user.role}:${Date.now()}`
      ).toString("base64");

      return NextResponse.json({
        success: true,
        token,
        user: {
          username: user.username,
          role: user.role,
        },
      });

    } catch (dbError) {
      console.error("Database error during CRM login:", dbError);
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
