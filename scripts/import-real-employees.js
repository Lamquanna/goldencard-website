#!/usr/bin/env node

/**
 * Import Real Employees from team-data.ts
 * Xóa mock users và tạo account cho nhân viên thực từ danh sách công ty
 */

const { readFileSync } = require('fs');
const { join } = require('path');

// Try to load dependencies
let Pool;
try {
  Pool = require('pg').Pool;
} catch (e) {
  console.error('❌ pg module not found. Install it with: npm install pg');
  process.exit(1);
}

// Load environment variables
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.warn('⚠️  dotenv not found.');
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env.local');
  process.exit(1);
}

// Real employee data from team-data.ts
const realEmployees = [
  {
    employeeCode: 'GES001',
    username: 'ges001',
    fullName: 'Hà Hoàng Hà',
    email: 'jimmy.ha@goldenenergy.vn',
    role: 'admin',
    department: 'Ban Giám đốc',
    title: 'Founder & CEO'
  },
  {
    employeeCode: 'GES002',
    username: 'ges002',
    fullName: 'Trương Kim Anh',
    email: 'rita.anh@goldenenergy.vn',
    role: 'admin',
    department: 'Ban Giám đốc',
    title: 'CFO & Vice-CEO'
  },
  {
    employeeCode: 'GES003',
    username: 'ges003',
    fullName: 'Hà Huy Tuấn',
    email: 'tuan.ha@goldenenergy.vn',
    role: 'manager',
    department: 'Phòng Dự án',
    title: 'Trưởng phòng Giám sát Dự án'
  },
  {
    employeeCode: 'GES004',
    username: 'ges004',
    fullName: 'Hồ Minh Tân',
    email: 'tan.ho@goldenenergy.vn',
    role: 'manager',
    department: 'Phòng Kỹ thuật',
    title: 'Trưởng phòng Kỹ thuật'
  },
  {
    employeeCode: 'GES005',
    username: 'ges005',
    fullName: 'Lê Quang Anh',
    email: 'anh.le@goldenenergy.vn',
    role: 'manager',
    department: 'Phòng Phát triển Dự án',
    title: 'CTO & Trưởng phòng Phát triển'
  },
  {
    employeeCode: 'GES006',
    username: 'ges006',
    fullName: 'Nguyễn Thị Thu',
    email: 'thu.nguyen@goldenenergy.vn',
    role: 'manager',
    department: 'Phòng Kế toán',
    title: 'Trưởng phòng Kế toán'
  },
  {
    employeeCode: 'GES007',
    username: 'ges007',
    fullName: 'Phạm Tấn Lễ',
    email: 'le.pham@goldenenergy.vn',
    role: 'manager',
    department: 'Bộ phận Vận chuyển',
    title: 'Trưởng bộ phận Vận chuyển'
  },
  {
    employeeCode: 'GES008',
    username: 'ges008',
    fullName: 'Nguyễn Minh Nguyệt',
    email: 'nguyet.nguyen@goldenenergy.vn',
    role: 'manager',
    department: 'Phòng Kinh doanh',
    title: 'Trưởng phòng Kinh doanh'
  },
  {
    employeeCode: 'GES009',
    username: 'ges009',
    fullName: 'Lưu Thị Duyên',
    email: 'cristina.lu@goldenenergy.vn',
    role: 'manager',
    department: 'Bộ phận Marketing',
    title: 'Trưởng bộ phận Marketing'
  },
  {
    employeeCode: 'GES010',
    username: 'ges010',
    fullName: 'Đào Hữu Giàu',
    email: 'giau.dao@goldenenergy.vn',
    role: 'staff',
    department: 'Phòng Kỹ thuật',
    title: 'Kỹ sư Hệ thống Điện mặt trời'
  },
  {
    employeeCode: 'GES011',
    username: 'ges011',
    fullName: 'Trần Văn Son',
    email: 'son.tran@goldenenergy.vn',
    role: 'staff',
    department: 'Phòng Kỹ thuật',
    title: 'Kỹ sư Hệ thống Điện mặt trời'
  },
  {
    employeeCode: 'GES012',
    username: 'ges012',
    fullName: 'Nguyễn Minh Duy',
    email: 'duy.nguyen@goldenenergy.vn',
    role: 'staff',
    department: 'Phòng Kỹ thuật',
    title: 'Kỹ sư Hệ thống Điện mặt trời'
  }
];

