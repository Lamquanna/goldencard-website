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
export interface CalculatorInput {
  monthlyBill: number; // VND
  roofArea?: number; // m² (optional for validation)
  systemType?: 'grid-tied' | 'hybrid'; // default: grid-tied
}

export interface ProductRecommendation {
  inverter: {
    _id: string;
    name: string;
    brand: string;
    model: string;
    capacity: number; // W
    efficiency: number; // %
    price: number; // VND
    warranty: number; // years
    imageUrl?: string;
  } | null;
  panels: {
    _id: string;
    name: string;
    brand: string;
    model: string;
    capacity: number; // W per panel
    efficiency: number; // %
    price: number; // VND per panel
    warranty: number; // years
    imageUrl?: string;
    quantity: number; // number of panels needed
    totalPrice: number; // total price for all panels
  } | null;
  battery?: {
    _id: string;
    name: string;
    brand: string;
    model: string;
    capacity: number; // Wh
    price: number; // VND
    warranty: number; // years
    imageUrl?: string;
  } | null;
}

export interface CalculatorResult {
  systemSize: number; // kWp
  monthlyProduction: number; // kWh
  monthlySavings: number; // VND
  paybackPeriod: number; // years
  totalInvestment: number; // VND
  products: ProductRecommendation;
  fallbackMessage?: string; // For edge cases
}

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================
export async function calculateSolarSystem(
  input: CalculatorInput
): Promise<CalculatorResult> {
  try {
    // Step 1: Calculate required system size (kWp)
    const monthlyConsumption = input.monthlyBill / VIETNAM_CONSTANTS.ELECTRICITY_RATE; // kWh/month
    const dailyConsumption = monthlyConsumption / 30; // kWh/day
    const systemSize =
      dailyConsumption /
      (VIETNAM_CONSTANTS.PEAK_SUN_HOURS * VIETNAM_CONSTANTS.SYSTEM_EFFICIENCY); // kWp

    console.log(`💡 Calculated System Size: ${systemSize.toFixed(2)} kWp`);

    // Step 2: Query CMS for products
    const products = await queryProducts(systemSize, input.systemType || 'grid-tied');

    // Step 3: Calculate financial metrics
    const monthlyProduction = systemSize * VIETNAM_CONSTANTS.PEAK_SUN_HOURS * 30; // kWh/month
    const monthlySavings = Math.min(monthlyProduction, monthlyConsumption) * VIETNAM_CONSTANTS.ELECTRICITY_RATE;

    // Calculate total investment
    let totalInvestment = 0;
    if (products.inverter) totalInvestment += products.inverter.price;
    if (products.panels) totalInvestment += products.panels.totalPrice;
    if (products.battery) totalInvestment += products.battery.price;

    const paybackPeriod = totalInvestment > 0 ? totalInvestment / (monthlySavings * 12) : 0; // years

    // Step 4: Check for edge cases
    let fallbackMessage: string | undefined;
    if (systemSize > 100) {
      fallbackMessage =
        'Hệ thống công suất lớn (>100kW). Vui lòng liên hệ hotline 0333 314 288 để được tư vấn chi tiết về giải pháp công nghiệp.';
    } else if (!products.inverter || !products.panels) {
      fallbackMessage =
        'Hiện chưa có sản phẩm phù hợp trong kho. Vui lòng liên hệ 0333 314 288 hoặc 0903 117 277 để được tư vấn sản phẩm thay thế.';
    }

    return {
      systemSize,
      monthlyProduction,
      monthlySavings,
      paybackPeriod,
      totalInvestment,
      products,
      fallbackMessage,
    };
  } catch (error) {
    console.error('❌ Calculator service error:', error);
    throw new Error('Failed to calculate solar system');
  }
}

