/**
 * Solar Calculator Engine - Vietnam Context
 * Calculates solar system specifications, costs, and ROI based on Vietnamese market data
 */

export interface CalculatorInput {
  monthlyElectricBill: number; // VND
  roofLength: number; // m
  roofWidth: number; // m
  location: {
    province: string;
    lat: number;
    lng: number;
  };
  roofType: 'flat' | 'tilted' | 'mixed';
  shading: 'none' | 'partial' | 'significant';
}

export interface CalculatorOutput {
  recommendedCapacity: number; // kW
  estimatedCost: {
    min: number;
    max: number;
    currency: 'VND';
  };
  roi: {
    paybackPeriod: number; // years
    totalSavings25Years: number; // VND
    irr: number; // %
    monthlyProduction: number; // kWh
    monthlySavings: number; // VND
  };
  solutionType: 'residential' | 'commercial' | 'industrial';
  systemSpecs: {
    panelCount: number;
    inverterCapacity: number;
    batteryCapacity?: number;
    roofCoverage: number; // percentage
  };
  environmentalImpact: {
    co2Offset: number; // tons per year
    treesEquivalent: number;
  };
}

// Vietnam-specific constants (2025-2026 data)
export const VIETNAM_SOLAR_CONSTANTS = {
  // Average solar radiation by region (kWh/m²/day)
  solarRadiation: {
    north: 4.2, // Hà Nội, Hải Phòng
    central: 4.8, // Đà Nẵng, Huế
    south: 5.0, // TP.HCM, Cần Thơ
  } as const,

  // EVN electricity pricing (2025) - Bậc thang giá điện
  electricityPrice: {
    tier1: 1893, // 0-50 kWh
    tier2: 1956, // 51-100 kWh
    tier3: 2271, // 101-200 kWh
    tier4: 2615, // 201-300 kWh
    tier5: 2701, // 301-400 kWh
    tier6: 2814, // > 400 kWh
    average: 2500, // Simplified average for calculations
  } as const,

  // System costs (VND/kW installed) - Including equipment + installation
  systemCost: {
    residential: 15_000_000, // 15M VND/kW
    commercial: 13_000_000, // 13M VND/kW
    industrial: 11_000_000, // 11M VND/kW
  } as const,

  // Performance factors
  performanceFactor: 0.75, // 75% system efficiency (accounts for losses)
  degradationRate: 0.005, // 0.5% per year
  electricityInflation: 0.05, // 5% annual increase
  
  // Environmental constants
  co2PerKWh: 0.84, // kg CO2 per kWh (Vietnam grid average)
  kwhPerTree: 20, // kWh offset equivalent to 1 tree per year
} as const;

/**
 * Main calculation function
 */
export function calculateSolarSystem(input: CalculatorInput): CalculatorOutput {
  // Step 1: Calculate roof area from dimensions
  const roofArea = input.roofLength * input.roofWidth;
  
  // Step 2: Calculate monthly energy consumption from bill
  const monthlyConsumption = estimateMonthlyConsumption(input.monthlyElectricBill);

  // Step 3: Determine region & solar radiation
  const region = getRegion(input.location.province);
  const dailySolarRadiation = VIETNAM_SOLAR_CONSTANTS.solarRadiation[region];

  // Step 4: Calculate required system capacity
  const dailyEnergyNeeded = monthlyConsumption / 30;
  const systemCapacity = calculateCapacity(
    dailyEnergyNeeded,
    dailySolarRadiation,
    roofArea,
    input.shading
  );

  // Step 5: Determine solution type (residential/commercial/industrial)
  const solutionType = determineSolutionType(systemCapacity, monthlyConsumption);

  // Step 6: Calculate costs
  const costPerKW = VIETNAM_SOLAR_CONSTANTS.systemCost[solutionType];
  const totalCost = systemCapacity * costPerKW;

  // Step 7: Calculate ROI metrics
  const roi = calculateROI(
    systemCapacity,
    totalCost,
    monthlyConsumption,
    dailySolarRadiation
  );

  // Step 8: System specifications
  const systemSpecs = calculateSystemSpecs(systemCapacity, solutionType, roofArea);

  // Step 9: Environmental impact
  const environmentalImpact = calculateEnvironmentalImpact(
    systemCapacity,
    dailySolarRadiation
  );

  return {
    recommendedCapacity: Math.round(systemCapacity * 10) / 10,
    estimatedCost: {
      min: Math.round(totalCost * 0.9),
      max: Math.round(totalCost * 1.1),
      currency: 'VND',
    },
    roi,
    solutionType,
    systemSpecs,
    environmentalImpact,
  };
}

