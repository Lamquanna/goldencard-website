import { NextRequest, NextResponse } from 'next/server';
import { calculateSolarSystem, type CalculatorInput } from '@/sanity/services/calculatorService';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CalculatorInput;

    // Validate input
    if (!body.monthlyBill || body.monthlyBill < 100000) {
      return NextResponse.json(
        { error: 'Invalid monthly bill. Minimum: 100,000 VND' },
        { status: 400 }
      );
    }

    // Calculate system
    const result = await calculateSolarSystem(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ Calculator API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
