"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storageService } from '@/services/storageService';

export default function UserAgreementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // بررسی وضعیت پذیرش توافق‌نامه با استفاده از سرویس
    const hasAcceptedAgreement = storageService.hasAcceptedAgreement();
    
    // اگر کاربر قبلاً توافق‌نامه را نپذیرفته باشد، مودال را نمایش بده
    if (!hasAcceptedAgreement) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    // ذخیره وضعیت پذیرش در localStorage با استفاده از سرویس
    const success = storageService.acceptUserAgreement();
    
    if (success) {
      setAccepted(true);
      setIsOpen(false);
    } else {
      // نمایش هشدار در صورت عدم موفقیت
      alert('متأسفانه دسترسی به حافظه محلی مرورگر ممکن نیست. لطفاً تنظیمات مرورگر خود را بررسی کنید و اجازه دسترسی به حافظه محلی را فعال نمایید.');
    }
  };

  const handleReject = () => {
    // بستن تب یا هدایت به صفحه خروج
    window.close();
    // در صورتی که window.close() کار نکند، به صفحه خطا هدایت می‌کنیم
    router.push('/access-denied');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">توافق‌نامه استفاده از برنامه‌ساز مدرسه</h2>
          
          <div className="prose dark:prose-invert max-w-none mb-6 text-gray-700 dark:text-gray-300">
            <p className="font-bold text-red-600 dark:text-red-400 text-lg mb-4">
              لطفاً پیش از استفاده از این برنامه، موارد زیر را با دقت مطالعه نمایید:
            </p>
            
            <h3 className="text-xl font-semibold mb-2">دسترسی به حافظه محلی مرورگر:</h3>
            <p>
              این برنامه برای ذخیره‌سازی اطلاعات و تنظیمات شما، از حافظه محلی مرورگرتان (localStorage) استفاده می‌کند.
              تمام داده‌های شما فقط به صورت محلی در دستگاه شما ذخیره می‌شوند و هیچ اطلاعاتی به سرور ارسال نمی‌شود.
            </p>
            
            <h3 className="text-xl font-semibold mb-2">امنیت و حریم خصوصی:</h3>
            <ul className="list-disc mr-6 space-y-2">
              <li>تمام داده‌های شما به صورت محلی در مرورگر شما ذخیره می‌شوند.</li>
              <li>هیچ داده‌ای به صورت عمومی منتشر نمی‌شود.</li>
              <li>برای محافظت از داده‌های خود، توصیه می‌کنیم به طور منظم از اطلاعات خود پشتیبان‌گیری کنید.</li>
              <li>از به اشتراک‌گذاری دسترسی به این برنامه با افراد غیرمجاز خودداری کنید.</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2">هشدارهای مهم:</h3>
            <ul className="list-disc mr-6 space-y-2">
              <li className="text-red-600 dark:text-red-400">
                <strong>رد درخواست‌های دسترسی مرورگر:</strong> در صورت رد درخواست‌های دسترسی مرورگر به حافظه محلی، ممکن است برنامه به درستی کار نکند یا داده‌های شما ذخیره نشود.
              </li>
              <li className="text-red-600 dark:text-red-400">
                <strong>پاک کردن حافظه مرورگر:</strong> در صورت پاک کردن حافظه مرورگر یا کوکی‌ها، تمام اطلاعات ذخیره شده در برنامه از بین خواهند رفت.
              </li>
              <li className="text-red-600 dark:text-red-400">
                <strong>حالت ناشناس (Incognito):</strong> استفاده از برنامه در حالت ناشناس توصیه نمی‌شود، زیرا داده‌ها پس از بستن مرورگر از بین خواهند رفت.
              </li>
            </ul>
            
            <p className="mt-4">
              با پذیرش این توافق‌نامه، شما اجازه می‌دهید تا برنامه به حافظه محلی مرورگر شما دسترسی داشته باشد و تمام اطلاعات مورد نیاز را در آن ذخیره کند.
            </p>
          </div>
          
          <div className="flex items-center mb-6">
            <input 
              type="checkbox" 
              id="agreement-checkbox" 
              className="w-5 h-5 ml-2 accent-blue-600" 
              checked={accepted} 
              onChange={(e) => setAccepted(e.target.checked)} 
            />
            <label htmlFor="agreement-checkbox" className="text-gray-800 dark:text-gray-200">
              من تمام موارد فوق را مطالعه کرده و می‌پذیرم
            </label>
          </div>
          
          <div className="flex justify-between">
            <button 
              onClick={handleReject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              رد کردن و خروج
            </button>
            
            <button 
              onClick={handleAccept}
              disabled={!accepted}
              className={`px-4 py-2 rounded-md transition-colors ${
                accepted 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              پذیرش و ادامه
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 