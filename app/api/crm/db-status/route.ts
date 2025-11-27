import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET - Check database connection status
export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ 
        status: 'fallback',
        mode: 'In-Memory Users',
        message: 'DATABASE_URL not configured. Using fallback in-memory users.',
        databaseUrl: process.env.DATABASE_URL ? 'Set but invalid' : 'Not set',
      });
    }

    // Try to query database
    const result = await sql`SELECT COUNT(*) as count FROM crm_users`;
    const users = await sql`SELECT username, role, email, created_at FROM crm_users ORDER BY created_at DESC`;
    
    return NextResponse.json({ 
      status: 'connected',
      mode: 'Neon PostgreSQL',
      message: 'Database connected successfully',
      database: {
        type: 'PostgreSQL',
        provider: 'Neon',
        userCount: result[0].count,
        users: users.map((u: any) => ({
          username: u.username,
          role: u.role,
          email: u.email,
          created: u.created_at
        }))
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      mode: 'Fallback Mode',
      message: 'Database connection failed. Using in-memory users.',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set but connection failed' : 'Not set',
    }, { status: 500 });
  }
}
