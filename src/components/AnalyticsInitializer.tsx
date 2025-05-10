'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnalyticsService } from '@/services/analyticsService';

/**
 * کامپوننت مسئول راه‌اندازی سرویس آنالیتیکس و ردیابی بازدیدهای صفحه
 */
const AnalyticsInitializer: React.FC = () => {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState<string | null>(null);

  useEffect(() => {
    // راه‌اندازی آنالیتیکس فقط در سمت کلاینت
    if (typeof window !== 'undefined') {
      const analyticsService = AnalyticsService.getInstance();

      // زمانی که مسیر تغییر می‌کند، بازدید صفحه را ثبت می‌کنیم
      if (pathname !== prevPathname) {
        setPrevPathname(pathname);

        // تاخیر کوتاه برای اطمینان از اینکه صفحه کاملاً لود شده است
        setTimeout(() => {
          // ثبت بازدید صفحه با نام صفحه
          const pageName = getPageNameFromPath(pathname);
          analyticsService.trackPageView(pageName);
          
          // ثبت رویداد ورود به برنامه (فقط برای صفحه اصلی)
          if (pathname === '/' || pathname === '/welcome') {
            analyticsService.trackEvent('app_entry', { entryPoint: pathname });
          }
        }, 500);
      }
    }
  }, [pathname, prevPathname]);

  // استخراج نام صفحه از مسیر URL
  const getPageNameFromPath = (path: string): string => {
    if (path === '/') return 'صفحه اصلی';
    if (path === '/welcome') return 'خوش‌آمدگویی';
    if (path.includes('class-schedule')) return 'برنامه کلاسی';
    if (path.includes('personnel-schedule')) return 'برنامه پرسنلی';
    
    // حذف / از ابتدای مسیر و بخش‌بندی براساس /
    return path.replace(/^\//, '').split('/').join(' - ');
  };

  // این کامپوننت چیزی رندر نمی‌کند
  return null;
};

export default AnalyticsInitializer; 