async function importRealEmployees() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : true
  });

  console.log('🚀 Importing Real Employees from Company Team Data...\n');

  try {
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log(`📅 Server time: ${testResult.rows[0].now}\n`);

    // Step 1: Delete existing mock users (keep admin if exists)
    console.log('🗑️  Deleting mock/sample users...');
    const deleteResult = await pool.query(`
      DELETE FROM erp_users 
      WHERE employee_code IN ('GES001', 'GES002', 'GES003')
      AND username != 'admin'
    `);
    console.log(`✅ Deleted ${deleteResult.rowCount} mock users\n`);

    // Step 2: Insert real employees
    console.log('👥 Inserting real employees...');
    let insertCount = 0;
    
    for (const emp of realEmployees) {
      try {
        // Default password is EMPLOYEE_CODE@2025 (e.g., GES001@2025)
        const defaultPassword = `${emp.employeeCode}@2025`;
        
        await pool.query(`
          INSERT INTO erp_users (
            username, 
            employee_code, 
            full_name, 
            email, 
            role, 
            department, 
            password, 
            is_active
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, true)
          ON CONFLICT (username) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            updated_at = NOW()
        `, [
          emp.username,
          emp.employeeCode,
          emp.fullName,
          emp.email,
          emp.role,
          emp.department,
          defaultPassword
        ]);
        
        insertCount++;
        console.log(`  ✓ ${emp.employeeCode}: ${emp.fullName} (${emp.title})`);
      } catch (err) {
        console.error(`  ✗ Failed to insert ${emp.employeeCode}:`, err.message);
      }
    }
    
    console.log(`\n✅ Successfully imported ${insertCount}/${realEmployees.length} employees\n`);

    // Step 3: Verify imported data
    const verifyResult = await pool.query(`
      SELECT 
        employee_code, 
        full_name, 
        email, 
        role, 
        department,
        is_active
      FROM erp_users 
      WHERE employee_code LIKE 'GES%'
      ORDER BY employee_code
    `);

    console.log('📋 Current ERP Users in Database:');
    console.log('┌──────────────┬─────────────────────────┬─────────────────────────────────────┬─────────┬────────────────────────┐');
    console.log('│ Employee Code│ Full Name               │ Email                               │ Role    │ Department             │');
    console.log('├──────────────┼─────────────────────────┼─────────────────────────────────────┼─────────┼────────────────────────┤');
    
    verifyResult.rows.forEach(user => {
      console.log(
        `│ ${user.employee_code.padEnd(12)} │ ` +
        `${user.full_name.padEnd(23)} │ ` +
        `${user.email.padEnd(35)} │ ` +
        `${user.role.padEnd(7)} │ ` +
        `${user.department.padEnd(22)} │`
      );
    });
    console.log('└──────────────┴─────────────────────────┴─────────────────────────────────────┴─────────┴────────────────────────┘');

    console.log('\n🎉 Employee import completed successfully!');
    console.log('\n📊 Default Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin Account: username="admin", password="Admin@2025"');
    console.log('👥 Employee Format: username="ges001", password="GES001@2025"');
    console.log('');
    console.log('🔒 Security Note: Please ask employees to change their default passwords after first login!');
    console.log('🌐 Login URL: https://goldencard-website-is4kudkbt-qas-projects-07cd4636.vercel.app/erp/login\n');
    
  } catch (error) {
    console.error('❌ Import error:');
    console.error(error.message);
    console.error('\nFull error:');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the import
importRealEmployees().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
