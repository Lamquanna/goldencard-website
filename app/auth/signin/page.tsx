'use client'
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import { Eye, EyeOff, User, Lock, Loader2 } from "lucide-react"

// Employee credentials database
const EMPLOYEE_CREDENTIALS: Record<string, { password: string; name: string; role: string; email: string }> = {
  'GES001': { password: '001', name: 'Hà Hoàng Hà', role: 'CEO', email: 'jimmy.ha@goldenenergy.vn' },
  'GES002': { password: '002', name: 'Trương Kim Anh', role: 'CFO', email: 'rita.anh@goldenenergy.vn' },
  'GES003': { password: '003', name: 'Hà Huy Tuấn', role: 'Project Manager', email: 'tuan.ha@goldenenergy.vn' },
  'GES004': { password: '004', name: 'Hồ Minh Tân', role: 'Tech Lead', email: 'tan.ho@goldenenergy.vn' },
  'GES005': { password: '005', name: 'Lê Quang Anh', role: 'CTO', email: 'anh.le@goldenenergy.vn' },
  'GES006': { password: '006', name: 'Nguyễn Thị Thu', role: 'Accountant', email: 'thu.nguyen@goldenenergy.vn' },
  'GES007': { password: '007', name: 'Phạm Tấn Lễ', role: 'Logistics', email: 'le.pham@goldenenergy.vn' },
  'GES008': { password: '008', name: 'Nguyễn Minh Nguyệt', role: 'Sales Manager', email: 'nguyet.nguyen@goldenenergy.vn' },
  'GES009': { password: '009', name: 'Lưu Thị Duyên', role: 'Marketing', email: 'cristina.lu@goldenenergy.vn' },
  'GES010': { password: '010', name: 'Đào Hữu Giàu', role: 'Engineer', email: 'giau.dao@goldenenergy.vn' },
  'GES011': { password: '011', name: 'Trần Văn Son', role: 'Engineer', email: 'son.tran@goldenenergy.vn' },
  'GES012': { password: '012', name: 'Nguyễn Minh Duy', role: 'Engineer', email: 'duy.nguyen@goldenenergy.vn' },
}

function SignInContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/erp'
  
  const [employeeCode, setEmployeeCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setIsLoading(true)

    const code = employeeCode.toUpperCase().trim()
    const employee = EMPLOYEE_CREDENTIALS[code]

    if (!employee) {
      setLoginError('Mã nhân viên không tồn tại')
      setIsLoading(false)
      return
    }

    if (employee.password !== password) {
      setLoginError('Mật khẩu không đúng')
      setIsLoading(false)
      return
    }

    // Store employee info in localStorage for session
    const sessionData = {
      employeeCode: code,
      name: employee.name,
      role: employee.role,
      email: employee.email,
      loginTime: new Date().toISOString(),
    }
    localStorage.setItem('ges_session', JSON.stringify(sessionData))
    
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setIsLoading(false)
    router.push(callbackUrl)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#D4AF37] to-[#B8960C] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">GE</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Golden Energy
          </h1>
          <p className="text-sm text-gray-500">
            Hệ thống quản lý nội bộ
          </p>
        </div>

        {/* Error messages */}
        {(error || loginError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {error === 'AccessDenied' 
                ? '❌ Bạn không có quyền truy cập hệ thống'
                : loginError || '⚠️ Đã xảy ra lỗi khi đăng nhập'
              }
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Employee Code Input */}
          <div>
            <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700 mb-2">
              Mã nhân viên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="employeeCode"
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                placeholder="VD: GES001"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all uppercase font-mono"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-white font-semibold rounded-lg hover:from-[#B8960C] hover:to-[#9A7B0A] transition-all shadow-lg shadow-[#D4AF37]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">hoặc</span>
          </div>
        </div>

        {/* Google Sign In (Optional) */}
        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium text-gray-600">
            Đăng nhập với Google
          </span>
        </button>

        {/* Footer */}
        <p className="mt-6 text-xs text-center text-gray-400">
          © 2024 Golden Energy Solutions. Bảo mật thông tin.
        </p>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
