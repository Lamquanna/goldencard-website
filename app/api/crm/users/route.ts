import { NextRequest, NextResponse } from "next/server";
// import { sql } from "@/lib/db";
import { mockSupabase } from "@/lib/supabase/mock";

// GET - List all users
export async function GET(request: NextRequest) {
  try {
    // Use mock data for local testing
    const supabase = mockSupabase as any;
    const { data: users, error } = await supabase.from('users').select('*');
    
    if (error) {
      console.error('Error fetching users from mock:', error);
      throw error;
    }
    
    console.log('👥 Users API - returning users:', users?.length || 0);
    
    return NextResponse.json({
      success: true,
      users: users || [],
    });
  } catch (error) {
    console.error('Error fetching users, using fallback:', error);
    
    // Fallback to in-memory users
    const fallbackUsers = [
      { 
        id: "mock-user-123",
        username: "admin", 
        full_name: "Admin User",
        password: "admin123", 
        role: "admin", 
        email: "admin@goldenenergy.vn", 
        created_at: new Date().toISOString() 
      },
      { 
        id: "mock-sale-456",
        username: "sale", 
        full_name: "Nhân viên Sale",
        password: "sale123", 
        role: "sale", 
        email: "sale@goldenenergy.vn", 
        created_at: new Date().toISOString() 
      },
    ];
    
    return NextResponse.json({
      success: true,
      users: fallbackUsers,
    });
  }
}

// POST - Create new user (mock implementation)
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

    const { username, password, role, email } = body;

    // Validate
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Mock implementation - in production this would insert into database
    console.log('Creating new user (mock):', { username, role, email });

    return NextResponse.json({
      success: true,
      message: "Tạo user thành công (mock mode)",
      user: { 
        id: `mock-${Date.now()}`,
        username, 
        full_name: username,
        role, 
        email: email || '',
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo user" },
      { status: 500 }
    );
  }
}
