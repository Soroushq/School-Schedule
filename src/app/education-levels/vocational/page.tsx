'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './vocational.module.css';
import { FaSun, FaMoon, FaArrowRight, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';
import AnimatedFooter from '@/app/components/AnimatedFooter';

export default function VocationalPage() {
  const router = useRouter();
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

  const scheduleOptions = [
    {
      id: 'class-schedule',
      title: 'برنامه‌ریزی بر اساس کلاس',
      description: 'برنامه‌ریزی بر اساس کلاس‌ها و دروس',
      icon: <FaChalkboardTeacher className="text-3xl" />,
      path: '/class-schedule'
    },
    {
      id: 'personnel-schedule',
      title: 'برنامه‌ریزی بر اساس پرسنل',
      description: 'برنامه‌ریزی بر اساس معلمان و کارکنان',
      icon: <FaUsers className="text-3xl" />,
      path: '/personnel-schedule'
    }
  ];

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.darkMode : ''}`}>
      {/* دکمه بازگشت به صفحه اصلی */}
      <Link
        href="/"
        className={`fixed duration-250 z-50 opacity-50 hover:opacity-100 top-12 right-6 p-3 rounded-full transition-all shadow-lg ${
          theme === 'dark' 
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
            : 'bg-white text-gray-800 hover:bg-gray-100'
        }`}
      >
        <FaArrowRight className={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'} />
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

      <h1 className={`${styles.title} ${theme === 'dark' ? 'text-white' : ''}`}>
        برنامه‌ریزی مقطع متوسطه دوم فنی و حرفه‌ای، کاردانش
      </h1>
      
      <p className={`${styles.subtitle} ${theme === 'dark' ? 'text-gray-300' : ''}`}>
        لطفا نوع برنامه‌ریزی مورد نظر خود را انتخاب کنید:
      </p>
      
      <div className={styles.options}>
        {scheduleOptions.map((option) => (
          <div 
            key={option.id}
            className={`${styles.option} ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
            onClick={() => router.push(option.path)}
          >
            <div className={`${styles.optionIcon} ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
              {option.icon}
            </div>
            <h2 className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
              {option.title}
            </h2>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              {option.description}
            </p>
          </div>
        ))}
      </div>
      
      {/* فوتر انیمیشن‌دار */}
      <AnimatedFooter />
    </div>
  );
} 