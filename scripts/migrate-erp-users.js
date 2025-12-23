#!/usr/bin/env node

/**
 * ERP Users Migration Runner
 * Chạy migration để tạo bảng erp_users
 * 
 * Usage:
 *   node scripts/migrate-erp-users.js
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
  console.warn('⚠️  dotenv not found. Trying process.env...');
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env.local');
  console.error('Please set up your database connection string.');
  process.exit(1);
}

async function runERPMigration() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : true
  });

  console.log('🚀 Starting ERP Users migration...\n');

  try {
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log(`📅 Server time: ${testResult.rows[0].now}\n`);

    // Read migration file
    const filePath = join(__dirname, '..', 'database', 'migrations', 'create_erp_users_table.sql');
    
    console.log(`📝 Running migration: create_erp_users_table.sql`);
    const sql = readFileSync(filePath, 'utf8');
    
    // Execute migration
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!\n');

    // Verify table was created
    const tableCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'erp_users' 
      ORDER BY ordinal_position;
    `);

    if (tableCheck.rows.length > 0) {
      console.log('📋 Table structure created:');
      tableCheck.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
      console.log();
    }

    // Count records
    const countResult = await pool.query('SELECT COUNT(*) FROM erp_users');
    const count = countResult.rows[0].count;
    
    console.log(`👥 Sample users created: ${count} records\n`);

    if (count > 0) {
      const users = await pool.query(`
        SELECT username, employee_code, full_name, role 
        FROM erp_users 
        ORDER BY employee_code
      `);
      
      console.log('Sample users:');
      users.rows.forEach(user => {
        console.log(`   - ${user.employee_code}: ${user.full_name} (${user.role}) - username: ${user.username}`);
      });
      console.log();
    }

    console.log('🎉 ERP Migration completed successfully!');
    console.log('\n📊 Next steps:');
    console.log('1. Login with admin account: username="admin", password="Admin@2025"');
    console.log('2. Or use sample users: username="ges001", password="GES001@2025"');
    console.log('3. Go to http://localhost:3000/erp/login to test\n');
    
  } catch (error) {
    console.error('❌ Migration error:');
    console.error(error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Table already exists. This is OK.');
      console.log('You can now use the ERP system.\n');
    } else {
      console.error('\nFull error:');
      console.error(error);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

// Run the migration
runERPMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
