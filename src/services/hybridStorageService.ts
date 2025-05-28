"use client";

import { Personnel, Schedule, SavedPersonnelSchedule, SavedClassSchedule } from './scheduleSync';
import { storageService } from './storageService';
import { apiService } from './apiService';

// تنظیمات سرویس ترکیبی
const USE_API = process.env.NEXT_PUBLIC_USE_API === 'true';

/**
 * سرویس ترکیبی که بین localStorage و API انتخاب می‌کند
 * بر اساس متغیر محیطی NEXT_PUBLIC_USE_API
 */
class HybridStorageService {
  private useApi: boolean;

  constructor() {
    // ابتدا از متغیر محیطی استفاده کن
    this.useApi = USE_API;
    
    // سپس بررسی کن که آیا کاربر تنظیمات خاصی ذخیره کرده
    if (typeof window !== 'undefined') {
      const savedSetting = localStorage.getItem('useApi');
      if (savedSetting !== null) {
        this.useApi = savedSetting === 'true';
      }
    }
  }

  // تغییر حالت بین API و localStorage
  setUseApi(useApi: boolean): void {
    this.useApi = useApi;
  }

  // بررسی اینکه آیا از API استفاده می‌کنیم یا نه
  isUsingApi(): boolean {
    return this.useApi;
  }

  // === متدهای مربوط به پرسنل ===

  async getAllPersonnel(): Promise<Personnel[]> {
    if (this.useApi) {
      try {
        return await apiService.getAllPersonnel();
      } catch (error) {
        console.error('خطا در دریافت پرسنل از API، استفاده از localStorage:', error);
        return this.getPersonnelFromLocalStorage();
      }
    }
    return this.getPersonnelFromLocalStorage();
  }

  async getPersonnelByCode(personnelCode: string): Promise<Personnel | null> {
    if (this.useApi) {
      try {
        return await apiService.getPersonnelByCode(personnelCode);
      } catch (error) {
        console.error('خطا در دریافت پرسنل از API، استفاده از localStorage:', error);
        return this.getPersonnelByCodeFromLocalStorage(personnelCode);
      }
    }
    return this.getPersonnelByCodeFromLocalStorage(personnelCode);
  }

  async createPersonnel(personnel: Omit<Personnel, 'id'>): Promise<Personnel> {
    if (this.useApi) {
      try {
        const result = await apiService.createPersonnel(personnel);
        // همگام‌سازی با localStorage
        this.savePersonnelToLocalStorage(result);
        return result;
      } catch (error) {
        console.error('خطا در ایجاد پرسنل در API، استفاده از localStorage:', error);
        return this.createPersonnelInLocalStorage(personnel);
      }
    }
    return this.createPersonnelInLocalStorage(personnel);
  }

  // === متدهای مربوط به برنامه‌های پرسنلی ===

  async getPersonnelSchedulesByCode(personnelCode: string): Promise<SavedPersonnelSchedule | null> {
    if (this.useApi) {
      try {
        return await apiService.getPersonnelSchedulesByCode(personnelCode);
      } catch (error) {
        console.error('خطا در دریافت برنامه پرسنلی از API، استفاده از localStorage:', error);
        return this.getPersonnelSchedulesByCodeFromLocalStorage(personnelCode);
      }
    }
    return this.getPersonnelSchedulesByCodeFromLocalStorage(personnelCode);
  }

  async savePersonnelSchedule(personnel: Personnel, schedules: Schedule[]): Promise<void> {
    if (this.useApi) {
      try {
        await apiService.savePersonnelSchedules(personnel.id, schedules);
        // همگام‌سازی با localStorage
        this.savePersonnelScheduleToLocalStorage(personnel, schedules);
      } catch (error) {
        console.error('خطا در ذخیره برنامه پرسنلی در API، استفاده از localStorage:', error);
        this.savePersonnelScheduleToLocalStorage(personnel, schedules);
      }
    } else {
      this.savePersonnelScheduleToLocalStorage(personnel, schedules);
    }
  }

  async getAllPersonnelSchedules(): Promise<SavedPersonnelSchedule[]> {
    if (this.useApi) {
      try {
        // در API، باید تمام پرسنل را دریافت کرده و برنامه‌هایشان را بگیریم
        const personnel = await apiService.getAllPersonnel();
        const schedules: SavedPersonnelSchedule[] = [];
        
        for (const person of personnel) {
          try {
            const schedule = await apiService.getPersonnelSchedules(person.id);
            schedules.push(schedule);
          } catch (error) {
            console.error(`خطا در دریافت برنامه پرسنل ${person.personnelCode}:`, error);
          }
        }
        
        return schedules;
      } catch (error) {
        console.error('خطا در دریافت برنامه‌های پرسنلی از API، استفاده از localStorage:', error);
        return this.getAllPersonnelSchedulesFromLocalStorage();
      }
    }
    return this.getAllPersonnelSchedulesFromLocalStorage();
  }

  // === متدهای مربوط به برنامه‌های کلاسی ===

  async getClassSchedule(grade: string, classNumber: string, field: string): Promise<SavedClassSchedule | null> {
    if (this.useApi) {
      try {
        return await apiService.getClassSchedule(grade, classNumber, field);
      } catch (error) {
        console.error('خطا در دریافت برنامه کلاسی از API، استفاده از localStorage:', error);
        return this.getClassScheduleFromLocalStorage(grade, classNumber, field);
      }
    }
    return this.getClassScheduleFromLocalStorage(grade, classNumber, field);
  }

  async getAllClassSchedules(): Promise<SavedClassSchedule[]> {
    if (this.useApi) {
      try {
        return await apiService.getAllClassSchedules();
      } catch (error) {
        console.error('خطا در دریافت برنامه‌های کلاسی از API، استفاده از localStorage:', error);
        return this.getAllClassSchedulesFromLocalStorage();
      }
    }
    return this.getAllClassSchedulesFromLocalStorage();
  }

