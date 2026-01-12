import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per minute
  const identifier = getClientIdentifier(request);
  const rateCheck = rateLimiters.strict.check(identifier);
  
  if (!rateCheck.allowed) {
    const retryAfter = Math.ceil((rateCheck.resetTime - Date.now()) / 1000);
    return NextResponse.json(
      { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
        }
      }
    );
  }
  try {
    const data = await request.formData()
    
    // Basic spam protection
    const honeypot = data.get("honeypot")
    if (honeypot) {
      console.warn("🚫 Spam detected - honeypot filled")
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    
    // Get form data
    const name = data.get("name") as string
    const email = data.get("email") as string
    const phone = data.get("phone") as string
    const company = data.get("company") as string
    const message = data.get("message") as string
    const locale = data.get("locale") as string
    
    // Validate required fields
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }
    
    // Get user agent for device detection
    const userAgent = request.headers.get('user-agent') || '';
    const deviceType = userAgent.includes('Mobile') ? 'mobile' : 
                       userAgent.includes('Tablet') ? 'tablet' : 'desktop';
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Log submission
    console.info("📧 New contact form submission:", {
      name,
      email,
      phone,
      company,
      message: message.substring(0, 100) + "...",
      locale,
      timestamp: new Date().toISOString()
    });
    
    // ✅ SAVE TO REAL DATABASE (PostgreSQL via Neon)
    try {
      if (!sql) {
        throw new Error('Database not configured');
      }

      // Create lead in database
      const result = await sql`
        INSERT INTO leads (
          name, email, phone, company, message,
          status, assigned_to, created_at, updated_at, unread
        ) VALUES (
          ${name},
          ${email},
          ${phone},
          ${company || null},
          ${message},
          'new',
          NULL,
          NOW(),
          NOW(),
          true
        )
        RETURNING id
      `;

      const leadId = result[0]?.id;
      console.info('✅ Lead saved to database with ID:', leadId);

      return NextResponse.json({ 
        ok: true,
        message: "Form submitted successfully",
        leadId: leadId
      });
    } catch (dbError: any) {
      console.error('❌ Database save failed:', dbError);
      
      // Return error to user if database fails
      return NextResponse.json(
        { 
          error: "Failed to save contact information. Please try again.",
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error processing contact form:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export function GET() {
  return NextResponse.json({ 
    message: "Contact API - Use POST to submit form",
    authenticated: false 
  })
}
