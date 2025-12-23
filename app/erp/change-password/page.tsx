'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('erp_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUsername(user.username);
    } else {
      // If no user, redirect to login
      router.push('/erp/login');
    }
  }, [router]);

  const validatePassword = (password: string) => {
    if (password.length < 4) {
      return 'Mật khẩu phải có ít nhất 4 ký tự';
    }
    if (password === '1') {
      return 'Vui lòng không sử dụng mật khẩu mặc định';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/erp/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          currentPassword: '1', // Default password
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Đổi mật khẩu thất bại');
      }

      setSuccess(true);
      
      // Wait 2 seconds then redirect to dashboard
      setTimeout(() => {
        router.push('/erp');
      }, 2000);

    } catch (err: any) {
      console.error('Change password error:', err);
      setError(err.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const length = newPassword.length;
    if (length === 0) return { label: '', color: '', width: '0%' };
    if (length < 4) return { label: 'Quá yếu', color: 'bg-red-500', width: '25%' };
    if (length < 6) return { label: 'Yếu', color: 'bg-orange-500', width: '50%' };
    if (length < 10) return { label: 'Trung bình', color: 'bg-yellow-500', width: '75%' };
    return { label: 'Mạnh', color: 'bg-green-500', width: '100%' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Đổi mật khẩu</h1>
          <p className="text-slate-600">Yêu cầu đổi mật khẩu lần đầu đăng nhập</p>
        </div>

        {/* Card */}
        <Card className="shadow-2xl border-slate-200">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Tạo mật khẩu mới</CardTitle>
            <CardDescription className="text-center">
              Vui lòng tạo mật khẩu mạnh và dễ nhớ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-700 font-medium">
                  Mật khẩu mới
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-slate-50 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength */}
                {newPassword && (
                  <div className="space-y-1">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    {strength.label && (
                      <p className="text-xs text-slate-600">
                        Độ mạnh: <span className="font-medium">{strength.label}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                  Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-slate-50 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && newPassword === confirmPassword && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mật khẩu khớp</span>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200 animate-in slide-in-from-top">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Đổi mật khẩu thành công! Đang chuyển hướng...
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Đổi mật khẩu'
                )}
              </Button>
            </form>

            {/* Requirements */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-slate-700">Yêu cầu mật khẩu:</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Tối thiểu 4 ký tự</li>
                  <li>• Không sử dụng mật khẩu mặc định (1)</li>
                  <li>• Nên sử dụng kết hợp chữ, số và ký tự đặc biệt</li>
                  <li>• Dễ nhớ nhưng khó đoán</li>
                </ul>
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
