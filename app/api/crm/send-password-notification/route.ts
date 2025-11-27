import { NextRequest, NextResponse } from "next/server";

// Mock email sending endpoint
// In production, integrate with SendGrid, Mailgun, or AWS SES
export async function POST(request: NextRequest) {
  try {
    const { username, oldPassword, newPassword, email } = await request.json();

    console.log("📧 Sending password change notification email:");
    console.log("  To:", email);
    console.log("  Username:", username);
    console.log("  Old Password:", oldPassword);
    console.log("  New Password:", newPassword);

    // Mock email content
    const emailContent = `
      Thông báo thay đổi mật khẩu CRM
      ================================
      
      Tài khoản: ${username}
      Mật khẩu cũ: ${oldPassword}
      Mật khẩu mới: ${newPassword}
      
      Thời gian: ${new Date().toLocaleString("vi-VN")}
      
      ---
      Golden Energy Vietnam
      CRM System
    `;

    console.log("📨 Email content:", emailContent);

    // In production, send actual email here:
    // await sendgrid.send({
    //   to: email,
    //   from: 'noreply@goldenenergy.vn',
    //   subject: 'Thông báo thay đổi mật khẩu CRM Admin',
    //   text: emailContent,
    // });

    // For now, just log to console (works in localhost)
    console.log("✅ Email notification logged (mock mode)");
    console.log("ℹ️  In production, integrate with real email service");

    return NextResponse.json({
      success: true,
      message: "Email notification sent",
      mock: true,
    });
  } catch (error) {
    console.error("❌ Failed to send email notification:", error);
    return NextResponse.json(
      { error: "Failed to send email notification" },
      { status: 500 }
    );
  }
}
