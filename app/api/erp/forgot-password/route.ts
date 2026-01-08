import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên đăng nhập" },
        { status: 400 }
      );
    }

    // Find user in database
    let user = null;
    
    try {
      const userResult = await sql`SELECT * FROM erp_users WHERE username = ${username}`;
      if (userResult.length > 0) {
        user = userResult[0];
      }
    } catch (dbError) {
      console.error("Database error, using fallback:", dbError);
      
      // Fallback to in-memory users
      const fallbackUsers = [
        { username: "admin", password: "admin000", role: "admin", email: "sales@goldenenergy.vn" },
        { username: "sale", password: "Goldencard", role: "sale", email: "" },
      ];
      
      user = fallbackUsers.find((u) => u.username === username);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tài khoản" },
        { status: 404 }
      );
    }

    // Mock email sending - In production, use a real email service
    console.log("====================================");
    console.log("📧 FORGOT PASSWORD EMAIL");
    console.log("====================================");
    console.log("From: noreply@goldenenergy.vn");
    console.log("To: sales@goldenenergy.vn");
    console.log("Subject: [CRM] Yêu cầu khôi phục mật khẩu");
    console.log("---");
    console.log(`Người dùng: ${username}`);
    console.log(`Vai trò: ${user.role}`);
    console.log(`Mật khẩu hiện tại: ${user.password}`);
    console.log("---");
    console.log("Thông tin đăng nhập:");
    console.log(`- Username: ${username}`);
    console.log(`- Password: ${user.password}`);
    console.log("====================================");

    return NextResponse.json({
      success: true,
      message: "Thông tin mật khẩu đã được gửi đến sales@goldenenergy.vn",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
