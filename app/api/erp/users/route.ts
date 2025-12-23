import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET - List all users
export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Try to fetch from database
    try {
      const users = await sql`
        SELECT 
          id, username, employee_code, full_name, email, role, 
          department, phone, created_at, is_active, last_login
        FROM erp_users
        ORDER BY created_at DESC
      `;
      
      console.log('👥 Users API - returning users from DB:', users?.length || 0);
      
      return NextResponse.json({
        success: true,
        users: users || [],
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Return empty array if table doesn't exist yet
      return NextResponse.json({
        success: true,
        users: [],
        note: "Database not initialized. Please create users table."
      });
    }
  } catch (error) {
    console.error('Error in GET /api/erp/users:', error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST - Create new user with auto-increment GES code
export async function POST(request: NextRequest) {
  try {
    // Get auth token and check if user is admin
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    // Parse decoded token to check role
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, role] = decoded.split(':');
    
    if (role !== 'admin') {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

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

    const { full_name, email, phone, role: userRole, department, password } = body;

    // Validate required fields
    if (!full_name || !userRole) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ họ tên và chức vụ" },
        { status: 400 }
      );
    }

    try {
      // Get the latest employee code to generate next one
      const latestUser = await sql`
        SELECT employee_code 
        FROM erp_users 
        WHERE employee_code LIKE 'GES%'
        ORDER BY employee_code DESC 
        LIMIT 1
      `;

      let nextCode = 'GES001';
      
      if (latestUser.length > 0) {
        const lastCode = latestUser[0].employee_code;
        const lastNumber = parseInt(lastCode.replace('GES', ''));
        const nextNumber = lastNumber + 1;
        nextCode = `GES${String(nextNumber).padStart(3, '0')}`;
      }

      // Generate default password if not provided
      const defaultPassword = password || `${nextCode}@2025`;
      
      // Create username from employee code (lowercase)
      const username = nextCode.toLowerCase();

      // Insert new user
      const result = await sql`
        INSERT INTO erp_users 
          (username, employee_code, full_name, email, phone, role, department, password, is_active, created_at)
        VALUES 
          (${username}, ${nextCode}, ${full_name}, ${email || ''}, ${phone || ''}, 
           ${userRole}, ${department || ''}, ${defaultPassword}, true, NOW())
        RETURNING id, username, employee_code, full_name, email, role, created_at
      `;

      console.log('✅ User created successfully:', result[0]);

      return NextResponse.json({
        success: true,
        message: `Tạo user thành công với mã ${nextCode}`,
        user: result[0],
        credentials: {
          username: username,
          password: defaultPassword,
          note: "Vui lòng gửi thông tin này cho nhân viên"
        }
      });

    } catch (dbError: any) {
      console.error('Database error when creating user:', dbError);
      
      // Check if it's a duplicate key error
      if (dbError.code === '23505') { // PostgreSQL unique violation
        return NextResponse.json(
          { error: "Mã nhân viên đã tồn tại" },
          { status: 409 }
        );
      }
      
      // Check if table doesn't exist
      if (dbError.code === '42P01') {
        return NextResponse.json(
          { 
            error: "Bảng erp_users chưa được tạo. Vui lòng chạy migration SQL.",
            sql: `
CREATE TABLE IF NOT EXISTS erp_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL,
  department VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
            `
          },
          { status: 503 }
        );
      }
      
      throw dbError;
    }

  } catch (error) {
    console.error('Error in POST /api/erp/users:', error);
    return NextResponse.json(
      { 
        error: "Có lỗi xảy ra khi tạo user",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo user" },
      { status: 500 }
    );
  }
}
