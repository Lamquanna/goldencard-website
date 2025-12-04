#!/usr/bin/env node

/**
 * Database Seeder
 * Seeds initial data into the database
 * 
 * Usage:
 *   npm install bcryptjs dotenv  # Install dependencies first
 *   node scripts/seed-database.js
 *   
 * Or with npm:
 *   npm run db:seed
 */

const { Pool } = require('pg');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Try to load bcrypt, provide fallback
let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  console.warn('⚠️  bcryptjs not found. Install it with: npm install bcryptjs');
  console.warn('Using fallback password hashing (NOT FOR PRODUCTION!)');
  bcrypt = {
    hash: async (password) => `FALLBACK_HASH_${password}`
  };
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env.local');
  process.exit(1);
}

async function seedDatabase() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  console.log('🌱 Seeding database...\n');

  try {
    // 1. Create admin user
    console.log('👤 Creating admin user...');
    const passwordHash = await bcrypt.hash('admin000', 10);
    
    await pool.query(`
      INSERT INTO users (username, email, password_hash, full_name, role, status, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role
      RETURNING id
    `, ['admin', 'admin@goldenenergy.vn', passwordHash, 'System Administrator', 'admin', 'active', true]);
    
    console.log('✅ Admin user created (username: admin, password: admin000)\n');

    // 2. Create sample users
    console.log('👥 Creating sample users...');
    const sampleUsers = [
      ['manager1', 'manager1@goldenenergy.vn', 'Nguyễn Văn Manager', 'manager'],
      ['sales1', 'sales1@goldenenergy.vn', 'Trần Thị Sales', 'sales'],
      ['engineer1', 'engineer1@goldenenergy.vn', 'Lê Văn Engineer', 'engineer'],
      ['tech1', 'tech1@goldenenergy.vn', 'Phạm Thị Technician', 'technician']
    ];

    for (const [username, email, fullName, role] of sampleUsers) {
      const hash = await bcrypt.hash('password123', 10);
      await pool.query(`
        INSERT INTO users (username, email, password_hash, full_name, role, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (username) DO NOTHING
      `, [username, email, hash, fullName, role, 'active']);
    }
    
    console.log('✅ Sample users created\n');

    // 3. Create notification preferences for all users
    console.log('🔔 Setting up notification preferences...');
    await pool.query(`
      INSERT INTO notification_preferences (user_id)
      SELECT id FROM users
      ON CONFLICT (user_id) DO NOTHING
    `);
    console.log('✅ Notification preferences created\n');

    // 4. Create sample team
    console.log('👨‍👩‍👧‍👦 Creating sample teams...');
    const teamResult = await pool.query(`
      INSERT INTO teams (name, description)
      VALUES ('Sales Team', 'Customer acquisition and relationship management')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    if (teamResult.rows.length > 0) {
      const teamId = teamResult.rows[0].id;
      
      // Add sales users to team
      await pool.query(`
        INSERT INTO team_members (team_id, user_id, role)
        SELECT $1, id, 'member'
        FROM users
        WHERE role = 'sales'
        ON CONFLICT (team_id, user_id) DO NOTHING
      `, [teamId]);
      
      console.log('✅ Teams created\n');
    }

    // 5. Create sample project
    console.log('📊 Creating sample project...');
    const adminUser = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    
    if (adminUser.rows.length > 0) {
      const adminId = adminUser.rows[0].id;
      
      await pool.query(`
        INSERT INTO projects (name, description, status, priority, owner_id, start_date, expected_completion)
        VALUES (
          'Dự án Solar Farm Bình Thuận',
          'Xây dựng trang trại điện mặt trời công suất 50MW tại Bình Thuận',
          'active',
          'high',
          $1,
          CURRENT_DATE,
          CURRENT_DATE + INTERVAL '6 months'
        )
        ON CONFLICT DO NOTHING
      `, [adminId]);
      
      console.log('✅ Sample project created\n');
    }

    console.log('🎉 Database seeding completed!\n');
    console.log('📋 Created:');
    console.log('  - Admin user: admin / admin000');
    console.log('  - 4 sample users (password: password123)');
    console.log('  - Notification preferences');
    console.log('  - Sample team');
    console.log('  - Sample project');
    console.log('\n🚀 You can now start using the application!');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
