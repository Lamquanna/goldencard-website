'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInEmployee } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Lock, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ERPLoginPage() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInEmployee(employeeCode, password);
      router.push('/erp/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Golden Energy ERP</h1>
          <p className="text-slate-600">Hệ thống quản lý nội bộ</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-slate-200">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
            <CardDescription className="text-center">
              Sử dụng mã nhân viên để đăng nhập vào hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee Code Input */}
              <div className="space-y-2">
                <Label htmlFor="employeeCode" className="text-slate-700 font-medium">
                  Mã nhân viên
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="employeeCode"
                    type="text"
                    placeholder="GES001"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                    className="pl-10 h-12 bg-slate-50 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Ví dụ: GES001 (sẽ được chuyển thành ges001@goldenenergy.vn)
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-slate-50 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-900 hover:to-slate-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </form>

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-slate-700">Tài khoản mẫu:</p>
                <div className="space-y-1 text-xs text-slate-600">
                  <p>• Mã: <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono">GES001</code> - Jimmy Ha (CEO)</p>
                  <p>• Mã: <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono">GES002</code> - Rita Kim Anh (CFO)</p>
                  <p>• Mã: <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono">GES003</code> - Tuan Ha (COO)</p>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Mật khẩu mặc định: <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono">Golden@2024</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © 2024 Golden Energy. All rights reserved.
        </p>
      </div>
    </div>
  );
}