/**
 * Estimate monthly consumption from tiered electricity bill
 */
function estimateMonthlyConsumption(bill: number): number {
  const tiers = VIETNAM_SOLAR_CONSTANTS.electricityPrice;

  // Reverse engineer consumption from tiered pricing
  if (bill <= 50 * tiers.tier1) {
    return bill / tiers.tier1;
  }

  if (bill <= 50 * tiers.tier1 + 50 * tiers.tier2) {
    return 50 + (bill - 50 * tiers.tier1) / tiers.tier2;
  }

  if (bill <= 50 * tiers.tier1 + 50 * tiers.tier2 + 100 * tiers.tier3) {
    return 100 + (bill - 50 * tiers.tier1 - 50 * tiers.tier2) / tiers.tier3;
  }

  if (bill <= 50 * tiers.tier1 + 50 * tiers.tier2 + 100 * tiers.tier3 + 100 * tiers.tier4) {
    return 200 + (bill - 50 * tiers.tier1 - 50 * tiers.tier2 - 100 * tiers.tier3) / tiers.tier4;
  }

  if (bill <= 50 * tiers.tier1 + 50 * tiers.tier2 + 100 * tiers.tier3 + 100 * tiers.tier4 + 100 * tiers.tier5) {
    return 300 + (bill - 50 * tiers.tier1 - 50 * tiers.tier2 - 100 * tiers.tier3 - 100 * tiers.tier4) / tiers.tier5;
  }

  // Tier 6 (> 400 kWh)
  const tier6Base = 50 * tiers.tier1 + 50 * tiers.tier2 + 100 * tiers.tier3 + 100 * tiers.tier4 + 100 * tiers.tier5;
  return 400 + (bill - tier6Base) / tiers.tier6;
}

/**
 * Calculate required system capacity
 */
function calculateCapacity(
  dailyEnergy: number,
  solarRadiation: number,
  roofArea: number,
  shading: CalculatorInput['shading']
): number {
  const shadingFactor = shading === 'none' ? 1.0 : shading === 'partial' ? 0.85 : 0.7;

  // Maximum capacity based on roof area (approximately 7m² per kW)
  const maxCapacityByRoof = roofArea / 7;

  // Required capacity based on energy needs
  const requiredCapacity =
    (dailyEnergy / (solarRadiation * VIETNAM_SOLAR_CONSTANTS.performanceFactor)) * shadingFactor;

  // Return minimum of required and maximum possible
  return Math.min(requiredCapacity, maxCapacityByRoof);
}

/**
 * Determine solution type based on capacity and consumption
 */
function determineSolutionType(
  capacity: number,
  monthlyConsumption: number
): CalculatorOutput['solutionType'] {
  if (capacity <= 10 && monthlyConsumption <= 500) {
    return 'residential';
  }
  if (capacity <= 100 && monthlyConsumption <= 5000) {
    return 'commercial';
  }
  return 'industrial';
}

/**
 * Calculate ROI metrics (payback period, savings, IRR)
 */
