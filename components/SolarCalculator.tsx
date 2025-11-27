'use client';

import React, { useState } from 'react';

interface PanelType {
  label: string;
  labelVi: string;
  labelZh: string;
  wattage: number;
  efficiency: string;
  // Panel physical specifications
  lengthMm: number; // mm
  widthMm: number;  // mm
  weightKg: number; // kg
  category: 'standard' | 'high-power' | 'ultra-high-power';
}

interface InverterType {
  label: string;
  labelVi: string;
  labelZh: string;
  minCapacityKW: number;
  maxCapacityKW: number;
  type: 'string' | 'micro' | 'hybrid' | 'central';
  features: string[];
  featuresVi: string[];
  featuresZh: string[];
  recommendReason: string;
  recommendReasonVi: string;
  recommendReasonZh: string;
  brands: string[];
}

const PANEL_TYPES: PanelType[] = [
  // Standard panels (330W-450W)
  { 
    label: 'Polycrystalline 330W', 
    labelVi: 'Đa tinh thể 330W', 
    labelZh: '多晶硅 330W', 
    wattage: 330, 
    efficiency: '17%',
    lengthMm: 1956,
    widthMm: 992,
    weightKg: 22.5,
    category: 'standard'
  },
  { 
    label: 'Monocrystalline 450W', 
    labelVi: 'Đơn tinh thể 450W', 
    labelZh: '单晶硅 450W', 
    wattage: 450, 
    efficiency: '21%',
    lengthMm: 2094,
    widthMm: 1038,
    weightKg: 24,
    category: 'standard'
  },
  // High-power panels (500W-600W)
  { 
    label: 'Bifacial 500W', 
    labelVi: 'Song mặt 500W', 
    labelZh: '双面 500W', 
    wattage: 500, 
    efficiency: '22%',
    lengthMm: 2172,
    widthMm: 1048,
    weightKg: 26.5,
    category: 'high-power'
  },
  { 
    label: 'High-Efficiency 550W', 
    labelVi: 'Hiệu suất cao 550W', 
    labelZh: '高效 550W', 
    wattage: 550, 
    efficiency: '23%',
    lengthMm: 2278,
    widthMm: 1134,
    weightKg: 28,
    category: 'high-power'
  },
  { 
    label: 'N-Type TOPCon 600W', 
    labelVi: 'N-Type TOPCon 600W', 
    labelZh: 'N型TOPCon 600W', 
    wattage: 600, 
    efficiency: '23.5%',
    lengthMm: 2384,
    widthMm: 1134,
    weightKg: 30.5,
    category: 'high-power'
  },
  // Ultra high-power panels (650W-800W+)
  { 
    label: 'Ultra Power 650W', 
    labelVi: 'Siêu công suất 650W', 
    labelZh: '超高功率 650W', 
    wattage: 650, 
    efficiency: '24%',
    lengthMm: 2465,
    widthMm: 1134,
    weightKg: 32,
    category: 'ultra-high-power'
  },
  { 
    label: 'Premium N-Type 700W', 
    labelVi: 'Premium N-Type 700W', 
    labelZh: '高端N型 700W', 
    wattage: 700, 
    efficiency: '24.5%',
    lengthMm: 2538,
    widthMm: 1188,
    weightKg: 34.5,
    category: 'ultra-high-power'
  },
  { 
    label: 'Industrial HJT 750W', 
    labelVi: 'Công nghiệp HJT 750W', 
    labelZh: '工业HJT 750W', 
    wattage: 750, 
    efficiency: '25%',
    lengthMm: 2592,
    widthMm: 1188,
    weightKg: 36,
    category: 'ultra-high-power'
  },
  { 
    label: 'Max Power 800W+', 
    labelVi: 'Công suất tối đa 800W+', 
    labelZh: '最大功率 800W+', 
    wattage: 800, 
    efficiency: '25.5%',
    lengthMm: 2650,
    widthMm: 1302,
    weightKg: 38.5,
    category: 'ultra-high-power'
  },
];

