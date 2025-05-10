"use client";

import { useEffect, useState } from 'react';
import { storageService } from '@/services/storageService';
import BrowserPermissionHelp from './BrowserPermissionHelp';

export default function StorageAccessIndicator() {
  const [hasAccess, setHasAccess] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // بررسی وضعیت دسترسی به حافظه محلی
    const checkAccess = () => {
      const accessStatus = storageService.getAccessStatus();
      setHasAccess(accessStatus);
      setIsVisible(!accessStatus);
    };

    // بررسی اولیه دسترسی
    checkAccess();

    // تنظیم بررسی دوره‌ای دسترسی (هر 5 ثانیه)
    const intervalId = setInterval(checkAccess, 5000);

    // اضافه کردن شنونده برای رویداد storage
    const handleStorageChange = () => {
      checkAccess();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // اگر دسترسی وجود دارد یا هشدار مخفی شده است، چیزی نمایش نده
  if (hasAccess || !isVisible) return null;

  return (
    <>
      <BrowserPermissionHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
      
      <div className="fixed bottom-4 left-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-40 max-w-lg mx-auto">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="mr-3 flex-1">
            <h3 className="text-base font-medium">مشکل در دسترسی به حافظه محلی</h3>
            <div className="mt-1 text-sm">
              <p>برنامه برای ذخیره‌سازی داده‌ها به حافظه محلی مرورگر نیاز دارد. لطفاً:</p>
              <ul className="list-disc mr-5 mt-1 space-y-1">
                <li>تنظیمات حریم خصوصی مرورگر خود را بررسی کنید</li>
                <li>اجازه دسترسی به حافظه محلی (Local Storage) را فعال کنید</li>
                <li>در صورت مسدود شدن توسط افزونه‌های مرورگر، آن‌ها را غیرفعال نمایید</li>
              </ul>
              <button 
                onClick={() => setShowHelp(true)}
                className="mt-2 text-white underline hover:text-red-100 font-medium"
              >
                راهنمای کامل فعال‌سازی دسترسی در مرورگرها
              </button>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)} 
            className="flex-shrink-0 bg-red-700 rounded-md p-1 hover:bg-red-800"
          >
            <span className="sr-only">بستن</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex justify-between">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-white text-red-600 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            بارگذاری مجدد
          </button>
          <button
            onClick={() => {
              const success = storageService.refreshAccess();
              setHasAccess(success);
              if (!success) {
                alert('همچنان مشکل دسترسی به حافظه محلی وجود دارد. لطفاً تنظیمات مرورگر خود را بررسی کنید.');
              } else {
                setIsVisible(false);
              }
            }}
            className="px-3 py-1 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors text-sm font-medium"
          >
            بررسی مجدد دسترسی
          </button>
        </div>
      </div>
    </>
  );
} 