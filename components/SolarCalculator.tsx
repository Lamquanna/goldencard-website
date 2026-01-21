'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { CalculatorResult } from '@/sanity/services/calculatorService';

// ============================================
// INTERFACES & TYPES
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
  monthlySavings: string;
  paybackPeriod: string;
  totalInvestment: string;
  recommendedProducts: string;
  inverter: string;
  solarPanels: string;
  battery: string;
  capacity: string;
  efficiency: string;
  warranty: string;
  quantity: string;
  years: string;
  contactButton: string;
  errorTitle: string;
  errorMessage: string;
  fallbackTitle: string;
}

const translations: Record<string, TranslatedContent> = {
  vi: {
    title: 'Máy tính hệ thống điện mặt trời',
    subtitle: 'Nhập hóa đơn điện để nhận gợi ý cấu hình phù hợp với sản phẩm thực tế',
    inputLabel: 'Hóa đơn điện hàng tháng (VNĐ)',
    inputPlaceholder: 'VD: 2,000,000',
    systemTypeLabel: 'Loại hệ thống',
    gridTied: 'Hòa lưới (Grid-tied)',
    hybrid: 'Hybrid (Pin lưu trữ)',
    calculateButton: 'Tính toán ngay',
    loadingText: 'Đang tính toán...',
    resultsTitle: 'Kết quả tính toán',
    systemSize: 'Công suất hệ thống',
    monthlyProduction: 'Sản lượng điện/tháng',
    monthlySavings: 'Tiết kiệm hàng tháng',
    paybackPeriod: 'Thời gian hoàn vốn',
    totalInvestment: 'Tổng đầu tư ước tính',
    recommendedProducts: 'Sản phẩm gợi ý',
    inverter: 'Biến tần',
    solarPanels: 'Tấm pin mặt trời',
    battery: 'Pin lưu trữ',
    capacity: 'Công suất',
    efficiency: 'Hiệu suất',
    warranty: 'Bảo hành',
    quantity: 'Số lượng',
    years: 'năm',
    contactButton: 'Liên hệ tư vấn',
    errorTitle: 'Có lỗi xảy ra',
    errorMessage: 'Vui lòng thử lại sau hoặc liên hệ hotline 0333 314 288',
    fallbackTitle: 'Thông báo',
  },
  en: {
    title: 'Solar System Calculator',
    subtitle: 'Enter your electricity bill to get recommendations with actual products',
    inputLabel: 'Monthly Electricity Bill (VND)',
    inputPlaceholder: 'Ex: 2,000,000',
    systemTypeLabel: 'System Type',
    gridTied: 'Grid-tied',
    hybrid: 'Hybrid (Battery Storage)',
    calculateButton: 'Calculate Now',
    loadingText: 'Calculating...',
    resultsTitle: 'Calculation Results',
    systemSize: 'System Capacity',
    monthlyProduction: 'Monthly Production',
    monthlySavings: 'Monthly Savings',
    paybackPeriod: 'Payback Period',
    totalInvestment: 'Estimated Investment',
    recommendedProducts: 'Recommended Products',
    inverter: 'Inverter',
    solarPanels: 'Solar Panels',
    battery: 'Battery Storage',
    capacity: 'Capacity',
    efficiency: 'Efficiency',
    warranty: 'Warranty',
    quantity: 'Quantity',
    years: 'years',
    contactButton: 'Contact Us',
    errorTitle: 'Error Occurred',
    errorMessage: 'Please try again or contact hotline 0333 314 288',
    fallbackTitle: 'Notice',
  },
  zh: {
    title: '太阳能系统计算器',
    subtitle: '输入您的电费账单，获取实际产品推荐',
    inputLabel: '月电费 (越南盾)',
    inputPlaceholder: '例如: 2,000,000',
    systemTypeLabel: '系统类型',
    gridTied: '并网系统',
    hybrid: '混合系统 (储能)',
    calculateButton: '立即计算',
    loadingText: '计算中...',
    resultsTitle: '计算结果',
    systemSize: '系统容量',
    monthlyProduction: '月发电量',
    monthlySavings: '月节省',
    paybackPeriod: '回本期',
    totalInvestment: '预估投资',
    recommendedProducts: '推荐产品',
    inverter: '逆变器',
    solarPanels: '太阳能板',
    battery: '储能电池',
    capacity: '容量',
    efficiency: '效率',
    warranty: '保修',
    quantity: '数量',
    years: '年',
    contactButton: '联系咨询',
    errorTitle: '发生错误',
    errorMessage: '请稍后重试或联系热线 0333 314 288',
    fallbackTitle: '通知',
  },
  id: {
    title: 'Kalkulator Sistem Surya',
    subtitle: 'Masukkan tagihan listrik untuk rekomendasi produk nyata',
    inputLabel: 'Tagihan Listrik Bulanan (VND)',
    inputPlaceholder: 'Contoh: 2,000,000',
    systemTypeLabel: 'Jenis Sistem',
    gridTied: 'Grid-tied',
    hybrid: 'Hybrid (Penyimpanan Baterai)',
    calculateButton: 'Hitung Sekarang',
    loadingText: 'Menghitung...',
    resultsTitle: 'Hasil Perhitungan',
    systemSize: 'Kapasitas Sistem',
    monthlyProduction: 'Produksi Bulanan',
    monthlySavings: 'Penghematan Bulanan',
    paybackPeriod: 'Periode Balik Modal',
    totalInvestment: 'Estimasi Investasi',
    recommendedProducts: 'Produk yang Direkomendasikan',
    inverter: 'Inverter',
    solarPanels: 'Panel Surya',
    battery: 'Penyimpanan Baterai',
    capacity: 'Kapasitas',
    efficiency: 'Efisiensi',
    warranty: 'Garansi',
    quantity: 'Jumlah',
    years: 'tahun',
    contactButton: 'Hubungi Kami',
    errorTitle: 'Terjadi Kesalahan',
    errorMessage: 'Silakan coba lagi atau hubungi hotline 0333 314 288',
    fallbackTitle: 'Pemberitahuan',
  },
};

