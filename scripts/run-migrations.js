#!/usr/bin/env node

/**
 * Database Migration Runner
 * Runs all SQL migrations in the correct order
 * 
 * Usage:
 *   npm install pg dotenv  # Install dependencies first
 *   node scripts/run-migrations.js
 *   
 * Or with npm:
 *   npm run db:migrate:full
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
  console.warn('⚠️  dotenv not found. Install it with: npm install dotenv');
  console.warn('Make sure environment variables are set in your shell.');
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env.local');
  console.error('Please set up your database connection string.');
  console.error('See DATABASE_SETUP.md for instructions.');
  process.exit(1);
}

// Migration files in order
const migrations = [
  '000_users_auth.sql',
  '001_project_management.sql',
  '002_inventory_warehouse.sql',
  '003_attendance_hr.sql',
  '004_automations_rules.sql',
  '005_leads_crm.sql',
  '006_projects_tasks.sql',
  '007_analytics.sql',
  '008_realtime_features.sql'
];

async function runMigrations() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  console.log('🚀 Starting database migrations...\n');

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Run each migration
    for (const migration of migrations) {
      const filePath = join(__dirname, '..', 'database', 'migrations', migration);
      
      try {
        console.log(`📝 Running migration: ${migration}`);
        const sql = readFileSync(filePath, 'utf8');
        
        await pool.query(sql);
        
        console.log(`✅ Completed: ${migration}\n`);
      } catch (error) {
        console.error(`❌ Error in ${migration}:`);
        console.error(error.message);
        
        if (error.message.includes('already exists')) {
          console.log('⚠️  Skipping (already exists)\n');
          continue;
        }
        
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');
    console.log('\n📊 Next steps:');
    console.log('1. Seed initial data (see DATABASE_SETUP.md)');
    console.log('2. Update client components to use real data');
    console.log('3. Test real-time features');
    
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
