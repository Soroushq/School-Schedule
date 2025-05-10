'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { scheduleSyncService } from '@/services/scheduleSync';
import { storageService } from '@/services/storageService';

// تعریف اینترفیس‌های مورد نیاز
interface Personnel {
  id: string;
  personnelCode: string;
  fullName: string;
  mainPosition: string;
  employmentStatus: string;
}

interface Schedule {
  id: string;
  personnelCode?: string;
  fullName?: string;
  grade?: string;
  classNumber?: string;
  field?: string;
  mainPosition?: string;
  employmentStatus?: string;
  hourType: string;
  teachingGroup: string;
  description: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  hourNumber?: number;
  timestamp?: number;
  personnelId?: string;
  classScheduleId?: string;
  personnelScheduleId?: string;
  source?: 'class' | 'personnel';
}

interface PersonnelSchedule {
  personnel: Personnel;
  schedules: Schedule[];
  timestamp: number;
}

interface ClassSchedule {
  id: string;
  grade: string;
  classNumber: string;
  field: string;
  schedules: Schedule[];
  timestamp: number;
}

// اینترفیس برای انتقال پیام بین تب‌ها
interface SyncMessage {
  type: 'SYNC_UPDATE';
  source: string;
  timestamp: number;
}

/**
 * کامپوننت مشاهده‌گر تغییرات برنامه‌های پرسنلی و کلاسی
 * این کامپوننت هر تغییری در برنامه‌ها را دنبال کرده و آنها را بین برنامه‌های مختلف همگام می‌کند
 */
export const ScheduleSyncObserver = () => {
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    // بررسی اینکه آیا در محیط مرورگر هستیم
    if (typeof window === 'undefined') {
      return; // در محیط سرور، اثری ندارد
    }

    // ایجاد یک شناسه منحصر به فرد برای این نشست
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    // شنونده برای رویداد storage
    const handleStorageChange = (e: StorageEvent) => {
      // بررسی تغییرات مربوط به برنامه‌ها
      if (e.key && (e.key.startsWith('class_schedule_') || e.key.startsWith('personnel_schedule_'))) {
        console.log('تغییر در داده‌های ذخیره شده شناسایی شد:', e.key);
        // به‌روزرسانی آخرین زمان تغییر برای القای رندر مجدد
        setLastUpdate(Date.now());
      }
      
      // بررسی پیام‌های همزمان‌سازی
      if (e.key === 'sync_message') {
        try {
          const message = JSON.parse(e.newValue || '{}') as SyncMessage;
          
          // اطمینان از اینکه پیام از منبع دیگری آمده است (نه خود این تب)
          if (message.type === 'SYNC_UPDATE' && message.source !== sessionId) {
            console.log('پیام همزمان‌سازی دریافت شد:', message);
            setLastUpdate(Date.now());
          }
        } catch (error) {
          console.error('خطا در پردازش پیام همزمان‌سازی:', error);
        }
      }
    };

    // افزودن شنونده به رویداد storage
    window.addEventListener('storage', handleStorageChange);

    // تابع ارسال پیام همزمان‌سازی
    const broadcastSyncMessage = () => {
      const message: SyncMessage = {
        type: 'SYNC_UPDATE',
        source: sessionId,
        timestamp: Date.now()
      };
      
      storageService.setItem('sync_message', JSON.stringify(message));
    };

    // اضافه کردن شنونده برای محتوای localStorage
    const originalSetItem = storageService.setItem;
    const enhancedSetItem = (key: string, value: string): boolean => {
      const result = originalSetItem.call(storageService, key, value);
      
      // اگر تغییر مربوط به برنامه‌ها باشد، پیام همزمان‌سازی ارسال کن
      if (key.startsWith('class_schedule_') || key.startsWith('personnel_schedule_')) {
        broadcastSyncMessage();
      }
      
      return result;
    };
    
    // جایگزینی موقت تابع setItem
    (storageService as any).setItem = enhancedSetItem;

    // تنظیم بررسی دوره‌ای همزمان‌سازی هر 10 ثانیه (پشتیبان)
    const syncInterval = setInterval(() => {
      // این فقط یک پشتیبان است در صورتی که رویداد storage به درستی کار نکند
      setLastUpdate(Date.now());
    }, 10000);

    return () => {
      // پاکسازی شنونده‌ها و بازگرداندن تابع اصلی
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(syncInterval);
      (storageService as any).setItem = originalSetItem;
    };
  }, []);

  // این کامپوننت چیزی رندر نمی‌کند، فقط به عنوان ناظر عمل می‌کند
  return null;
};

export default ScheduleSyncObserver; 