import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🚀 Running leads table migration...\n');

  try {
    // Step 1: Drop existing leads table
    console.log('1️⃣  Dropping existing leads table...');
    await sql`DROP TABLE IF EXISTS leads CASCADE`;
    console.log('✅ Old table dropped\n');

    // Step 2: Create new leads table with correct schema
    console.log('2️⃣  Creating new leads table with correct schema...');
    await sql`
      CREATE TABLE leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_number VARCHAR(20) UNIQUE,
        title VARCHAR(10),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(20),
        mobile VARCHAR(20),
        whatsapp VARCHAR(20),
        zalo VARCHAR(20),
        company_name VARCHAR(255),
        company_size VARCHAR(50),
        industry VARCHAR(100),
        job_title VARCHAR(100),
        website VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        province VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Vietnam',
        postal_code VARCHAR(20),
        source VARCHAR(100) DEFAULT 'manual',
        source_detail TEXT,
        stage VARCHAR(50) DEFAULT 'new',
        product_interest JSONB DEFAULT '[]',
        project_type VARCHAR(50),
        estimated_capacity DECIMAL(10,2),
        estimated_value DECIMAL(15,2),
        currency VARCHAR(3) DEFAULT 'VND',
        lead_score INTEGER DEFAULT 0,
        temperature VARCHAR(20) DEFAULT 'warm',
        status VARCHAR(50) DEFAULT 'new',
        priority VARCHAR(20) DEFAULT 'medium',
        assigned_to VARCHAR(50),
        description TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(50),
        last_contacted_at TIMESTAMP,
        next_follow_up TIMESTAMP,
        deleted_at TIMESTAMP,
        deleted_by VARCHAR(50)
      )
    `;
    console.log('✅ Table created\n');

    // Step 3: Create indexes
    console.log('3️⃣  Creating indexes...');
    await sql`CREATE INDEX idx_leads_email ON leads(email)`;
    await sql`CREATE INDEX idx_leads_phone ON leads(phone)`;
    await sql`CREATE INDEX idx_leads_company ON leads(company_name)`;
    await sql`CREATE INDEX idx_leads_status ON leads(status)`;
    await sql`CREATE INDEX idx_leads_created ON leads(created_at DESC)`;
    console.log('✅ Indexes created\n');

    // Step 4: Test insert
    console.log('4️⃣  Testing insert...');
    const result = await sql`
      INSERT INTO leads (
        first_name, last_name, email, phone, company_name, 
        description, source, status, temperature
      ) VALUES (
        'Test', 'User', 'test@example.com', '0901234567', 'Test Co',
        'Migration test', 'migration-test', 'new', 'warm'
      )
      RETURNING id, first_name, last_name, company_name, email
    `;
    console.log('✅ Test lead created:', result[0]);

    // Cleanup
    await sql`DELETE FROM leads WHERE source = 'migration-test'`;
    console.log('✅ Test data cleaned up\n');

    console.log('─'.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
