"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AccessDenied() {
  const [countdown, setCountdown] = useState(15);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // تشخیص دستگاه موبایل
    if (typeof window !== 'undefined') {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }

    // کاهش تایمر شمارش معکوس
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // اضافه کردن تایمر برای بستن صفحه بعد از 15 ثانیه
    const timer = setTimeout(() => {
      try {
        window.close();
      } catch (e) {
        console.log('نمی‌توان صفحه را به صورت خودکار بست');
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  // تابع بستن دستی صفحه (مخصوص موبایل)
  const handleCloseManually = () => {
    window.close();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 text-red-600 mx-auto mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          دسترسی ممنوع است
        </h1>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          شما توافق‌نامه استفاده از برنامه‌ساز مدرسه را نپذیرفته‌اید. برای استفاده از این برنامه، باید توافق‌نامه را بپذیرید.
        </p>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          این صفحه به طور خودکار بعد از <span className="font-bold text-red-500">{countdown}</span> ثانیه بسته خواهد شد.
        </p>
        
        {isMobile && (
          <div className="mb-6 text-sm text-gray-600">
            <p className="bg-yellow-50 border border-yellow-200 p-2 rounded-md">
              برخی مرورگرهای موبایل اجازه بستن خودکار صفحه را نمی‌دهند. در صورت عدم بسته شدن خودکار، می‌توانید از دکمه زیر استفاده کنید.
            </p>
            <button 
              onClick={handleCloseManually}
              className="mt-3 w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              بستن صفحه
            </button>
          </div>
        )}
        
        <Link 
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          بازگشت به صفحه اصلی و پذیرش توافق‌نامه
        </Link>
      </div>
    </div>
  );
} 