'use client';

import React, { useState, useEffect } from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import Link from 'next/link';
import { FaLock, FaLockOpen, FaShieldAlt, FaUserShield, FaUserCog, FaUserGraduate, FaArrowRight } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

const AccessControlPage = () => {
  const { userRole, hasAccess } = useUserRole();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
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
        
        <div className={`p-6 rounded-xl shadow-md mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-center mb-6">
            <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-indigo-900' : 'bg-indigo-100'}`}>
              <FaShieldAlt className={`text-4xl ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`} />
            </div>
          </div>
          <h1 className={`text-3xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            مدیریت دسترسی‌ها
          </h1>
          <p className={`text-center mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            در این صفحه می‌توانید دسترسی‌های نقش فعلی خود را مشاهده کنید.
          </p>
          
          <div className={`p-4 mb-8 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              نقش فعلی:
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className={`p-4 rounded-lg text-center w-full md:w-1/3 ${
                userRole === 'admin' 
                  ? 'bg-indigo-600 text-white' 
                  : theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500'
              }`}>
                <FaUserCog className="text-4xl mx-auto mb-2" />
                <div className="font-bold">مدیر سیستم</div>
              </div>
              <div className={`p-4 rounded-lg text-center w-full md:w-1/3 ${
                userRole === 'educator' 
                  ? 'bg-blue-600 text-white' 
                  : theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500'
              }`}>
                <FaUserShield className="text-4xl mx-auto mb-2" />
                <div className="font-bold">آموزشگر</div>
              </div>
              <div className={`p-4 rounded-lg text-center w-full md:w-1/3 ${
                userRole === 'learner' 
                  ? 'bg-green-600 text-white' 
                  : theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500'
              }`}>
                <FaUserGraduate className="text-4xl mx-auto mb-2" />
                <div className="font-bold">دانش‌آموز</div>
              </div>
            </div>
          </div>
          
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            دسترسی به بخش‌های مختلف
          </h2>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  مدیریت برنامه کلاسی
                </h3>
                {hasAccess(['admin', 'educator']) ? (
                  <div className="flex items-center text-green-500">
                    <FaLockOpen className="ml-1" />
                    مجاز
                  </div>
                ) : (
                  <div className="flex items-center text-red-500">
                    <FaLock className="ml-1" />
                    غیرمجاز
                  </div>
                )}
              </div>
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                امکان ایجاد، ویرایش و مدیریت برنامه‌های کلاسی
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  مدیریت برنامه پرسنلی
                </h3>
                {hasAccess(['admin', 'educator']) ? (
                  <div className="flex items-center text-green-500">
                    <FaLockOpen className="ml-1" />
                    مجاز
                  </div>
                ) : (
                  <div className="flex items-center text-red-500">
                    <FaLock className="ml-1" />
                    غیرمجاز
                  </div>
                )}
              </div>
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                امکان ایجاد، ویرایش و مدیریت برنامه‌های پرسنلی
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  تنظیمات سیستم
                </h3>
                {hasAccess(['admin']) ? (
                  <div className="flex items-center text-green-500">
                    <FaLockOpen className="ml-1" />
                    مجاز
                  </div>
                ) : (
                  <div className="flex items-center text-red-500">
                    <FaLock className="ml-1" />
                    غیرمجاز
                  </div>
                )}
              </div>
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                امکان تغییر تنظیمات کلی سیستم و مدیریت دسترسی‌ها
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  گزارش‌گیری و آمار
                </h3>
                {hasAccess(['admin', 'educator']) ? (
                  <div className="flex items-center text-green-500">
                    <FaLockOpen className="ml-1" />
                    مجاز
                  </div>
                ) : (
                  <div className="flex items-center text-red-500">
                    <FaLock className="ml-1" />
                    غیرمجاز
                  </div>
                )}
              </div>
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                امکان مشاهده و دریافت گزارش‌های مختلف از سیستم
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          <p>برای تغییر نقش، به نوار ناوبری بالای صفحه مراجعه کنید.</p>
        </div>
      </div>
    </div>
  );
};

export default AccessControlPage; 