// ============================================
// PRODUCT CARD COMPONENT
// ============================================
interface ProductCardProps {
  title: string;
  icon: string;
  product: {
    name: string;
    brand: string;
    model: string;
    capacity: number;
    efficiency?: number;
    warranty: number;
    price: number;
    imageUrl?: string;
    quantity?: number;
    totalPrice?: number;
  };
  locale: string;
}

function ProductCard({ title, icon, product, locale }: ProductCardProps) {
  const t = translations[locale] || translations.vi;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          {title}
        </h3>
      </div>
      <div className="p-4">
        <div className="flex gap-4">
          {product.imageUrl ? (
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center text-4xl">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{product.name}</h4>
            <p className="text-sm text-gray-600">
              {product.brand} {product.model}
            </p>
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">{t.capacity}:</span>{' '}
                {product.capacity >= 1000
                  ? `${(product.capacity / 1000).toFixed(1)}kW`
                  : `${product.capacity}W`}
              </p>
              {product.efficiency && (
                <p className="text-gray-700">
                  <span className="font-medium">{t.efficiency}:</span> {product.efficiency}%
                </p>
              )}
              <p className="text-gray-700">
                <span className="font-medium">{t.warranty}:</span> {product.warranty} {t.years}
              </p>
              {product.quantity && (
                <p className="text-gray-700">
                  <span className="font-medium">{t.quantity}:</span> {product.quantity}
                </p>
              )}
            </div>
            <div className="mt-3">
              <p className="text-lg font-bold text-green-600">
                {formatVND(product.totalPrice || product.price)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function generateContactMessage(result: CalculatorResult, locale: string): string {
  const { systemSize, products } = result;

  let message = ``;

  if (locale === 'vi') {
    message = `Tôi quan tâm đến hệ thống điện mặt trời ${systemSize.toFixed(1)}kWp gồm:\n\n`;
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
  } else if (locale === 'en') {
    message = `I'm interested in a ${systemSize.toFixed(1)}kWp solar system including:\n\n`;
    if (products.inverter) {
      message += `🔌 Inverter: ${products.inverter.brand} ${products.inverter.model} (${products.inverter.capacity / 1000}kW)\n`;
    }
    if (products.panels) {
      message += `☀️ Solar Panels: ${products.panels.quantity} pcs ${products.panels.brand} ${products.panels.model} (${products.panels.capacity}W)\n`;
    }
    if (products.battery) {
      message += `🔋 Battery: ${products.battery.brand} ${products.battery.model} (${products.battery.capacity / 1000}kWh)\n`;
    }
    message += `\n💰 Estimated Investment: ${formatVND(result.totalInvestment)}\n`;
    message += `💵 Monthly Savings: ${formatVND(result.monthlySavings)}\n`;
    message += `⏱️ Payback Period: ${result.paybackPeriod.toFixed(1)} years\n\n`;
    message += `Please provide detailed consultation and accurate quotation.`;
  } else {
    // Chinese/Indonesian fallback
    message = `System: ${systemSize.toFixed(1)}kWp\nInvestment: ${formatVND(result.totalInvestment)}\nSavings: ${formatVND(result.monthlySavings)}/month`;
  }

  return encodeURIComponent(message);
}

// ============================================
// MAIN CALCULATOR COMPONENT
// ============================================
interface SolarCalculatorProps {
  locale?: string;
}

export default function SolarCalculator({ locale = 'vi' }: SolarCalculatorProps) {
  const t = translations[locale] || translations.vi;

  const [monthlyBill, setMonthlyBill] = useState('');
  const [systemType, setSystemType] = useState<'grid-tied' | 'hybrid'>('grid-tied');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setError(null);
    setResult(null);

    const billAmount = parseFloat(monthlyBill.replace(/,/g, ''));

    if (!billAmount || billAmount < 100000) {
      setError('Vui lòng nhập hóa đơn hợp lệ (tối thiểu 100,000 VNĐ)');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyBill: billAmount,
          systemType,
        }),
      });

      if (!response.ok) {
        throw new Error('Calculation failed');
      }

      const data: CalculatorResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Calculator error:', err);
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = () => {
    if (!result) return;

    const message = generateContactMessage(result, locale);
    const phone = '0333314288';
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Bill Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.inputLabel}
            </label>
            <input
              type="text"
              value={monthlyBill}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setMonthlyBill(value);
              }}
              placeholder={t.inputPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* System Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.systemTypeLabel}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="grid-tied"
                  checked={systemType === 'grid-tied'}
                  onChange={(e) => setSystemType(e.target.value as 'grid-tied')}
                  className="mr-2"
                />
                <span className="text-sm">{t.gridTied}</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="hybrid"
                  checked={systemType === 'hybrid'}
                  onChange={(e) => setSystemType(e.target.value as 'hybrid')}
                  className="mr-2"
                />
                <span className="text-sm">{t.hybrid}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <div className="mt-6">
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t.loadingText : t.calculateButton}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-semibold mb-1">{t.errorTitle}</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Fallback Message (for edge cases) */}
      {result?.fallbackMessage && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="text-orange-800 font-semibold mb-1">{t.fallbackTitle}</h3>
          <p className="text-orange-700 text-sm">{result.fallbackMessage}</p>
        </div>
      )}

      {/* Results Section */}
      {result && !result.fallbackMessage && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.resultsTitle}</h3>

          {/* Financial Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {result.systemSize.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 mt-1">kWp</div>
              <div className="text-xs text-gray-500 mt-1">{t.systemSize}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {result.monthlyProduction.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">kWh</div>
              <div className="text-xs text-gray-500 mt-1">{t.monthlyProduction}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-yellow-600">
                {formatVND(result.monthlySavings)}
              </div>
              <div className="text-xs text-gray-500 mt-1">{t.monthlySavings}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {result.paybackPeriod.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 mt-1">{t.years}</div>
              <div className="text-xs text-gray-500 mt-1">{t.paybackPeriod}</div>
            </div>
          </div>

          {/* Total Investment Banner */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 mb-8 text-center">
            <div className="text-white text-sm font-medium mb-1">{t.totalInvestment}</div>
            <div className="text-white text-4xl font-bold">
              {formatVND(result.totalInvestment)}
            </div>
          </div>

          {/* Recommended Products */}
          <div className="mb-8">
            <h4 className="text-xl font-bold text-gray-900 mb-4">{t.recommendedProducts}</h4>
            <div className="space-y-4">
              {result.products.inverter && (
                <ProductCard
                  title={t.inverter}
                  icon="🔌"
                  product={result.products.inverter}
                  locale={locale}
                />
              )}
              {result.products.panels && (
                <ProductCard
                  title={t.solarPanels}
                  icon="☀️"
                  product={result.products.panels}
                  locale={locale}
                />
              )}
              {result.products.battery && (
                <ProductCard
                  title={t.battery}
                  icon="🔋"
                  product={result.products.battery}
                  locale={locale}
                />
              )}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center">
            <button
              onClick={handleContactClick}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-colors shadow-lg"
            >
              {t.contactButton}
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Hotline: 0333 314 288 | 0903 117 277
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