const INVERTER_TYPES: InverterType[] = [
  {
    label: 'String Inverter',
    labelVi: 'Biến tần chuỗi',
    labelZh: '组串逆变器',
    minCapacityKW: 3,
    maxCapacityKW: 110,
    type: 'string',
    features: ['Cost-effective', 'Easy installation', 'Good for uniform roofs', 'Single/three phase'],
    featuresVi: ['Tiết kiệm chi phí', 'Lắp đặt dễ dàng', 'Phù hợp mái đồng đều', 'Một pha/ba pha'],
    featuresZh: ['成本效益高', '安装简便', '适合均匀屋顶', '单相/三相'],
    recommendReason: 'Best for residential and small commercial systems with unshaded roofs. Offers the best balance of cost and performance.',
    recommendReasonVi: 'Phù hợp nhất cho hệ thống gia đình và thương mại nhỏ với mái không bị che bóng. Cân bằng tốt nhất giữa chi phí và hiệu suất.',
    recommendReasonZh: '最适合无遮挡屋顶的住宅和小型商业系统。提供成本和性能的最佳平衡。',
    brands: ['Huawei SUN2000', 'SMA Sunny Tripower', 'Growatt', 'Sungrow']
  },
  {
    label: 'Micro Inverter',
    labelVi: 'Biến tần vi mô',
    labelZh: '微型逆变器',
    minCapacityKW: 0.3,
    maxCapacityKW: 15,
    type: 'micro',
    features: ['Panel-level optimization', 'Shading tolerance', 'Individual monitoring', 'Safer DC voltage'],
    featuresVi: ['Tối ưu từng tấm pin', 'Chịu bóng râm tốt', 'Giám sát riêng lẻ', 'Điện áp DC an toàn hơn'],
    featuresZh: ['面板级优化', '耐遮挡', '单独监控', '更安全的直流电压'],
    recommendReason: 'Ideal for complex roofs with shading issues or multiple orientations. Higher initial cost but better long-term performance.',
    recommendReasonVi: 'Lý tưởng cho mái phức tạp có vấn đề bóng râm hoặc nhiều hướng. Chi phí ban đầu cao hơn nhưng hiệu suất dài hạn tốt hơn.',
    recommendReasonZh: '适合有遮挡问题或多方向的复杂屋顶。初始成本较高但长期性能更好。',
    brands: ['Enphase IQ8', 'Hoymiles', 'APsystems']
  },
  {
    label: 'Hybrid Inverter',
    labelVi: 'Biến tần hybrid',
    labelZh: '混合逆变器',
    minCapacityKW: 3,
    maxCapacityKW: 50,
    type: 'hybrid',
    features: ['Battery compatible', 'Backup power', 'Energy storage', 'Grid-tie + Off-grid'],
    featuresVi: ['Tương thích pin lưu trữ', 'Điện dự phòng', 'Lưu trữ năng lượng', 'Hòa lưới + Độc lập'],
    featuresZh: ['兼容电池', '备用电源', '储能', '并网+离网'],
    recommendReason: 'Perfect for areas with unstable grid or frequent outages. Future-proof with battery storage capability.',
    recommendReasonVi: 'Hoàn hảo cho khu vực lưới điện không ổn định hoặc hay mất điện. Sẵn sàng cho tương lai với khả năng lưu trữ pin.',
    recommendReasonZh: '非常适合电网不稳定或经常停电的地区。具备电池储能功能，面向未来。',
    brands: ['Huawei LUNA', 'Growatt SPH', 'Goodwe ES', 'Deye']
  },
  {
    label: 'Central Inverter',
    labelVi: 'Biến tần trung tâm',
    labelZh: '集中式逆变器',
    minCapacityKW: 50,
    maxCapacityKW: 5000,
    type: 'central',
    features: ['High capacity', 'Industrial grade', 'Lower cost per kW', 'Professional maintenance'],
    featuresVi: ['Công suất cao', 'Cấp công nghiệp', 'Chi phí thấp hơn/kW', 'Bảo trì chuyên nghiệp'],
    featuresZh: ['大容量', '工业级', '每千瓦成本更低', '专业维护'],
    recommendReason: 'Designed for large-scale solar farms and industrial installations. Most cost-effective for systems above 100kW.',
    recommendReasonVi: 'Thiết kế cho trang trại điện mặt trời quy mô lớn và lắp đặt công nghiệp. Hiệu quả chi phí nhất cho hệ thống trên 100kW.',
    recommendReasonZh: '专为大型太阳能电站和工业安装设计。对于100kW以上系统最具成本效益。',
    brands: ['Huawei SUN2000', 'SMA Sunny Central', 'Sungrow', 'ABB']
  }
];

