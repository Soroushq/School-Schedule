'use client';

import React, { useState, useEffect } from 'react';
import { FaCheck, FaInfoCircle, FaCode, FaHistory, FaMoon, FaSun, FaTools, FaUserCog, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';

const AboutAppPage = () => {
  const [mounted, setMounted] = useState(false);
  const { userRole } = useUserRole();
  const [theme, setTheme] = useState('light');

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

  if (!mounted) return <div className="h-screen w-full flex items-center justify-center">در حال بارگذاری...</div>;

  // اطلاعات نسخه‌های مختلف برنامه
  const versions = [
    {
      version: "3.0.0",
      date: "1403/04/15",
      title: "افزودن سیستم نقش‌های کاربری",
      changes: [
        "افزودن سیستم نقش‌های کاربری (مدیر سیستم، آموزشگر، دانش‌آموز)",
        "پیاده‌سازی کنترل دسترسی بر اساس نقش",
        "بهبود صفحه خوش‌آمدگویی با دسترسی‌های سریع",
        "افزودن صفحه کنترل دسترسی",
        "بهبود رابط کاربری با پشتیبانی از حالت تاریک"
      ]
    },
    {
      version: "2.5.0",
      date: "1403/03/24",
      title: "بهبود صفحه بارگذاری",
      changes: [
        "جایگزینی تمام اسپینرهای بارگذاری با انیمیشن‌های ldrs",
        "بهبود سرعت انیمیشن‌های فلوچارت و عناصر تعاملی",
        "اصلاح باگ‌های جزئی در رابط کاربری"
      ]
    },
    {
      version: "2.0.0",
      date: "1403/02/10",
      title: "به‌روزرسانی طراحی کلی",
      changes: [
        "بازطراحی کامل رابط کاربری با پشتیبانی از تم تاریک",
        "بهبود سازگاری با دستگاه‌های مختلف",
        "افزودن انیمیشن‌های پیشرفته و اثرات پارالاکس",
        "بهینه‌سازی عملکرد برنامه با استفاده از تکنیک‌های مدرن"
      ]
    },
    {
      version: "1.0.0",
      date: "1402/10/15",
      title: "نسخه اولیه",
      changes: [
        "برنامه‌ریزی پرسنلی و کلاسی",
        "امکان ذخیره‌سازی برنامه‌ها",
        "پشتیبانی از خروجی اکسل",
        "رابط کاربری پایه"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* دکمه تغییر تم و دکمه بازگشت */}
          <div className="flex justify-between mb-6">
            <Link 
              href="/welcome" 
              className={`flex items-center px-4 py-2 rounded-lg transition-colors shadow ${
                theme === 'dark' 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <FaArrowRight className="ml-2" />
              بازگشت
            </Link>
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-white hover:bg-gray-100 text-blue-500 border border-gray-200'
              }`}
              aria-label={theme === 'light' ? 'تغییر به حالت تاریک' : 'تغییر به حالت روشن'}
            >
              {theme === 'light' 
                ? <FaMoon className="text-xl" /> 
                : <FaSun className="text-xl" />
              }
            </button>
          </div>

          <div className="mb-8 text-center">
            <div className="inline-block bg-blue-500 text-white p-4 rounded-full mb-4">
              <FaInfoCircle className="text-4xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              درباره سیستم برنامه‌ریزی مدرسه
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              نسخه فعلی: {versions[0].version} - {userRole && (
                <span className="px-2 py-1 ml-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                  نقش فعال: {userRole === 'admin' ? 'مدیر سیستم' : userRole === 'educator' ? 'آموزشگر' : 'دانش‌آموز'}
                </span>
              )}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaTools className="ml-2 text-blue-500" />
                ویژگی‌های اصلی
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 ml-2" />
                  <span className="text-gray-700 dark:text-gray-300">برنامه‌ریزی پرسنلی با امکان مدیریت تداخل‌ها</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 ml-2" />
                  <span className="text-gray-700 dark:text-gray-300">برنامه‌ریزی کلاس‌ها با قابلیت همگام‌سازی</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 ml-2" />
                  <span className="text-gray-700 dark:text-gray-300">پشتیبانی از مقاطع مختلف تحصیلی</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 ml-2" />
                  <span className="text-gray-700 dark:text-gray-300">خروجی در قالب‌های مختلف (اکسل، PDF، JSON)</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 ml-2" />
                  <span className="text-gray-700 dark:text-gray-300">سیستم کنترل دسترسی بر اساس نقش کاربر</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 ml-2" />
                  <span className="text-gray-700 dark:text-gray-300">رابط کاربری پیشرفته با پشتیبانی از حالت تاریک</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-blue-50 dark:bg-blue-900/30">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <FaHistory className="ml-2 text-blue-500" />
                تاریخچه تغییرات
              </h2>
            </div>
            <div className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {versions.map((version, index) => (
                  <div key={version.version} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          نسخه {version.version} - {version.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          تاریخ انتشار: {version.date}
                        </p>
                      </div>
                      {index === 0 && (
                        <span className="mt-2 md:mt-0 px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                          نسخه فعلی
                        </span>
                      )}
                    </div>
                    <ul className="space-y-2 mr-6 list-disc">
                      {version.changes.map((change, i) => (
                        <li key={i} className="text-gray-700 dark:text-gray-300">
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaUserCog className="ml-2 text-blue-500" />
                نقش‌های کاربری
              </h2>
              <div className="space-y-4">
                <div className="p-4 border border-indigo-200 dark:border-indigo-800 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                  <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">مدیر سیستم</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    دسترسی کامل به تمام بخش‌های سیستم، توانایی مدیریت پرسنل و کلاس‌ها
                  </p>
                </div>
                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">آموزشگر</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    دسترسی به برنامه پرسنلی و کلاسی، توانایی مشاهده و مدیریت برنامه‌ها
                  </p>
                </div>
                <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/30">
                  <h3 className="font-bold text-green-800 dark:text-green-300 mb-2">دانش‌آموز</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    دسترسی محدود به مشاهده برنامه کلاسی و برخی بخش‌های عمومی
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutAppPage; 