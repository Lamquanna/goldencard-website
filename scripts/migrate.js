#!/usr/bin/env node

/**
 * Database Migration Runner for Golden Energy Analytics
 * Runs SQL migration files on Vercel Postgres
 */

const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

// Support both POSTGRES_URL and DATABASE_URL
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
  console.log('ℹ️  Using DATABASE_URL as POSTGRES_URL\n');
}

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runMigration() {
  try {
    log('🚀 Starting database migration...', 'blue');
    log('='.repeat(60), 'blue');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'db', 'migrations', '001_create_analytics_tables.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    log(`📖 Reading migration file: ${migrationPath}`, 'yellow');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL into individual statements (basic split by semicolon)
    // Note: This is a simple approach. For production, consider using a proper SQL parser
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');

    log(`📋 Found ${statements.length} SQL statements to execute`, 'yellow');
    log('='.repeat(60), 'blue');

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const statementPreview = statement.substring(0, 100).replace(/\n/g, ' ');
      
      try {
        log(`\n[${i + 1}/${statements.length}] Executing: ${statementPreview}...`, 'yellow');
        
        await sql.query(statement);
        
        successCount++;
        log(`✅ Success`, 'green');
      } catch (error) {
        errorCount++;
        
        // Some errors are expected (e.g., "already exists")
        if (error.message.includes('already exists')) {
          log(`⚠️  Warning: ${error.message}`, 'yellow');
        } else {
          log(`❌ Error: ${error.message}`, 'red');
          console.error(error);
        }
      }
    }

    log('\n' + '='.repeat(60), 'blue');
    log('📊 Migration Summary:', 'bold');
    log(`   ✅ Successful: ${successCount}`, 'green');
    log(`   ❌ Errors: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
    log('='.repeat(60), 'blue');

    if (errorCount === 0) {
      log('🎉 Migration completed successfully!', 'green');
    } else {
      log('⚠️  Migration completed with some errors. Please review above.', 'yellow');
    }

    // Test connection by querying tables
    log('\n🔍 Verifying tables...', 'blue');
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE 'analytics_%'
      ORDER BY table_name;
    `;

    log(`\n📋 Analytics tables created:`, 'green');
    result.rows.forEach(row => {
      log(`   • ${row.table_name}`, 'green');
    });

    log('\n✨ Database schema is ready for analytics!', 'green');

  } catch (error) {
    log('\n❌ Migration failed:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run migration
runMigration()
  .then(() => {
    log('\n👋 Migration script completed.', 'blue');
    process.exit(0);
  })
  .catch((error) => {
    log('\n💥 Fatal error:', 'red');
    console.error(error);
    process.exit(1);
  });
