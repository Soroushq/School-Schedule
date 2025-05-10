'use client';

import { useState, useEffect } from 'react';
import { storageService } from '@/services/storageService';

const PrivacyAgreement = () => {
  const [showAgreement, setShowAgreement] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // بررسی می‌کند که آیا کاربر قبلاً توافقنامه را پذیرفته است یا خیر
    const hasAgreed = storageService.getItem('privacy_agreement_accepted');
    if (!hasAgreed) {
      setShowAgreement(true);
    }
  }, []);

  const handleAccept = () => {
    storageService.setItem('privacy_agreement_accepted', 'true');
    setShowAgreement(false);
  };

  const handleDecline = () => {
    setShowAgreement(false);
    
    // در موبایل، اگر کاربر نپذیرد، بهتر است صفحه بسته شود
    if (typeof window !== 'undefined' && /mobile/i.test(window.navigator.userAgent)) {
      // یک تایمر کوتاه قبل از بستن صفحه
      setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          // در برخی مرورگرها اجازه بستن پنجره‌هایی که با اسکریپت باز نشده‌اند داده نمی‌شود
          // در این حالت پیامی به کاربر نمایش می‌دهیم
          alert('لطفاً صفحه را ببندید');
        }
      }, 500);
    }
  };

  if (!isClient || !showAgreement) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">توافقنامه حریم خصوصی</h2>
          <p className="text-gray-500 text-sm">لطفاً پیش از استفاده از برنامه، این توافقنامه را مطالعه کنید</p>
        </div>
        
        <div className="text-gray-700 text-justify space-y-3 text-sm mb-4 border p-3 rounded-md bg-gray-50">
          <p>
            کاربر گرامی، به برنامه‌ساز مدرسه خوش آمدید. برای ارائه خدمات بهتر و بهبود کیفیت برنامه، ما اطلاعات زیر را جمع‌آوری می‌کنیم:
          </p>
          <ul className="list-disc space-y-1 mr-6">
            <li>اطلاعات دستگاه شما (سیستم عامل، مرورگر، نوع دستگاه)</li>
            <li>رزولوشن صفحه نمایش و تنظیمات زبان</li>
            <li>منطقه زمانی</li>
            <li>آدرس IP و داده‌های مربوط به استفاده از برنامه</li>
            <li>زمان ورود و خروج شما و صفحاتی که بازدید می‌کنید</li>
          </ul>
          <p>
            این اطلاعات تنها برای بهبود کیفیت برنامه و رفع مشکلات احتمالی استفاده خواهد شد و با اشخاص ثالث به اشتراک گذاشته نخواهد شد.
          </p>
          <p className="text-blue-600 font-bold text-[10px]">
            * توجه: تاریخ، ساعت و اطلاعات دستگاه شما در هنگام استفاده از برنامه ثبت خواهد شد.
          </p>
        </div>
        
        <div className="flex flex-row-reverse items-center justify-between gap-3 flex-wrap">
          <button
            onClick={handleAccept}
            className="py-2 px-5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-md"
          >
            پذیرش و ادامه
          </button>
          <button
            onClick={handleDecline}
            className="py-2 px-5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
          >
            نپذیرفتن و خروج
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyAgreement; 