  async saveClassSchedule(grade: string, classNumber: string, field: string, schedules: Schedule[]): Promise<void> {
    if (this.useApi) {
      try {
        await apiService.saveClassSchedule(grade, classNumber, field, { schedules });
        // همگام‌سازی با localStorage
        this.saveClassScheduleToLocalStorage(grade, classNumber, field, schedules);
      } catch (error) {
        console.error('خطا در ذخیره برنامه کلاسی در API، استفاده از localStorage:', error);
        this.saveClassScheduleToLocalStorage(grade, classNumber, field, schedules);
      }
    } else {
      this.saveClassScheduleToLocalStorage(grade, classNumber, field, schedules);
    }
  }

  // === متدهای کمکی ===

  async clearAllSchedules(): Promise<void> {
    if (this.useApi) {
      try {
        await apiService.clearAllSchedules();
      } catch (error) {
        console.error('خطا در پاک کردن برنامه‌ها از API:', error);
      }
    }
    // همیشه localStorage را هم پاک کن
    this.clearAllSchedulesFromLocalStorage();
  }

  // === متدهای localStorage ===

  private getPersonnelFromLocalStorage(): Personnel[] {
    const schedules = this.getAllPersonnelSchedulesFromLocalStorage();
    return schedules.map(s => s.personnel);
  }

  private getPersonnelByCodeFromLocalStorage(personnelCode: string): Personnel | null {
    const schedules = this.getAllPersonnelSchedulesFromLocalStorage();
    const found = schedules.find(s => s.personnel.personnelCode === personnelCode);
    return found ? found.personnel : null;
  }

  private createPersonnelInLocalStorage(personnel: Omit<Personnel, 'id'>): Personnel {
    const newPersonnel: Personnel = {
      ...personnel,
      id: Date.now().toString()
    };
    this.savePersonnelToLocalStorage(newPersonnel);
    return newPersonnel;
  }

  private savePersonnelToLocalStorage(personnel: Personnel): void {
    // ذخیره در قالب برنامه پرسنلی خالی
    const scheduleData: SavedPersonnelSchedule = {
      personnel,
      schedules: [],
      timestamp: Date.now()
    };
    const key = `personnel_schedule_${personnel.id}`;
    storageService.setItem(key, JSON.stringify(scheduleData));
  }

  private getPersonnelSchedulesByCodeFromLocalStorage(personnelCode: string): SavedPersonnelSchedule | null {
    const allKeys = storageService.getAllKeys();
    
    for (const key of allKeys) {
      if (key && key.startsWith('personnel_schedule_')) {
        const savedData = storageService.getItem(key);
        
        if (savedData) {
          try {
            const parsedData: SavedPersonnelSchedule = JSON.parse(savedData);
            if (parsedData.personnel.personnelCode === personnelCode) {
              return parsedData;
            }
          } catch (e) {
            console.error('خطا در تجزیه داده‌های ذخیره شده پرسنلی:', e);
          }
        }
      }
    }
    
    return null;
  }

  private savePersonnelScheduleToLocalStorage(personnel: Personnel, schedules: Schedule[]): void {
    const scheduleData: SavedPersonnelSchedule = {
      personnel,
      schedules,
      timestamp: Date.now()
    };
    const key = `personnel_schedule_${personnel.id}`;
    storageService.setItem(key, JSON.stringify(scheduleData));
  }

  private getAllPersonnelSchedulesFromLocalStorage(): SavedPersonnelSchedule[] {
    const schedules: SavedPersonnelSchedule[] = [];
    const allKeys = storageService.getAllKeys();
    
    for (const key of allKeys) {
      if (key && key.startsWith('personnel_schedule_')) {
        const savedData = storageService.getItem(key);
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            schedules.push(parsedData);
          } catch (e) {
            console.error('خطا در تجزیه داده‌های ذخیره شده پرسنلی:', e);
          }
        }
      }
    }
    
    return schedules.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  private getClassScheduleFromLocalStorage(grade: string, classNumber: string, field: string): SavedClassSchedule | null {
    const classKey = `${grade}-${classNumber}-${field}`;
    const storageKey = `class_schedule_${classKey}`;
    const data = storageService.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  }

  private getAllClassSchedulesFromLocalStorage(): SavedClassSchedule[] {
    const schedules: SavedClassSchedule[] = [];
    const allKeys = storageService.getAllKeys();
    
    for (const key of allKeys) {
      if (key && key.startsWith('class_schedule_')) {
        const savedData = storageService.getItem(key);
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            schedules.push(parsedData);
          } catch (e) {
            console.error('خطا در تجزیه داده‌های ذخیره شده کلاسی:', e);
          }
        }
      }
    }
    
    return schedules.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  private saveClassScheduleToLocalStorage(grade: string, classNumber: string, field: string, schedules: Schedule[]): void {
    const classSchedule: SavedClassSchedule = {
      id: Date.now().toString(),
      grade,
      classNumber,
      field,
      schedules,
      timestamp: Date.now()
    };
    
    const classKey = `${grade}-${classNumber}-${field}`;
    const storageKey = `class_schedule_${classKey}`;
    storageService.setItem(storageKey, JSON.stringify(classSchedule));
  }

  private clearAllSchedulesFromLocalStorage(): void {
    const allKeys = storageService.getAllKeys();
    
    for (const key of allKeys) {
      if (key && (key.startsWith('class_schedule_') || key.startsWith('personnel_schedule_'))) {
        storageService.removeItem(key);
      }
    }
  }
}

// صادر کردن نمونه منحصر به فرد از سرویس
export const hybridStorageService = new HybridStorageService();
export default hybridStorageService; 