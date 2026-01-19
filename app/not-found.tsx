'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const pathname = usePathname()
  
  useEffect(() => {
    // Track 404 errors for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag
      if (typeof gtag === 'function') {
        gtag('event', 'exception', {
          description: `404 Error: ${pathname}`,
          fatal: false,
        })
      }
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`404 Page Not Found: ${pathname}`)
    }
  }, [pathname])
  
  // Detect locale from pathname
  const locale = pathname?.split('/')[1] || 'vi'
  const isValidLocale = ['vi', 'en', 'zh', 'id'].includes(locale)
  const currentLocale = isValidLocale ? locale : 'vi'
  
  const translations = {
    vi: {
      title: 'Không Tìm Thấy Trang',
      subtitle: 'Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.',
      errorCode: 'Mã lỗi: 404',
      requestedUrl: 'URL yêu cầu',
      suggestions: 'Bạn có thể thử:',
      suggestionItems: [
        'Kiểm tra lại địa chỉ URL',
        'Quay lại trang trước',
        'Tìm kiếm nội dung bạn cần',
        'Truy cập trang chủ'
      ],
      buttons: {
        home: 'Về Trang Chủ',
        back: 'Quay Lại',
        contact: 'Liên Hệ Hỗ Trợ'
      },
      popularPages: 'Trang phổ biến',
      pages: {
        solutions: 'Giải Pháp',
        products: 'Sản Phẩm',
        projects: 'Dự Án',
        blog: 'Bài Viết',
        contact: 'Liên Hệ'
      }
    },
    en: {
      title: 'Page Not Found',
      subtitle: 'Sorry, the page you are looking for does not exist or has been moved.',
      errorCode: 'Error code: 404',
      requestedUrl: 'Requested URL',
      suggestions: 'You can try:',
      suggestionItems: [
        'Check the URL address',
        'Go back to previous page',
        'Search for what you need',
        'Visit homepage'
      ],
      buttons: {
        home: 'Go Home',
        back: 'Go Back',
        contact: 'Contact Support'
      },
      popularPages: 'Popular pages',
      pages: {
        solutions: 'Solutions',
        products: 'Products',
        projects: 'Projects',
        blog: 'Blog',
        contact: 'Contact'
      }
    },
    zh: {
      title: '找不到页面',
      subtitle: '抱歉，您要查找的页面不存在或已被移动。',
      errorCode: '错误代码：404',
      requestedUrl: '请求的网址',
      suggestions: '您可以尝试：',
      suggestionItems: [
        '检查网址',
        '返回上一页',
        '搜索您需要的内容',
        '访问首页'
      ],
      buttons: {
        home: '返回首页',
        back: '返回',
        contact: '联系支持'
      },
      popularPages: '热门页面',
      pages: {
        solutions: '解决方案',
        products: '产品',
        projects: '项目',
        blog: '博客',
        contact: '联系我们'
      }
    },
    id: {
      title: 'Halaman Tidak Ditemukan',
      subtitle: 'Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.',
      errorCode: 'Kode kesalahan: 404',
      requestedUrl: 'URL yang diminta',
      suggestions: 'Anda dapat mencoba:',
      suggestionItems: [
        'Periksa alamat URL',
        'Kembali ke halaman sebelumnya',
        'Cari apa yang Anda butuhkan',
        'Kunjungi beranda'
      ],
      buttons: {
        home: 'Ke Beranda',
        back: 'Kembali',
        contact: 'Hubungi Dukungan'
      },
      popularPages: 'Halaman populer',
      pages: {
        solutions: 'Solusi',
        products: 'Produk',
        projects: 'Proyek',
        blog: 'Blog',
        contact: 'Kontak'
      }
    }
  }
  
  const t = translations[currentLocale as keyof typeof translations]
  
  const popularLinks = [
    { href: `/${currentLocale}`, label: t.buttons.home, icon: Home },
    { href: `/${currentLocale}/giai-phap`, label: t.pages.solutions },
    { href: `/${currentLocale}/san-pham`, label: t.pages.products },
    { href: `/${currentLocale}/du-an`, label: t.pages.projects },
    { href: `/${currentLocale}/bai-viet`, label: t.pages.blog },
    { href: `/${currentLocale}/lien-he`, label: t.pages.contact }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Error Code */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 drop-shadow-lg">
              404
            </h1>
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mt-2"></div>
          </div>
        </div>
        
        {/* Title & Subtitle */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {t.title}
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            {t.subtitle}
          </p>
          <div className="inline-block bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-500">
            <span className="font-medium">{t.requestedUrl}:</span>{' '}
            <code className="text-gray-700">{pathname}</code>
          </div>
        </div>
        
        {/* Suggestions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-yellow-500" />
            {t.suggestions}
          </h3>
          <ul className="space-y-2 mb-6">
            {t.suggestionItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-600">
                <span className="text-yellow-500 font-bold mt-1">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${currentLocale}`}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <Home className="w-4 h-4" />
              {t.buttons.home}
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.buttons.back}
            </button>
            
            <Link
              href={`/${currentLocale}/lien-he`}
              className="flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-yellow-500 hover:text-yellow-600 transition-colors"
            >
              {t.buttons.contact}
            </Link>
          </div>
        </div>
        
        {/* Popular Links */}
        <div className="bg-gradient-to-r from-gray-50 to-yellow-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t.popularPages}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {popularLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg text-gray-700 hover:text-yellow-600 hover:shadow-md transition-all duration-200 group"
              >
                {link.icon && <link.icon className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" />}
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Error Code Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          {t.errorCode} • Golden Energy Vietnam
        </p>
      </div>
    </div>
  )
}
