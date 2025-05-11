'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './welcome.module.css';
import { FaSun, FaMoon, FaSchool, FaChild, FaUserGraduate, FaTools } from 'react-icons/fa';

export default function WelcomePage() {
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

  const educationLevels = [
    { 
      id: 'elementary', 
      title: 'مقطع ابتدایی', 
      description: 'برنامه‌ریزی مدارس ابتدایی',
      icon: <FaChild className="text-green-500 text-4xl" />,
      color: theme === 'dark' ? 'bg-green-800/60' : 'bg-green-50',
      borderColor: theme === 'dark' ? 'border-green-700' : 'border-green-200',
      hoverColor: theme === 'dark' ? 'hover:bg-green-700/80' : 'hover:bg-green-100',
      path: '/education-levels/elementary'
    },
    { 
      id: 'middleschool', 
      title: 'مقطع متوسطه اول', 
      description: 'برنامه‌ریزی مدارس متوسطه اول',
      icon: <FaSchool className="text-blue-500 text-4xl" />,
      color: theme === 'dark' ? 'bg-blue-800/60' : 'bg-blue-50',
      borderColor: theme === 'dark' ? 'border-blue-700' : 'border-blue-200',
      hoverColor: theme === 'dark' ? 'hover:bg-blue-700/80' : 'hover:bg-blue-100',
      path: '/education-levels/middleschool'
    },
    { 
      id: 'highschool', 
      title: 'مقطع متوسطه دوم نظری', 
      description: 'برنامه‌ریزی مدارس متوسطه دوم نظری',
      icon: <FaUserGraduate className="text-purple-500 text-4xl" />,
      color: theme === 'dark' ? 'bg-purple-800/60' : 'bg-purple-50',
      borderColor: theme === 'dark' ? 'border-purple-700' : 'border-purple-200',
      hoverColor: theme === 'dark' ? 'hover:bg-purple-700/80' : 'hover:bg-purple-100',
      path: '/education-levels/highschool'
    },
    { 
      id: 'vocational', 
      title: 'مقطع متوسطه دوم فنی و حرفه‌ای، کاردانش', 
      description: 'برنامه‌ریزی هنرستان‌ها و مدارس فنی و حرفه‌ای',
      icon: <FaTools className="text-yellow-500 text-4xl" />,
      color: theme === 'dark' ? 'bg-yellow-800/60' : 'bg-yellow-50',
      borderColor: theme === 'dark' ? 'border-yellow-700' : 'border-yellow-200',
      hoverColor: theme === 'dark' ? 'hover:bg-yellow-700/80' : 'hover:bg-yellow-100',
      path: '/education-levels/vocational'
    }
  ];

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.darkMode : ''}`}>
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

      <h1 className={`${styles.title} ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        به سیستم برنامه‌ریزی مدرسه خوش آمدید
      </h1>
      <p className={`${styles.subtitle} ${theme === 'dark' ? 'text-gray-300' : ''}`}>
        لطفا مقطع تحصیلی مورد نظر خود را انتخاب کنید:
      </p>
      
      <div className={styles.educationLevels}>
        {educationLevels.map((level) => (
          <div 
            key={level.id}
            className={`${styles.levelCard} ${level.color} ${level.hoverColor} border ${level.borderColor} ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
            onClick={() => router.push(level.path)}
          >
            <div className={styles.levelIcon}>
              {level.icon}
            </div>
            <h2 className={`${styles.levelTitle} ${theme === 'dark' ? 'text-white' : ''}`}>
              {level.title}
            </h2>
            <p className={`${styles.levelDescription} ${theme === 'dark' ? 'text-gray-300' : ''}`}>
              {level.description}
            </p>
          </div>
        ))}
      </div>

      <p className={`${styles.footer} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        طراحی و توسعه: سروش قاری ایوری
      </p>
    </div>
  );
} 