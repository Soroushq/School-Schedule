'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storageService } from '@/services/storageService';

const PrivacyAgreement = () => {
  const [showAgreement, setShowAgreement] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    
    // بررسی وضعیت پذیرش توافق‌نامه با استفاده از سرویس
    const hasAcceptedAgreement = storageService.hasAcceptedAgreement();
    const hasPrivacyAgreement = storageService.getItem('privacy_agreement_accepted');
    
    // اگر کاربر هر کدام از توافق‌نامه‌ها را نپذیرفته باشد، مودال را نمایش بده
    if (!hasAcceptedAgreement || !hasPrivacyAgreement) {
      setShowAgreement(true);
      
      // اگر در موبایل هستیم و کاربر مایل به ادامه است، قفل اسکرول فعال شود
      if (typeof window !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    }
  }, []);

  const handleAccept = () => {
    if (!accepted) {
      // اگر چک‌باکس را علامت نزده باشد
      alert('لطفاً توافق‌نامه را مطالعه کرده و تیک تأیید را بزنید');
      return;
    }
    
    // ذخیره وضعیت پذیرش در localStorage با استفاده از سرویس
    const success1 = storageService.acceptUserAgreement();
    const success2 = storageService.setItem('privacy_agreement_accepted', 'true');
    
    if (success1 && success2) {
      setShowAgreement(false);
      // برداشتن قفل اسکرول
      if (typeof window !== 'undefined') {
        document.body.style.overflow = 'auto';
      }
    } else {
      // نمایش هشدار در صورت عدم موفقیت
      alert('متأسفانه دسترسی به حافظه محلی مرورگر ممکن نیست. لطفاً تنظیمات مرورگر خود را بررسی کنید و اجازه دسترسی به حافظه محلی را فعال نمایید.');
    }
  };

  const handleDecline = () => {
    // در موبایل، تلاش برای بستن صفحه
    if (typeof window !== 'undefined') {
      try {
        window.close();
      } catch (e) {
        // اگر بستن پنجره کار نکرد، به صفحه خطا هدایت می‌کنیم
        router.push('/access-denied');
      }
      
      // اضافه کردن یک لایه مسدودکننده روی همه محتوا
      const blocker = document.createElement('div');
      blocker.style.position = 'fixed';
      blocker.style.inset = '0';
      blocker.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      blocker.style.zIndex = '9999';
      blocker.style.display = 'flex';
      blocker.style.flexDirection = 'column';
      blocker.style.alignItems = 'center';
      blocker.style.justifyContent = 'center';
      blocker.style.color = 'white';
      blocker.style.fontWeight = 'bold';
      blocker.style.textAlign = 'center';
      blocker.style.padding = '20px';
      
      const message = document.createElement('p');
      message.textContent = 'برای استفاده از برنامه، پذیرش توافق‌نامه الزامی است. لطفاً صفحه را ببندید.';
      
      const reloadBtn = document.createElement('button');
      reloadBtn.textContent = 'تلاش مجدد';
      reloadBtn.style.marginTop = '20px';
      reloadBtn.style.padding = '10px 20px';
      reloadBtn.style.backgroundColor = '#3b82f6';
      reloadBtn.style.color = 'white';
      reloadBtn.style.border = 'none';
      reloadBtn.style.borderRadius = '5px';
      reloadBtn.style.cursor = 'pointer';
      reloadBtn.onclick = () => window.location.reload();
      
      blocker.appendChild(message);
      blocker.appendChild(reloadBtn);
      document.body.appendChild(blocker);
    }
  };

  if (!isClient || !showAgreement) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto shadow-xl max-h-[90vh] overflow-y-auto w-full">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">توافق‌نامه حریم خصوصی و استفاده از برنامه</h2>
          <p className="text-gray-500 text-sm">لطفاً پیش از استفاده از برنامه، این توافقنامه را مطالعه کنید</p>
        </div>
        
        <div className="text-gray-700 text-justify space-y-4 text-sm mb-6 border p-4 rounded-md bg-gray-50 overflow-y-auto max-h-[50vh]">
          <p className="font-bold text-red-600 text-base">
            کاربر گرامی، به برنامه‌ساز مدرسه خوش آمدید. لطفاً پیش از استفاده از این برنامه، موارد زیر را با دقت مطالعه نمایید:
          </p>
          
          <h3 className="text-lg font-semibold mt-4">دسترسی به حافظه محلی مرورگر:</h3>
          <p>
            این برنامه برای ذخیره‌سازی اطلاعات و تنظیمات شما، از حافظه محلی مرورگرتان (localStorage) استفاده می‌کند.
            تمام داده‌های شما فقط به صورت محلی در دستگاه شما ذخیره می‌شوند و هیچ اطلاعاتی به سرور ارسال نمی‌شود.
          </p>
          
          <h3 className="text-lg font-semibold">حریم خصوصی و اطلاعات جمع‌آوری شده:</h3>
          <p>
            برای ارائه خدمات بهتر و بهبود کیفیت برنامه، ما اطلاعات زیر را جمع‌آوری می‌کنیم:
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
          
          <h3 className="text-lg font-semibold">امنیت و حریم خصوصی:</h3>
          <ul className="list-disc mr-6 space-y-2">
            <li>تمام داده‌های شما به صورت محلی در مرورگر شما ذخیره می‌شوند.</li>
            <li>هیچ داده‌ای به صورت عمومی منتشر نمی‌شود.</li>
            <li>برای محافظت از داده‌های خود، توصیه می‌کنیم به طور منظم از اطلاعات خود پشتیبان‌گیری کنید.</li>
            <li>از به اشتراک‌گذاری دسترسی به این برنامه با افراد غیرمجاز خودداری کنید.</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-red-600">هشدارهای مهم:</h3>
          <ul className="list-disc mr-6 space-y-2">
            <li className="text-red-600">
              <strong>رد درخواست‌های دسترسی مرورگر:</strong> در صورت رد درخواست‌های دسترسی مرورگر به حافظه محلی، ممکن است برنامه به درستی کار نکند یا داده‌های شما ذخیره نشود.
            </li>
            <li className="text-red-600">
              <strong>پاک کردن حافظه مرورگر:</strong> در صورت پاک کردن حافظه مرورگر یا کوکی‌ها، تمام اطلاعات ذخیره شده در برنامه از بین خواهند رفت.
            </li>
            <li className="text-red-600">
              <strong>حالت ناشناس (Incognito):</strong> استفاده از برنامه در حالت ناشناس توصیه نمی‌شود، زیرا داده‌ها پس از بستن مرورگر از بین خواهند رفت.
            </li>
          </ul>
          
          <p className="font-bold text-blue-600 text-[11px] mt-4">
            * توجه: تاریخ، ساعت و اطلاعات دستگاه شما در هنگام استفاده از برنامه ثبت خواهد شد. با پذیرش این توافق‌نامه، شما اجازه می‌دهید تا برنامه به حافظه محلی مرورگر شما دسترسی داشته باشد و تمام اطلاعات مورد نیاز را در آن ذخیره کند.
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
          <label htmlFor="agreement-checkbox" className="text-gray-800">
            من تمام موارد فوق را مطالعه کرده و می‌پذیرم
          </label>
        </div>
        
        <div className="flex flex-row-reverse items-center justify-between gap-3">
          <button
            onClick={handleAccept}
            disabled={!accepted}
            className={`py-2 px-5 rounded-lg font-semibold transition-all shadow-md ${
              accepted 
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            پذیرش و ادامه
          </button>
          <button
            onClick={handleDecline}
            className="py-2 px-5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all shadow-md"
          >
            نپذیرفتن و خروج
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyAgreement; 