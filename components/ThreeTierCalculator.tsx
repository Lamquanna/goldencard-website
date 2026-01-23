'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { ThreeTierResult, TierRecommendation } from '@/sanity/services/threeTierCalculatorService';
import { generateTierContactMessage } from '@/sanity/services/threeTierCalculatorService';

// ============================================
// INTERFACES
// ============================================
interface TranslatedContent {
  title: string;
  subtitle: string;
  inputLabel: string;
  inputPlaceholder: string;
  systemTypeLabel: string;
  gridTied: string;
  hybrid: string;
  calculateButton: string;
  loadingText: string;
  resultsTitle: string;
  systemSize: string;
  monthlyProduction: string;
  selectTier: string;
  compareTitle: string;
  tierBudget: string;
  tierStandard: string;
  tierPremium: string;
  investment: string;
  monthlySavings: string;
  paybackPeriod: string;
  lifetimeSavings: string;
  roi: string;
  features: string;
  products: string;
  inverter: string;
  panels: string;
  battery: string;
  warranty: string;
  years: string;
  contactButton: string;
  downloadPDF: string;
  errorTitle: string;
  errorMessage: string;
}

const translations: Record<string, TranslatedContent> = {
  vi: {
    title: 'Máy tính hệ thống điện mặt trời - So sánh 3 gói',
    subtitle: 'Nhập hóa đơn điện để nhận 3 gợi ý: Giá rẻ, Phổ thông, VIP',
    inputLabel: 'Hóa đơn điện hàng tháng (VNĐ)',
    inputPlaceholder: 'VD: 2,000,000',
    systemTypeLabel: 'Loại hệ thống',
    gridTied: 'Hòa lưới (Grid-tied)',
    hybrid: 'Hybrid (Pin lưu trữ)',
    calculateButton: 'So sánh 3 gói ngay',
    loadingText: 'Đang tính toán 3 phân khúc...',
    resultsTitle: 'So sánh 3 gói phù hợp với bạn',
    systemSize: 'Công suất hệ thống',
    monthlyProduction: 'Sản lượng điện/tháng',
    selectTier: 'Chọn gói phù hợp với bạn',
    compareTitle: 'So sánh nhanh',
    tierBudget: '💰 Giá rẻ - Tiết kiệm',
    tierStandard: '⭐ Phổ thông - Tin cậy',
    tierPremium: '👑 VIP - Cao cấp',
    investment: 'Tổng đầu tư',
    monthlySavings: 'Tiết kiệm/tháng',
    paybackPeriod: 'Hoàn vốn',
    lifetimeSavings: 'Lợi nhuận 25 năm',
    roi: 'ROI',
    features: 'Đặc điểm',
    products: 'Sản phẩm',
    inverter: 'Biến tần',
    panels: 'Tấm pin',
    battery: 'Pin lưu trữ',
    warranty: 'Bảo hành',
    years: 'năm',
    contactButton: 'Liên hệ tư vấn gói này',
    downloadPDF: 'Tải báo giá PDF',
    errorTitle: 'Có lỗi xảy ra',
    errorMessage: 'Vui lòng thử lại sau hoặc liên hệ hotline 0333 314 288',
  },
  en: {
    title: 'Solar System Calculator - Compare 3 Packages',
    subtitle: 'Enter your bill to get 3 options: Budget, Standard, Premium',
    inputLabel: 'Monthly Electricity Bill (VND)',
    inputPlaceholder: 'Ex: 2,000,000',
    systemTypeLabel: 'System Type',
    gridTied: 'Grid-tied',
    hybrid: 'Hybrid (Battery Storage)',
    calculateButton: 'Compare 3 Packages Now',
    loadingText: 'Calculating 3 tiers...',
    resultsTitle: 'Compare 3 Packages for You',
    systemSize: 'System Capacity',
    monthlyProduction: 'Monthly Production',
    selectTier: 'Select the package that fits you',
    compareTitle: 'Quick Comparison',
    tierBudget: '💰 Budget - Economical',
    tierStandard: '⭐ Standard - Reliable',
    tierPremium: '👑 Premium - High-end',
    investment: 'Total Investment',
    monthlySavings: 'Monthly Savings',
    paybackPeriod: 'Payback',
    lifetimeSavings: '25-Year Profit',
    roi: 'ROI',
    features: 'Features',
    products: 'Products',
    inverter: 'Inverter',
    panels: 'Solar Panels',
    battery: 'Battery',
    warranty: 'Warranty',
    years: 'years',
    contactButton: 'Contact for this package',
    downloadPDF: 'Download PDF Quote',
    errorTitle: 'Error Occurred',
    errorMessage: 'Please try again or contact hotline 0333 314 288',
  },
};

