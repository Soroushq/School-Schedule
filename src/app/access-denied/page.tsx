"use client";

import { useEffect } from 'react';
import Link from 'next/link';

export default function AccessDenied() {
  useEffect(() => {
    // اضافه کردن تایمر برای بستن صفحه بعد از 15 ثانیه
    const timer = setTimeout(() => {
      window.close();
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

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
        
        <p className="text-gray-700 dark:text-gray-300 mb-8">
          این صفحه به طور خودکار بعد از ۱۵ ثانیه بسته خواهد شد.
        </p>
        
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