"use client";

// سرویس آنالیتیکس غیرفعال شده است

/**
 * تعریف اینترفیس برای NetworkInformation
 */
interface NetworkInformation {
  type?: string;
  effectiveType?: string;
}

/**
 * گسترش تایپ Navigator برای اضافه کردن connection
 */
declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
}

/**
 * سرویس آنالیتیکس برای ردیابی و جمع‌آوری اطلاعات کاربران
 * این سرویس در حال حاضر غیرفعال است
 */
export class AnalyticsService {
  private static instance: AnalyticsService;

  // استفاده از الگوی Singleton
  private constructor() {}

  // دریافت نمونه منحصر به فرد از سرویس
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // متدهای غیرفعال شده
  public trackPageView(pageName: string): void {}
  public trackEvent(eventName: string, eventData?: Record<string, any>): void {}
}

// صادر کردن نمونه از پیش ساخته شده
export const analyticsService = AnalyticsService.getInstance(); 