// ============================================
// QUERY PRODUCTS FROM SANITY CMS
// ============================================
async function queryProducts(
  systemSize: number,
  systemType: 'grid-tied' | 'hybrid'
): Promise<ProductRecommendation> {
  const systemSizeWatts = systemSize * 1000; // Convert kWp to Watts

  try {
    // Query 1: Find suitable inverter (smallest capacity >= system size)
    const inverterQuery = `*[
      _type == "product" && 
      (category == "inverter" || category == "inverters") && 
      techSpecs.capacity >= $systemSize &&
      inStock == true
    ] | order(techSpecs.capacity asc) [0] {
      _id,
      name,
      brand,
      model,
      "capacity": techSpecs.capacity,
      "efficiency": techSpecs.efficiency,
      "warranty": techSpecs.warrantyYears,
      price,
      "imageUrl": coalesce(mainImage.asset->url, image.asset->url)
    }`;

    const inverter = await client.fetch(inverterQuery, { systemSize: systemSizeWatts });

    console.log(`🔌 Found Inverter: ${inverter?.name || 'None'}`);

    // Query 2: Find solar panels (most popular, highest efficiency)
    const panelQuery = `*[
      _type == "product" && 
      (category == "solar-panel" || category == "panels") && 
      inStock == true
    ] | order(techSpecs.efficiency desc) [0] {
      _id,
      name,
      brand,
      model,
      "capacity": techSpecs.capacity,
      "efficiency": techSpecs.efficiency,
      "warranty": techSpecs.warrantyYears,
      price,
      "imageUrl": coalesce(mainImage.asset->url, image.asset->url)
    }`;

    const panel = await client.fetch(panelQuery);

    let panelsResult = null;
    if (panel) {
      const panelCount = Math.ceil(systemSizeWatts / panel.capacity);
      panelsResult = {
        ...panel,
        quantity: panelCount,
        totalPrice: panel.price * panelCount,
      };
      console.log(`☀️ Found Panel: ${panel.name} x ${panelCount}`);
    }

    // Query 3: Find battery (if hybrid system)
    let battery = null;
    if (systemType === 'hybrid') {
      const requiredBatteryCapacity =
        systemSizeWatts * VIETNAM_CONSTANTS.BATTERY_HOURS; // Wh

      const batteryQuery = `*[
        _type == "product" && 
        (category == "battery" || category == "batteries") && 
        techSpecs.capacity >= $minCapacity &&
        inStock == true
      ] | order(techSpecs.capacity asc) [0] {
        _id,
        name,
        brand,
        model,
        "capacity": techSpecs.capacity,
        "warranty": techSpecs.warrantyYears,
        price,
        "imageUrl": coalesce(mainImage.asset->url, image.asset->url)
      }`;

      battery = await client.fetch(batteryQuery, {
        minCapacity: requiredBatteryCapacity,
      });

      console.log(`🔋 Found Battery: ${battery?.name || 'None'}`);
    }

    return {
      inverter,
      panels: panelsResult,
      battery,
    };
  } catch (error) {
    console.error('❌ Failed to query products:', error);
    return {
      inverter: null,
      panels: null,
      battery: undefined,
    };
  }
}

// ============================================
// HELPER: GENERATE CONTACT MESSAGE
// ============================================
export function generateContactMessage(result: CalculatorResult): string {
  const { systemSize, products } = result;

  let message = `Tôi quan tâm đến hệ thống điện mặt trời ${systemSize.toFixed(1)}kWp gồm:\n\n`;

  if (products.inverter) {
    message += `🔌 Biến tần: ${products.inverter.brand} ${products.inverter.model} (${products.inverter.capacity / 1000}kW)\n`;
  }

  if (products.panels) {
    message += `☀️ Tấm pin: ${products.panels.quantity} tấm ${products.panels.brand} ${products.panels.model} (${products.panels.capacity}W)\n`;
  }

  if (products.battery) {
    message += `🔋 Pin lưu trữ: ${products.battery.brand} ${products.battery.model} (${products.battery.capacity / 1000}kWh)\n`;
  }

  message += `\n💰 Tổng đầu tư ước tính: ${formatVND(result.totalInvestment)}\n`;
  message += `💵 Tiết kiệm hàng tháng: ${formatVND(result.monthlySavings)}\n`;
  message += `⏱️ Thời gian hoàn vốn: ${result.paybackPeriod.toFixed(1)} năm\n\n`;
  message += `Vui lòng tư vấn chi tiết và báo giá chính xác cho tôi.`;

  return encodeURIComponent(message);
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
