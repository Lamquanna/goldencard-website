// COMPREHENSIVE QA TEST - Database & API Endpoints
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function comprehensiveQA() {
  console.log('🔍 COMPREHENSIVE QA TEST');
  console.log('='.repeat(60));
  
  let allTestsPassed = true;
  const issues = [];

  try {
    // TEST 1: Database Connection
    console.log('\n📊 TEST 1: Database Connection');
    console.log('-'.repeat(60));
    try {
      const result = await sql`SELECT NOW() as time, version() as version`;
      console.log('✅ Database connected successfully');
      console.log(`   Time: ${result[0].time}`);
      console.log(`   Version: ${result[0].version.substring(0, 50)}...`);
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      issues.push('Database connection failed');
      allTestsPassed = false;
    }

    // TEST 2: ERP Users Table Structure
    console.log('\n📊 TEST 2: ERP Users Table Structure');
    console.log('-'.repeat(60));
    try {
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'erp_users'
        ORDER BY ordinal_position
      `;
      
      if (columns.length === 0) {
        console.error('❌ erp_users table does not exist!');
        issues.push('erp_users table missing');
        allTestsPassed = false;
      } else {
        console.log('✅ erp_users table exists');
        console.log(`   Columns found: ${columns.length}`);
        
        // Check critical columns
        const requiredColumns = ['username', 'password', 'employee_code', 'role', 'is_active', 'requires_password_change'];
        const columnNames = columns.map(c => c.column_name);
        
        requiredColumns.forEach(col => {
          if (columnNames.includes(col)) {
            console.log(`   ✓ ${col}`);
          } else {
            console.error(`   ✗ Missing column: ${col}`);
            issues.push(`Missing column: ${col}`);
            allTestsPassed = false;
          }
        });
      }
    } catch (error) {
      console.error('❌ Table structure check failed:', error.message);
      issues.push('Table structure check failed');
      allTestsPassed = false;
    }

    // TEST 3: User Data Integrity
    console.log('\n📊 TEST 3: User Data Integrity');
    console.log('-'.repeat(60));
    try {
      // Count total users
      const totalUsers = await sql`SELECT COUNT(*) as count FROM erp_users`;
      console.log(`✅ Total users in database: ${totalUsers[0].count}`);
      
      // Count active users
      const activeUsers = await sql`SELECT COUNT(*) as count FROM erp_users WHERE is_active = true`;
      console.log(`✅ Active users: ${activeUsers[0].count}`);
      
      // Check admin exists
      const admin = await sql`SELECT * FROM erp_users WHERE username = 'admin'`;
      if (admin.length === 0) {
        console.error('❌ Admin user not found!');
        issues.push('Admin user missing');
        allTestsPassed = false;
      } else {
        console.log('✅ Admin user exists');
        console.log(`   Password: ${admin[0].password}`);
        console.log(`   Role: ${admin[0].role}`);
        console.log(`   Active: ${admin[0].is_active}`);
        console.log(`   Requires password change: ${admin[0].requires_password_change}`);
        
        if (admin[0].password !== '1') {
          console.error(`❌ Admin password is NOT "1" (current: "${admin[0].password}")`);
          issues.push('Admin password incorrect');
          allTestsPassed = false;
        }
      }
      
      // Check employee users
      const employees = await sql`
        SELECT COUNT(*) as count 
        FROM erp_users 
        WHERE employee_code LIKE 'GES%' AND is_active = true
      `;
      console.log(`✅ Employee accounts: ${employees[0].count}`);
      
      if (employees[0].count < 12) {
        console.warn(`⚠️  Expected 12 employees, found ${employees[0].count}`);
      }
      
    } catch (error) {
      console.error('❌ User data integrity check failed:', error.message);
      issues.push('User data integrity check failed');
      allTestsPassed = false;
    }

    // TEST 4: Login Simulation
    console.log('\n📊 TEST 4: Login Simulation (Database Query)');
    console.log('-'.repeat(60));
    try {
      // Simulate admin login query
      const adminLogin = await sql`
        SELECT * FROM erp_users 
        WHERE LOWER(username) = LOWER('admin') 
          AND password = '1' 
          AND is_active = true
      `;
      
      if (adminLogin.length === 0) {
        console.error('❌ Admin login query returned no results');
        issues.push('Admin cannot login with password "1"');
        allTestsPassed = false;
      } else {
        console.log('✅ Admin login query successful');
        console.log(`   User: ${adminLogin[0].username}`);
        console.log(`   Employee Code: ${adminLogin[0].employee_code}`);
      }
      
      // Simulate employee login
      const empLogin = await sql`
        SELECT * FROM erp_users 
        WHERE LOWER(username) = LOWER('ges001') 
          AND password = '1' 
          AND is_active = true
      `;
      
      if (empLogin.length === 0) {
        console.error('❌ Employee ges001 login query returned no results');
        issues.push('Employee ges001 cannot login');
        allTestsPassed = false;
      } else {
        console.log('✅ Employee ges001 login query successful');
        console.log(`   Full Name: ${empLogin[0].full_name}`);
      }
      
    } catch (error) {
      console.error('❌ Login simulation failed:', error.message);
      issues.push('Login simulation failed');
      allTestsPassed = false;
    }

    // TEST 5: CRM Users Table
    console.log('\n📊 TEST 5: CRM Users Table');
    console.log('-'.repeat(60));
    try {
      const crmCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'crm_users'
        ) as exists
      `;
      
      if (crmCheck[0].exists) {
        console.log('✅ crm_users table exists');
        const crmCount = await sql`SELECT COUNT(*) as count FROM crm_users`;
        console.log(`   Total CRM users: ${crmCount[0].count}`);
      } else {
        console.log('ℹ️  crm_users table does not exist (may not be needed)');
      }
    } catch (error) {
      console.log('ℹ️  CRM users check skipped:', error.message);
    }

    // TEST 6: Other Critical Tables
    console.log('\n📊 TEST 6: Other Critical Tables');
    console.log('-'.repeat(60));
    const criticalTables = ['leads', 'messages', 'analytics_events', 'page_views'];
    
    for (const table of criticalTables) {
      try {
        const exists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = ${table}
          ) as exists
        `;
        
        if (exists[0].exists) {
          const count = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
          console.log(`✅ ${table}: ${count[0].count} records`);
        } else {
          console.log(`⚠️  ${table}: does not exist`);
        }
      } catch (error) {
        console.log(`⚠️  ${table}: check failed (${error.message})`);
      }
    }

    // FINAL SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('📋 QA TEST SUMMARY');
    console.log('='.repeat(60));
    
    if (allTestsPassed && issues.length === 0) {
      console.log('✅ ALL TESTS PASSED - NO ISSUES FOUND');
      console.log('\n🎉 Database is fully operational and ready for production!');
    } else {
      console.log(`❌ TESTS FAILED - ${issues.length} ISSUE(S) FOUND:`);
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      console.log('\n⚠️  Please fix these issues before going to production!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error);
    process.exit(1);
  }
}

comprehensiveQA();