const TRANSLATIONS = {
  vi: {
    title: 'Ước Tính Hệ Thống Năng Lượng Mặt Trời',
    subtitle: 'Nhập thông tin để tính toán công suất phù hợp',
    inputBill: 'Hóa đơn điện hàng tháng (VNĐ)',
    inputPanel: 'Loại tấm pin mặt trời',
    inputRoofLength: 'Chiều dài mái (m)',
    inputRoofWidth: 'Chiều rộng mái (m)',
    inputRoof: 'Diện tích mái khả dụng (m²)',
    calculate: 'Tính toán',
    reset: 'Đặt lại',
    results: 'Kết quả ước tính',
    capacity: 'Công suất đề xuất',
    panelCount: 'Số lượng tấm pin',
    requiredArea: 'Diện tích cần thiết',
    areaWarning: '⚠️ Diện tích mái không đủ!',
    areaOk: '✅ Diện tích mái đủ',
    disclaimer: 'Đây chỉ là ước tính sơ bộ dựa trên mức tiêu thụ trung bình và 5 giờ nắng/ngày. Vui lòng liên hệ chuyên gia để khảo sát chi tiết và báo giá chính xác.',
    contactExpert: 'Liên hệ chuyên gia miễn phí',
    tooltipBill: 'Nhập số tiền hóa đơn điện trung bình hàng tháng của bạn',
    tooltipPanel: 'Chọn loại tấm pin phù hợp với ngân sách và không gian',
    tooltipRoofLength: 'Đo chiều dài mái sạch, không bị che bóng',
    tooltipRoofWidth: 'Đo chiều rộng mái sạch, không bị che bóng',
    tooltipRoof: 'Đo diện tích mái sạch, không bị che bóng',
    formulaTitle: 'Công thức tính (Chuẩn Việt Nam)',
    formulaStep1: '1. Tiêu thụ tháng (kWh) = Hóa đơn ÷ 2,500 VNĐ/kWh',
    formulaStep2: '2. Tiêu thụ ngày = Tiêu thụ tháng ÷ 30 ngày',
    formulaStep3: '3. Công suất cần = Tiêu thụ ngày ÷ (4.5h nắng × 80% hiệu suất)',
    formulaStep4: '4. Số tấm = (Công suất × 1000W) ÷ Công suất tấm',
    formulaStep5: '5. Diện tích = Số tấm × diện tích tấm × 1.2 (khoảng cách 20%)',
    // Panel specifications
    panelSpecs: 'Thông số tấm pin',
    panelSize: 'Kích thước',
    panelWeight: 'Trọng lượng',
    panelEfficiency: 'Hiệu suất',
    totalWeight: 'Tổng trọng lượng',
    // Panel categories
    categoryStandard: 'Tiêu chuẩn',
    categoryHighPower: 'Công suất cao',
    categoryUltraHighPower: 'Siêu công suất',
    // Inverter recommendations
    inverterTitle: 'Đề Xuất Biến Tần',
    inverterRecommended: 'Loại biến tần đề xuất',
    inverterReason: 'Lý do đề xuất',
    inverterFeatures: 'Tính năng',
    inverterBrands: 'Thương hiệu gợi ý',
    inverterCapacity: 'Công suất đề xuất',
  },
  en: {
    title: 'Solar Energy System Estimate',
    subtitle: 'Enter information to calculate suitable capacity',
    inputBill: 'Monthly electricity bill (VND)',
    inputPanel: 'Solar panel type',
    inputRoofLength: 'Roof length (m)',
    inputRoofWidth: 'Roof width (m)',
    inputRoof: 'Available roof area (m²)',
    calculate: 'Calculate',
    reset: 'Reset',
    results: 'Estimate Results',
    capacity: 'Recommended capacity',
    panelCount: 'Number of panels',
    requiredArea: 'Required area',
    areaWarning: '⚠️ Insufficient roof area!',
    areaOk: '✅ Sufficient roof area',
    disclaimer: 'This is a rough estimate based on average consumption and 5 peak sun hours/day. Please contact our experts for detailed site survey and accurate quotation.',
    contactExpert: 'Contact expert for free',
    tooltipBill: 'Enter your average monthly electricity bill amount',
    tooltipPanel: 'Choose panel type suitable for your budget and space',
    tooltipRoofLength: 'Measure clean roof length without shading',
    tooltipRoofWidth: 'Measure clean roof width without shading',
    tooltipRoof: 'Measure clean roof area without shading',
    formulaTitle: 'Calculation Formula (Vietnam Standard)',
    formulaStep1: '1. Monthly consumption (kWh) = Bill ÷ 2,500 VND/kWh',
    formulaStep2: '2. Daily consumption = Monthly ÷ 30 days',
    formulaStep3: '3. Required capacity = Daily ÷ (4.5h sun × 80% efficiency)',
    formulaStep4: '4. Panel count = (Capacity × 1000W) ÷ Panel wattage',
    formulaStep5: '5. Area = Panels × panel area × 1.2 (20% spacing)',
    // Panel specifications
    panelSpecs: 'Panel Specifications',
    panelSize: 'Size',
    panelWeight: 'Weight',
    panelEfficiency: 'Efficiency',
    totalWeight: 'Total weight',
    // Panel categories
    categoryStandard: 'Standard',
    categoryHighPower: 'High Power',
    categoryUltraHighPower: 'Ultra High Power',
    // Inverter recommendations
    inverterTitle: 'Inverter Recommendation',
    inverterRecommended: 'Recommended inverter type',
    inverterReason: 'Recommendation reason',
    inverterFeatures: 'Features',
    inverterBrands: 'Suggested brands',
    inverterCapacity: 'Recommended capacity',
  },
  zh: {
    title: '太阳能系统估算',
    subtitle: '输入信息以计算合适的容量',
    inputBill: '每月电费（越南盾）',
    inputPanel: '太阳能板类型',
    inputRoofLength: '屋顶长度（m）',
    inputRoofWidth: '屋顶宽度（m）',
    inputRoof: '可用屋顶面积（m²）',
    calculate: '计算',
    reset: '重置',
    results: '估算结果',
    capacity: '推荐容量',
    panelCount: '面板数量',
    requiredArea: '所需面积',
    areaWarning: '⚠️ 屋顶面积不足！',
    areaOk: '✅ 屋顶面积充足',
    disclaimer: '此为参考估算，基于平均消耗和每天5小时峰值日照。如需详细咨询及准确报价，请联系我们的专家免费指导。',
    contactExpert: '免费联系专家',
    tooltipBill: '输入您的平均每月电费金额',
    tooltipPanel: '选择适合您预算和空间的面板类型',
    tooltipRoofLength: '测量无遮挡的屋顶长度',
    tooltipRoofWidth: '测量无遮挡的屋顶宽度',
    tooltipRoof: '测量无遮挡的干净屋顶面积',
    formulaTitle: '计算公式（越南标准）',
    formulaStep1: '1. 月消耗（kWh）= 电费 ÷ 2,500越南盾/kWh',
    formulaStep2: '2. 日消耗 = 月消耗 ÷ 30天',
    formulaStep3: '3. 所需容量 = 日消耗 ÷（4.5h峰值日照 × 80%效率）',
    formulaStep4: '4. 面板数 =（容量 × 1000W）÷ 面板功率',
    formulaStep5: '5. 面积 = 面板数 × 面板面积 × 1.2（20%间距）',
    // Panel specifications
    panelSpecs: '面板规格',
    panelSize: '尺寸',
    panelWeight: '重量',
    panelEfficiency: '效率',
    totalWeight: '总重量',
    // Panel categories
    categoryStandard: '标准',
    categoryHighPower: '高功率',
    categoryUltraHighPower: '超高功率',
    // Inverter recommendations
    inverterTitle: '逆变器推荐',
    inverterRecommended: '推荐逆变器类型',
    inverterReason: '推荐理由',
    inverterFeatures: '功能特点',
    inverterBrands: '建议品牌',
    inverterCapacity: '推荐容量',
  }
};

