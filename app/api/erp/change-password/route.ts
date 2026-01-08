import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// POST - Change password for ERP users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, currentPassword, newPassword } = body;

    // Validate inputs
    if (!username || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 4 characters)
    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 4 ký tự" },
        { status: 400 }
      );
    }

    try {
      // Verify user exists and current password is correct (if provided)
      let userResult;
      if (currentPassword) {
        userResult = await sql`
          SELECT * FROM erp_users 
          WHERE username = ${username} AND password = ${currentPassword} AND is_active = true
        `;
      } else {
        // If no current password provided (first time change), just check user exists
        userResult = await sql`
          SELECT * FROM erp_users 
          WHERE username = ${username} AND is_active = true
        `;
      }

      if (userResult.length === 0) {
        return NextResponse.json(
          { error: currentPassword ? "Mật khẩu hiện tại không đúng" : "Người dùng không tồn tại" },
          { status: 401 }
        );
      }

      const user = userResult[0];

      // Update password in database
      await sql`
        UPDATE erp_users 
        SET 
          password = ${newPassword}, 
          requires_password_change = false,
          updated_at = NOW()
        WHERE username = ${username}
      `;

      console.log(`Password changed successfully for user: ${username}`);

      // Return updated user info
      return NextResponse.json({
        success: true,
        message: "Đổi mật khẩu thành công",
        user: {
          username: user.username,
          role: user.role,
          email: user.email,
          full_name: user.full_name,
          employee_code: user.employee_code,
        }
      });

    } catch (dbError) {
      console.error("Database error during password change:", dbError);
      return NextResponse.json(
        { error: "Không thể kết nối cơ sở dữ liệu" },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đổi mật khẩu" },
      { status: 500 }
    );
  }
}
