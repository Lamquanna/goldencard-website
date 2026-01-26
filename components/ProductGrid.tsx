'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sanityClient } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  category: string;
  brand?: string;
  model?: string;
  tier?: 'budget' | 'standard' | 'premium';
  brandOrigin?: string;
  techSpecs?: {
    capacity?: number;
    efficiency?: number;
    warrantyYears?: number;
  };
  price?: {
    amount: number;
    currency: string;
  };
  description?: string;
  images?: any[];
  inStock?: boolean;
}

interface ProductGridProps {
  locale: string;
  initialProducts: Product[];
}

const translations = {
  vi: {
    tiers: {
      budget: '💰 Tiết kiệm',
      standard: '⭐ Phổ thông',
      premium: '👑 VIP',
    },
    specs: {
      capacity: 'Công suất',
      efficiency: 'Hiệu suất',
      warranty: 'Bảo hành',
      origin: 'Xuất xứ',
    },
    cta: {
      viewDetails: 'Xem chi tiết',
      inStock: 'Còn hàng',
      outOfStock: 'Hết hàng',
    },
    realtime: 'Đồng bộ real-time',
  },
  en: {
    tiers: {
      budget: '💰 Budget',
      standard: '⭐ Standard',
      premium: '👑 Premium',
    },
    specs: {
      capacity: 'Capacity',
      efficiency: 'Efficiency',
      warranty: 'Warranty',
      origin: 'Origin',
    },
    cta: {
      viewDetails: 'View Details',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
    },
    realtime: 'Real-time sync',
  },
  zh: {
    tiers: {
      budget: '💰 经济型',
      standard: '⭐ 标准型',
      premium: '👑 高端型',
    },
    specs: {
      capacity: '容量',
      efficiency: '效率',
      warranty: '保修',
      origin: '产地',
    },
    cta: {
      viewDetails: '查看详情',
      inStock: '有货',
      outOfStock: '缺货',
    },
    realtime: '实时同步',
  },
  id: {
    tiers: {
      budget: '💰 Hemat',
      standard: '⭐ Standar',
      premium: '👑 Premium',
    },
    specs: {
      capacity: 'Kapasitas',
      efficiency: 'Efisiensi',
      warranty: 'Garansi',
      origin: 'Asal',
    },
    cta: {
      viewDetails: 'Lihat Detail',
      inStock: 'Tersedia',
      outOfStock: 'Habis',
    },
    realtime: 'Sinkronisasi real-time',
  },
};

export function ProductGrid({ locale, initialProducts }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLive, setIsLive] = useState(false);
  const t = translations[locale as keyof typeof translations] || translations.vi;

  useEffect(() => {
    // Real-time subscription from Sanity
    const subscription = sanityClient
      .listen('*[_type == "product"]', {}, { includeResult: true })
      .subscribe((update) => {
        console.log('🔄 Real-time product update:', update);
        setIsLive(true);

        // Refresh products
        const query = `*[_type == "product"] | order(_createdAt desc) {
          _id,
          name,
          slug,
          category,
          brand,
          model,
          tier,
          brandOrigin,
          techSpecs,
          price,
          description,
          images,
          inStock
        }`;

        sanityClient.fetch(query).then((data) => {
          setProducts(data);
          setTimeout(() => setIsLive(false), 2000);
        });
      });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => {
          const imageUrl = product.images?.[0]
            ? urlForImage(product.images[0]).width(600).height(400).url()
            : null;

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group"
            >
              {/* Product Image */}
              <div className="relative h-64 bg-gray-100">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span className="text-6xl">☀️</span>
                  </div>
                )}

                {/* Tier Badge */}
                {product.tier && (
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        product.tier === 'premium'
                          ? 'bg-yellow-500 text-white'
                          : product.tier === 'standard'
                          ? 'bg-blue-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {t.tiers[product.tier]}
                    </span>
                  </div>
                )}

                {/* Stock Badge */}
                {product.inStock !== undefined && (
                  <div className="absolute bottom-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        product.inStock ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {product.inStock ? t.cta.inStock : t.cta.outOfStock}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                {product.brand && product.model && (
                  <p className="text-sm text-gray-600 mb-4">
                    {product.brand} {product.model}
                  </p>
                )}

                {/* Technical Specs */}
                {product.techSpecs && (
                  <div className="space-y-2 mb-4">
                    {product.techSpecs.capacity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t.specs.capacity}:</span>
                        <span className="font-semibold">{product.techSpecs.capacity}W</span>
                      </div>
                    )}
                    {product.techSpecs.efficiency && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t.specs.efficiency}:</span>
                        <span className="font-semibold">{product.techSpecs.efficiency}%</span>
                      </div>
                    )}
                    {product.techSpecs.warrantyYears && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t.specs.warranty}:</span>
                        <span className="font-semibold">
                          {product.techSpecs.warrantyYears} năm
                        </span>
                      </div>
                    )}
                    {product.brandOrigin && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t.specs.origin}:</span>
                        <span className="font-semibold">{product.brandOrigin}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Price */}
                {product.price && (
                  <div className="text-2xl font-bold text-orange-600 mb-4">
                    {product.price.amount.toLocaleString('vi-VN')} {product.price.currency}
                  </div>
                )}

                {/* CTAs */}
                <div className="flex gap-2">
                  <Link
                    href={`/${locale}/san-pham/${product.slug.current}`}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-semibold text-center hover:shadow-lg transition-all"
                  >
                    {t.cta.viewDetails}
                  </Link>
                  <a
                    href="tel:0333314288"
                    className="px-4 py-3 border-2 border-orange-500 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                  >
                    📞
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Sync Indicator */}
      <div
        className={`fixed bottom-4 right-4 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all ${
          isLive
            ? 'bg-green-500 text-white scale-110'
            : 'bg-gray-800 text-white scale-100 opacity-75'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isLive ? 'bg-white animate-pulse' : 'bg-green-400'
          }`}
        ></span>
        <span className="text-sm font-semibold">{t.realtime}</span>
      </div>
    </>
  );
}
