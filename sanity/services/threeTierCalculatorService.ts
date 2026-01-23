import { client } from '@/sanity/lib/client';

// ============================================
// VIETNAM MARKET CONSTANTS
// ============================================
const VIETNAM_CONSTANTS = {
  ELECTRICITY_RATE: 2000, // VND/kWh (average residential rate)
  PEAK_SUN_HOURS: 4, // hours/day (Vietnam average)
  SYSTEM_EFFICIENCY: 0.8, // 80% efficiency (inverter losses, temperature, wiring)
  BATTERY_HOURS: 2, // 2 hours of battery backup for hybrid systems
} as const;

// ============================================
// INTERFACES
// ============================================
export interface TierProduct {
  _id: string;
  name: string;
  brand: string;
  model: string;
  capacity: number;
  efficiency: number;
  warranty: number;
  price: number;
  imageUrl?: string;
  brandOrigin?: string;
}

export interface TierRecommendation {
  tier: 'budget' | 'standard' | 'premium';
  tierLabel: string;
  tierEmoji: string;
  inverter: TierProduct | null;
  panels: (TierProduct & { quantity: number; totalPrice: number }) | null;
  battery: TierProduct | null;
  totalInvestment: number;
  monthlySavings: number;
  paybackPeriod: number;
  lifeTimeSavings: number; // 25 years
  roi: number; // %
  features: string[]; // Key selling points for this tier
}

export interface ThreeTierResult {
  systemSize: number; // kWp
  monthlyProduction: number; // kWh
  tiers: {
    budget: TierRecommendation;
    standard: TierRecommendation;
    premium: TierRecommendation;
  };
  comparisonMessage: string;
}

// ============================================
// MAIN 3-TIER CALCULATION FUNCTION
// ============================================
export async function calculateThreeTiers(
  monthlyBill: number,
  systemType: 'grid-tied' | 'hybrid' = 'grid-tied'
): Promise<ThreeTierResult> {
  try {
    // Step 1: Calculate required system size
    const monthlyConsumption = monthlyBill / VIETNAM_CONSTANTS.ELECTRICITY_RATE;
    const dailyConsumption = monthlyConsumption / 30;
    const systemSize =
      dailyConsumption /
      (VIETNAM_CONSTANTS.PEAK_SUN_HOURS * VIETNAM_CONSTANTS.SYSTEM_EFFICIENCY);

    console.log(`💡 System Size: ${systemSize.toFixed(2)} kWp for ₫${monthlyBill.toLocaleString()} bill`);

    // Step 2: Query products for all 3 tiers simultaneously
    const [budgetProducts, standardProducts, premiumProducts] = await Promise.all([
      queryProductsByTier(systemSize, 'budget', systemType),
      queryProductsByTier(systemSize, 'standard', systemType),
      queryProductsByTier(systemSize, 'premium', systemType),
    ]);

    // Step 3: Calculate monthly production (same for all tiers)
    const monthlyProduction = systemSize * VIETNAM_CONSTANTS.PEAK_SUN_HOURS * 30;
    const baseMonthlySavings = Math.min(monthlyProduction, monthlyConsumption) * VIETNAM_CONSTANTS.ELECTRICITY_RATE;

    // Step 4: Build tier recommendations
    const budget = buildTierRecommendation('budget', budgetProducts, baseMonthlySavings, systemSize);
    const standard = buildTierRecommendation('standard', standardProducts, baseMonthlySavings, systemSize);
    const premium = buildTierRecommendation('premium', premiumProducts, baseMonthlySavings, systemSize);

    return {
      systemSize,
      monthlyProduction,
      tiers: { budget, standard, premium },
      comparisonMessage: generateComparisonMessage(budget, standard, premium),
    };
  } catch (error) {
    console.error('❌ Three-tier calculator error:', error);
    throw new Error('Failed to calculate three-tier system');
  }
}

