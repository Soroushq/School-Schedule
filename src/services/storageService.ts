"use client";

/**
 * سرویس مدیریت حافظه محلی برای استفاده امن از localStorage
 * 
 * این سرویس یک لایه انتزاعی ایجاد می‌کند که دسترسی به localStorage را کنترل می‌کند
 * تا در صورت بروز مشکل یا رد درخواست دسترسی، با خطا مواجه نشویم.
 */
export class StorageService {
  private static instance: StorageService;
  private hasAccess: boolean = false;

  // استفاده از الگوی Singleton
  private constructor() {
    this.checkAccess();
  }

  // دریافت نمونه منحصر به فرد از سرویس
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // بررسی دسترسی به localStorage
  private checkAccess(): void {
    try {
      // تلاش برای نوشتن و خواندن یک مقدار آزمایشی
      localStorage.setItem('storage_test', 'test');
      const test = localStorage.getItem('storage_test');
      localStorage.removeItem('storage_test');
      
      // اگر مقدار خوانده شده با مقدار نوشته شده برابر باشد، دسترسی داریم
      this.hasAccess = test === 'test';

      // بررسی پذیرش توافق‌نامه
      const hasAcceptedAgreement = localStorage.getItem('userAgreementAccepted');
      if (!hasAcceptedAgreement) {
        this.hasAccess = false;
      }
    } catch (e) {
      console.error('دسترسی به localStorage ممکن نیست:', e);
      this.hasAccess = false;
    }
  }

  // دریافت وضعیت دسترسی
  public getAccessStatus(): boolean {
    return this.hasAccess;
  }

  // ذخیره‌سازی داده در localStorage با مدیریت خطا
  public setItem(key: string, value: string): boolean {
    if (!this.hasAccess) {
      console.warn('دسترسی به localStorage وجود ندارد. لطفاً توافق‌نامه را بپذیرید.');
      return false;
    }

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error(`خطا در ذخیره‌سازی "${key}":`, e);
      this.checkAccess(); // بررسی مجدد دسترسی
      return false;
    }
  }

  // خواندن داده از localStorage با مدیریت خطا
  public getItem(key: string): string | null {
    if (!this.hasAccess) {
      console.warn('دسترسی به localStorage وجود ندارد. لطفاً توافق‌نامه را بپذیرید.');
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`خطا در خواندن "${key}":`, e);
      this.checkAccess(); // بررسی مجدد دسترسی
      return null;
    }
  }

  // حذف داده از localStorage با مدیریت خطا
  public removeItem(key: string): boolean {
    if (!this.hasAccess) {
      console.warn('دسترسی به localStorage وجود ندارد. لطفاً توافق‌نامه را بپذیرید.');
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`خطا در حذف "${key}":`, e);
      this.checkAccess(); // بررسی مجدد دسترسی
      return false;
    }
  }

  // دریافت تمام کلیدهای موجود در localStorage
  public getAllKeys(): string[] {
    if (!this.hasAccess) {
      console.warn('دسترسی به localStorage وجود ندارد. لطفاً توافق‌نامه را بپذیرید.');
      return [];
    }

    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (e) {
      console.error('خطا در دریافت کلیدها:', e);
      this.checkAccess(); // بررسی مجدد دسترسی
      return [];
    }
  }

  // پاک کردن تمام داده‌های localStorage
  public clear(): boolean {
    if (!this.hasAccess) {
      console.warn('دسترسی به localStorage وجود ندارد. لطفاً توافق‌نامه را بپذیرید.');
      return false;
    }

    try {
      localStorage.clear();
      // حفظ وضعیت پذیرش توافق‌نامه
      localStorage.setItem('userAgreementAccepted', 'true');
      return true;
    } catch (e) {
      console.error('خطا در پاک کردن داده‌ها:', e);
      this.checkAccess(); // بررسی مجدد دسترسی
      return false;
    }
  }

  // بررسی مجدد دسترسی و بروزرسانی وضعیت
  public refreshAccess(): boolean {
    this.checkAccess();
    return this.hasAccess;
  }

  // ثبت پذیرش توافق‌نامه
  public acceptUserAgreement(): boolean {
    try {
      localStorage.setItem('userAgreementAccepted', 'true');
      this.hasAccess = true;
      return true;
    } catch (e) {
      console.error('خطا در ثبت پذیرش توافق‌نامه:', e);
      return false;
    }
  }

  // بررسی وضعیت پذیرش توافق‌نامه
  public hasAcceptedAgreement(): boolean {
    try {
      return localStorage.getItem('userAgreementAccepted') === 'true';
    } catch (e) {
      return false;
    }
  }
}

// صادر کردن نمونه منحصر به فرد از سرویس برای استفاده در برنامه
export const storageService = StorageService.getInstance(); 