// ============================================
// MAIN COMPONENT
// ============================================
export function ThreeTierCalculator({ locale = 'vi' }: { locale?: string }) {
  const t = translations[locale] || translations.vi;

  const [monthlyBill, setMonthlyBill] = useState<string>('');
  const [systemType, setSystemType] = useState<'grid-tied' | 'hybrid'>('grid-tied');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThreeTierResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<'budget' | 'standard' | 'premium' | null>(null);

  const handleCalculate = async () => {
    const billNumber = parseFloat(monthlyBill.replace(/,/g, ''));

    if (!billNumber || billNumber <= 0) {
      setError('Vui lòng nhập hóa đơn điện hợp lệ');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedTier(null);

    try {
      const response = await fetch('/api/calculator/three-tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyBill: billNumber, systemType }),
      });

      if (!response.ok) throw new Error('Calculation failed');

      const data: ThreeTierResult = await response.json();
      setResult(data);
      setSelectedTier('standard'); // Default to standard tier
    } catch (err) {
      console.error('Calculator error:', err);
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleContact = (tier: TierRecommendation) => {
    if (!result) return;
    const message = generateTierContactMessage(tier, result.systemSize);
    window.open(`https://zalo.me/0333314288?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">{t.title}</h2>
        <p className="text-lg text-gray-600">{t.subtitle}</p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-orange-100">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.inputLabel}
            </label>
            <input
              type="text"
              value={monthlyBill}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setMonthlyBill(value ? parseInt(value).toLocaleString() : '');
              }}
              placeholder={t.inputPlaceholder}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.systemTypeLabel}
            </label>
            <select
              value={systemType}
              onChange={(e) => setSystemType(e.target.value as 'grid-tied' | 'hybrid')}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition text-lg"
            >
              <option value="grid-tied">{t.gridTied}</option>
              <option value="hybrid">{t.hybrid}</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="mt-6 w-full bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? t.loadingText : t.calculateButton}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded">
          <p className="text-red-700 font-semibold">{t.errorTitle}</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Results - 3 Tier Comparison */}
      {result && (
        <div>
          {/* System Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-8 border border-blue-200">
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.systemSize}</p>
                <p className="text-3xl font-bold text-blue-600">{result.systemSize.toFixed(2)} kWp</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.monthlyProduction}</p>
                <p className="text-3xl font-bold text-green-600">{result.monthlyProduction.toFixed(0)} kWh</p>
              </div>
            </div>
          </div>

          {/* 3-Column Tier Comparison */}
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t.selectTier}</h3>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {(['budget', 'standard', 'premium'] as const).map((tierKey) => {
              const tier = result.tiers[tierKey];
              const isSelected = selectedTier === tierKey;
              const isRecommended = tierKey === 'standard';

              return (
                <div
                  key={tierKey}
                  onClick={() => setSelectedTier(tierKey)}
                  className={`relative bg-white rounded-2xl shadow-lg border-4 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-1 ${
                    isSelected
                      ? 'border-orange-500 ring-4 ring-orange-200'
                      : isRecommended
                      ? 'border-yellow-400'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md">
                      ⭐ KHUYÊN DÙNG
                    </div>
                  )}

                  <div className="p-6">
                    {/* Tier Header */}
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-2">{tier.tierEmoji}</div>
                      <h4 className="text-xl font-bold text-gray-900">{tier.tierLabel}</h4>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6 pb-6 border-b border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">{t.investment}</p>
                      <p className="text-2xl font-bold text-orange-600">{formatVND(tier.totalInvestment)}</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t.monthlySavings}:</span>
                        <span className="font-semibold text-green-600">{formatVND(tier.monthlySavings)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t.paybackPeriod}:</span>
                        <span className="font-semibold text-blue-600">{tier.paybackPeriod.toFixed(1)} {t.years}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t.roi}:</span>
                        <span className="font-semibold text-purple-600">{tier.roi.toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{t.features}:</p>
                      <ul className="space-y-1 text-xs text-gray-600">
                        {tier.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="truncate">{feature}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Contact Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContact(tier);
                      }}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-md'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {t.contactButton}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed View of Selected Tier */}
          {selectedTier && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Chi tiết gói {result.tiers[selectedTier].tierLabel}
              </h3>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Inverter */}
                {result.tiers[selectedTier].inverter && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                      🔌 {t.inverter}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">{result.tiers[selectedTier].inverter.brand} {result.tiers[selectedTier].inverter.model}</p>
                      <p className="text-gray-600">
                        📊 {result.tiers[selectedTier].inverter.capacity / 1000}kW | {result.tiers[selectedTier].inverter.efficiency}%
                      </p>
                      <p className="text-gray-600">
                        🛡️ {result.tiers[selectedTier].inverter.warranty} {t.years} {t.warranty}
                      </p>
                      <p className="font-semibold text-orange-600">
                        {formatVND(result.tiers[selectedTier].inverter.price)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Panels */}
                {result.tiers[selectedTier].panels && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                      ☀️ {t.panels}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">{result.tiers[selectedTier].panels.brand} {result.tiers[selectedTier].panels.model}</p>
                      <p className="text-gray-600">
                        📊 {result.tiers[selectedTier].panels.capacity}W/tấm | {result.tiers[selectedTier].panels.efficiency}%
                      </p>
                      <p className="text-gray-600">
                        🛡️ {result.tiers[selectedTier].panels.warranty} {t.years} {t.warranty}
                      </p>
                      <p className="text-blue-600">
                        Số lượng: {result.tiers[selectedTier].panels.quantity} tấm
                      </p>
                      <p className="font-semibold text-orange-600">
                        {formatVND(result.tiers[selectedTier].panels.totalPrice)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Battery */}
                {result.tiers[selectedTier].battery && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                      🔋 {t.battery}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">{result.tiers[selectedTier].battery.brand} {result.tiers[selectedTier].battery.model}</p>
                      <p className="text-gray-600">
                        📊 {result.tiers[selectedTier].battery.capacity / 1000}kWh
                      </p>
                      <p className="text-gray-600">
                        🛡️ {result.tiers[selectedTier].battery.warranty} {t.years} {t.warranty}
                      </p>
                      <p className="font-semibold text-orange-600">
                        {formatVND(result.tiers[selectedTier].battery.price)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ROI Visualization */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-4">📈 Phân tích lợi nhuận 25 năm</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Hoàn vốn sau {result.tiers[selectedTier].paybackPeriod.toFixed(1)} năm</span>
                      <span className="text-sm font-semibold">{((result.tiers[selectedTier].paybackPeriod / 25) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((result.tiers[selectedTier].paybackPeriod / 25) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Tổng lợi nhuận</p>
                      <p className="text-xl font-bold text-green-600">{formatVND(result.tiers[selectedTier].lifeTimeSavings)}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Tỷ suất hoàn vốn (ROI)</p>
                      <p className="text-xl font-bold text-purple-600">{result.tiers[selectedTier].roi.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
