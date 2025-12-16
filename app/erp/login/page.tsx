'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { teamData } from '@/lib/team-data'

// Build employee lookup from real team data
const EMPLOYEES: Record<string, { name: string; role: string }> = {};
teamData.forEach(member => {
  EMPLOYEES[member.employeeCode] = {
    name: member.nameVi,
    role: member.roleVi,
  };
});

export default function ERPLoginPage() {
  const router = useRouter()
  const [employeeCode, setEmployeeCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const code = localStorage.getItem('erp_user_code')
    if (code && EMPLOYEES[code]) {
      router.push('/erp')
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const code = employeeCode.toUpperCase().trim()
    const employee = EMPLOYEES[code]
    const expectedPassword = code.slice(-3)

    if (!employee) {
      setError('Mã nhân viên không tồn tại')
      setIsLoading(false)
      return
    }

    if (password !== expectedPassword) {
      setError('Mật khẩu không đúng')
      setIsLoading(false)
      return
    }

    localStorage.setItem('erp_user_code', code)
    localStorage.setItem('crm_auth', code)
    router.push('/erp')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#B8960A] rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">GE</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            <span className="text-[#D4AF37]">Golden</span>Energy
          </h1>
          <p className="text-gray-400 mt-2">Đăng nhập hệ thống ERP</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã nhân viên
              </label>
              <input
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="VD: GES001"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-gray-900 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8960A] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-500 hover:text-[#D4AF37] transition-colors text-sm">
              Quay về trang chủ
            </Link>
          </div>

          {/* Employee list hint */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Danh sách nhân viên ({teamData.length} người):
            </p>
            <div className="max-h-40 overflow-y-auto text-xs text-gray-600 space-y-1">
              {teamData.map(emp => (
                <div key={emp.employeeCode} className="flex justify-between px-2 py-1 hover:bg-gray-50 rounded">
                  <span className="font-mono">{emp.employeeCode}</span>
                  <span className="truncate ml-2">{emp.nameVi}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Liên hệ IT nếu bạn quên mật khẩu
        </p>
      </motion.div>
    </div>
  )
}
