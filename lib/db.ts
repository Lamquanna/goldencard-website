import { neon } from '@neondatabase/serverless';

// Allow building without DATABASE_URL (will use fallback in API routes)
const DATABASE_URL = process.env.DATABASE_URL || '';

export const sql = DATABASE_URL ? neon(DATABASE_URL) : null as any;

// Database initialization
export async function initDatabase() {
  // Create crm_users table (avoid 'user' reserved keyword)
  await sql`
    CREATE TABLE IF NOT EXISTS crm_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create leads table
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      company VARCHAR(255),
      message TEXT,
      status VARCHAR(50) DEFAULT 'new',
      assigned_to VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_viewed_at TIMESTAMP,
      unread BOOLEAN DEFAULT TRUE
    )
  `;

  // Create messages table
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
      sender VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      is_customer BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create events table
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
      username VARCHAR(50) NOT NULL,
      action VARCHAR(100) NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  console.log('✅ Database tables created successfully');
}

// Migrate existing users to database
export async function migrateUsers() {
  const defaultUsers = [
    {
      username: 'admin',
      password: 'admin000',
      role: 'admin',
      email: 'sales@goldenenergy.vn',
    },
    {
      username: 'sale',
      password: 'Goldencard',
      role: 'sale',
      email: '',
    },
  ];

  for (const user of defaultUsers) {
    await sql`
      INSERT INTO crm_users (username, password, role, email)
      VALUES (${user.username}, ${user.password}, ${user.role}, ${user.email})
      ON CONFLICT (username) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        email = EXCLUDED.email,
        updated_at = CURRENT_TIMESTAMP
    `;
  }

  console.log('✅ Users migrated successfully');
}
