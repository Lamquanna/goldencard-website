import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// GeoIP detection using IP
async function getLocationFromIP(ip: string) {
  try {
    // Using ipapi.co free tier (1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'GoldenEnergy-Analytics/1.0' }
    });
    
    if (!response.ok) throw new Error('GeoIP API failed');
    
    const data = await response.json();
    
    return {
      countryCode: data.country_code || 'unknown',
      countryName: data.country_name || 'unknown',
      region: data.region || 'unknown',
      city: data.city || 'unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || 'unknown',
      isp: data.org || 'unknown',
      organization: data.org || 'unknown',
      isVpn: false, // Would need additional API for VPN detection
    };
  } catch (error) {
    console.error('GeoIP detection failed:', error);
    return {
      countryCode: 'unknown',
      countryName: 'unknown',
      region: 'unknown',
      city: 'unknown',
      latitude: 0,
      longitude: 0,
      timezone: 'unknown',
      isp: 'unknown',
      organization: 'unknown',
      isVpn: false,
    };
  }
}

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

function getClientIP(request: NextRequest): string {
  // Try different headers in order of preference
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to localhost for development
  return '127.0.0.1';
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);
    
    // Get location data
    const locationData = await getLocationFromIP(clientIP);
    
    // Detect device type from User-Agent
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    
    return NextResponse.json({
      ipAddressHash: ipHash,
      isMobile,
      ...locationData,
    });
  } catch (error) {
    console.error('Location API error:', error);
    return NextResponse.json(
      { error: 'Failed to get location data' },
      { status: 500 }
    );
  }
}
