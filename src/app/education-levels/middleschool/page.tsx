'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import AnimatedFooter from '@/app/components/AnimatedFooter';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';

const LoadingSpinner = dynamic(() => import('@/components/LoadingSpinner'), { ssr: false });

export default function MiddleSchoolPage() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // مدیریت تم در سمت کلاینت
  useEffect(() => {
    setMounted(true);
  }, []);

  // اگر کامپوننت هنوز به صورت کامل لود نشده است، نمایش یک اسپینر
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={60} color="#3B82F6" />
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center p-8 ${
        theme === 'dark' 
          ? 'bg-gray-900 text-white' 
          : 'bg-blue-50 text-gray-800'
      }`}
    >
      {/* دکمه بازگشت به صفحه اصلی */}
      <Link 
        href="/" 
        className={`fixed duration-250 z-50 opacity-50 hover:opacity-100 top-12 right-6 p-3 rounded-full transition-all shadow-lg ${
          theme === 'dark' 
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
            : 'bg-white text-gray-800 hover:bg-gray-100'
        }`}
      >
        <FaArrowRight className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
      </Link>
      
      <div className={`text-center max-w-lg mx-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl shadow-xl`}>
        <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
          برنامه‌ریزی مقطع متوسطه اول
        </h1>
        
        <p className="text-lg mb-8">
          این بخش در حال توسعه است. به زودی امکان برنامه‌ریزی برای مدارس متوسطه اول فراهم خواهد شد.
        </p>
        
        <Link 
          href="/"
          className={`inline-block px-6 py-3 rounded-lg font-medium transition-all ${
            theme === 'dark'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>

      {/* فوتر انیمیشن‌دار */}
      <AnimatedFooter />
    </div>
  );
} 