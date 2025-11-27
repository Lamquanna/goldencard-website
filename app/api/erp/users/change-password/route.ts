import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import fs from 'fs';
import path from 'path';

// POST - Change password
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { error: "Request body is empty" },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    const { username, newPassword } = body;

    if (!username || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Find user and update password
    let user = null;
    let oldPassword = '';
    let useDatabase = false;

    try {
      // Try database first
      if (sql) {
        const userResult = await sql`SELECT * FROM crm_users WHERE username = ${username}`;
        
        if (userResult.length > 0) {
          user = userResult[0];
          oldPassword = user.password;
          useDatabase = true;
          
          // Update password in database
          await sql`
            UPDATE crm_users 
            SET password = ${newPassword}, updated_at = CURRENT_TIMESTAMP 
            WHERE username = ${username}
          `;
        }
      }
    } catch (dbError) {
      console.error("Database error, using fallback:", dbError);
      useDatabase = false;
    }

    // If database not available or user not found, check fallback
    if (!user) {
      // Fallback users (in-memory)
      const fallbackUsers = [
        { username: "admin", password: "admin000", role: "admin" },
        { username: "sale", password: "Goldencard", role: "sale" },
      ];
      
      user = fallbackUsers.find((u) => u.username === username);
      
      if (!user) {
        return NextResponse.json(
          { error: "User không tồn tại" },
          { status: 404 }
        );
      }
      
      oldPassword = user.password;
      // Note: In fallback mode, password change only updates DONT_READ_ME.md
    }

    // Update DONT_READ_ME.md file
    try {
      const dontReadMePath = path.join(process.cwd(), 'DONT_READ_ME.md');
      let content = fs.readFileSync(dontReadMePath, 'utf-8');
      
      // Update password in the file based on username
      if (username === 'admin') {
        content = content.replace(
          /Username: admin\nPassword: .+/,
          `Username: admin\nPassword: ${newPassword}`
        );
      } else if (username === 'sale') {
        content = content.replace(
          /Username: sale\nPassword: .+/,
          `Username: sale\nPassword: ${newPassword}`
        );
      }
      
      // Update last modified date
      const now = new Date();
      const dateStr = now.toLocaleDateString('vi-VN');
      content = content.replace(
        /\*\*Ngày\*\*: .+/,
        `**Ngày**: ${dateStr}`
      );
      
      fs.writeFileSync(dontReadMePath, content, 'utf-8');
      console.log('✅ DONT_READ_ME.md updated successfully');
    } catch (fileError) {
      console.error('Failed to update DONT_READ_ME.md:', fileError);
      // Don't fail the password change if file update fails
    }

    // Send email notification if admin password is changed
    if (username === "admin") {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/crm/send-password-notification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            oldPassword,
            newPassword,
            email: "sales@goldenenergy.vn",
          }),
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the password change if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message:
        username === "admin"
          ? "Đổi mật khẩu thành công! Email thông báo đã được gửi tới sales@goldenenergy.vn"
          : "Đổi mật khẩu thành công!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đổi mật khẩu" },
      { status: 500 }
    );
  }
}
