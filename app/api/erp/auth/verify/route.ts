import { NextRequest, NextResponse } from "next/server";

// Valid roles for the ERP system
const VALID_ROLES = ['admin', 'manager', 'sale', 'staff', 'hr', 'warehouse', 'engineer'];

// Verify token endpoint
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Validate token (simple check - in production use JWT verification)
    if (token && token.length > 0) {
      try {
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        const parts = decoded.split(":");
        
        if (parts.length >= 2) {
          const username = parts[0];
          const role = parts[1];
          
          // Validate role is one of the valid roles
          if (username && VALID_ROLES.includes(role)) {
            return NextResponse.json({
              valid: true,
              user: {
                id: `user-${username}`,
                username,
                role,
                email: `${username}@goldenenergy.vn`,
                fullName: username === 'admin' ? 'Admin User' : 
                         username === 'sale' ? 'Nhân viên Sale' :
                         username === 'manager' ? 'Quản lý' :
                         username === 'hr' ? 'Nhân sự' :
                         username === 'warehouse' ? 'Kho' :
                         username === 'engineer' ? 'Kỹ thuật' :
                         username,
              },
            });
          }
        }
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  } catch {
    return NextResponse.json(
      { error: "Token verification failed" },
      { status: 500 }
    );
  }
}
