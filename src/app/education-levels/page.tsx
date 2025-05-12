'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowRight, FaGraduationCap, FaSchool, FaUniversity, FaTools } from 'react-icons/fa';
import AnimatedFooter from '@/app/components/AnimatedFooter';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';

const LoadingSpinner = dynamic(() => import('@/components/LoadingSpinner'), { ssr: false });

export default function EducationLevelsPage() {
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
        href="/welcome" 
        className={`fixed duration-250 z-50 opacity-50 hover:opacity-100 top-12 right-6 p-3 rounded-full transition-all shadow-lg ${
          theme === 'dark' 
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
            : 'bg-white text-gray-800 hover:bg-gray-100'
        }`}
      >
        <FaArrowRight className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
      </Link>
      
      <div className={`text-center max-w-4xl mx-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl shadow-xl`}>
        <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
          مقاطع تحصیلی
        </h1>

        <p className="text-lg mb-8">
          لطفاً مقطع تحصیلی مورد نظر خود را انتخاب کنید:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* کارت مقطع ابتدایی */}
          <div className={`p-6 rounded-xl shadow-lg transition-all hover:shadow-xl ${
            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
          }`}>
            <div className="flex flex-col items-center">
              <FaGraduationCap className={`text-4xl mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className="text-xl font-bold mb-3">دوره ابتدایی</h2>
              <p className="text-center mb-4">
                برنامه‌ریزی دوره ابتدایی (پایه‌های اول تا ششم)
              </p>
              <Link 
                href="/education-levels/elementary"
                className={`inline-block w-full text-center px-6 py-3 rounded-lg font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                ورود به مقطع ابتدایی
              </Link>
            </div>
          </div>

          {/* کارت مقطع متوسطه اول */}
          <div className={`p-6 rounded-xl shadow-lg transition-all hover:shadow-xl ${
            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
          }`}>
            <div className="flex flex-col items-center">
              <FaSchool className={`text-4xl mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className="text-xl font-bold mb-3">دوره متوسطه اول</h2>
              <p className="text-center mb-4">
                برنامه‌ریزی دوره متوسطه اول (پایه‌های هفتم تا نهم)
              </p>
              <Link 
                href="/education-levels/middleschool"
                className={`inline-block w-full text-center px-6 py-3 rounded-lg font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                ورود به متوسطه اول
              </Link>
            </div>
          </div>

          {/* کارت مقطع متوسطه دوم */}
          <div className={`p-6 rounded-xl shadow-lg transition-all hover:shadow-xl ${
            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
          }`}>
            <div className="flex flex-col items-center">
              <FaUniversity className={`text-4xl mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className="text-xl font-bold mb-3">دوره متوسطه دوم</h2>
              <p className="text-center mb-4">
                برنامه‌ریزی دوره متوسطه دوم (پایه‌های دهم تا دوازدهم)
              </p>
              <Link 
                href="/education-levels/highschool"
                className={`inline-block w-full text-center px-6 py-3 rounded-lg font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                ورود به متوسطه دوم
              </Link>
            </div>
          </div>

          {/* کارت مقطع فنی و حرفه‌ای */}
          <div className={`p-6 rounded-xl shadow-lg transition-all hover:shadow-xl ${
            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
          }`}>
            <div className="flex flex-col items-center">
              <FaTools className={`text-4xl mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className="text-xl font-bold mb-3">فنی و حرفه‌ای</h2>
              <p className="text-center mb-4">
                برنامه‌ریزی دوره فنی و حرفه‌ای (پایه‌های دهم تا دوازدهم)
              </p>
              <Link 
                href="/education-levels/vocational"
                className={`inline-block w-full text-center px-6 py-3 rounded-lg font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                ورود به فنی و حرفه‌ای
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <Link 
            href="/welcome"
            className={`inline-block px-6 py-3 rounded-lg font-medium transition-all ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>

      {/* فوتر انیمیشن‌دار */}
      <AnimatedFooter />
    </div>
  );
} 