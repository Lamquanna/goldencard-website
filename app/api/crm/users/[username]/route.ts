import { NextRequest, NextResponse } from "next/server";
import { users } from "../users-data";

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Cannot delete main admin
    if (username === "admin") {
      return NextResponse.json(
        { error: "Không thể xóa tài khoản Admin chính" },
        { status: 403 }
      );
    }

    // Find and delete user
    const userIndex = users.findIndex((u) => u.username === username);

    if (userIndex === -1) {
      return NextResponse.json(
        { error: "User không tồn tại" },
        { status: 404 }
      );
    }

    // Remove user
    users.splice(userIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Xóa user thành công",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa user" },
      { status: 500 }
    );
  }
}
