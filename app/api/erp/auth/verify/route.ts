import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyToken } from "@/lib/auth/jwt";

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
      // Verify JWT token
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
      }

      const username = decoded.username;

      if (!username) {
        return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
      }

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
