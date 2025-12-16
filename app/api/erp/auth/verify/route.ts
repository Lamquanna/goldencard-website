import { NextRequest, NextResponse } from "next/server";
import { teamData } from "@/lib/team-data";

// Valid roles for the ERP system
const VALID_ROLES = ['admin', 'manager', 'sale', 'staff', 'hr', 'warehouse', 'engineer', 'ceo', 'cfo', 'cto'];

// Build employee map from team data
const EMPLOYEES: Record<string, { name: string; role: string; email: string }> = {};
teamData.forEach((member) => {
  EMPLOYEES[member.employeeCode] = {
    name: member.nameVi,
    role: member.roleVi,
    email: member.email || `${member.employeeCode.toLowerCase()}@goldenenergy.vn`,
  };
});

// Verify token endpoint
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Validate token
    if (token && token.length > 0) {
      // New simple token format: CODE|timestamp|random
      if (token.includes('|')) {
        const [code, timestampStr] = token.split('|');
        const timestamp = parseInt(timestampStr, 10);
        
        // Check if token is expired (24 hours)
        if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
          return NextResponse.json({ error: "Token expired" }, { status: 401 });
        }
        
        // Get employee info
        const employee = EMPLOYEES[code];
        if (employee) {
          return NextResponse.json({
            valid: true,
            user: {
              id: `user-${code}`,
              username: code,
              employeeCode: code,
              role: employee.role.includes('CEO') ? 'admin' : 
                    employee.role.includes('CFO') || employee.role.includes('CTO') ? 'manager' :
                    employee.role.includes('Trưởng') ? 'manager' : 'staff',
              email: employee.email,
              fullName: employee.name,
              position: employee.role,
            },
          });
        }
      }
      
      // Legacy: try to decode base64 token
      try {
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        
        // Old format: username:role
        const parts = decoded.split(":");
        
        if (parts.length >= 2) {
          const username = parts[0];
          const role = parts[1];
          
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
        // Invalid token format
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
