// API route: Seed employees from team-data
// POST /api/erp/employees/seed

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { teamData } from '@/lib/team-data'

// Ensure employees table exists
async function ensureTableExists() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        employee_code VARCHAR(20) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        avatar VARCHAR(500),
        gender VARCHAR(10),
        birth_date DATE,
        national_id VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Vietnam',
        
        department VARCHAR(100),
        position VARCHAR(100),
        employment_type VARCHAR(50) DEFAULT 'full_time',
        start_date DATE NOT NULL DEFAULT CURRENT_DATE,
        end_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        
        salary DECIMAL(15, 2),
        currency VARCHAR(10) DEFAULT 'VND',
        bank_account VARCHAR(50),
        bank_name VARCHAR(100),
        
        emergency_name VARCHAR(100),
        emergency_phone VARCHAR(20),
        emergency_relation VARCHAR(50),
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Employees table ready');
  } catch (e: any) {
    console.log('Table check/create:', e.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTableExists();
    
    // Check if already seeded
    const existing = await sql`SELECT COUNT(*) as count FROM employees` as any[];
    if (parseInt(existing[0]?.count || '0') > 0) {
      return NextResponse.json({
        success: false,
        message: 'Employees already exist. Use DELETE first to reseed.',
        count: parseInt(existing[0]?.count || '0')
      });
    }
    
    // Insert all team members
    const results = [];
    
    for (const member of teamData) {
      // Parse Vietnamese name (họ ở đầu)
      const nameParts = member.nameVi.split(' ');
      const lastName = nameParts[0]; // Họ
      const firstName = nameParts.slice(1).join(' '); // Tên đệm + Tên
      
      // Determine salary based on category
      let salary = 15000000; // Default
      if (member.category === 'leadership') salary = 50000000;
      else if (member.category === 'management') salary = 35000000;
      else if (member.category === 'engineering') salary = 20000000;
      
      try {
        const result = await sql`
          INSERT INTO employees (
            employee_code, first_name, last_name, email, 
            avatar, department, position, employment_type,
            start_date, salary, status
          )
          VALUES (
            ${member.employeeCode},
            ${firstName},
            ${lastName},
            ${member.email || `${member.employeeCode.toLowerCase()}@goldenenergy.vn`},
            ${member.avatar},
            ${member.department || 'Chưa phân công'},
            ${member.roleVi},
            ${'full_time'},
            ${'2023-01-01'},
            ${salary},
            ${'active'}
          )
          RETURNING *
        ` as any[];
        
        results.push({
          success: true,
          code: member.employeeCode,
          name: member.nameVi
        });
      } catch (e: any) {
        results.push({
          success: false,
          code: member.employeeCode,
          name: member.nameVi,
          error: e.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return NextResponse.json({
      success: true,
      message: `Seeded ${successCount}/${teamData.length} employees`,
      results
    });
    
  } catch (error: any) {
    console.error('Error seeding employees:', error);
    return NextResponse.json(
      { error: 'Failed to seed employees: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Clear all employees for reseeding
export async function DELETE(request: NextRequest) {
  try {
    await sql`DELETE FROM employees`;
    
    return NextResponse.json({
      success: true,
      message: 'All employees deleted'
    });
  } catch (error: any) {
    console.error('Error deleting employees:', error);
    return NextResponse.json(
      { error: 'Failed to delete employees: ' + error.message },
      { status: 500 }
    );
  }
}

// GET - Check current status
export async function GET() {
  try {
    await ensureTableExists();
    
    const count = await sql`SELECT COUNT(*) as count FROM employees` as any[];
    
    return NextResponse.json({
      success: true,
      employeeCount: parseInt(count[0]?.count || '0'),
      teamDataCount: teamData.length,
      needsSeeding: parseInt(count[0]?.count || '0') === 0
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
