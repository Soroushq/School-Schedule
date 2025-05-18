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
  private isClient: boolean = false;

  // استفاده از الگوی Singleton
  private constructor() {
    // بررسی اینکه آیا کد در محیط کلاینت (مرورگر) اجرا می‌شود یا سرور
    this.isClient = typeof window !== 'undefined';
    // فقط در صورتی که در محیط کلاینت باشیم، دسترسی به localStorage را بررسی می‌کنیم
    if (this.isClient) {
      this.checkAccess();
    }
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
    if (!this.isClient) {
      // در محیط سرور، دسترسی به localStorage نداریم
      this.hasAccess = false;
      return;
    }

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
      // در صورت بروز خطا، دسترسی نداریم - ولی خطا را در سرور لاگ نمی‌کنیم
      if (this.isClient) {
        console.error('دسترسی به localStorage ممکن نیست:', e);
      }
      this.hasAccess = false;
    }
  }

  // دریافت وضعیت دسترسی
  public getAccessStatus(): boolean {
    return this.hasAccess;
  }

  // ذخیره‌سازی داده در localStorage با مدیریت خطا
  public setItem(key: string, value: string): boolean {
    if (!this.isClient) {
      // در محیط سرور اعلام می‌کنیم که عملیات انجام نشده
      return false;
    }

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
    if (!this.isClient) {
      // در محیط سرور، null برمی‌گردانیم
      return null;
    }

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
    if (!this.isClient) {
      // در محیط سرور اعلام می‌کنیم که عملیات انجام نشده
      return false;
    }

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
    if (!this.isClient) {
      // در محیط سرور، یک آرایه خالی برمی‌گردانیم
      return [];
    }

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
    if (!this.isClient) {
      // در محیط سرور اعلام می‌کنیم که عملیات انجام نشده
      return false;
    }

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
    if (this.isClient) {
      this.checkAccess();
    }
    return this.hasAccess;
  }

  // ثبت پذیرش توافق‌نامه
  public acceptUserAgreement(): boolean {
    if (!this.isClient) {
      return false;
    }

    try {
      localStorage.setItem('userAgreementAccepted', 'true');
      localStorage.setItem('privacy_agreement_accepted', 'true');
      this.hasAccess = true;
      return true;
    } catch (e) {
      console.error('خطا در ثبت پذیرش توافق‌نامه:', e);
      return false;
    }
  }

  // بررسی وضعیت پذیرش توافق‌نامه
  public hasAcceptedAgreement(): boolean {
    if (!this.isClient) {
      return false;
    }

    try {
      const hasUserAgreement = localStorage.getItem('userAgreementAccepted') === 'true';
      const hasPrivacyAgreement = localStorage.getItem('privacy_agreement_accepted') === 'true';
      return hasUserAgreement && hasPrivacyAgreement;
    } catch (_e) {
      return false;
    }
  }
}

// صادر کردن نمونه منحصر به فرد از سرویس برای استفاده در برنامه
export const storageService = StorageService.getInstance(); 