// ============================================
// QUERY PRODUCTS BY TIER
// ============================================
async function queryProductsByTier(
  systemSize: number,
  tier: 'budget' | 'standard' | 'premium',
  systemType: 'grid-tied' | 'hybrid'
): Promise<{
  inverter: TierProduct | null;
  panels: TierProduct | null;
  battery: TierProduct | null;
}> {
  const systemSizeWatts = systemSize * 1000;

  try {
    // Query inverter
    const inverterQuery = `*[
      _type == "product" && 
      category == "inverter" && 
      tier == $tier &&
      techSpecs.capacity >= $systemSize &&
      inStock == true
    ] | order(techSpecs.capacity asc) [0] {
      _id, name, brand, model, brandOrigin,
      "capacity": techSpecs.capacity,
      "efficiency": techSpecs.efficiency,
      "warranty": techSpecs.warrantyYears,
      price,
      "imageUrl": mainImage.asset->url
    }`;

    const inverter = await client.fetch(inverterQuery, { tier, systemSize: systemSizeWatts });

    // Query solar panels
    const panelQuery = `*[
      _type == "product" && 
      category == "solar-panel" && 
      tier == $tier &&
      inStock == true
    ] | order(techSpecs.efficiency desc, price asc) [0] {
      _id, name, brand, model, brandOrigin,
      "capacity": techSpecs.capacity,
      "efficiency": techSpecs.efficiency,
      "warranty": techSpecs.warrantyYears,
      price,
      "imageUrl": mainImage.asset->url
    }`;

    const panel = await client.fetch(panelQuery, { tier });

    // Query battery (if hybrid)
    let battery = null;
    if (systemType === 'hybrid') {
      const requiredBatteryCapacity = systemSizeWatts * VIETNAM_CONSTANTS.BATTERY_HOURS;

      const batteryQuery = `*[
        _type == "product" && 
        category == "battery" && 
        tier == $tier &&
        techSpecs.capacity >= $minCapacity &&
        inStock == true
      ] | order(techSpecs.capacity asc, price asc) [0] {
        _id, name, brand, model, brandOrigin,
        "capacity": techSpecs.capacity,
        "warranty": techSpecs.warrantyYears,
        price,
        "imageUrl": mainImage.asset->url
      }`;

      battery = await client.fetch(batteryQuery, { tier, minCapacity: requiredBatteryCapacity });
    }

    console.log(`✅ ${tier.toUpperCase()}: Inverter=${inverter?.brand || 'None'}, Panel=${panel?.brand || 'None'}, Battery=${battery?.brand || 'None'}`);

    return { inverter, panels: panel, battery };
  } catch (error) {
    console.error(`❌ Failed to query ${tier} tier:`, error);
    return { inverter: null, panels: null, battery: null };
  }
}

// ============================================
// BUILD TIER RECOMMENDATION
// ============================================
function buildTierRecommendation(
  tier: 'budget' | 'standard' | 'premium',
  products: { inverter: TierProduct | null; panels: TierProduct | null; battery: TierProduct | null },
  baseMonthlySavings: number,
  systemSize: number
): TierRecommendation {
  const tierLabels = {
    budget: '💰 Giá rẻ - Tiết kiệm',
    standard: '⭐ Phổ thông - Tin cậy',
    premium: '👑 VIP - Cao cấp',
  };

  const tierEmojis = {
    budget: '💰',
    standard: '⭐',
    premium: '👑',
  };

  // Calculate total investment
  let totalInvestment = 0;
  let panels = null;

  if (products.inverter) totalInvestment += products.inverter.price;

  if (products.panels) {
    const panelCount = Math.ceil((systemSize * 1000) / products.panels.capacity);
    const totalPanelPrice = products.panels.price * panelCount;
    totalInvestment += totalPanelPrice;

    panels = {
      ...products.panels,
      quantity: panelCount,
      totalPrice: totalPanelPrice,
    };
  }

  if (products.battery) totalInvestment += products.battery.price;

  // Adjust monthly savings based on efficiency
  const efficiencyMultiplier = tier === 'budget' ? 0.95 : tier === 'standard' ? 1.0 : 1.05;
  const monthlySavings = baseMonthlySavings * efficiencyMultiplier;

  // Calculate ROI metrics
  const paybackPeriod = totalInvestment > 0 ? totalInvestment / (monthlySavings * 12) : 0;
  const lifeTimeSavings = monthlySavings * 12 * 25 - totalInvestment; // 25 years
  const roi = totalInvestment > 0 ? ((lifeTimeSavings / totalInvestment) * 100) : 0;

  // Tier-specific features
  const features = getTierFeatures(tier, products);

  return {
    tier,
    tierLabel: tierLabels[tier],
    tierEmoji: tierEmojis[tier],
    inverter: products.inverter,
    panels,
    battery: products.battery,
    totalInvestment,
    monthlySavings,
    paybackPeriod,
    lifeTimeSavings,
    roi,
    features,
  };
}

