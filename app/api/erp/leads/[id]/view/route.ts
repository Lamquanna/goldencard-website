import { NextRequest, NextResponse } from "next/server";
import { mockSupabase } from "@/lib/supabase/mock";

// POST /api/crm/leads/[id]/view - Track when employee views a lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = mockSupabase as any;
    const body = await request.json();
    
    // Get current user (employee)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get employee details
    const { data: employee } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Record the view
    const { data: view, error: viewError } = await supabase
      .from("lead_views")
      .insert({
        lead_id: id,
        employee_id: user.id,
        employee_name: employee?.full_name || user.email,
        employee_email: user.email,
        page_url: body.page_url || "",
        device_type: body.device_type || "unknown",
        viewed_at: new Date().toISOString(),
      });

    if (viewError) {
      console.error("Error tracking view:", viewError);
      return NextResponse.json(
        { error: "Failed to track view" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, view });
  } catch (error) {
    console.error("Error in view tracking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
