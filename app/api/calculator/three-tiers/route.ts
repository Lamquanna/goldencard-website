import { NextRequest, NextResponse } from 'next/server';
import { calculateThreeTiers } from '@/sanity/services/threeTierCalculatorService';

/**
 * POST /api/calculator/three-tiers
 * Body: { monthlyBill: number, systemType?: 'grid-tied' | 'hybrid' }
 * Response: ThreeTierResult with budget/standard/premium recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { monthlyBill, systemType = 'grid-tied' } = body;

    // Validation
    if (!monthlyBill || typeof monthlyBill !== 'number' || monthlyBill <= 0) {
      return NextResponse.json(
        { error: 'Invalid monthlyBill. Must be a positive number.' },
        { status: 400 }
      );
    }

    if (systemType && !['grid-tied', 'hybrid'].includes(systemType)) {
      return NextResponse.json(
        { error: 'Invalid systemType. Must be "grid-tied" or "hybrid".' },
        { status: 400 }
      );
    }

    console.log(`📊 Three-tier calculation request: ₫${monthlyBill.toLocaleString()} (${systemType})`);

    // Calculate 3 tiers
    const result = await calculateThreeTiers(monthlyBill, systemType);

    console.log(`✅ Three-tier calculation complete: ${result.systemSize.toFixed(2)}kWp`);
    console.log(`   💰 Budget: ₫${result.tiers.budget.totalInvestment.toLocaleString()}`);
    console.log(`   ⭐ Standard: ₫${result.tiers.standard.totalInvestment.toLocaleString()}`);
    console.log(`   👑 Premium: ₫${result.tiers.premium.totalInvestment.toLocaleString()}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Three-tier calculator API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate three-tier system',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
