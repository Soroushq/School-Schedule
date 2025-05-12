"use client";

import { Schedule, SavedPersonnelSchedule, ClassSchedule, Personnel } from '../types/scheduleTypes';

/**
 * کلاس کمکی برای ذخیره و بازیابی داده‌ها از localStorage
 */
class StorageHelpers {
  // کلیدهای ذخیره‌سازی
  private static PERSONNEL_KEY = 'personnel_data';
  private static PERSONNEL_SCHEDULE_KEY = 'personnel_schedules';
  private static CLASS_SCHEDULE_KEY = 'class_schedules';

  // ذخیره لیست پرسنل
  static savePersonnelList(personnelList: Personnel[]): void {
    localStorage.setItem(this.PERSONNEL_KEY, JSON.stringify(personnelList));
  }

  // بازیابی لیست پرسنل
  static getPersonnelList(): Personnel[] {
    const data = localStorage.getItem(this.PERSONNEL_KEY);
    return data ? JSON.parse(data) : [];
  }

  // ذخیره برنامه پرسنلی
  static savePersonnelSchedule(schedule: SavedPersonnelSchedule): void {
    const schedules = this.getAllPersonnelSchedules();
    const index = schedules.findIndex(s => s.personnelCode === schedule.personnelCode);
    
    if (index >= 0) {
      schedules[index] = schedule;
    } else {
      schedules.push(schedule);
    }
    
    localStorage.setItem(this.PERSONNEL_SCHEDULE_KEY, JSON.stringify(schedules));
  }

  // بازیابی برنامه پرسنلی با کد پرسنلی
  static getPersonnelScheduleByCode(personnelCode: string): SavedPersonnelSchedule | null {
    const schedules = this.getAllPersonnelSchedules();
    return schedules.find(s => s.personnelCode === personnelCode) || null;
  }

  // بازیابی برنامه پرسنلی با آیدی
  static getPersonnelSchedule(personnelId: string): SavedPersonnelSchedule | null {
    const schedules = this.getAllPersonnelSchedules();
    return schedules.find(s => s.id === personnelId) || null;
  }