interface Props {
  locale?: 'vi' | 'en' | 'zh' | 'id';
}

export default function SolarCalculator({ locale = 'vi' }: Props) {
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS['vi'];
  
  const [monthlyBill, setMonthlyBill] = useState<number>(0);
  const [selectedPanel, setSelectedPanel] = useState<PanelType>(PANEL_TYPES[1]); // Default to 450W mono
  const [roofLength, setRoofLength] = useState<number>(0);
  const [roofWidth, setRoofWidth] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  // Calculate roof area from length and width
  const roofArea = roofLength * roofWidth;

  // CÔNG THỨC CHÍNH XÁC CHO HỆ THỐNG NĂNG LƯỢNG MẶT TRỜI VIỆT NAM
  
  // Bước 1: Tính tiêu thụ điện hàng tháng (kWh) từ hóa đơn
  // Giá điện bậc thang Việt Nam trung bình: ~2,500 VNĐ/kWh
  const ELECTRICITY_RATE = 2500; // VNĐ/kWh (trung bình)
  const monthlyConsumptionKWh = monthlyBill / ELECTRICITY_RATE;
  
  // Bước 2: Tính tiêu thụ hàng ngày (kWh/ngày)
  const dailyConsumptionKWh = monthlyConsumptionKWh / 30;
  
  // Bước 3: Tính công suất hệ thống cần thiết (kW)
  // Công thức: Công suất = Tiêu thụ hàng ngày / (Giờ nắng × Hiệu suất hệ thống)
  const PEAK_SUN_HOURS = 4.5; // Giờ nắng peak trung bình Việt Nam (4-5h)
  const SYSTEM_EFFICIENCY = 0.8; // Hiệu suất hệ thống 80% (mất mát inverter, dây, nhiệt độ)
  const capacityKW = dailyConsumptionKWh / (PEAK_SUN_HOURS * SYSTEM_EFFICIENCY);
  
  // Bước 4: Tính số lượng tấm pin
  const panelCount = Math.ceil((capacityKW * 1000) / selectedPanel.wattage);
  
  // Bước 5: Tính diện tích cần thiết (using actual panel dimensions)
  // Panel area in m² (convert from mm to m)
  const PANEL_AREA = (selectedPanel.lengthMm / 1000) * (selectedPanel.widthMm / 1000);
  const SPACING_FACTOR = 1.2; // Thêm 20% cho khoảng cách
  const requiredArea = panelCount * PANEL_AREA * SPACING_FACTOR;
  
  // Tổng trọng lượng
  const totalWeight = panelCount * selectedPanel.weightKg;
  
  const areaInsufficient = requiredArea > roofArea && roofArea > 0;

  // Get recommended inverter based on capacity
  const getRecommendedInverter = (): InverterType => {
    if (capacityKW <= 15) {
      // For small systems, recommend based on roof conditions
      return INVERTER_TYPES.find(inv => inv.type === 'string') || INVERTER_TYPES[0];
    } else if (capacityKW <= 50) {
      // For medium systems, hybrid is good for flexibility
      return INVERTER_TYPES.find(inv => inv.type === 'hybrid') || INVERTER_TYPES[2];
    } else {
      // For large systems, central inverter
      return INVERTER_TYPES.find(inv => inv.type === 'central') || INVERTER_TYPES[3];
    }
  };

  const recommendedInverter = getRecommendedInverter();

  // Get inverter label based on locale
  const getInverterLabel = (inverter: InverterType) => {
    if (locale === 'vi') return inverter.labelVi;
    if (locale === 'zh') return inverter.labelZh;
    return inverter.label;
  };

  // Get inverter features based on locale
  const getInverterFeatures = (inverter: InverterType) => {
    if (locale === 'vi') return inverter.featuresVi;
    if (locale === 'zh') return inverter.featuresZh;
    return inverter.features;
  };

  // Get inverter reason based on locale
  const getInverterReason = (inverter: InverterType) => {
    if (locale === 'vi') return inverter.recommendReasonVi;
    if (locale === 'zh') return inverter.recommendReasonZh;
    return inverter.recommendReason;
  };

  // Get panel category label
  const getCategoryLabel = (category: PanelType['category']) => {
    switch (category) {
      case 'standard':
        return t.categoryStandard;
      case 'high-power':
        return t.categoryHighPower;
      case 'ultra-high-power':
        return t.categoryUltraHighPower;
      default:
        return category;
    }
  };

  const handleCalculate = () => {
    if (monthlyBill > 0 && roofLength > 0 && roofWidth > 0) {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setMonthlyBill(0);
    setRoofLength(0);
    setRoofWidth(0);
    setSelectedPanel(PANEL_TYPES[1]);
    setShowResults(false);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(num));
  };

  const getPanelLabel = (panel: PanelType) => {
    if (locale === 'vi') return panel.labelVi;
    if (locale === 'zh') return panel.labelZh;
    return panel.label;
  };

  return (
    <div className="w-full bg-white border border-gray-10 rounded-lg p-8 font-light shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl text-black font-bold tracking-wide mb-3">
          {t.title}
        </h2>
        <p className="text-black text-sm md:text-base font-semibold">
          {t.subtitle}
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Monthly Bill */}
        <div className="group">
          <label className="block text-black text-sm mb-3 flex items-center gap-2 font-bold">
            {t.inputBill}
            <span 
              className="text-xs text-black cursor-help font-semibold" 
              title={t.tooltipBill}
            >
              ⓘ
            </span>
          </label>
          <input
            type="number"
            value={monthlyBill || ''}
            onChange={(e) => setMonthlyBill(Number(e.target.value))}
            placeholder="2,000,000"
            className="w-full bg-white border-2 border-[#D4AF37] text-black px-4 py-3 text-sm focus:border-[#B89129] focus:outline-none transition-colors rounded font-semibold"
          />
        </div>

        {/* Panel Type with Category */}
        <div className="group">
          <label className="block text-black text-sm mb-3 flex items-center gap-2 font-bold">
            {t.inputPanel}
            <span 
              className="text-xs text-black cursor-help font-semibold" 
              title={t.tooltipPanel}
            >
              ⓘ
            </span>
          </label>
          <select
            value={selectedPanel.wattage}
            onChange={(e) => {
              const panel = PANEL_TYPES.find(p => p.wattage === Number(e.target.value));
              if (panel) setSelectedPanel(panel);
            }}
            className="w-full bg-white border-2 border-[#D4AF37] text-black px-4 py-3 text-sm focus:border-[#B89129] focus:outline-none transition-colors cursor-pointer rounded font-semibold"
          >
            <optgroup label={t.categoryStandard}>
              {PANEL_TYPES.filter(p => p.category === 'standard').map((panel) => (
                <option key={panel.wattage} value={panel.wattage}>
                  {getPanelLabel(panel)} ({panel.efficiency})
                </option>
              ))}
            </optgroup>
            <optgroup label={t.categoryHighPower}>
              {PANEL_TYPES.filter(p => p.category === 'high-power').map((panel) => (
                <option key={panel.wattage} value={panel.wattage}>
                  {getPanelLabel(panel)} ({panel.efficiency})
                </option>
              ))}
            </optgroup>
            <optgroup label={t.categoryUltraHighPower}>
              {PANEL_TYPES.filter(p => p.category === 'ultra-high-power').map((panel) => (
                <option key={panel.wattage} value={panel.wattage}>
                  {getPanelLabel(panel)} ({panel.efficiency})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Panel Specifications Display */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-black text-sm font-bold mb-3">{t.panelSpecs}: {getPanelLabel(selectedPanel)}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 font-semibold">{t.panelSize}:</span>
            <div className="text-black font-bold">{selectedPanel.lengthMm} × {selectedPanel.widthMm} mm</div>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">{t.panelWeight}:</span>
            <div className="text-black font-bold">{selectedPanel.weightKg} kg</div>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">{t.panelEfficiency}:</span>
            <div className="text-black font-bold">{selectedPanel.efficiency}</div>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">{locale === 'vi' ? 'Loại' : locale === 'zh' ? '类型' : 'Category'}:</span>
            <div className="text-black font-bold">{getCategoryLabel(selectedPanel.category)}</div>
          </div>
        </div>
      </div>

      {/* Roof Dimensions - Length and Width instead of Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Roof Length */}
        <div className="group">
          <label className="block text-black text-sm mb-3 flex items-center gap-2 font-bold">
            {t.inputRoofLength}
            <span 
              className="text-xs text-black cursor-help font-semibold" 
              title={t.tooltipRoofLength}
            >
              ⓘ
            </span>
          </label>
          <input
            type="number"
            value={roofLength || ''}
            onChange={(e) => setRoofLength(Number(e.target.value))}
            placeholder="15"
            className="w-full bg-white border-2 border-[#D4AF37] text-black px-4 py-3 text-sm focus:border-[#B89129] focus:outline-none transition-colors rounded font-semibold"
          />
        </div>

        {/* Roof Width */}
        <div className="group">
          <label className="block text-black text-sm mb-3 flex items-center gap-2 font-bold">
            {t.inputRoofWidth}
            <span 
              className="text-xs text-black cursor-help font-semibold" 
              title={t.tooltipRoofWidth}
            >
              ⓘ
            </span>
          </label>
          <input
            type="number"
            value={roofWidth || ''}
            onChange={(e) => setRoofWidth(Number(e.target.value))}
            placeholder="10"
            className="w-full bg-white border-2 border-[#D4AF37] text-black px-4 py-3 text-sm focus:border-[#B89129] focus:outline-none transition-colors rounded font-semibold"
          />
        </div>
      </div>

      {/* Calculated Area Display */}
      {(roofLength > 0 && roofWidth > 0) && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <span className="text-blue-800 font-semibold">
            {t.inputRoof}: <strong>{formatNumber(roofArea)} m²</strong> ({roofLength}m × {roofWidth}m)
          </span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={handleCalculate}
          disabled={monthlyBill === 0 || roofArea === 0}
          className="flex-1 bg-[#D4AF37] text-white px-6 py-4 text-sm font-bold tracking-wide hover:bg-[#B89129] transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-lg shadow-lg"
        >
          {t.calculate}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-4 text-sm font-bold text-white bg-[#D4AF37] border-2 border-[#D4AF37] hover:bg-[#B89129] hover:border-[#B89129] transition-colors rounded-lg shadow-lg"
        >
          {t.reset}
        </button>
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="px-6 py-4 text-sm font-bold text-white bg-[#D4AF37] border-2 border-[#D4AF37] hover:bg-[#B89129] hover:border-[#B89129] transition-colors rounded-lg shadow-lg"
          title={t.formulaTitle}
        >
          ⓘ
        </button>
      </div>

      {/* Formula Display */}
      {showFormula && (
        <div className="mb-8 p-4 bg-white/5 border border-gray-10">
          <h3 className="text-black text-sm font-bold mb-3">{t.formulaTitle}</h3>
          <div className="space-y-2 text-xs text-black font-mono font-semibold">
            <p>{t.formulaStep1}</p>
            <p>{t.formulaStep2}</p>
            <p>{t.formulaStep3}</p>
            <p>{t.formulaStep4}</p>
            {'formulaStep5' in t && <p>{t.formulaStep5}</p>}
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="border-t border-gray-10 pt-8">
          <h3 className="text-2xl text-black font-bold mb-6 text-center">
            {t.results}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Capacity */}
            <div className="bg-white p-5 text-center border-2 border-[#D4AF37] rounded-lg shadow-lg">
              <div className="text-black text-xs uppercase tracking-wider mb-2 font-bold">
                {t.capacity}
              </div>
              <div className="text-black text-2xl font-bold">
                {capacityKW.toFixed(2)} <span className="text-sm">kW</span>
              </div>
            </div>

            {/* Panel Count */}
            <div className="bg-white p-5 text-center border-2 border-[#D4AF37] rounded-lg shadow-lg">
              <div className="text-black text-xs uppercase tracking-wider mb-2 font-bold">
                {t.panelCount}
              </div>
              <div className="text-black text-2xl font-bold">
                {formatNumber(panelCount)} <span className="text-sm">{locale === 'vi' ? 'tấm' : locale === 'zh' ? '块' : 'pcs'}</span>
              </div>
            </div>

            {/* Required Area */}
            <div className={`${areaInsufficient ? 'bg-red-100 border-red-500' : 'bg-white border-[#D4AF37]'} p-5 text-center border-2 rounded-lg shadow-lg`}>
              <div className="text-black text-xs uppercase tracking-wider mb-2 font-bold">
                {t.requiredArea}
              </div>
              <div className="text-black text-2xl font-bold">
                {formatNumber(requiredArea)} <span className="text-sm">m²</span>
              </div>
              <div className={`text-xs mt-1 ${areaInsufficient ? 'text-red-500' : 'text-green-600'}`}>
                {areaInsufficient ? t.areaWarning : t.areaOk}
              </div>
            </div>

            {/* Total Weight */}
            <div className="bg-white p-5 text-center border-2 border-[#D4AF37] rounded-lg shadow-lg">
              <div className="text-black text-xs uppercase tracking-wider mb-2 font-bold">
                {t.totalWeight}
              </div>
              <div className="text-black text-2xl font-bold">
                {formatNumber(totalWeight)} <span className="text-sm">kg</span>
              </div>
            </div>
          </div>

          {/* Inverter Recommendation Section */}
          <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-lg shadow-lg">
            <h4 className="text-xl text-black font-bold mb-4 flex items-center gap-2">
              ⚡ {t.inverterTitle}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inverter Type */}
              <div>
                <div className="text-sm text-gray-600 font-semibold mb-1">{t.inverterRecommended}:</div>
                <div className="text-xl text-black font-bold mb-2">{getInverterLabel(recommendedInverter)}</div>
                
                <div className="text-sm text-gray-600 font-semibold mb-1">{t.inverterCapacity}:</div>
                <div className="text-lg text-green-700 font-bold mb-3">
                  {capacityKW < recommendedInverter.minCapacityKW 
                    ? recommendedInverter.minCapacityKW 
                    : Math.ceil(capacityKW * 1.1)} kW
                </div>

                <div className="text-sm text-gray-600 font-semibold mb-1">{t.inverterBrands}:</div>
                <div className="flex flex-wrap gap-2">
                  {recommendedInverter.brands.map((brand, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>

              {/* Inverter Reason & Features */}
              <div>
                <div className="text-sm text-gray-600 font-semibold mb-1">{t.inverterReason}:</div>
                <p className="text-sm text-black mb-3 leading-relaxed">
                  {getInverterReason(recommendedInverter)}
                </p>
                
                <div className="text-sm text-gray-600 font-semibold mb-1">{t.inverterFeatures}:</div>
                <ul className="text-sm text-black space-y-1">
                  {getInverterFeatures(recommendedInverter).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Visual Diagram */}
          <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600 font-semibold mb-3 text-center">
              {locale === 'vi' ? 'Bố trí tấm pin (mô phỏng)' : locale === 'zh' ? '面板布局（模拟）' : 'Panel Layout (Simulation)'}
            </div>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: Math.min(panelCount, 40) }).map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-[3/4] bg-blue-100 border border-blue-300 rounded"
                  title={`${locale === 'vi' ? 'Tấm' : locale === 'zh' ? '面板' : 'Panel'} ${i + 1}`}
                />
              ))}
            </div>
            {panelCount > 40 && (
              <p className="text-xs text-gray-600 text-center mt-3">
                {locale === 'vi' ? `... và ${panelCount - 40} tấm nữa` : 
                 locale === 'zh' ? `... 还有 ${panelCount - 40} 块` : 
                 `... and ${panelCount - 40} more panels`}
              </p>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded-lg">
            <p className="text-xs text-yellow-800 leading-relaxed font-semibold">
              ⚠️ {t.disclaimer}
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href={`/${locale}/contact`}
              className="inline-block bg-[#D4AF37] text-white px-8 py-3 text-sm font-bold tracking-wide hover:bg-[#B89129] transition-colors rounded-lg shadow-lg"
            >
              {t.contactExpert}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
