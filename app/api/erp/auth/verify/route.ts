import { NextRequest, NextResponse } from "next/server";

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
          
          if ((username === "admin" || username === "sale") && (role === "admin" || role === "sale")) {
            return NextResponse.json({
              valid: true,
              user: {
                username,
                role,
              },
            });
          }
        }
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  } catch (error) {
    return NextResponse.json(
      { error: "Token verification failed" },
      { status: 500 }
    );
  }
}