  // بازیابی همه برنامه‌های پرسنلی
  static getAllPersonnelSchedules(): SavedPersonnelSchedule[] {
    const data = localStorage.getItem(this.PERSONNEL_SCHEDULE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // ذخیره برنامه کلاسی
  static saveClassSchedule(schedule: ClassSchedule): void {
    const schedules = this.getAllClassSchedules();
    const key = `${schedule.grade}-${schedule.classNumber}-${schedule.field}`;
    const index = schedules.findIndex(s => 
      s.grade === schedule.grade && 
      s.classNumber === schedule.classNumber && 
      s.field === schedule.field
    );
    
    if (index >= 0) {
      schedules[index] = schedule;
    } else {
      schedules.push(schedule);
    }
    
    localStorage.setItem(this.CLASS_SCHEDULE_KEY, JSON.stringify(schedules));
  }

  // بازیابی برنامه کلاسی
  static getClassSchedule(grade: string, classNumber: string, field: string): ClassSchedule | null {
    const schedules = this.getAllClassSchedules();
    return schedules.find(s => 
      s.grade === grade && 
      s.classNumber === classNumber && 
      s.field === field
    ) || null;
  }

  // بازیابی همه برنامه‌های کلاسی
  static getAllClassSchedules(): ClassSchedule[] {
    const data = localStorage.getItem(this.CLASS_SCHEDULE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // به‌روزرسانی برنامه پرسنلی از برنامه کلاسی
  static updatePersonnelScheduleFromClass(schedule: Schedule): void {
    if (!schedule.personnelCode) return;
    
    const personnelSchedule = this.getPersonnelScheduleByCode(schedule.personnelCode);
    
    if (personnelSchedule) {
      // حذف برنامه قبلی با همان آیدی (اگر وجود داشته باشد)
      const schedules = personnelSchedule.schedules.filter(s => s.id !== schedule.id);
      
      // افزودن برنامه جدید
      schedules.push({
        ...schedule,
        source: 'class'
      });
      
      // ذخیره برنامه به‌روزرسانی شده
      this.savePersonnelSchedule({
        ...personnelSchedule,
        schedules,
        timestamp: Date.now()
      });
    } else {
      // پیدا کردن اطلاعات پرسنل
      const personnelList = this.getPersonnelList();
      const personnel = personnelList.find(p => p.personnelCode === schedule.personnelCode);
      
      if (personnel) {
        // ایجاد برنامه پرسنلی جدید
        this.savePersonnelSchedule({
          id: personnel.id,
          personnelCode: personnel.personnelCode,
          fullName: personnel.fullName,
          mainPosition: personnel.mainPosition,
          employmentStatus: personnel.employmentStatus,
          schedules: [{
            ...schedule,
            source: 'class'
          }],
          timestamp: Date.now()
        });
      }
    }
  }

  // به‌روزرسانی برنامه کلاسی از برنامه پرسنلی
  static updateClassScheduleFromPersonnel(schedule: Schedule): void {
    if (!schedule.grade || !schedule.classNumber || !schedule.field) return;
    
    const classSchedule = this.getClassSchedule(schedule.grade, schedule.classNumber, schedule.field);
    
    if (classSchedule) {
      // حذف برنامه قبلی با همان آیدی (اگر وجود داشته باشد)
      const schedules = classSchedule.schedules.filter(s => s.id !== schedule.id);
      
      // افزودن برنامه جدید
      schedules.push({
        ...schedule,
        source: 'personnel'
      });
      
      // ذخیره برنامه به‌روزرسانی شده
      this.saveClassSchedule({
        ...classSchedule,
        schedules,
        timestamp: Date.now()
      });
    } else {
      // ایجاد برنامه کلاسی جدید
      this.saveClassSchedule({
        id: Date.now().toString(),
        grade: schedule.grade,
        classNumber: schedule.classNumber,
        field: schedule.field,
        schedules: [{
          ...schedule,
          source: 'personnel'
        }],
        timestamp: Date.now()
      });
    }
  }
}

/**
 * مدیریت داده‌های برنامه‌ریزی
 * این کلاس مسئول مدیریت ذخیره و بازیابی داده‌های برنامه‌ریزی است
 */
export const ScheduleDataManager = {
  // === توابع مرتبط با پرسنل ===
  
  // ذخیره لیست پرسنل
  savePersonnelList: (personnelList: Personnel[]): void => {
    StorageHelpers.savePersonnelList(personnelList);
  },
  
  // بارگذاری لیست پرسنل
  loadPersonnelList: (): Personnel[] => {
    return StorageHelpers.getPersonnelList();
  },
  
  // افزودن پرسنل جدید
  addPersonnel: (personnel: Omit<Personnel, 'id'>): Personnel => {
    const id = Date.now().toString();
    const newPersonnel: Personnel = {
      ...personnel,
      id,
      timestamp: Date.now()
    };
    
    const personnelList = StorageHelpers.getPersonnelList();
    personnelList.push(newPersonnel);
    StorageHelpers.savePersonnelList(personnelList);
    
    return newPersonnel;
  },
  
  // جستجوی پرسنل با کد پرسنلی
  findPersonnelByCode: (personnelCode: string): Personnel | null => {
    const personnelList = StorageHelpers.getPersonnelList();
    return personnelList.find(p => p.personnelCode === personnelCode) || null;
  },
  
  // جستجوی پرسنل با نام
  searchPersonnelByName: (query: string): Personnel[] => {
    if (!query) return [];
    
    const personnelList = StorageHelpers.getPersonnelList();
    return personnelList.filter(p => 
      p.fullName.includes(query) || 
      p.personnelCode.includes(query)
    );
  },
  
  // ذخیره برنامه پرسنلی
  savePersonnelSchedule: (personnelCode: string, fullName: string, mainPosition: string, employmentStatus: string, schedules: Schedule[]): void => {
    const personnelId = StorageHelpers.getPersonnelScheduleByCode(personnelCode)?.id || Date.now().toString();
    
    const personnelSchedule: SavedPersonnelSchedule = {
      id: personnelId,
      personnelCode,
      fullName,
      mainPosition,
      employmentStatus,
      schedules: schedules.map(schedule => {
        // اطمینان از وجود تمام فیلدهای لازم
        const updatedSchedule: Schedule = {
          ...schedule,
          personnelCode,
          timestamp: Date.now()
        };
        
        // به‌روزرسانی برنامه کلاسی مرتبط
        if (schedule.grade && schedule.classNumber && schedule.field) {
          StorageHelpers.updateClassScheduleFromPersonnel(updatedSchedule);
        }
        
        return updatedSchedule;
      }),
      timestamp: Date.now()
    };
    
    StorageHelpers.savePersonnelSchedule(personnelSchedule);
  },
  
  // بارگذاری برنامه پرسنلی
  loadPersonnelSchedule: (personnelCode: string): Schedule[] => {
    const savedSchedule = StorageHelpers.getPersonnelScheduleByCode(personnelCode);
    return savedSchedule ? savedSchedule.schedules : [];
  },
  
  // بارگذاری همه برنامه‌های پرسنلی
  loadAllPersonnelSchedules: (): SavedPersonnelSchedule[] => {
    return StorageHelpers.getAllPersonnelSchedules();
  },
  
  // حذف برنامه از برنامه پرسنلی
  removeFromPersonnelSchedule: (personnelCode: string, scheduleId: string): void => {
    const savedSchedule = StorageHelpers.getPersonnelScheduleByCode(personnelCode);
    
    if (savedSchedule) {
      // حذف برنامه از لیست
      savedSchedule.schedules = savedSchedule.schedules.filter(s => s.id !== scheduleId);
      savedSchedule.timestamp = Date.now();
      
      // ذخیره تغییرات
      StorageHelpers.savePersonnelSchedule(savedSchedule);
    }
  },
  
  // === توابع مرتبط با برنامه کلاسی ===
  
  // ذخیره برنامه کلاسی
  saveClassSchedule: (grade: string, classNumber: string, field: string, schedules: Schedule[]): void => {
    const classSchedule: ClassSchedule = {
      id: Date.now().toString(),
      grade,
      classNumber,
      field,
      schedules: schedules.map(schedule => {
        // ایجاد شناسه کلاس
        const classScheduleId = `${grade}-${classNumber}-${field}`;
        
        // اطمینان از وجود تمام فیلدهای لازم
        const updatedSchedule: Schedule = {
          ...schedule,
          grade,
          classNumber,
          field,
          classScheduleId,
          timestamp: Date.now()
        };
        
        // به‌روزرسانی برنامه‌های پرسنلی مرتبط
        if (schedule.personnelCode) {
          StorageHelpers.updatePersonnelScheduleFromClass(updatedSchedule);
        }
        
        return updatedSchedule;
      }),
      timestamp: Date.now()
    };
    
    StorageHelpers.saveClassSchedule(classSchedule);
  },
  
  // بارگذاری برنامه کلاسی
  loadClassSchedule: (grade: string, classNumber: string, field: string): Schedule[] => {
    const savedSchedule = StorageHelpers.getClassSchedule(grade, classNumber, field);
    return savedSchedule ? savedSchedule.schedules : [];
  },
  
  // بارگذاری همه برنامه‌های کلاسی
  loadAllClassSchedules: (): ClassSchedule[] => {
    return StorageHelpers.getAllClassSchedules();
  },
  
  // حذف برنامه از برنامه کلاسی
  removeFromClassSchedule: (grade: string, classNumber: string, field: string, scheduleId: string): void => {
    const savedSchedule = StorageHelpers.getClassSchedule(grade, classNumber, field);
    
    if (savedSchedule) {
      // حذف برنامه از لیست
      savedSchedule.schedules = savedSchedule.schedules.filter(s => s.id !== scheduleId);
      savedSchedule.timestamp = Date.now();
      
      // ذخیره تغییرات
      StorageHelpers.saveClassSchedule(savedSchedule);
    }
  },
  
  // === توابع کمکی ===
  
  // ایجاد آیدی جدید
  generateId: (): string => {
    return Date.now().toString();
  },
  
  // بررسی وجود تداخل در برنامه کلاسی
  hasClassConflict: (grade: string, classNumber: string, field: string, day: string, timeStart: string): boolean => {
    const classSchedule = StorageHelpers.getClassSchedule(grade, classNumber, field);
    if (!classSchedule) return false;
    
    return classSchedule.schedules.some(s => s.day === day && s.timeStart === timeStart);
  },
  
  // بررسی وجود تداخل در برنامه پرسنلی
  hasPersonnelConflict: (personnelCode: string, day: string, timeStart: string): boolean => {
    const personnelSchedule = StorageHelpers.getPersonnelScheduleByCode(personnelCode);
    if (!personnelSchedule) return false;
    
    return personnelSchedule.schedules.some(s => s.day === day && s.timeStart === timeStart);
  },
  
  // دریافت برنامه پرسنلی با آیدی
  getPersonnelSchedule: (personnelId: string): SavedPersonnelSchedule | null => {
    return StorageHelpers.getPersonnelSchedule(personnelId);
  }
}; 