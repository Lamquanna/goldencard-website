import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // TEMPORARY: Bypass authentication for local testing with mock data
  // Comment this line out when Supabase is setup in production
  return NextResponse.next();
}

export const config = {
  matcher: ["/crm/:path*"],
};
