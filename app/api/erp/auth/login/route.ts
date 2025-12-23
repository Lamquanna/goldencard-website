import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Admin account (hardcoded for initial setup)
const ADMIN_ACCOUNT = {
  username: "admin",
  password: "Admin@2025",
  role: "admin",
  email: "admin@goldenenergy.vn",
  full_name: "Administrator",
  employee_code: "ADMIN",
};

// Simple authentication endpoint
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

    let user = null;

    // Check if it's admin account first
    if (username === ADMIN_ACCOUNT.username && password === ADMIN_ACCOUNT.password) {
      user = ADMIN_ACCOUNT;
      console.log("Admin login successful");
    } else {
      // Try to find user in database
      try {
        const userResult = await sql`
          SELECT * FROM erp_users 
          WHERE username = ${username} AND password = ${password} AND is_active = true
        `;

        if (userResult.length > 0) {
          user = userResult[0];
          console.log("User login successful:", user.username);
        }
      } catch (dbError) {
        console.error("Database error during login:", dbError);
        
        // If database connection fails, only allow admin login
        return NextResponse.json(
          { error: "Không thể kết nối cơ sở dữ liệu. Chỉ admin có thể đăng nhập." },
          { status: 503 }
        );
      }
    }

    if (user) {
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
          email: user.email,
          full_name: user.full_name,
          employee_code: user.employee_code || user.username.toUpperCase(),
        },
      });
    }

    return NextResponse.json(
      { error: "Tên đăng nhập hoặc mật khẩu không đúng" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đăng nhập" },
      { status: 500 }
    );
  }
}
