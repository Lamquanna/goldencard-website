import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

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

// GET /api/erp/employees - Get all employees
export async function GET() {
  try {
    await ensureTableExists();
    
    const rows = await sql`
      SELECT * FROM employees 
      WHERE status != 'deleted'
      ORDER BY created_at DESC
    ` as any[];

    const employees = rows.map((row: any) => ({
      id: row.id.toString(),
      employeeCode: row.employee_code,
      firstName: row.first_name,
      lastName: row.last_name,
      fullName: `${row.last_name} ${row.first_name}`,
      email: row.email,
      phone: row.phone || '',
      avatar: row.avatar || '',
      gender: row.gender,
      birthDate: row.birth_date,
      nationalId: row.national_id,
      address: row.address,
      city: row.city,
      country: row.country,
      department: row.department || 'Chưa phân công',
      departmentId: row.department || '',
      position: row.position || 'Nhân viên',
      level: row.position?.includes('Manager') || row.position?.includes('Director') ? 'Manager' : 'Staff',
      employmentType: row.employment_type || 'full_time',
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status || 'active',
      salary: parseFloat(row.salary) || 0,
      baseSalary: parseFloat(row.salary) || 0,
      currency: row.currency || 'VND',
      bankAccount: row.bank_account,
      bankName: row.bank_name,
      emergencyName: row.emergency_name,
      emergencyPhone: row.emergency_phone,
      emergencyRelation: row.emergency_relation,
      isRemote: false,
      joinDate: row.start_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    console.log(`📋 Found ${employees.length} employees`);
    return NextResponse.json({ employees, total: employees.length })
  } catch (error: any) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch employees', 
      details: error.message,
      employees: [] 
    }, { status: 500 })
  }
}

// POST /api/erp/employees - Create new employee
export async function POST(request: NextRequest) {
  try {
    await ensureTableExists();
    
    const body = await request.json()
    const { 
      firstName, lastName, email, phone, gender, birthDate,
      nationalId, address, city, country,
      department, position, employmentType, startDate, salary,
      bankAccount, bankName,
      emergencyName, emergencyPhone, emergencyRelation
    } = body

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Họ và tên là bắt buộc' },
        { status: 400 }
      )
    }

    // Generate employee code
    const countResult = await sql`SELECT COUNT(*) as count FROM employees` as any[];
    const count = parseInt(countResult[0]?.count || '0') + 1;
    const employeeCode = `NV${String(count).padStart(4, '0')}`;

    const result = await sql`
      INSERT INTO employees (
        employee_code, first_name, last_name, email, phone, gender, birth_date,
        national_id, address, city, country,
        department, position, employment_type, start_date, salary,
        bank_account, bank_name,
        emergency_name, emergency_phone, emergency_relation,
        status
      )
      VALUES (
        ${employeeCode},
        ${firstName},
        ${lastName},
        ${email || null},
        ${phone || null},
        ${gender || null},
        ${birthDate || null},
        ${nationalId || null},
        ${address || null},
        ${city || null},
        ${country || 'Vietnam'},
        ${department || null},
        ${position || 'Nhân viên'},
        ${employmentType || 'full_time'},
        ${startDate || new Date().toISOString().split('T')[0]},
        ${salary || 0},
        ${bankAccount || null},
        ${bankName || null},
        ${emergencyName || null},
        ${emergencyPhone || null},
        ${emergencyRelation || null},
        ${'active'}
      )
      RETURNING *
    ` as any[];

    const employee = result[0];
    console.log('✅ Created employee:', employeeCode);

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id.toString(),
        employeeCode: employee.employee_code,
        firstName: employee.first_name,
        lastName: employee.last_name,
        fullName: `${employee.last_name} ${employee.first_name}`,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        status: employee.status,
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating employee:', error)
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Email hoặc mã nhân viên đã tồn tại' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Không thể tạo nhân viên: ' + error.message },
      { status: 500 }
    )
  }
}
