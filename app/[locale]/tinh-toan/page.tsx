/**
 * Solar Calculator Page
 * Semantic URL: /[locale]/tinh-toan/
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Container } from '@/components/Container';
import { calculateSolarSystem, formatVND, type CalculatorInput } from '@/lib/calculator/solar-engine';
import { useBehavioralTracking } from '@/lib/hooks/use-behavioral-tracking';

const vietnamProvinces = [
  // North
  'Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Hải Dương', 'Hưng Yên', 'Bắc Ninh',
  // Central
  'Đà Nẵng', 'Huế', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Khánh Hòa',
  // South
  'TP. Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Vũng Tàu', 'Cần Thơ', 'Long An',
];

export default function CalculatorPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { trackEvent } = useBehavioralTracking();
  
  const [step, setStep] = useState(1);
  const [input, setInput] = useState<Partial<CalculatorInput>>({
    roofType: 'flat',
    shading: 'none',
  });
  const [result, setResult] = useState<any>(null);
  
  const content = {
    vi: {
      title: 'Tính Toán Hệ Thống Điện Mặt Trời',
      subtitle: 'Nhận báo cáo chi tiết về công suất, chi phí và ROI trong 2 phút',
      steps: {
        1: 'Hóa đơn điện',
        2: 'Mái nhà',
        3: 'Vị trí',
        4: 'Kết quả',
      },
      form: {
        electricBill: {
          label: 'Hóa đơn điện hàng tháng',
          placeholder: 'VD: 2,000,000',
          unit: 'VND',
        },
        roofLength: {
          label: 'Chiều dài mái',
          placeholder: 'VD: 10',
          unit: 'm',
        },
        roofWidth: {
          label: 'Chiều rộng mái',
          placeholder: 'VD: 5',
          unit: 'm',
        },
        roofType: {
          label: 'Loại mái',
          options: {
            flat: 'Mái bằng',
            tilted: 'Mái nghiêng',
            mixed: 'Hỗn hợp',
          },
        },
        shading: {
          label: 'Che phủ',
          options: {
            none: 'Không che',
            partial: 'Che một phần',
            significant: 'Che nhiều',
          },
        },
        province: {
          label: 'Tỉnh/Thành phố',
        },
      },
      buttons: {
        next: 'Tiếp tục',
        back: 'Quay lại',
        calculate: 'Tính toán',
        getQuote: 'Nhận báo giá',
      },
      results: {
        title: 'Kết Quả Tính Toán',
        systemSpecs: 'Thông số hệ thống',
        financial: 'Tài chính',
        environmental: 'Môi trường',
        specs: {
          capacity: 'Công suất khuyến nghị',
          panels: 'Số lượng tấm pin',
          inverter: 'Biến tần',
          battery: 'Pin lưu trữ',
          roofCoverage: 'Phủ mái',
        },
        finance: {
          cost: 'Chi phí ước tính',
          savings: 'Tiết kiệm hàng tháng',
          payback: 'Thời gian hoàn vốn',
          total25years: 'Tổng tiết kiệm 25 năm',
          irr: 'Lợi suất nội bộ (IRR)',
        },
        env: {
          co2: 'Giảm CO2 mỗi năm',
          trees: 'Tương đương số cây',
        },
      },
    },
    en: {
      title: 'Solar System Calculator',
      subtitle: 'Get detailed report on capacity, cost and ROI in 2 minutes',
      steps: {
        1: 'Electric Bill',
        2: 'Roof',
        3: 'Location',
        4: 'Results',
      },
      form: {
        electricBill: {
          label: 'Monthly electric bill',
          placeholder: 'Ex: 2,000,000',
          unit: 'VND',
        },
        roofLength: {
          label: 'Roof length',
          placeholder: 'Ex: 10',
          unit: 'm',
        },
        roofWidth: {
          label: 'Roof width',
          placeholder: 'Ex: 5',
          unit: 'm',
        },
        roofType: {
          label: 'Roof type',
          options: {
            flat: 'Flat roof',
            tilted: 'Tilted roof',
            mixed: 'Mixed',
          },
        },
        shading: {
          label: 'Shading',
          options: {
            none: 'No shading',
            partial: 'Partial shading',
            significant: 'Significant shading',
          },
        },
        province: {
          label: 'Province/City',
        },
      },
      buttons: {
        next: 'Next',
        back: 'Back',
        calculate: 'Calculate',
        getQuote: 'Get Quote',
      },
      results: {
        title: 'Calculation Results',
        systemSpecs: 'System Specifications',
        financial: 'Financial',
        environmental: 'Environmental',
        specs: {
          capacity: 'Recommended capacity',
          panels: 'Number of panels',
          inverter: 'Inverter',
          battery: 'Battery storage',
          roofCoverage: 'Roof coverage',
        },
        finance: {
          cost: 'Estimated cost',
          savings: 'Monthly savings',
          payback: 'Payback period',
          total25years: 'Total 25-year savings',
          irr: 'Internal Rate of Return (IRR)',
        },
        env: {
          co2: 'CO2 reduction per year',
          trees: 'Equivalent trees',
        },
      },
    },
    zh: {
      title: '太阳能系统计算器',
      subtitle: '2分钟内获取有关容量、成本和投资回报率的详细报告',
      steps: {
        1: '电费账单',
        2: '屋顶',
        3: '位置',
        4: '结果',
      },
      form: {
        electricBill: {
          label: '月电费账单',
          placeholder: '例: 2,000,000',
          unit: 'VND',
        },
        roofLength: {
          label: '屋顶长度',
          placeholder: '例: 10',
          unit: 'm',
        },
        roofWidth: {
          label: '屋顶宽度',
          placeholder: '例: 5',
          unit: 'm',
        },
        roofType: {
          label: '屋顶类型',
          options: {
            flat: '平屋顶',
            tilted: '斜屋顶',
            mixed: '混合',
          },
        },
        shading: {
          label: '遮挡',
          options: {
            none: '无遮挡',
            partial: '部分遮挡',
            significant: '大量遮挡',
          },
        },
        province: {
          label: '省/市',
        },
      },
      buttons: {
        next: '下一步',
        back: '返回',
        calculate: '计算',
        getQuote: '获取报价',
      },
      results: {
        title: '计算结果',
        systemSpecs: '系统规格',
        financial: '财务',
        environmental: '环境',
        specs: {
          capacity: '推荐容量',
          panels: '面板数量',
          inverter: '逆变器',
          battery: '电池储能',
          roofCoverage: '屋顶覆盖',
        },
        finance: {
          cost: '预估成本',
          savings: '每月节省',
          payback: '回本期',
          total25years: '25年总节省',
          irr: '内部收益率 (IRR)',
        },
        env: {
          co2: '每年CO2减少',
          trees: '相当于树木',
        },
      },
    },
  };
  
  const t = content[locale as keyof typeof content] || content.vi;
  
  const handleCalculate = () => {
    trackEvent({
      type: 'calculator_start',
      timestamp: Date.now(),
      metadata: { step: 1 },
    });
    
    if (!input.monthlyElectricBill || !input.roofLength || !input.roofWidth || !input.location?.province) {
      alert('Please fill in all required fields');
      return;
    }
    
    const calculatorInput: CalculatorInput = {
      monthlyElectricBill: input.monthlyElectricBill!,
      roofLength: input.roofLength!,
      roofWidth: input.roofWidth!,
      location: {
        province: input.location!.province,
        lat: 10.8231, // Default HCM
        lng: 106.6297,
      },
      roofType: input.roofType || 'flat',
      shading: input.shading || 'none',
    };
    
    const output = calculateSolarSystem(calculatorInput);
    setResult(output);
    setStep(4);
    
    trackEvent({
      type: 'calculator_complete',
      timestamp: Date.now(),
      metadata: {
        capacity: output.recommendedCapacity,
        solutionType: output.solutionType,
      },
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-32 pb-20">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {t.title}
            </h1>
            <p className="text-xl text-gray-600">
              {t.subtitle}
            </p>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-between mb-12">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                <div className="ml-2 text-sm font-medium text-gray-700">
                  {t.steps[s as keyof typeof t.steps]}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {step === 1 && (
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  {t.form.electricBill.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={input.monthlyElectricBill || ''}
                    onChange={(e) =>
                      setInput({ ...input, monthlyElectricBill: Number(e.target.value) })
                    }
                    placeholder={t.form.electricBill.placeholder}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-600 focus:outline-none"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">
                    {t.form.electricBill.unit}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {locale === 'vi'
                    ? 'Tham khảo hóa đơn điện EVN gần nhất của bạn'
                    : 'Refer to your latest EVN electricity bill'}
                </p>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Roof Length */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      {t.form.roofLength.label}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={input.roofLength || ''}
                        onChange={(e) =>
                          setInput({ ...input, roofLength: Number(e.target.value) })
                        }
                        placeholder={t.form.roofLength.placeholder}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-600 focus:outline-none"
                      />
                      <span className="absolute right-4 top-3 text-gray-500">
                        {t.form.roofLength.unit}
                      </span>
                    </div>
                  </div>
                  
                  {/* Roof Width */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      {t.form.roofWidth.label}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={input.roofWidth || ''}
                        onChange={(e) =>
                          setInput({ ...input, roofWidth: Number(e.target.value) })
                        }
                        placeholder={t.form.roofWidth.placeholder}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-600 focus:outline-none"
                      />
                      <span className="absolute right-4 top-3 text-gray-500">
                        {t.form.roofWidth.unit}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Display calculated area */}
                {input.roofLength && input.roofWidth && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">{locale === 'vi' ? 'Diện tích mái:' : locale === 'zh' ? '屋顶面积:' : 'Roof area:'}</span>
                      {' '}{(input.roofLength * input.roofWidth).toFixed(2)} m²
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    {t.form.roofType.label}
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['flat', 'tilted', 'mixed'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setInput({ ...input, roofType: type })}
                        className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                          input.roofType === type
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {t.form.roofType.options[type]}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    {t.form.shading.label}
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['none', 'partial', 'significant'] as const).map((shade) => (
                      <button
                        key={shade}
                        onClick={() => setInput({ ...input, shading: shade })}
                        className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                          input.shading === shade
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {t.form.shading.options[shade]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  {t.form.province.label}
                </label>
                <select
                  value={input.location?.province || ''}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      location: { province: e.target.value, lat: 0, lng: 0 },
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-600 focus:outline-none"
                >
                  <option value="">
                    {locale === 'vi' ? 'Chọn tỉnh/thành' : 'Select province'}
                  </option>
                  {vietnamProvinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {step === 4 && result && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-center text-gray-900">
                  {t.results.title}
                </h2>
                
                {/* System Specs */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t.results.systemSpecs}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        {t.results.specs.capacity}
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        {result.recommendedCapacity} kW
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        {t.results.specs.panels}
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        {result.systemSpecs.panelCount}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Financial */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t.results.financial}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{t.results.finance.cost}</span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatVND(result.estimatedCost.min)} - {formatVND(result.estimatedCost.max)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="text-gray-700">{t.results.finance.savings}</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatVND(result.roi.monthlySavings)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                      <span className="text-gray-700">{t.results.finance.payback}</span>
                      <span className="text-xl font-bold text-yellow-600">
                        {result.roi.paybackPeriod} {locale === 'vi' ? 'năm' : 'years'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-gray-700">{t.results.finance.total25years}</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatVND(result.roi.totalSavings25Years)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Environmental */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t.results.environmental}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-4xl mb-2">🌍</div>
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {result.environmentalImpact.co2Offset} {locale === 'vi' ? 'tấn' : 'tons'}
                      </div>
                      <div className="text-sm text-gray-600">{t.results.env.co2}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-4xl mb-2">🌳</div>
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {result.environmentalImpact.treesEquivalent}
                      </div>
                      <div className="text-sm text-gray-600">{t.results.env.trees}</div>
                    </div>
                  </div>
                </div>
                
                {/* Recommended System Configuration */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    {locale === 'vi' ? '🎯 Hệ Thống Đề Xuất' : locale === 'zh' ? '🎯 推荐系统' : '🎯 Recommended System'}
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                      <div className="text-sm opacity-90 mb-1">
                        {locale === 'vi' ? 'Tấm pin mặt trời' : locale === 'zh' ? '太阳能板' : 'Solar Panels'}
                      </div>
                      <div className="text-lg font-bold">Longi Hi-MO 6 450W × {result.systemSpecs.panelCount}</div>
                      <div className="text-sm opacity-80 mt-1">
                        {locale === 'vi' ? '✅ Có sẵn trong kho' : locale === 'zh' ? '✅ 库存充足' : '✅ In Stock'}
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                      <div className="text-sm opacity-90 mb-1">
                        {locale === 'vi' ? 'Biến tần (Inverter)' : locale === 'zh' ? '逆变器' : 'Inverter'}
                      </div>
                      <div className="text-lg font-bold">
                        Huawei SUN2000-{result.systemSpecs.inverterCapacity}KTL-L1
                      </div>
                      <div className="text-sm opacity-80 mt-1">
                        {locale === 'vi' ? '✅ Có sẵn trong kho' : locale === 'zh' ? '✅ 库存充足' : '✅ In Stock'}
                      </div>
                    </div>
                    {result.systemSpecs.batteryCapacity && (
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="text-sm opacity-90 mb-1">
                          {locale === 'vi' ? 'Pin lưu trữ (Battery)' : locale === 'zh' ? '储能电池' : 'Battery Storage'}
                        </div>
                        <div className="text-lg font-bold">
                          UFO Powerwall {result.systemSpecs.batteryCapacity}kWh
                        </div>
                        <div className="text-sm opacity-80 mt-1">
                          {locale === 'vi' ? '✅ Có sẵn trong kho' : locale === 'zh' ? '✅ 库存充足' : '✅ In Stock'}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 text-center text-sm opacity-90">
                    {locale === 'vi' 
                      ? '💡 Sản phẩm chính hãng, bảo hành 25 năm, lắp đặt trong 1-2 ngày' 
                      : locale === 'zh' 
                      ? '💡 原装产品，25年质保，1-2天内安装' 
                      : '💡 Genuine products, 25-year warranty, installation in 1-2 days'}
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && step < 4 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  {t.buttons.back}
                </button>
              )}
              
              {step < 3 && (
                <button
                  onClick={() => {
                    // Validate step 2 (roof dimensions)
                    if (step === 2 && (!input.roofLength || !input.roofWidth)) {
                      alert(locale === 'vi' 
                        ? 'Vui lòng nhập chiều dài và chiều rộng mái nhà' 
                        : locale === 'zh' 
                        ? '请输入屋顶长度和宽度' 
                        : 'Please enter roof length and width');
                      return;
                    }
                    setStep(step + 1);
                  }}
                  disabled={step === 1 && !input.monthlyElectricBill}
                  className="ml-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.buttons.next}
                </button>
              )}
              
              {step === 3 && (
                <button
                  onClick={handleCalculate}
                  className="ml-auto px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-bold transition-all transform hover:scale-105"
                >
                  {t.buttons.calculate}
                </button>
              )}
              
              {step === 4 && (
                <button
                  onClick={() => window.location.href = `/${locale}/lien-he?intent=quote`}
                  className="ml-auto px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-bold transition-all transform hover:scale-105"
                >
                  {t.buttons.getQuote}
                </button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
