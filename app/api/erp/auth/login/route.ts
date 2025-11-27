import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Simple authentication endpoint
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    let user = null;

    // Try to find user in database
    try {
      const userResult = await sql`
        SELECT * FROM crm_users 
        WHERE username = ${username} AND password = ${password}
      `;

      if (userResult.length > 0) {
        user = userResult[0];
      }
    } catch (dbError) {
      console.error("Database error, falling back to in-memory users:", dbError);
      
      // Fallback to in-memory users if database is not available
      const fallbackUsers = [
        { username: "admin", password: "admin000", role: "admin", email: "sales@goldenenergy.vn" },
        { username: "sale", password: "Goldencard", role: "sale", email: "" },
      ];
      
      user = fallbackUsers.find(
        (u) => u.username === username && u.password === password
      );
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
