'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Phone, Mail, MapPin } from 'lucide-react';

interface PricingPackage {
  _id: string;
  name: { vi: string; en: string; zh: string };
  slug: { current: string };
  category: string;
  capacity: number;
  priceBeforeVAT: number;
  priceAfterVAT: number;
  components: Array<{
    name: { vi: string; en: string; zh: string };
    quantity: string;
    icon: string;
  }>;
  suitableFor: { vi: string; en: string; zh: string };
  monthlyConsumption?: { min: number; max: number };
  featured: boolean;
  warranty: {
    panels: number;
    inverter: number;
    battery: number;
  };
  installationTime: { vi: string; en: string; zh: string };
}

interface PricingPageProps {
  packages: PricingPackage[];
  locale: string;
}

const categoryNames: Record<string, { vi: string; en: string; zh: string }> = {
  '1phase': {
    vi: '🏠 GÓI HỘ GIA ĐÌNH (1 Phase)',
    en: '🏠 RESIDENTIAL PACKAGES (1 Phase)',
    zh: '🏠 家庭套餐 (单相)',
  },
  '3phase-storage': {
    vi: '🏢 GÓI THƯƠNG MẠI (3 Phase - Có Lưu Trữ)',
    en: '🏢 COMMERCIAL PACKAGES (3 Phase - With Storage)',
    zh: '🏢 商业套餐 (三相 - 带储能)',
  },
  'ci-ongrid': {
    vi: '🏭 GÓI C&I (On-Grid - Không Lưu Trữ)',
    en: '🏭 C&I PACKAGES (On-Grid - No Storage)',
    zh: '🏭 工商业套餐 (并网 - 无储能)',
  },
  bess: {
    vi: '🔋 GÓI BESS (Battery Energy Storage)',
    en: '🔋 BESS PACKAGES (Battery Energy Storage)',
    zh: '🔋 电池储能系统',
  },
};

