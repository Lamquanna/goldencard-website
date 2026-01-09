#!/usr/bin/env node

/**
 * Add admin account to database
 * Admin sẽ được thêm vào database để đồng nhất với employee accounts
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

async function addAdminToDatabase() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : true
  });

  console.log('➕ Adding admin account to database...\n');

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected\n');

    // Insert or update admin account
    const result = await pool.query(`
      INSERT INTO erp_users (
        username, 
        employee_code, 
        full_name, 
        email, 
        role, 
        department, 
        password, 
        requires_password_change,
        is_active
      )
      VALUES (
        'admin',
        'ADMIN',
        'Administrator',
        'admin@goldenenergy.vn',
        'admin',
        'Ban Giám đốc',
        '1',
        true,
        true
      )
      ON CONFLICT (username) DO UPDATE SET
        password = '1',
        requires_password_change = true,
        updated_at = NOW()
      RETURNING username, employee_code, full_name, role
    `);

    console.log('✅ Admin account added/updated:');
    console.log(`   Username: ${result.rows[0].username}`);
    console.log(`   Employee Code: ${result.rows[0].employee_code}`);
    console.log(`   Full Name: ${result.rows[0].full_name}`);
    console.log(`   Role: ${result.rows[0].role}`);
    console.log(`   Password: 1`);
    console.log(`   Requires Password Change: true\n`);

    // Verify all users
    const allUsers = await pool.query(`
      SELECT employee_code, username, full_name, role, password
      FROM erp_users
      ORDER BY 
        CASE WHEN employee_code = 'ADMIN' THEN 0 ELSE 1 END,
        employee_code
    `);

    console.log('📋 All users in database:');
    console.log('┌──────────────┬──────────┬─────────────────────────┬─────────┬──────────┐');
    console.log('│ Employee Code│ Username │ Full Name               │ Role    │ Password │');
    console.log('├──────────────┼──────────┼─────────────────────────┼─────────┼──────────┤');
    allUsers.rows.forEach(u => {
      console.log(
        `│ ${u.employee_code.padEnd(12)} │ ` +
        `${u.username.padEnd(8)} │ ` +
        `${u.full_name.padEnd(23)} │ ` +
        `${u.role.padEnd(7)} │ ` +
        `${u.password.padEnd(8)} │`
      );
    });
    console.log('└──────────────┴──────────┴─────────────────────────┴─────────┴──────────┘');

    console.log('\n🎉 Admin account setup completed!');
    console.log('\n📝 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: 1');
    console.log('   ⚠️  Bạn phải đổi mật khẩu lần đầu đăng nhập');
    console.log('\n📌 Admin can now login and create additional users\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addAdminToDatabase();