function calculateROI(
  capacity: number,
  totalCost: number,
  monthlyConsumption: number,
  solarRadiation: number
) {
  const annualProduction =
    capacity * solarRadiation * 365 * VIETNAM_SOLAR_CONSTANTS.performanceFactor;

  // Cap annual production at consumption (no export assumed)
  const usableProduction = Math.min(annualProduction, monthlyConsumption * 12);

  const annualSavings = usableProduction * VIETNAM_SOLAR_CONSTANTS.electricityPrice.average;
  const paybackPeriod = totalCost / annualSavings;

  // Calculate 25-year savings with degradation and inflation
  let totalSavings = 0;
  for (let year = 1; year <= 25; year++) {
    const degradationFactor = Math.pow(1 - VIETNAM_SOLAR_CONSTANTS.degradationRate, year - 1);
    const inflationFactor = Math.pow(1 + VIETNAM_SOLAR_CONSTANTS.electricityInflation, year - 1);

    const yearlyProduction = usableProduction * degradationFactor;
    const yearlySavings =
      yearlyProduction * VIETNAM_SOLAR_CONSTANTS.electricityPrice.average * inflationFactor;

    totalSavings += yearlySavings;
  }

  const irr = calculateIRR(totalCost, annualSavings, 25);

  return {
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    totalSavings25Years: Math.round(totalSavings),
    irr: Math.round(irr * 100) / 100,
    monthlyProduction: Math.round((usableProduction / 12) * 10) / 10,
    monthlySavings: Math.round(annualSavings / 12),
  };
}

/**
 * Calculate Internal Rate of Return (IRR)
 */
function calculateIRR(initialInvestment: number, annualSavings: number, years: number): number {
  let rate = 0.1; // Start with 10%
  const tolerance = 1000; // VND
  const maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    let npv = -initialInvestment;

    for (let year = 1; year <= years; year++) {
      npv += annualSavings / Math.pow(1 + rate, year);
    }

    if (Math.abs(npv) < tolerance) {
      break;
    }

    // Adjust rate based on NPV
    rate += npv > 0 ? 0.01 : -0.01;

    // Prevent negative rates
    if (rate < 0) rate = 0.01;
  }

  return rate * 100; // Convert to percentage
}

/**
 * Calculate system specifications
 */
function calculateSystemSpecs(
  capacity: number,
  solutionType: CalculatorOutput['solutionType'],
  roofArea: number
) {
  // Panel wattage depends on solution type
  const panelWattage = solutionType === 'industrial' ? 550 : solutionType === 'commercial' ? 500 : 450;

  const panelCount = Math.ceil((capacity * 1000) / panelWattage);

  // Inverter capacity (20% oversizing for safety)
  const inverterCapacity = Math.round(capacity * 1.2 * 10) / 10;

  // Battery capacity (optional, 2 hours storage for residential)
  const batteryCapacity =
    solutionType === 'residential' ? Math.round(capacity * 2 * 10) / 10 : undefined;

  // Roof coverage
  const panelArea = (panelCount * panelWattage) / 200; // Approx 200W per m²
  const roofCoverage = Math.round((panelArea / roofArea) * 100);

  return {
    panelCount,
    inverterCapacity,
    batteryCapacity,
    roofCoverage: Math.min(roofCoverage, 100),
  };
}

/**
 * Calculate environmental impact
 */
function calculateEnvironmentalImpact(capacity: number, solarRadiation: number) {
  const annualProduction = capacity * solarRadiation * 365 * VIETNAM_SOLAR_CONSTANTS.performanceFactor;

  // CO2 offset in tons per year
  const co2Offset = Math.round((annualProduction * VIETNAM_SOLAR_CONSTANTS.co2PerKWh) / 1000 * 10) / 10;

  // Trees equivalent
  const treesEquivalent = Math.round(annualProduction / VIETNAM_SOLAR_CONSTANTS.kwhPerTree);

  return {
    co2Offset,
    treesEquivalent,
  };
}

/**
 * Get region from province name
 */
export function getRegion(province: string): 'north' | 'central' | 'south' {
  const provinceLower = province.toLowerCase();

  const northProvinces = [
    'hà nội',
    'hải phòng',
    'quảng ninh',
    'hải dương',
    'hưng yên',
    'bắc ninh',
    'vĩnh phúc',
    'thái nguyên',
    'lào cai',
  ];

  const centralProvinces = [
    'đà nẵng',
    'huế',
    'quảng nam',
    'quảng ngãi',
    'bình định',
    'phú yên',
    'khánh hòa',
    'ninh thuận',
    'bình thuận',
  ];

  if (northProvinces.some((p) => provinceLower.includes(p))) {
    return 'north';
  }

  if (centralProvinces.some((p) => provinceLower.includes(p))) {
    return 'central';
  }

  return 'south';
}

/**
 * Format currency to VND
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
}
