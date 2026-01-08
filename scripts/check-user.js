#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

async function checkUser() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: true
  });

  try {
    const username = process.argv[2] || 'ges005';
    
    const result = await pool.query(`
      SELECT username, full_name, email, role, employee_code, password
      FROM erp_users 
      WHERE username = $1
    `, [username]);

    if (result.rows.length === 0) {
      console.log(`❌ User ${username} not found`);
    } else {
      console.log(`✅ User ${username} info:`);
      console.log(JSON.stringify(result.rows[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUser();