// ============================================
// GET TIER-SPECIFIC FEATURES
// ============================================
function getTierFeatures(
  tier: 'budget' | 'standard' | 'premium',
  products: { inverter: TierProduct | null; panels: TierProduct | null; battery: TierProduct | null }
): string[] {
  const budgetFeatures = [
    '✅ Giá cả cạnh tranh nhất',
    '✅ Phù hợp ngân sách hạn chế',
    '✅ Bảo hành 5-12 năm',
    '✅ Hoàn vốn nhanh',
    '⚠️ Hiệu suất trung bình',
  ];

  const standardFeatures = [
    '✅ Thương hiệu uy tín (Longi, Huawei)',
    '✅ Hiệu suất cao 97-98%',
    '✅ Bảo hành 10-15 năm',
    '✅ Cân bằng giá-chất lượng tốt',
    '✅ Lựa chọn phổ biến nhất',
  ];

  const premiumFeatures = [
    '🌟 Công nghệ hàng đầu thế giới',
    '🌟 Hiệu suất cực cao 99%+',
    '🌟 Bảo hành 12-25 năm',
    '🌟 Độ bền vượt trội',
    '🌟 Thiết kế sang trọng',
    '🌟 Giá trị tài sản cao',
  ];

  const tierFeatures = {
    budget: budgetFeatures,
    standard: standardFeatures,
    premium: premiumFeatures,
  };

  return tierFeatures[tier];
}

// ============================================
// GENERATE COMPARISON MESSAGE
// ============================================
function generateComparisonMessage(
  budget: TierRecommendation,
  standard: TierRecommendation,
  premium: TierRecommendation
): string {
  const budgetPrice = formatVND(budget.totalInvestment);
  const standardPrice = formatVND(standard.totalInvestment);
  const premiumPrice = formatVND(premium.totalInvestment);

  return `
So sánh 3 phân khúc:

💰 BUDGET: ${budgetPrice}
   Hoàn vốn: ${budget.paybackPeriod.toFixed(1)} năm
   Tiết kiệm 25 năm: ${formatVND(budget.lifeTimeSavings)}

⭐ STANDARD: ${standardPrice}
   Hoàn vốn: ${standard.paybackPeriod.toFixed(1)} năm
   Tiết kiệm 25 năm: ${formatVND(standard.lifeTimeSavings)}

👑 PREMIUM: ${premiumPrice}
   Hoàn vốn: ${premium.paybackPeriod.toFixed(1)} năm
   Tiết kiệm 25 năm: ${formatVND(premium.lifeTimeSavings)}

💡 Khuyến nghị: Gói STANDARD là lựa chọn cân bằng nhất về giá và chất lượng.
  `.trim();
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================
// GENERATE WHATSAPP MESSAGE FOR TIER
// ============================================
export function generateTierContactMessage(tier: TierRecommendation, systemSize: number): string {
  let message = `🌞 Tôi quan tâm đến gói *${tier.tierLabel}* cho hệ thống ${systemSize.toFixed(1)}kWp:\n\n`;

  if (tier.inverter) {
    message += `🔌 *Biến tần*: ${tier.inverter.brand} ${tier.inverter.model}\n`;
    message += `   📊 ${tier.inverter.capacity / 1000}kW | ${tier.inverter.efficiency}% | ${tier.inverter.warranty} năm BH\n\n`;
  }

  if (tier.panels) {
    message += `☀️ *Tấm pin*: ${tier.panels.quantity}x ${tier.panels.brand} ${tier.panels.model}\n`;
    message += `   📊 ${tier.panels.capacity}W/tấm | ${tier.panels.efficiency}% | ${tier.panels.warranty} năm BH\n\n`;
  }

  if (tier.battery) {
    message += `🔋 *Pin lưu trữ*: ${tier.battery.brand} ${tier.battery.model}\n`;
    message += `   📊 ${tier.battery.capacity / 1000}kWh | ${tier.battery.warranty} năm BH\n\n`;
  }

  message += `💰 *Tổng đầu tư*: ${formatVND(tier.totalInvestment)}\n`;
  message += `💵 *Tiết kiệm/tháng*: ${formatVND(tier.monthlySavings)}\n`;
  message += `⏱️ *Hoàn vốn*: ${tier.paybackPeriod.toFixed(1)} năm\n`;
  message += `📈 *Lợi nhuận 25 năm*: ${formatVND(tier.lifeTimeSavings)} (ROI: ${tier.roi.toFixed(0)}%)\n\n`;

  message += `Vui lòng tư vấn chi tiết và báo giá chính xác. Cảm ơn! 🙏`;

  return encodeURIComponent(message);
}
