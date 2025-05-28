"use client";

import { Personnel, Schedule, SavedPersonnelSchedule, SavedClassSchedule } from './scheduleSync';

// تنظیمات API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// کلاس سرویس API
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // متد کمکی برای ارسال درخواست
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // === API های مربوط به پرسنل ===

  // دریافت تمام پرسنل
  async getAllPersonnel(): Promise<Personnel[]> {
    return this.request<Personnel[]>('/personnel');
  }

  // دریافت پرسنل با ID
  async getPersonnelById(personnelId: string): Promise<Personnel> {
    return this.request<Personnel>(`/personnel/${personnelId}`);
  }

  // دریافت پرسنل با کد پرسنلی
  async getPersonnelByCode(personnelCode: string): Promise<Personnel> {
    return this.request<Personnel>(`/personnel/by-code/${personnelCode}`);
  }

  // ایجاد پرسنل جدید
  async createPersonnel(personnel: Omit<Personnel, 'id'>): Promise<Personnel> {
    return this.request<Personnel>('/personnel', {
      method: 'POST',
      body: JSON.stringify(personnel),
    });
  }

  // به‌روزرسانی پرسنل
  async updatePersonnel(personnelId: string, personnel: Partial<Personnel>): Promise<Personnel> {
    return this.request<Personnel>(`/personnel/${personnelId}`, {
      method: 'PUT',
      body: JSON.stringify(personnel),
    });
  }

  // === API های مربوط به برنامه‌های پرسنلی ===

  // دریافت برنامه‌های پرسنل با ID
  async getPersonnelSchedules(personnelId: string): Promise<SavedPersonnelSchedule> {
    return this.request<SavedPersonnelSchedule>(`/personnel/${personnelId}/schedules`);
  }

  // دریافت برنامه‌های پرسنل با کد پرسنلی
  async getPersonnelSchedulesByCode(personnelCode: string): Promise<SavedPersonnelSchedule> {
    return this.request<SavedPersonnelSchedule>(`/personnel/by-code/${personnelCode}/schedules`);
  }

  // ذخیره برنامه‌های پرسنل
  async savePersonnelSchedules(
    personnelId: string, 
    schedules: Schedule[]
  ): Promise<{ message: string; personnel: Personnel; timestamp: number }> {
    return this.request(`/personnel/${personnelId}/schedules`, {
      method: 'POST',
      body: JSON.stringify({ schedules }),
    });
  }

  // === API های مربوط به برنامه‌های کلاسی ===

  // دریافت تمام برنامه‌های کلاسی
  async getAllClassSchedules(): Promise<SavedClassSchedule[]> {
    return this.request<SavedClassSchedule[]>('/class-schedules');
  }

  // دریافت برنامه کلاس خاص
  async getClassSchedule(
    grade: string, 
    classNumber: string, 
    field: string
  ): Promise<SavedClassSchedule> {
    return this.request<SavedClassSchedule>(`/class-schedules/${grade}/${classNumber}/${field}`);
  }

  // ذخیره برنامه کلاسی
  async saveClassSchedule(
    grade: string, 
    classNumber: string, 
    field: string, 
    data: any = {}
  ): Promise<{ message: string; classSchedule: SavedClassSchedule }> {
    return this.request(`/class-schedules/${grade}/${classNumber}/${field}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // === API های مربوط به برنامه‌ها ===

  // حذف برنامه
  async deleteSchedule(scheduleId: string): Promise<{ message: string }> {
    return this.request(`/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
  }

  // به‌روزرسانی برنامه
  async updateSchedule(scheduleId: string, schedule: Partial<Schedule>): Promise<Schedule> {
    return this.request<Schedule>(`/schedules/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify(schedule),
    });
  }

  // === API های کمکی ===

  // حذف تمام برنامه‌ها
  async clearAllSchedules(): Promise<{ message: string }> {
    return this.request('/clear-all', {
      method: 'DELETE',
    });
  }

  // بررسی سلامت سرور
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }
}

// صادر کردن نمونه منحصر به فرد از سرویس
export const apiService = new ApiService();
export default apiService; 