'use client';

import React, { useState } from 'react';

interface PanelType {
  label: string;
  labelVi: string;
  labelZh: string;
  wattage: number;
  efficiency: string;
}

const PANEL_TYPES: PanelType[] = [
  { label: 'Monocrystalline 450W', labelVi: 'Đơn tinh thể 450W', labelZh: '单晶硅 450W', wattage: 450, efficiency: '21%' },
  { label: 'Polycrystalline 330W', labelVi: 'Đa tinh thể 330W', labelZh: '多晶硅 330W', wattage: 330, efficiency: '17%' },
  { label: 'Bifacial 500W', labelVi: 'Song mặt 500W', labelZh: '双面 500W', wattage: 500, efficiency: '22%' },
  { label: 'High-Efficiency 550W', labelVi: 'Hiệu suất cao 550W', labelZh: '高效 550W', wattage: 550, efficiency: '23%' },
];

const TRANSLATIONS = {
  vi: {
    title: 'Ước Tính Hệ Thống Năng Lượng Mặt Trời',
    subtitle: 'Nhập thông tin để tính toán công suất phù hợp',
    inputBill: 'Hóa đơn điện hàng tháng (VNĐ)',
    inputPanel: 'Loại tấm pin mặt trời',
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
    tooltipRoof: 'Đo diện tích mái sạch, không bị che bóng',
    formulaTitle: 'Công thức tính (Chuẩn Việt Nam)',
    formulaStep1: '1. Tiêu thụ tháng (kWh) = Hóa đơn ÷ 2,500 VNĐ/kWh',
    formulaStep2: '2. Tiêu thụ ngày = Tiêu thụ tháng ÷ 30 ngày',
    formulaStep3: '3. Công suất cần = Tiêu thụ ngày ÷ (4.5h nắng × 80% hiệu suất)',
    formulaStep4: '4. Số tấm = (Công suất × 1000W) ÷ Công suất tấm',
    formulaStep5: '5. Diện tích = Số tấm × 2m² × 1.2 (khoảng cách 20%)',
  },
  en: {
    title: 'Solar Energy System Estimate',
    subtitle: 'Enter information to calculate suitable capacity',
    inputBill: 'Monthly electricity bill (VND)',
    inputPanel: 'Solar panel type',
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
    tooltipRoof: 'Measure clean roof area without shading',
    formulaTitle: 'Calculation Formula (Vietnam Standard)',
    formulaStep1: '1. Monthly consumption (kWh) = Bill ÷ 2,500 VND/kWh',
    formulaStep2: '2. Daily consumption = Monthly ÷ 30 days',
    formulaStep3: '3. Required capacity = Daily ÷ (4.5h sun × 80% efficiency)',
    formulaStep4: '4. Panel count = (Capacity × 1000W) ÷ Panel wattage',
    formulaStep5: '5. Area = Panels × 2m² × 1.2 (20% spacing)',
  },
  zh: {
    title: '太阳能系统估算',
    subtitle: '输入信息以计算合适的容量',
    inputBill: '每月电费（越南盾）',
    inputPanel: '太阳能板类型',
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
    tooltipRoof: '测量无遮挡的干净屋顶面积',
    formulaTitle: '计算公式（越南标准）',
    formulaStep1: '1. 月消耗（kWh）= 电费 ÷ 2,500越南盾/kWh',
    formulaStep2: '2. 日消耗 = 月消耗 ÷ 30天',
    formulaStep3: '3. 所需容量 = 日消耗 ÷（4.5h峰值日照 × 80%效率）',
    formulaStep4: '4. 面板数 =（容量 × 1000W）÷ 面板功率',
    formulaStep5: '5. 面积 = 面板数 × 2m² × 1.2（20%间距）',
  }
};

interface Props {
  locale?: 'vi' | 'en' | 'zh' | 'id';
}

