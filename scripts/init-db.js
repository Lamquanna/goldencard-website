/**
 * Database Initialization Script
 * Run: node scripts/init-db.js
 */

import { sql, initDatabase, migrateUsers } from '../lib/db.ts';

async function main() {
  try {
    console.log('🚀 Initializing database...');
    
    // Create tables
    await initDatabase();
    
    // Migrate users
    await migrateUsers();
    
    console.log('✅ Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

main();
