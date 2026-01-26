import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/Container'
import { client } from '@/sanity/lib/client'
import { urlForImage } from '@/sanity/lib/image'
import { 
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  Shield,
  Award,
  Zap
} from 'lucide-react'

// ISR: Revalidate every 60 seconds
export const revalidate = 60

interface PageProps {
  params: Promise<{
    locale: string
    category: string
  }>
}

// Category name mapping
const categoryNames: Record<string, Record<string, string>> = {
  'tam-pin': {
    vi: 'Tấm Pin Mặt Trời',
    en: 'Solar Panels',
    zh: '太阳能板',
    id: 'Panel Surya'
  },
  'bien-tan': {
    vi: 'Biến Tần (Inverter)',
    en: 'Inverters',
    zh: '逆变器',
    id: 'Inverter'
  },
  'pin-luu-tru': {
    vi: 'Pin Lưu Trữ',
    en: 'Battery Storage',
    zh: '储能电池',
    id: 'Baterai Penyimpanan'
  },
  'giam-sat': {
    vi: 'Hệ Thống Giám Sát',
    en: 'Monitoring Systems',
    zh: '监控系统',
    id: 'Sistem Monitoring'
  }
}

// Map URL slug to Sanity category
const categoryMapping: Record<string, string[]> = {
  'tam-pin': ['panels', 'solar-panel'],
  'bien-tan': ['inverter', 'inverters'],
  'pin-luu-tru': ['battery'],
  'giam-sat': ['monitoring']
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category } = await params
  const categoryName = categoryNames[category]?.[locale] || category
  
  return {
    title: `${categoryName} - Golden Energy`,
    description: `Danh sách sản phẩm ${categoryName} chính hãng từ Golden Energy`,
  }
}

