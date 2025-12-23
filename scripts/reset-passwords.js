#!/usr/bin/env node

/**
 * Reset all passwords to default "1" and require password change
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

async function resetPasswords() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : true
  });

  console.log('🔄 Resetting all passwords to default "1"...\n');

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected\n');

    // Add column if not exists
    await pool.query(`
      ALTER TABLE erp_users 
      ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT true
    `);
    console.log('✅ Added requires_password_change column\n');

    // Reset all passwords to "1"
    const result = await pool.query(`
      UPDATE erp_users 
      SET password = '1', requires_password_change = true
      RETURNING employee_code, username, full_name
    `);

    console.log(`✅ Reset ${result.rowCount} passwords to default "1"\n`);
    console.log('Updated accounts:');
    result.rows.forEach(user => {
      console.log(`  - ${user.employee_code}: ${user.full_name} (${user.username})`);
    });

    console.log('\n🎉 Password reset completed!');
    console.log('\n📋 Default credentials for ALL users:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Password: 1');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Examples:');
    console.log('  - admin/1');
    console.log('  - ges001/1');
    console.log('  - ges002/1');
    console.log('\n🔒 Users will be required to change password on first login\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetPasswords();