export default function SolarCalculator({ locale = 'vi' }: Props) {
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS['vi'];
  
  const [monthlyBill, setMonthlyBill] = useState<number>(0);
  const [selectedPanel, setSelectedPanel] = useState<PanelType>(PANEL_TYPES[0]);
  const [roofArea, setRoofArea] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

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
  
  // Bước 5: Tính diện tích cần thiết
  // Diện tích 1 tấm pin chuẩn: 2m² (1.7m x 1.1m)
  // Thêm 20% khoảng cách giữa các tấm và biên mái
  const PANEL_AREA = 2.0; // m²/tấm
  const SPACING_FACTOR = 1.2; // Thêm 20% cho khoảng cách
  const requiredArea = panelCount * PANEL_AREA * SPACING_FACTOR;
  
  const areaInsufficient = requiredArea > roofArea && roofArea > 0;

  const handleCalculate = () => {
    if (monthlyBill > 0 && roofArea > 0) {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setMonthlyBill(0);
    setRoofArea(0);
    setSelectedPanel(PANEL_TYPES[0]);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Panel Type */}
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
            {PANEL_TYPES.map((panel) => (
              <option key={panel.wattage} value={panel.wattage}>
                {getPanelLabel(panel)} ({panel.efficiency})
              </option>
            ))}
          </select>
        </div>

        {/* Roof Area */}
        <div className="group">
          <label className="block text-black text-sm mb-3 flex items-center gap-2 font-bold">
            {t.inputRoof}
            <span 
              className="text-xs text-black cursor-help font-semibold" 
              title={t.tooltipRoof}
            >
              ⓘ
            </span>
          </label>
          <input
            type="number"
            value={roofArea || ''}
            onChange={(e) => setRoofArea(Number(e.target.value))}
            placeholder="100"
            className="w-full bg-white border-2 border-[#D4AF37] text-black px-4 py-3 text-sm focus:border-[#B89129] focus:outline-none transition-colors rounded font-semibold"
          />
        </div>
      </div>

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Capacity */}
            <div className="bg-white p-6 text-center border-2 border-[#D4AF37] rounded-lg shadow-lg">
              <div className="text-black text-xs uppercase tracking-wider mb-2 font-bold">
                {t.capacity}
              </div>
              <div className="text-black text-3xl font-bold">
                {capacityKW.toFixed(2)} <span className="text-lg">kW</span>
              </div>
            </div>

            {/* Panel Count */}
            <div className="bg-white p-6 text-center border-2 border-[#D4AF37] rounded-lg shadow-lg">
              <div className="text-black text-xs uppercase tracking-wider mb-2 font-bold">
                {t.panelCount}
              </div>
              <div className="text-black text-3xl font-bold">
                {formatNumber(panelCount)} <span className="text-lg">{locale === 'vi' ? 'tấm' : locale === 'zh' ? '块' : 'pcs'}</span>
              </div>
            </div>

            {/* Required Area */}
            <div className={`${areaInsufficient ? 'bg-red-100 border-red-500' : 'bg-white border-[#D4AF37]'} p-6 text-center border-2 rounded-lg shadow-lg`}>
              <div className="text-black text-xs uppercase tracking-wider mb-2 font-bold">
                {t.requiredArea}
              </div>
              <div className="text-black text-3xl font-bold">
                {formatNumber(requiredArea)} <span className="text-lg">m²</span>
              </div>
              <div className={`text-xs mt-2 ${areaInsufficient ? 'text-red-400' : 'text-green-400'}`}>
                {areaInsufficient ? t.areaWarning : t.areaOk}
              </div>
            </div>
          </div>

          {/* Visual Diagram */}
          <div className="mb-6 p-6 bg-white/5 border border-gray-10">
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: Math.min(panelCount, 40) }).map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-white/20 border border-gray-30"
                  title={`${locale === 'vi' ? 'Tấm' : locale === 'zh' ? '面板' : 'Panel'} ${i + 1}`}
                />
              ))}
            </div>
            {panelCount > 40 && (
              <p className="text-xs text-gray-900 text-center mt-3">
                {locale === 'vi' ? `... và ${panelCount - 40} tấm nữa` : 
                 locale === 'zh' ? `... 还有 ${panelCount - 40} 块` : 
                 `... and ${panelCount - 40} more panels`}
              </p>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-white/5 border border-gray-10 p-4 mb-6">
            <p className="text-xs text-black leading-relaxed font-semibold">
              {t.disclaimer}
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
