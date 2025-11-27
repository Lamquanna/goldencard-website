import { NextResponse } from "next/server"
import { mockSupabase } from "@/lib/supabase/mock"

export async function POST(request: Request) {
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
    
    // ✅ SAVE TO CRM DATABASE
    try {
      const supabase = mockSupabase as any;
      
      // Create lead in CRM
      const leadData = {
        name,
        email,
        phone,
        company: company || null,
        message,
        source: 'website_contact_form',
        source_url: request.headers.get('referer') || 'direct',
        status: 'new',
        priority: 'medium',
        locale: locale || 'vi',
        device_type: deviceType,
        ip_address: ipAddress,
        browser: userAgent.slice(0, 200),
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
      };

      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (leadError) {
        console.error('❌ Error saving lead to CRM:', leadError);
        throw leadError;
      }

      console.info('✅ Lead saved to CRM with ID:', lead.id);

      // Create initial event
      await supabase
        .from('lead_events')
        .insert({
          lead_id: lead.id,
          event_type: 'created',
          description: `Lead created from website contact form`,
          metadata: {
            device: deviceType,
            ip: ipAddress,
            form_type: 'contact',
          },
        });

      console.info('✅ Lead event created');

      return NextResponse.json({ 
        ok: true,
        message: "Form submitted successfully",
        leadId: lead.id
      });
    } catch (crmError) {
      console.error('❌ CRM save failed, but form submission recorded:', crmError);
      // Still return success to user even if CRM fails
      return NextResponse.json({ 
        ok: true,
        message: "Form submitted successfully"
      });
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