export default async function ProductCategoryPage({ params }: PageProps) {
  const { locale, category } = await params
  
  // Get category name
  const categoryName = categoryNames[category]?.[locale]
  if (!categoryName) {
    notFound()
  }
  
  // Map URL category to Sanity categories
  const sanityCategories = categoryMapping[category]
  if (!sanityCategories) {
    notFound()
  }
  
  // Fetch products from Sanity
  const products = await client.fetch(
    `*[_type == "product" && locale == $locale && category in $categories] | order(featured desc, name asc) {
      _id,
      name,
      slug,
      category,
      brand,
      model,
      "imageUrl": image.asset->url,
      price,
      techSpecs,
      features,
      inStock,
      featured
    }`,
    { locale, categories: sanityCategories }
  )
  
  // Translations
  const t = {
    vi: {
      back: 'Quay lại Sản phẩm',
      inStock: 'Còn hàng',
      outOfStock: 'Hết hàng',
      featured: 'Nổi bật',
      from: 'Từ',
      viewDetails: 'Xem chi tiết',
      contact: 'Liên hệ tư vấn',
      noProducts: 'Chưa có sản phẩm trong danh mục này',
      capacity: 'Công suất',
      efficiency: 'Hiệu suất',
      warranty: 'Bảo hành',
      years: 'năm'
    },
    en: {
      back: 'Back to Products',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      featured: 'Featured',
      from: 'From',
      viewDetails: 'View Details',
      contact: 'Contact Us',
      noProducts: 'No products in this category yet',
      capacity: 'Capacity',
      efficiency: 'Efficiency',
      warranty: 'Warranty',
      years: 'years'
    },
    zh: {
      back: '返回产品',
      inStock: '有货',
      outOfStock: '缺货',
      featured: '精选',
      from: '从',
      viewDetails: '查看详情',
      contact: '联系咨询',
      noProducts: '此类别暂无产品',
      capacity: '容量',
      efficiency: '效率',
      warranty: '保修',
      years: '年'
    },
    id: {
      back: 'Kembali ke Produk',
      inStock: 'Tersedia',
      outOfStock: 'Habis',
      featured: 'Unggulan',
      from: 'Dari',
      viewDetails: 'Lihat Detail',
      contact: 'Hubungi Kami',
      noProducts: 'Belum ada produk dalam kategori ini',
      capacity: 'Kapasitas',
      efficiency: 'Efisiensi',
      warranty: 'Garansi',
      years: 'tahun'
    }
  }
  
  const content = t[locale as keyof typeof t] || t.vi
  
  // Generate Schema.org Product List with Prices
  const productListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: categoryName,
    description: `Danh sách sản phẩm ${categoryName} chính hãng từ Golden Energy`,
    numberOfItems: products.length,
    itemListElement: products.map((product: any, index: number) => ({
      '@type': 'Product',
      position: index + 1,
      name: product.name,
      brand: product.brand || 'Golden Energy',
      category: categoryName,
      ...(product.imageUrl && { image: product.imageUrl }),
      ...(product.price && {
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'VND',
          availability: product.inStock 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Golden Energy Vietnam',
            url: 'https://goldenenergy.vn'
          }
        }
      }),
      ...(product.techSpecs && {
        additionalProperty: Object.entries(product.techSpecs).map(([key, value]) => ({
          '@type': 'PropertyValue',
          name: key,
          value: String(value)
        }))
      })
    }))
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* SEO: Schema.org Product List with REAL PRICES */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
      />
      
      <Container>
        {/* Breadcrumb */}
        <div className="py-8">
          <Link 
            href={`/${locale}/san-pham`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {content.back}
          </Link>
        </div>
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {categoryName}
          </h1>
          <p className="text-xl text-gray-600">
            {products.length} {locale === 'vi' ? 'sản phẩm' : locale === 'zh' ? '产品' : locale === 'id' ? 'produk' : 'products'}
          </p>
        </div>
        
        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-6 rounded-full bg-gray-100 mb-6">
              <Zap className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {content.noProducts}
            </h3>
            <p className="text-gray-600 mb-8">
              {locale === 'vi' 
                ? 'Vui lòng quay lại sau hoặc xem danh mục khác' 
                : locale === 'zh'
                ? '请稍后再试或查看其他类别'
                : locale === 'id'
                ? 'Silakan coba lagi nanti atau lihat kategori lain'
                : 'Please check back later or browse other categories'}
            </p>
            <Link
              href={`/${locale}/san-pham`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {content.back}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {products.map((product: any) => (
              <div 
                key={product._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Product Image */}
                <div className="relative h-64 bg-gradient-to-br from-blue-50 to-gray-50">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Zap className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.featured && (
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                        {content.featured}
                      </span>
                    )}
                    {product.inStock ? (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        {content.inStock}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-400 text-white text-xs font-semibold rounded-full">
                        {content.outOfStock}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-6">
                  {/* Brand */}
                  {product.brand && (
                    <p className="text-sm text-blue-600 font-semibold mb-2">
                      {product.brand}
                    </p>
                  )}
                  
                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {/* Tech Specs */}
                  {product.techSpecs && (
                    <div className="space-y-2 mb-4">
                      {product.techSpecs.capacity && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span>{content.capacity}: {product.techSpecs.capacity}W</span>
                        </div>
                      )}
                      {product.techSpecs.efficiency && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span>{content.efficiency}: {product.techSpecs.efficiency}%</span>
                        </div>
                      )}
                      {product.techSpecs.warrantyYears && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span>{content.warranty}: {product.techSpecs.warrantyYears} {content.years}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div className="mb-4 space-y-1">
                      {product.features.slice(0, 3).map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 line-clamp-1">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Price - HIDDEN from UI for better conversion */}
                  {/* Real price is in Schema.org JSON-LD for SEO */}
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-blue-600">
                      {locale === 'vi' ? 'Liên hệ' : locale === 'zh' ? '联系咨询' : locale === 'id' ? 'Hubungi' : 'Contact'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {locale === 'vi' ? 'Để nhận báo giá tốt nhất' : locale === 'zh' ? '获取最优报价' : locale === 'id' ? 'Dapatkan penawaran terbaik' : 'Get best quote'}
                    </p>
                  </div>
                  
                  {/* CTA */}
                  <Link
                    href={`/${locale}/lien-he?product=${encodeURIComponent(product.name)}`}
                    className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all group-hover:shadow-md"
                  >
                    {content.contact}
                    <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}
