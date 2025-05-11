"use client";

import { storageService } from '../src/services/storageService';

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
 */
export class AnalyticsService {
  private static instance: AnalyticsService;
  private isClient: boolean = false;
  private readonly EMAIL_ENDPOINT = '/api/send-analytics';
  private sessionId: string = '';

  // استفاده از الگوی Singleton
  private constructor() {
    this.isClient = typeof window !== 'undefined';
    this.sessionId = this.generateSessionId();
  }

  // دریافت نمونه منحصر به فرد از سرویس
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // ایجاد شناسه منحصر به فرد جلسه
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // جمع‌آوری اطلاعات دستگاه کاربر
  private collectDeviceInfo(): Record<string, any> {
    if (!this.isClient) {
      return {};
    }

    try {
      const userAgent = window.navigator.userAgent;
      const platform = window.navigator.platform;
      const language = window.navigator.language;
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const colorDepth = window.screen.colorDepth;
      const pixelRatio = window.devicePixelRatio || 1;
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const dateTime = new Date().toISOString();
      
      // تلاش برای تشخیص نوع دستگاه
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent.toLowerCase());
      const isDesktop = !isMobile && !isTablet;
      
      // تشخیص سیستم عامل
      let os = "نامشخص";
      if (/Windows/.test(userAgent)) os = "Windows";
      else if (/Mac/.test(userAgent)) os = "MacOS";
      else if (/Linux/.test(userAgent)) os = "Linux";
      else if (/Android/.test(userAgent)) os = "Android";
      else if (/iOS|iPhone|iPad|iPod/.test(userAgent)) os = "iOS";
      
      // تشخیص مرورگر
      let browser = "نامشخص";
      if (/Edge/.test(userAgent)) browser = "Edge";
      else if (/Chrome/.test(userAgent)) browser = "Chrome";
      else if (/Firefox/.test(userAgent)) browser = "Firefox";
      else if (/Safari/.test(userAgent)) browser = "Safari";
      else if (/MSIE|Trident/.test(userAgent)) browser = "Internet Explorer";
      else if (/Opera|OPR/.test(userAgent)) browser = "Opera";
      
      // اطلاعات شبکه (اگر در دسترس باشد)
      let connectionType = "نامشخص";
      let effectiveType = "نامشخص";
      
      if (navigator.connection) {
        connectionType = navigator.connection.type || "نامشخص";
        effectiveType = navigator.connection.effectiveType || "نامشخص";
      }
      
      // دریافت مسیر فعلی
      const currentPath = window.location.pathname;
      const referrer = document.referrer;
      const uniqueId = this.getOrCreateUniqueId();
      
      return {
        sessionId: this.sessionId,
        uniqueId,
        userAgent,
        platform,
        language,
        screenWidth,
        screenHeight,
        colorDepth,
        pixelRatio,
        timeZone,
        dateTime,
        deviceType: isMobile ? "موبایل" : isTablet ? "تبلت" : "دسکتاپ",
        os,
        browser,
        connectionType,
        effectiveType,
        currentPath,
        referrer
      };
    } catch (error) {
      console.error('خطا در جمع‌آوری اطلاعات دستگاه:', error);
      return {
        error: 'خطا در جمع‌آوری اطلاعات',
        dateTime: new Date().toISOString()
      };
    }
  }

  // ایجاد یا دریافت شناسه منحصر به فرد برای کاربر
  private getOrCreateUniqueId(): string {
    if (!this.isClient) {
      return '';
    }

    try {
      let uniqueId = storageService.getItem('analytics_unique_id');
      
      if (!uniqueId) {
        uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        storageService.setItem('analytics_unique_id', uniqueId);
      }
      
      return uniqueId;
    } catch (error) {
      console.error('خطا در ایجاد شناسه منحصر به فرد:', error);
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
  }

  // ارسال اطلاعات به سرور
  private async sendAnalyticsData(data: Record<string, any>): Promise<void> {
    if (!this.isClient) {
      return;
    }

    try {
      const response = await fetch(this.EMAIL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'soroush.qe.78@gmail.com',
          subject: `بازدید جدید از برنامه‌ساز - ${data.deviceType} - ${data.os}`,
          data
        }),
      });
      
      if (!response.ok) {
        throw new Error(`خطا در ارسال داده‌های آنالیتیکس: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('داده‌های آنالیتیکس با موفقیت ارسال شد:', result);
    } catch (error) {
      console.error('خطا در ارسال داده‌های آنالیتیکس:', error);
    }
  }

  // ثبت بازدید کاربر از صفحه
  public trackPageView(pageName: string): void {
    if (!this.isClient) {
      return;
    }

    try {
      const deviceInfo = this.collectDeviceInfo();
      
      const analyticsData = {
        ...deviceInfo,
        eventType: 'page_view',
        pageName,
        timestamp: new Date().toISOString()
      };
      
      // ارسال اطلاعات به سرور
      this.sendAnalyticsData(analyticsData);
      
      // ثبت در localStorage برای آمار داخلی
      this.savePageViewLocally(analyticsData);
      
    } catch (error) {
      console.error('خطا در ردیابی بازدید صفحه:', error);
    }
  }

  // ذخیره بازدید در localStorage
  private savePageViewLocally(data: Record<string, any>): void {
    if (!this.isClient) {
      return;
    }

    try {
      const pageViews = this.getLocalPageViews();
      
      // افزودن بازدید جدید
      pageViews.push({
        sessionId: data.sessionId,
        uniqueId: data.uniqueId,
        pageName: data.pageName,
        deviceType: data.deviceType,
        os: data.os,
        browser: data.browser,
        timestamp: data.timestamp
      });
      
      // حفظ فقط 50 بازدید آخر
      if (pageViews.length > 50) {
        pageViews.shift();
      }
      
      storageService.setItem('analytics_page_views', JSON.stringify(pageViews));
    } catch (error) {
      console.error('خطا در ذخیره بازدید صفحه:', error);
    }
  }

  // دریافت بازدیدهای ذخیره شده در localStorage
  private getLocalPageViews(): Array<Record<string, any>> {
    if (!this.isClient) {
      return [];
    }

    try {
      const data = storageService.getItem('analytics_page_views');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('خطا در بازیابی بازدیدهای صفحه:', error);
      return [];
    }
  }

  // ثبت اقدام کاربر (مانند کلیک روی دکمه)
  public trackEvent(eventName: string, eventData?: Record<string, any>): void {
    if (!this.isClient) {
      return;
    }

    try {
      const deviceInfo = this.collectDeviceInfo();
      
      const analyticsData = {
        ...deviceInfo,
        eventType: 'custom_event',
        eventName,
        eventData: eventData || {},
        timestamp: new Date().toISOString()
      };
      
      // ارسال اطلاعات به سرور
      this.sendAnalyticsData(analyticsData);
      
    } catch (error) {
      console.error('خطا در ردیابی رویداد:', error);
    }
  }
}

// صادر کردن نمونه از پیش ساخته شده
export const analyticsService = AnalyticsService.getInstance(); 