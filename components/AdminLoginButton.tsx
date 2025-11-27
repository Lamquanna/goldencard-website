'use client'
import { signIn, signOut, useSession } from "next-auth/react"

export default function AdminLoginButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="text-sm text-neutral-500">Đang tải...</div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-sm font-medium text-neutral-700">
            {session.user?.email}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm font-medium text-gray-900 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="px-6 py-3 text-sm font-medium text-gray-900 bg-[#d4af37] rounded-lg hover:bg-[#b89129] transition-colors shadow-md"
    >
      🔐 Đăng nhập Admin
    </button>
  )
}