export function PricingClient({ packages, locale }: PricingPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(packages.map((p) => p.category))];

  const filteredPackages =
    selectedCategory === 'all'
      ? packages
      : packages.filter((p) => p.category === selectedCategory);

  const groupedPackages = filteredPackages.reduce((acc, pkg) => {
    if (!acc[pkg.category]) {
      acc[pkg.category] = [];
    }
    acc[pkg.category].push(pkg);
    return acc;
  }, {} as Record<string, PricingPackage[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {locale === 'vi'
              ? '📋 BẢNG GIÁ HỆ THỐNG ĐIỆN MẶT TRỜI 2026'
              : locale === 'zh'
              ? '📋 太阳能系统价格表 2026'
              : '📋 SOLAR SYSTEM PRICING 2026'}
          </h1>
          <p className="text-xl opacity-90">
            {locale === 'vi'
              ? 'Golden Energy Vietnam - Giải Pháp Năng Lượng Xanh Toàn Diện'
              : locale === 'zh'
              ? '金能源越南 - 全面绿色能源解决方案'
              : 'Golden Energy Vietnam - Comprehensive Green Energy Solutions'}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <a
              href="tel:0333314288"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-5 h-5" />
              03333 142 88
            </a>
            <a
              href="tel:0903117277"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
            >
              <Phone className="w-5 h-5" />
              0903 117 277
            </a>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {locale === 'vi' ? 'Tất cả' : locale === 'zh' ? '全部' : 'All'}
            </button>
            {categories
              .filter((c) => c !== 'all')
              .map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {categoryNames[category]?.[locale as 'vi' | 'en' | 'zh'] || category}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Pricing Packages */}
      <div className="container mx-auto px-4 py-12">
        {Object.entries(groupedPackages).map(([category, categoryPackages]) => (
          <div key={category} className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {categoryNames[category]?.[locale as 'vi' | 'en' | 'zh'] || category}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryPackages.map((pkg) => (
                <div
                  key={pkg._id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                    pkg.featured ? 'ring-4 ring-orange-500' : ''
                  }`}
                >
                  {pkg.featured && (
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-center py-2 font-bold">
                      {locale === 'vi' ? '⭐ PHỔ BIẾN' : locale === 'zh' ? '⭐ 热门' : '⭐ POPULAR'}
                    </div>
                  )}

                  <div className="p-6">
                    {/* Package Name */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {pkg.name[locale as 'vi' | 'en' | 'zh'] || pkg.name.vi}
                    </h3>
                    <div className="text-4xl font-bold text-orange-600 mb-1">
                      {pkg.capacity}kW
                    </div>
                    <div className="text-lg text-gray-600 mb-4">
                      {pkg.priceBeforeVAT.toLocaleString()} triệu VNĐ
                      <span className="text-sm text-gray-500"> (Chưa VAT)</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-6">
                      {pkg.priceAfterVAT?.toLocaleString() ||
                        (pkg.priceBeforeVAT * 1.08).toFixed(1)}{' '}
                      triệu VNĐ
                      <span className="text-sm text-gray-500 block">(Có VAT 8%)</span>
                    </div>

                    {/* Components */}
                    <div className="space-y-3 mb-6">
                      {pkg.components?.map((component, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-2xl">{component.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {component.name[locale as 'vi' | 'en' | 'zh'] || component.name.vi}
                            </div>
                            <div className="text-sm text-gray-600">{component.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Suitable For */}
                    {pkg.suitableFor && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <div className="text-sm font-semibold text-blue-900 mb-1">
                          {locale === 'vi'
                            ? '✅ Phù hợp:'
                            : locale === 'zh'
                            ? '✅ 适合:'
                            : '✅ Suitable for:'}
                        </div>
                        <div className="text-sm text-blue-800">
                          {pkg.suitableFor[locale as 'vi' | 'en' | 'zh'] || pkg.suitableFor.vi}
                        </div>
                        {pkg.monthlyConsumption && (
                          <div className="text-xs text-blue-700 mt-1">
                            {pkg.monthlyConsumption.min}-{pkg.monthlyConsumption.max} kWh/tháng
                          </div>
                        )}
                      </div>
                    )}

                    {/* Warranty */}
                    <div className="grid grid-cols-3 gap-2 text-center text-sm mb-6">
                      <div className="bg-gray-50 rounded p-2">
                        <div className="font-bold text-gray-900">
                          {pkg.warranty.panels}
                          {locale === 'vi' ? ' năm' : locale === 'zh' ? ' 年' : ' yrs'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {locale === 'vi' ? 'Tấm pin' : locale === 'zh' ? '太阳能板' : 'Panels'}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <div className="font-bold text-gray-900">
                          {pkg.warranty.inverter}
                          {locale === 'vi' ? ' năm' : locale === 'zh' ? ' 年' : ' yrs'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {locale === 'vi' ? 'Inverter' : locale === 'zh' ? '逆变器' : 'Inverter'}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <div className="font-bold text-gray-900">
                          {pkg.warranty.battery}
                          {locale === 'vi' ? ' năm' : locale === 'zh' ? ' 年' : ' yrs'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {locale === 'vi' ? 'Pin' : locale === 'zh' ? '电池' : 'Battery'}
                        </div>
                      </div>
                    </div>

                    {/* Installation Time */}
                    {pkg.installationTime && (
                      <div className="text-sm text-gray-600 mb-6 text-center">
                        ⏱️ {locale === 'vi' ? 'Lắp đặt: ' : locale === 'zh' ? '安装时间: ' : 'Installation: '}
                        {pkg.installationTime[locale as 'vi' | 'en' | 'zh'] ||
                          pkg.installationTime.vi}
                      </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="space-y-2">
                      <a
                        href={`tel:0333314288`}
                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-lg font-bold hover:from-orange-600 hover:to-yellow-600 transition-all"
                      >
                        <Phone className="w-5 h-5" />
                        {locale === 'vi'
                          ? 'Gọi tư vấn ngay'
                          : locale === 'zh'
                          ? '立即咨询'
                          : 'Call Now'}
                      </a>
                      <Link
                        href={`/${locale}/tinh-toan`}
                        className="w-full inline-block text-center border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                      >
                        {locale === 'vi'
                          ? '💡 Tính toán chi tiết'
                          : locale === 'zh'
                          ? '💡 详细计算'
                          : '💡 Calculate Details'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Free Services */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {locale === 'vi'
              ? '🎁 DỊCH VỤ MIỄN PHÍ'
              : locale === 'zh'
              ? '🎁 免费服务'
              : '🎁 FREE SERVICES'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              locale === 'vi' ? 'Khảo sát 24/7' : locale === 'zh' ? '24/7勘察' : 'Survey 24/7',
              locale === 'vi' ? 'Thiết kế 3D' : locale === 'zh' ? '3D设计' : '3D Design',
              locale === 'vi' ? 'Tính ROI' : locale === 'zh' ? 'ROI计算' : 'ROI Calculation',
              locale === 'vi' ? 'Báo giá minh bạch' : locale === 'zh' ? '透明报价' : 'Transparent Quote',
              locale === 'vi' ? 'Hỗ trợ EVN' : locale === 'zh' ? 'EVN支持' : 'EVN Support',
              locale === 'vi' ? 'Bảo trì năm 1' : locale === 'zh' ? '第一年维护' : '1st Year Maintenance',
            ].map((service, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
                <Check className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">
            {locale === 'vi'
              ? '📞 LIÊN HỆ TƯ VẤN'
              : locale === 'zh'
              ? '📞 联系咨询'
              : '📞 CONTACT US'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <Phone className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <div className="font-bold text-lg mb-2">Hotline</div>
              <div className="text-gray-300">
                <a href="tel:0333314288" className="hover:text-orange-500">
                  03333 142 88
                </a>
                <br />
                <a href="tel:0903117277" className="hover:text-orange-500">
                  0903 117 277
                </a>
              </div>
            </div>
            <div>
              <Mail className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <div className="font-bold text-lg mb-2">Email</div>
              <a
                href="mailto:info@goldenenergy.vn"
                className="text-gray-300 hover:text-orange-500"
              >
                info@goldenenergy.vn
              </a>
            </div>
            <div>
              <MapPin className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <div className="font-bold text-lg mb-2">
                {locale === 'vi' ? 'Văn phòng' : locale === 'zh' ? '办公室' : 'Office'}
              </div>
              <div className="text-gray-300 text-sm">
                TP.HCM, Hà Nội, Đà Nẵng
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700 text-sm text-gray-400">
            <p>
              {locale === 'vi'
                ? '📅 Cập nhật: 27/01/2026 | Bảng giá có hiệu lực đến 31/03/2026'
                : locale === 'zh'
                ? '📅 更新: 27/01/2026 | 价格有效期至 31/03/2026'
                : '📅 Updated: 27/01/2026 | Valid until 31/03/2026'}
            </p>
            <p className="mt-2">
              ⚠️{' '}
              {locale === 'vi'
                ? 'Giá chưa bao gồm VAT 8% (trừ khi ghi rõ)'
                : locale === 'zh'
                ? '价格不含8%增值税(除非另有说明)'
                : 'Prices exclude 8% VAT (unless specified)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
