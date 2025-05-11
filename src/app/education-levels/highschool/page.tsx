'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSun, FaMoon, FaArrowRight } from 'react-icons/fa';
import AnimatedFooter from '@/app/components/AnimatedFooter';

export default function HighSchoolPage() {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // مدیریت تم در سمت کلاینت
  useEffect(() => {
    // بررسی localStorage برای تم ذخیره شده
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // اعمال کلاس به المان ریشه
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setMounted(true);
  }, []);

  // تغییر تم
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // اعمال به DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // ذخیره در localStorage
    localStorage.setItem('theme', newTheme);
    
    // به‌روزرسانی state
    setTheme(newTheme);
  };

  // اگر کامپوننت هنوز به صورت کامل لود نشده است، نمایش یک اسپینر
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center p-8 ${
        theme === 'dark' 
          ? 'bg-gray-900 text-white' 
          : 'bg-purple-50 text-gray-800'
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
        <FaArrowRight className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
      </Link>

      {/* دکمه تغییر تم */}
      <button 
        onClick={toggleTheme}
        className={`fixed duration-250 z-50 opacity-50 hover:opacity-100 top-12 left-6 p-3 rounded-full transition-all shadow-lg ${
          theme === 'dark' 
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
            : 'bg-white text-gray-800 hover:bg-gray-100'
        }`}
        aria-label={theme === 'light' ? 'تغییر به حالت تاریک' : 'تغییر به حالت روشن'}
      >
        {theme === 'light' 
          ? <FaMoon className="text-blue-500 text-xl" /> 
          : <FaSun className="text-yellow-500 text-xl" />
        }
      </button>
      
      <div className={`text-center max-w-lg mx-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl shadow-xl`}>
        <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
          برنامه‌ریزی مقطع متوسطه دوم نظری
        </h1>
        
        <p className="text-lg mb-8">
          این بخش در حال توسعه است. به زودی امکان برنامه‌ریزی برای مدارس متوسطه دوم نظری فراهم خواهد شد.
        </p>
        
        <Link 
          href="/"
          className={`inline-block px-6 py-3 rounded-lg font-medium transition-all ${
            theme === 'dark'
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-purple-500 text-white hover:bg-purple-600'
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