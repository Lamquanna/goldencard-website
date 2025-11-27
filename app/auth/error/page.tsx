'use client'
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full p-8 bg-[#0A0A0A] rounded-2xl shadow-xl text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🚫</span>
        </div>
        
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Truy cập bị từ chối
        </h1>
        
        <p className="text-neutral-600 mb-6">
          {error === 'AccessDenied' 
            ? 'Email của bạn không có trong danh sách được phép truy cập hệ thống.'
            : 'Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.'
          }
        </p>

        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full px-6 py-3 bg-[#d4af37] text-white rounded-lg hover:bg-[#b89129] transition-colors"
          >
            Thử lại
          </Link>
          
          <Link
            href="/"
            className="block w-full px-6 py-3 border-2 border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>

        <p className="mt-6 text-xs text-neutral-500">
          Liên hệ admin nếu bạn cần quyền truy cập
        </p>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto"></div>
          <p className="mt-4 text-[#CCC]">Đang tải...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
