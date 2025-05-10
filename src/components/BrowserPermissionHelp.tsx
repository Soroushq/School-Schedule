"use client";

import { useState } from 'react';

export default function BrowserPermissionHelp({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'chrome' | 'firefox' | 'edge' | 'safari'>('chrome');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">راهنمای فعال‌سازی دسترسی مرورگر</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            برای استفاده از این برنامه، لازم است که مرورگر شما اجازه دسترسی به حافظه محلی (Local Storage) را داشته باشد.
            در ادامه، راهنمای فعال‌سازی این دسترسی در مرورگرهای مختلف را مشاهده می‌کنید.
          </p>
          
          {/* تب‌های مرورگرها */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <ul className="flex flex-wrap -mb-px">
              <li className="ml-4">
                <button
                  onClick={() => setActiveTab('chrome')}
                  className={`inline-block py-2 px-4 border-b-2 ${
                    activeTab === 'chrome' 
                      ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500' 
                      : 'border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  گوگل کروم
                </button>
              </li>
              <li className="ml-4">
                <button
                  onClick={() => setActiveTab('firefox')}
                  className={`inline-block py-2 px-4 border-b-2 ${
                    activeTab === 'firefox' 
                      ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500' 
                      : 'border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  فایرفاکس
                </button>
              </li>
              <li className="ml-4">
                <button
                  onClick={() => setActiveTab('edge')}
                  className={`inline-block py-2 px-4 border-b-2 ${
                    activeTab === 'edge' 
                      ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500' 
                      : 'border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  مایکروسافت اج
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('safari')}
                  className={`inline-block py-2 px-4 border-b-2 ${
                    activeTab === 'safari' 
                      ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500' 
                      : 'border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  سافاری
                </button>
              </li>
            </ul>
          </div>
          
          {/* محتوای مربوط به کروم */}
          {activeTab === 'chrome' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">گوگل کروم</h3>
              <ol className="list-decimal mr-6 space-y-4 text-gray-700 dark:text-gray-300">
                <li>
                  <strong>بررسی وضعیت فعلی:</strong> در نوار آدرس مرورگر، کنار آدرس سایت، یک آیکون (معمولاً قفل یا آیکن اطلاعات) را مشاهده خواهید کرد. روی آن کلیک کنید.
                </li>
                <li>
                  <strong>تنظیمات سایت:</strong> روی گزینه "تنظیمات سایت" یا "Site settings" کلیک کنید.
                </li>
                <li>
                  <strong>مجوزها:</strong> در صفحه تنظیمات، به دنبال بخش "مجوزها" یا "Permissions" بگردید.
                </li>
                <li>
                  <strong>ذخیره‌سازی محلی:</strong> سوئیچ مربوط به "Local storage" یا "Cookies and site data" را فعال کنید.
                </li>
                <li>
                  <strong>بارگذاری مجدد:</strong> صفحه را مجدداً بارگذاری کنید تا تغییرات اعمال شود.
                </li>
              </ol>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900 rounded-md">
                <p className="text-yellow-800 dark:text-yellow-400">
                  <strong>نکته:</strong> گاهی اوقات، افزونه‌های مرورگر مانند افزونه‌های مسدودکننده تبلیغات یا حریم خصوصی می‌توانند دسترسی به localStorage را مسدود کنند. اگر با مشکل مواجه هستید، موقتاً این افزونه‌ها را غیرفعال کنید.
                </p>
              </div>
            </div>
          )}
          
          {/* محتوای مربوط به فایرفاکس */}
          {activeTab === 'firefox' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">فایرفاکس</h3>
              <ol className="list-decimal mr-6 space-y-4 text-gray-700 dark:text-gray-300">
                <li>
                  <strong>باز کردن منوی فایرفاکس:</strong> روی دکمه سه خط افقی در گوشه بالا سمت راست مرورگر کلیک کنید.
                </li>
                <li>
                  <strong>تنظیمات:</strong> گزینه "تنظیمات" یا "Preferences" را انتخاب کنید.
                </li>
                <li>
                  <strong>حریم خصوصی و امنیت:</strong> از پنل سمت چپ، گزینه "حریم خصوصی و امنیت" یا "Privacy & Security" را انتخاب کنید.
                </li>
                <li>
                  <strong>کوکی‌ها و داده‌های سایت:</strong> به بخش "Cookies and Site Data" بروید و مطمئن شوید که گزینه "Accept cookies and site data" فعال است.
                </li>
                <li>
                  <strong>حالت محافظت پیشرفته:</strong> اگر "Enhanced Tracking Protection" را در حالت سختگیرانه تنظیم کرده‌اید، ممکن است نیاز باشد برای این سایت استثنا قائل شوید.
                </li>
              </ol>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900 rounded-md">
                <p className="text-yellow-800 dark:text-yellow-400">
                  <strong>نکته:</strong> اگر فایرفاکس را در حالت حفاظت شده استفاده می‌کنید، ممکن است دسترسی به localStorage محدود باشد. برای استفاده از این برنامه، به حالت معمولی مرورگر بازگردید.
                </p>
              </div>
            </div>
          )}
          
          {/* محتوای مربوط به اج */}
          {activeTab === 'edge' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">مایکروسافت اج</h3>
              <ol className="list-decimal mr-6 space-y-4 text-gray-700 dark:text-gray-300">
                <li>
                  <strong>بررسی وضعیت فعلی:</strong> روی آیکون قفل یا اطلاعات کنار آدرس سایت در نوار آدرس کلیک کنید.
                </li>
                <li>
                  <strong>مجوزهای سایت:</strong> گزینه "تنظیمات سایت" یا "Site permissions" را انتخاب کنید.
                </li>
                <li>
                  <strong>تنظیمات کوکی:</strong> مطمئن شوید که گزینه‌های مربوط به "Cookies" و "Storage" فعال هستند.
                </li>
                <li>
                  <strong>تنظیمات پیشرفته:</strong> به منوی سه نقطه بالای مرورگر بروید و "Settings" را انتخاب کنید. سپس به "Cookies and site permissions" بروید و تنظیمات مربوط به "Cookies and data storage" را بررسی کنید.
                </li>
                <li>
                  <strong>لیست استثنائات:</strong> در بخش تنظیمات، به "Manage exceptions" بروید و این سایت را به لیست سایت‌های مجاز اضافه کنید.
                </li>
              </ol>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900 rounded-md">
                <p className="text-yellow-800 dark:text-yellow-400">
                  <strong>نکته:</strong> اگر از حالت InPrivate در اج استفاده می‌کنید، امکان استفاده از localStorage وجود نخواهد داشت. لطفاً از حالت عادی مرورگر استفاده کنید.
                </p>
              </div>
            </div>
          )}
          
          {/* محتوای مربوط به سافاری */}
          {activeTab === 'safari' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">سافاری</h3>
              <ol className="list-decimal mr-6 space-y-4 text-gray-700 dark:text-gray-300">
                <li>
                  <strong>تنظیمات سافاری:</strong> از منوی سافاری، گزینه "Preferences" را انتخاب کنید.
                </li>
                <li>
                  <strong>حریم خصوصی:</strong> به تب "Privacy" بروید.
                </li>
                <li>
                  <strong>مدیریت داده‌های وب‌سایت:</strong> دکمه "Manage Website Data" را کلیک کنید.
                </li>
                <li>
                  <strong>بررسی دسترسی‌ها:</strong> مطمئن شوید که گزینه "Prevent cross-site tracking" انتخاب نشده باشد یا این سایت را به استثنائات اضافه کنید.
                </li>
                <li>
                  <strong>کوکی‌ها:</strong> در تب "Privacy"، مطمئن شوید که "Block all cookies" انتخاب نشده باشد.
                </li>
              </ol>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900 rounded-md">
                <p className="text-yellow-800 dark:text-yellow-400">
                  <strong>نکته:</strong> سافاری در سیستم عامل iOS و macOS محدودیت‌هایی برای localStorage دارد. اگر در حالت مرور خصوصی (Private Browsing) هستید، localStorage کار نخواهد کرد. همچنین اگر گزینه "Prevent cross-site tracking" فعال باشد، ممکن است با مشکل مواجه شوید.
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">اقدامات عمومی برای رفع مشکل</h3>
            <ul className="list-disc mr-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>مرورگر خود را به آخرین نسخه به‌روزرسانی کنید.</li>
              <li>افزونه‌های مسدودکننده تبلیغات یا محافظ حریم خصوصی را موقتاً غیرفعال کنید.</li>
              <li>حافظه کش (Cache) مرورگر خود را پاک کنید.</li>
              <li>از حالت ناشناس یا مرور خصوصی خارج شوید.</li>
              <li>در صورت امکان، از مرورگر دیگری استفاده کنید.</li>
              <li>فایروال یا نرم‌افزارهای امنیتی را بررسی کنید که مانع دسترسی نشوند.</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
} 