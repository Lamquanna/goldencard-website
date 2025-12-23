'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthWrapper: Checking auth for path:', pathname);
    
    // Check if user is authenticated via localStorage token
    const token = localStorage.getItem('erp_token');
    const userStr = localStorage.getItem('erp_user');
    
    if (token && userStr) {
      console.log('AuthWrapper: User authenticated');
      setAuthenticated(true);
      setLoading(false);
    } else {
      console.log('AuthWrapper: No auth token found');
      setAuthenticated(false);
      setLoading(false);
      
      // If no token and not on login/change-password page, redirect to login
      if (!pathname?.includes('/login') && !pathname?.includes('/change-password')) {
        console.log('AuthWrapper: Redirecting to login');
        router.push('/erp/login');
      }
    }
  }, [router, pathname]);

  // Show loading state (but only if not on login or change-password page)
  if (loading && !pathname?.includes('/login') && !pathname?.includes('/change-password')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl mb-4 shadow-lg animate-pulse">
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
          <p className="text-slate-600 font-medium">Đang kiểm tra xác thực...</p>
          <p className="text-slate-400 text-sm mt-2">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  // If user is logged in or on login/change-password page, show content
  if (authenticated || pathname?.includes('/login') || pathname?.includes('/change-password')) {
    return <>{children}</>;
  }

  // Otherwise don't render anything (redirecting)
  return null;
}
