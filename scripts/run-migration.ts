/**
 * Database Migration Runner
 * Run: npm run migrate
 * Applies FIX_leads_schema_2026-01-14.sql
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'database', 'migrations', 'FIX_leads_schema_2026-01-14.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration: FIX_leads_schema_2026-01-14.sql');
    console.log('─'.repeat(60));

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.startsWith('COMMENT ON')) {
        console.log(`⏭️  Skipping comment statement ${i + 1}/${statements.length}`);
        continue;
      }

      try {
        console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
        await sql(statement);
        console.log(`✅ Statement ${i + 1} completed\n`);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists') || 
            error.message?.includes('does not exist')) {
          console.log(`⚠️  Warning: ${error.message}\n`);
        } else {
          throw error;
        }
      }
    }

    // Verify the table structure
    console.log('─'.repeat(60));
    console.log('📊 Verifying leads table structure...\n');
    
    const columns = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'leads'
      ORDER BY ordinal_position
    `;

    console.log('Columns in leads table:');
    console.table(columns);

    // Test insert
    console.log('\n🧪 Testing lead creation...');
    const testLead = await sql`
      INSERT INTO leads (
        first_name,
        last_name,
        email,
        phone,
        company_name,
        description,
        source,
        status,
        temperature
      ) VALUES (
        'Test',
        'User',
        'test@example.com',
        '0901234567',
        'Test Company',
        'Migration test lead',
        'migration-test',
        'new',
        'warm'
      )
      RETURNING id, lead_number, full_name, company_name, created_at
    `;

    console.log('✅ Test lead created successfully:');
    console.table(testLead);

    // Clean up test lead
    await sql`DELETE FROM leads WHERE source = 'migration-test'`;
    console.log('🧹 Test lead cleaned up\n');

    console.log('─'.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('─'.repeat(60));

  } catch (error: any) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runMigration();
