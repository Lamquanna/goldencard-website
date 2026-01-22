/**
 * Content Recommendations Component
 * Displays personalized content based on user behavior
 * 
 * Usage:
 * <RecommendedContent 
 *   recommendations={['page1', 'page2']} 
 *   locale="vi"
 * />
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface RecommendedContentProps {
  recommendations: string[];
  locale: string;
  className?: string;
}

interface PageMetadata {
  url: string;
  title: string;
  description: string;
  category: string;
}

// Map URLs to metadata
const PAGE_METADATA: Record<string, PageMetadata> = {
  '/vi/giai-phap/dien-mat-troi-ho-gia-dinh': {
    url: '/vi/giai-phap/dien-mat-troi-ho-gia-dinh',
    title: 'Điện Mặt Trời Hộ Gia Đình',
    description: 'Giải pháp tiết kiệm 70-80% hóa đơn điện cho ngôi nhà của bạn',
    category: 'Giải pháp',
  },
  '/vi/giai-phap/dien-mat-troi-thuong-mai': {
    url: '/vi/giai-phap/dien-mat-troi-thuong-mai',
    title: 'Điện Mặt Trời Thương Mại',
    description: 'Tối ưu chi phí vận hành cho doanh nghiệp, ROI hấp dẫn',
    category: 'Giải pháp',
  },
  '/vi/giai-phap/dien-mat-troi-cong-nghiep': {
    url: '/vi/giai-phap/dien-mat-troi-cong-nghiep',
    title: 'Điện Mặt Trời Công Nghiệp',
    description: 'Giảm chi phí sản xuất, đáp ứng tiêu chuẩn ESG',
    category: 'Giải pháp',
  },
  '/vi/san-pham/tam-pin': {
    url: '/vi/san-pham/tam-pin',
    title: 'Tấm Pin Mặt Trời',
    description: 'Longi, Jinko, Trina - Hiệu suất cao, giá cạnh tranh',
    category: 'Sản phẩm',
  },
  '/vi/san-pham/bien-tan': {
    url: '/vi/san-pham/bien-tan',
    title: 'Biến Tần (Inverter)',
    description: 'Huawei, Growatt - Công nghệ thông minh, bền bỉ',
    category: 'Sản phẩm',
  },
  '/vi/san-pham/pin-luu-tru': {
    url: '/vi/san-pham/pin-luu-tru',
    title: 'Pin Lưu Trữ',
    description: 'UFO Powerwall, Tesla - Backup điện, tối ưu chi phí',
    category: 'Sản phẩm',
  },
  '/vi/du-an': {
    url: '/vi/du-an',
    title: 'Dự Án Tiêu Biểu',
    description: '500+ dự án hoàn thành, 50MW công suất',
    category: 'Dự án',
  },
  '/vi/tinh-toan': {
    url: '/vi/tinh-toan',
    title: 'Công Cụ Tính Toán',
    description: 'Tính ROI và chi phí hệ thống điện mặt trời miễn phí',
    category: 'Công cụ',
  },
  '/vi/bai-viet': {
    url: '/vi/bai-viet',
    title: 'Blog & Kiến Thức',
    description: 'Cập nhật xu hướng năng lượng tái tạo mới nhất',
    category: 'Blog',
  },
};

export function RecommendedContent({ 
  recommendations, 
  locale,
  className = '' 
}: RecommendedContentProps) {
  const [pages, setPages] = useState<PageMetadata[]>([]);
  
  useEffect(() => {
    // Map recommendations to metadata
    const metadata = recommendations
      .map(url => PAGE_METADATA[url])
      .filter(Boolean)
      .slice(0, 4); // Max 4 recommendations
    
    setPages(metadata);
  }, [recommendations]);
  
  if (pages.length === 0) return null;
  
  const content = {
    vi: {
      title: 'Nội Dung Liên Quan',
      subtitle: 'Khách hàng cũng quan tâm',
      cta: 'Xem thêm',
    },
    en: {
      title: 'Related Content',
      subtitle: 'Customers also viewed',
      cta: 'Learn more',
    },
    zh: {
      title: '相关内容',
      subtitle: '客户也关注',
      cta: '了解更多',
    },
  };
  
  const t = content[locale as keyof typeof content] || content.vi;
  
  return (
    <section className={`py-16 bg-gradient-to-br from-gray-50 to-white ${className}`}>
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-yellow-600" />
          <h2 className="text-3xl font-bold text-gray-900">
            {t.title}
          </h2>
        </div>
        <p className="text-gray-600 mb-8">{t.subtitle}</p>
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pages.map((page, index) => (
            <Link
              key={page.url}
              href={page.url}
              className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-yellow-500 hover:shadow-lg transition-all duration-300"
            >
              {/* Category Badge */}
              <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full mb-3">
                {page.category}
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                {page.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {page.description}
              </p>
              
              {/* CTA */}
              <div className="flex items-center gap-2 text-yellow-600 font-semibold text-sm group-hover:gap-3 transition-all">
                <span>{t.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
