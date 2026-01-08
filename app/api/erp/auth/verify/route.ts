import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Verify token endpoint - Check against PostgreSQL database
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    if (!token || token.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    try {
      // Decode base64 token: format is "username:role:timestamp"
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const parts = decoded.split(":");
      
      if (parts.length < 2) {
        return NextResponse.json({ error: "Invalid token format" }, { status: 401 });
      }

      const username = parts[0];
      const role = parts[1];

      // Verify user exists in database and is active
      const userResult = await sql`
        SELECT * FROM erp_users 
        WHERE username = ${username} AND is_active = true
      `;

      if (userResult.length === 0) {
        return NextResponse.json({ error: "User not found or inactive" }, { status: 401 });
      }

      const user = userResult[0];

      // Return user info
      return NextResponse.json({
        valid: true,
        user: {
          id: `user-${user.id}`,
          username: user.username,
          employeeCode: user.employee_code,
          role: user.role,
          email: user.email,
          fullName: user.full_name,
          position: user.role,
          department: user.department,
          phone: user.phone,
        },
      });

    } catch (decodeError) {
      console.error("Token decode error:", decodeError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Token verification failed" },
      { status: 500 }
    );
  }
}
