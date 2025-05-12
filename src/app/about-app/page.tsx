'use client';

import React, { useState, useEffect } from 'react';
import { FaCheck, FaInfoCircle, FaCode, FaHistory, FaTools, FaUserCog, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import { useTheme } from '@/context/ThemeContext';

const AboutAppPage = () => {
  const [mounted, setMounted] = useState(false);
  const { userRole } = useUserRole();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-screen w-full flex items-center justify-center">در حال بارگذاری...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* تنها دکمه بازگشت - دکمه تغییر تم حذف شد */}
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
          </div>

          <div className={`p-6 md:p-8 rounded-2xl shadow-lg mb-8 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <h1 className="text-2xl md:text-3xl font-bold mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
              درباره سیستم برنامه‌ریزی مدرسه
            </h1>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center">
                  <FaInfoCircle className={`ml-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  معرفی نرم‌افزار
                </h2>
                <p className="leading-7 text-gray-700 dark:text-gray-300">
                  سیستم برنامه‌ریزی مدرسه، نرم‌افزاری تخصصی و توسعه داده شده با آخرین فناوری‌های وب است که برای مدیریت برنامه هفتگی مدارس طراحی شده است. این نرم‌افزار یک راه‌حل کامل برای مدیران، معاونین آموزشی، و مسئولین برنامه‌ریزی مدارس است تا بتوانند با سهولت بیشتری برنامه هفتگی کلاس‌ها و معلمان را تنظیم کنند.
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center">
                  <FaCode className={`ml-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                  تکنولوژی‌های استفاده شده
                </h2>
                <p className="leading-7 text-gray-700 dark:text-gray-300 mb-4">
                  این نرم‌افزار با استفاده از فناوری‌های مدرن وب توسعه داده شده است که عبارتند از:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <li className={`p-3 rounded flex items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <FaCheck className="ml-2 text-green-500" />
                    <span>Next.js 14 (React Framework)</span>
                  </li>
                  <li className={`p-3 rounded flex items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <FaCheck className="ml-2 text-green-500" />
                    <span>TypeScript</span>
                  </li>
                  <li className={`p-3 rounded flex items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <FaCheck className="ml-2 text-green-500" />
                    <span>Tailwind CSS</span>
                  </li>
                  <li className={`p-3 rounded flex items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <FaCheck className="ml-2 text-green-500" />
                    <span>React Context API</span>
                  </li>
                  <li className={`p-3 rounded flex items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <FaCheck className="ml-2 text-green-500" />
                    <span>Local Storage Web API</span>
                  </li>
                  <li className={`p-3 rounded flex items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <FaCheck className="ml-2 text-green-500" />
                    <span>React Beautiful DnD</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center">
                  <FaHistory className={`ml-2 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                  سابقه توسعه
                </h2>
                <p className="leading-7 text-gray-700 dark:text-gray-300">
                  این پروژه از ابتدای سال 1402 با هدف تسهیل برنامه‌ریزی در مدارس آغاز شد. در ابتدا به صورت یک نمونه اولیه ساده بود که به مرور زمان و با دریافت بازخورد از مدیران و معلمان مدارس، توسعه یافت و به نسخه فعلی رسید. این نرم‌افزار حاصل بیش از 6 ماه تحقیق و توسعه مستمر و بهینه‌سازی است.
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center">
                  <FaTools className={`ml-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                  قابلیت‌های اصلی
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>برنامه‌ریزی کلاسی</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      امکان ایجاد و مدیریت برنامه هفتگی برای کلاس‌های مختلف با قابلیت اضافه کردن دروس و معلمان مختلف
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>برنامه‌ریزی پرسنلی</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      امکان ایجاد و مدیریت برنامه هفتگی برای معلمان و کارکنان مدرسه
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'}`}>
                    <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>مدیریت دسترسی‌ها</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      امکان تعریف سطوح دسترسی مختلف برای مدیران، معلمان و دانش‌آموزان
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-amber-50'}`}>
                    <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>ذخیره‌سازی محلی</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      امکان ذخیره‌سازی برنامه‌ها به صورت محلی روی دستگاه کاربر برای استفاده آفلاین
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center">
                  <FaUserCog className={`ml-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  چگونگی استفاده
                </h2>
                <p className="leading-7 text-gray-700 dark:text-gray-300 mb-3">
                  برای استفاده از این نرم‌افزار، ابتدا نقش خود را انتخاب کنید. سپس با توجه به نقش انتخاب شده، به بخش‌های مختلف دسترسی خواهید داشت:
                </p>
                <ul className="space-y-3">
                  <li className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className="font-bold block mb-1">مدیر سیستم</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      دسترسی کامل به تمام بخش‌ها، امکان تعریف پرسنل، کلاس‌ها و تنظیمات سیستم
                    </p>
                  </li>
                  <li className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className="font-bold block mb-1">آموزشگر</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      دسترسی به برنامه‌های هفتگی شخصی و کلاس‌های مرتبط با خود
                    </p>
                  </li>
                  <li className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className="font-bold block mb-1">دانش‌آموز</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      دسترسی به برنامه هفتگی کلاس خود و اطلاعات دروس و معلمان
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            <p>© {new Date().getFullYear()} - تمامی حقوق برای سروش قاری ایوری محفوظ است.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutAppPage; 