'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInEmployee } from '@/lib/firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Lock, User, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ERPLoginPage() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [firebaseStatus, setFirebaseStatus] = useState<'checking' | 'ready' | 'error'>('checking');

  // Check Firebase initialization on mount
  useEffect(() => {
    const checkFirebase = async () => {
      try {
        if (!isFirebaseConfigured) {
          setFirebaseStatus('error');
          setError('Hệ thống chưa được cấu hình đúng. Vui lòng liên hệ IT.');
        } else {
          setFirebaseStatus('ready');
        }
      } catch (err) {
        console.error('Firebase check error:', err);
        setFirebaseStatus('error');
      }
    };
    
    checkFirebase();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Login attempt with employee code:', employeeCode);
      
      const user = await signInEmployee(employeeCode, password);
      
      console.log('Login successful, checking profile...');
      
      // Check if user needs to change password
      const { getEmployeeProfile } = await import('@/lib/firebase/auth');
      const profile = await getEmployeeProfile(user.uid);
      
      if (profile?.mustChangePassword) {
        router.push('/erp/change-password');
      } else {
        router.push('/erp/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle network errors with retry suggestion
      if (err.message.includes('mạng') || err.message.includes('network')) {
        setError(`${err.message} ${retryCount > 0 ? `(Lần thử: ${retryCount + 1})` : ''}`);
        setRetryCount(prev => prev + 1);
      } else {
        setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.');
      }
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

        {/* Firebase Status Warning */}
        {firebaseStatus === 'error' && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Hệ thống xác thực chưa sẵn sàng. Vui lòng kiểm tra cấu hình Firebase hoặc liên hệ IT.
            </AlertDescription>
          </Alert>
        )}

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
                disabled={loading || firebaseStatus !== 'ready'}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : firebaseStatus === 'checking' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang kiểm tra hệ thống...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 text-center">
                  Liên hệ bộ phận IT nếu bạn quên mật khẩu hoặc cần hỗ trợ đăng nhập
                </p>
                
                {/* Debug info in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                    <p>🔧 Debug Info:</p>
                    <p>Firebase Status: <span className="font-mono">{firebaseStatus}</span></p>
                    <p>Retry Count: <span className="font-mono">{retryCount}</span></p>
                    <p className="text-blue-600">Check browser console (F12) for detailed logs</p>
                  </div>
                )}
                
                <p className="text-xs text-slate-500 text-center mt-2">
                  Email: <a href="mailto:it@goldenenergy.vn" className="text-slate-700 hover:underline">it@goldenenergy.vn</a>
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
