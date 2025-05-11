'use client';

import React, { useState, useEffect } from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import Link from 'next/link';
import { FaLock, FaLockOpen, FaShieldAlt, FaUserShield, FaUserCog, FaUserGraduate, FaSun, FaMoon, FaArrowRight } from 'react-icons/fa';

const AccessControlPage = () => {
  const { userRole, hasAccess } = useUserRole();
  const [mounted, setMounted] = useState(false);
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

  // در صورتی که کاربر هنوز نقشی انتخاب نکرده باشد
  if (mounted && !userRole) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-center mb-6">
            <FaLock className="text-4xl text-red-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">دسترسی محدود شده</h1>
          </div>
          
          <div className="text-center bg-red-50 dark:bg-red-900/30 p-4 rounded-lg mb-6">
            <p className="text-red-700 dark:text-red-300">
              برای دسترسی به این بخش، ابتدا باید نقش خود را از طریق نوار بالای صفحه انتخاب کنید.
            </p>
          </div>
          
          <div className="text-center">
            <Link href="/welcome" className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
          <div className="flex items-center mb-6">
            <FaShieldAlt className="text-4xl text-indigo-500 dark:text-indigo-400 ml-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">نمایش دسترسی</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                مشاهده سطوح دسترسی براساس نقش کاربری
              </p>
            </div>
          </div>
          
          {mounted && (
            <>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  {userRole === 'admin' && <FaUserShield className="text-2xl text-indigo-600 dark:text-indigo-300 ml-2" />}
                  {userRole === 'educator' && <FaUserCog className="text-2xl text-blue-600 dark:text-blue-300 ml-2" />}
                  {userRole === 'learner' && <FaUserGraduate className="text-2xl text-green-600 dark:text-green-300 ml-2" />}
                  <p className="font-bold text-lg">
                    نقش فعلی شما: {' '}
                    <span className={`
                      ${userRole === 'admin' ? 'text-indigo-700 dark:text-indigo-300' : ''}
                      ${userRole === 'educator' ? 'text-blue-700 dark:text-blue-300' : ''}
                      ${userRole === 'learner' ? 'text-green-700 dark:text-green-300' : ''}
                    `}>
                      {userRole === 'admin' ? 'مدیر سیستم' : userRole === 'educator' ? 'آموزشگر' : 'دانش‌آموز'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">دسترسی‌های ویژه</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PermissionCard 
                    title="مدیریت کاربران" 
                    description="ایجاد، ویرایش و حذف کاربران سیستم"
                    icon={<FaUserShield className="text-2xl" />}
                    allowed={hasAccess(['admin'])}
                  />
                  
                  <PermissionCard 
                    title="تعریف دروس و کلاس‌ها" 
                    description="تعریف دروس و برنامه‌ریزی کلاس‌ها"
                    icon={<FaUserCog className="text-2xl" />}
                    allowed={hasAccess(['admin', 'educator'])}
                  />
                  
                  <PermissionCard 
                    title="مشاهده برنامه کلاسی" 
                    description="نمایش برنامه کلاس‌های مختلف"
                    icon={<FaUserGraduate className="text-2xl" />}
                    allowed={hasAccess(['admin', 'educator', 'learner'])}
                  />
                  
                  <PermissionCard 
                    title="تنظیمات سیستم" 
                    description="تغییر تنظیمات اصلی سیستم"
                    icon={<FaUserShield className="text-2xl" />}
                    allowed={hasAccess(['admin'])}
                  />
                </div>
                
                <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <p>دسترسی‌ها بر اساس نقش انتخابی شما تعیین می‌شوند. برای تغییر نقش خود، از گزینه «انتخاب نقش» در نوار ابزار بالای صفحه استفاده کنید.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface PermissionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  allowed: boolean;
}

const PermissionCard: React.FC<PermissionCardProps> = ({ title, description, icon, allowed }) => {
  return (
    <div className={`
      p-4 rounded-lg border transition-all duration-300
      ${allowed 
        ? 'bg-white dark:bg-gray-700 border-green-200 dark:border-green-800' 
        : 'bg-gray-50 dark:bg-gray-800 border-red-200 dark:border-red-900 opacity-70'}
    `}>
      <div className="flex">
        <div className={`
          flex items-center justify-center rounded-full w-10 h-10 ml-3
          ${allowed 
            ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' 
            : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}
        `}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center">
            {title}
            {allowed 
              ? <FaLockOpen className="mr-2 text-green-600 dark:text-green-400 text-sm" /> 
              : <FaLock className="mr-2 text-red-600 dark:text-red-400 text-sm" />}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
          <div className={`
            mt-2 inline-block px-2 py-1 rounded text-xs font-bold
            ${allowed 
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' 
              : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}
          `}>
            {allowed ? 'دسترسی دارید' : 'دسترسی ندارید'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessControlPage; 