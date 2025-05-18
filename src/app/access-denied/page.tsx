"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaLock, FaHome, FaArrowLeft } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

export default function AccessDenied() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center p-5 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`max-w-md w-full text-center space-y-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
        <div>
          <div className="flex justify-center">
            <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <FaLock className={`text-5xl ${theme === 'dark' ? 'text-red-500' : 'text-red-600'}`} />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold">
            دسترسی محدود شده
          </h2>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            متأسفانه شما اجازه دسترسی به این صفحه را ندارید.
          </p>
          <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            برای دسترسی به این بخش، نیاز به سطح دسترسی بالاتری دارید.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => router.back()}
            className={`
              flex items-center justify-center gap-2 py-2 px-4 rounded-md 
              ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} 
              transition-colors flex-1
            `}
          >
            <FaArrowLeft />
            <span>بازگشت</span>
          </button>
          
          <Link
            href="/welcome"
            className={`
              flex items-center justify-center gap-2 py-2 px-4 rounded-md 
              ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} 
              transition-colors flex-1
            `}
          >
            <FaHome />
            <span>صفحه اصلی</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 