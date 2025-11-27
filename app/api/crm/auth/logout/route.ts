import { NextRequest, NextResponse } from "next/server";

// Logout endpoint
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Đăng xuất thành công",
  });
}
