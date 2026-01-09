import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { username, currentPassword, newPassword } = await request.json();

    // Validate inputs
    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải khác với mật khẩu hiện tại" },
        { status: 400 }
      );
    }

    try {
      // Verify current password
      const userResult = await sql`
        SELECT * FROM erp_users 
        WHERE LOWER(username) = LOWER(${username}) 
          AND password = ${currentPassword} 
          AND is_active = true
      `;

      if (userResult.length === 0) {
        return NextResponse.json(
          { error: "Mật khẩu hiện tại không đúng" },
          { status: 401 }
        );
      }

      const user = userResult[0];

      // Update password and clear the requires_password_change flag
      await sql`
        UPDATE erp_users 
        SET 
          password = ${newPassword},
          requires_password_change = false,
          updated_at = NOW()
        WHERE username = ${username}
      `;

      console.log(`Password changed successfully for user: ${username}`);

      // Generate new token
      const token = Buffer.from(
        `${user.username}:${user.role}:${Date.now()}`
      ).toString("base64");

      return NextResponse.json({
        success: true,
        message: "Đổi mật khẩu thành công",
        token,
        user: {
          username: user.username,
          role: user.role,
          email: user.email,
          full_name: user.full_name,
          employee_code: user.employee_code,
        },
      });

    } catch (dbError) {
      console.error("Database error during password change:", dbError);
      return NextResponse.json(
        { error: "Không thể kết nối cơ sở dữ liệu. Vui lòng liên hệ quản trị viên." },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đổi mật khẩu" },
      { status: 500 }
    );
  }
}
