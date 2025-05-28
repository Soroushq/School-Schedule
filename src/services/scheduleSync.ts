import { v4 as uuidv4 } from 'uuid';
import { storageService } from './storageService';
import { hybridStorageService } from './hybridStorageService';

// تعریف اینترفیس‌ها برای استفاده در کل برنامه
export interface Personnel {
  id: string;
  personnelCode: string;
  fullName: string;
  mainPosition: string;
  employmentStatus: string;
}

export interface Schedule {
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

export interface SavedPersonnelSchedule {
  personnel: Personnel;
  schedules: Schedule[];
  timestamp: number;
}

export interface SavedClassSchedule {
  id: string;
  grade: string;
  classNumber: string;
  field: string;
  schedules: Schedule[];
  timestamp: number;
}

// سرویس هماهنگی برنامه‌های کلاسی و پرسنلی
class ScheduleSyncService {
  // بارگذاری تمام برنامه‌های پرسنلی ذخیره شده
  async getAllPersonnelSchedules(): Promise<SavedPersonnelSchedule[]> {
    try {
      // بررسی اینکه آیا در محیط مرورگر هستیم
      if (typeof window === 'undefined') {
        return [];
      }

      return await hybridStorageService.getAllPersonnelSchedules();
    } catch (error) {
      console.error('خطا در بارگیری برنامه‌های پرسنلی:', error);
      return [];
    }
  }

  // بارگذاری تمام برنامه‌های کلاسی ذخیره شده
  async getAllClassSchedules(): Promise<SavedClassSchedule[]> {
    try {
      // بررسی اینکه آیا در محیط مرورگر هستیم
      if (typeof window === 'undefined') {
        return [];
      }

      return await hybridStorageService.getAllClassSchedules();
    } catch (error) {
      console.error('خطا در بارگیری برنامه‌های کلاسی:', error);
      return [];
    }
  }

  // بارگذاری برنامه پرسنلی با ID مشخص
  async getPersonnelScheduleById(personnelId: string): Promise<SavedPersonnelSchedule | null> {
    try {
      // بررسی اینکه آیا در محیط مرورگر هستیم
      if (typeof window === 'undefined') {
        return null;
      }

      // در حال حاضر hybridStorageService این متد را ندارد، پس از localStorage استفاده می‌کنیم
      const key = `personnel_schedule_${personnelId}`;
      const savedData = storageService.getItem(key);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // اطمینان از یکپارچگی داده‌ها با برنامه‌های کلاسی
        parsedData.schedules = await this.enrichPersonnelSchedules(parsedData.schedules, parsedData.personnel);
        return parsedData;
      }
      
      return null;
    } catch (error) {
      console.error('خطا در بارگیری برنامه پرسنلی:', error);
      return null;
    }
  }

  // غنی‌سازی برنامه‌های پرسنلی با اطلاعات مشابه از برنامه‌های کلاسی
  private async enrichPersonnelSchedules(schedules: Schedule[], personnel: Personnel): Promise<Schedule[]> {
    try {
      // بررسی اینکه آیا در محیط مرورگر هستیم
      if (typeof window === 'undefined') {
        return schedules;
      }

      // بررسی وجود تکراری‌ها و حذف آنها
      const uniqueSchedules = new Map<string, Schedule>();
      
      // ابتدا همه برنامه‌های کلاسی مرتبط را بیابیم
      const classSchedules = await this.getAllClassSchedules();
      const allClassSchedules: Schedule[] = [];
      
      classSchedules.forEach(cs => {
        const matchingSchedules = cs.schedules.filter(s => 
          s.personnelCode === personnel.personnelCode
        );
        
        allClassSchedules.push(...matchingSchedules);
      });
      
      // اضافه کردن برنامه‌های کلاسی مرتبط
      allClassSchedules.forEach(s => {
        const key = `${s.day}-${s.timeStart}-${s.grade}-${s.classNumber}-${s.field}`;
        if (!uniqueSchedules.has(key)) {
          uniqueSchedules.set(key, {
            ...s,
            source: 'class'
          });
        }
      });
      
      // اضافه کردن برنامه‌های پرسنلی (اولویت بالاتر)
      schedules.forEach(s => {
        const key = `${s.day}-${s.timeStart}-${s.grade}-${s.classNumber}-${s.field}`;
        uniqueSchedules.set(key, {
          ...s,
          personnelCode: personnel.personnelCode,
          fullName: personnel.fullName,
          mainPosition: s.mainPosition || personnel.mainPosition,
          employmentStatus: s.employmentStatus || personnel.employmentStatus,
          source: s.source || 'personnel'
        });
      });
      
      return Array.from(uniqueSchedules.values());
    } catch (error) {
      console.error('خطا در غنی‌سازی برنامه‌های پرسنلی:', error);
      return schedules;
    }
  }

  // بارگذاری برنامه کلاسی با مشخصات کلاس
  async getClassSchedule(grade: string, classNumber: string, field: string): Promise<SavedClassSchedule | null> {
    try {
      // بررسی اینکه آیا در محیط مرورگر هستیم
      if (typeof window === 'undefined') {
        return null;
      }

      return await hybridStorageService.getClassSchedule(grade, classNumber, field);
    } catch (error) {
      console.error('خطا در بارگیری برنامه کلاسی:', error);
      return null;
    }
  }

  // ذخیره برنامه پرسنلی و بروزرسانی برنامه‌های کلاسی مرتبط
  async savePersonnelSchedule(personnelSchedule: SavedPersonnelSchedule): Promise<void> {
    try {
      // ذخیره برنامه پرسنلی
      await hybridStorageService.savePersonnelSchedule(
        personnelSchedule.personnel, 
        personnelSchedule.schedules
      );

      // بروزرسانی برنامه‌های کلاسی مرتبط
      for (const schedule of personnelSchedule.schedules) {
        if (schedule.grade && schedule.classNumber && schedule.field) {
          // جستجوی برنامه کلاسی مربوطه
          const classSchedule = await this.getClassSchedule(
            schedule.grade, 
            schedule.classNumber, 
            schedule.field
          );
          
          if (classSchedule) {
            // حذف برنامه مربوط به این پرسنل از برنامه کلاسی (اگر وجود داشته باشد)
            const updatedSchedules = classSchedule.schedules.filter(s => 
              !(s.day === schedule.day && s.timeStart === schedule.timeStart && s.timeEnd === schedule.timeEnd)
            );
            
            // اضافه کردن برنامه جدید
            const newSchedule: Schedule = {
              ...schedule,
              id: schedule.id,
              personnelCode: personnelSchedule.personnel.personnelCode,
              fullName: personnelSchedule.personnel.fullName,
              mainPosition: personnelSchedule.personnel.mainPosition,
              employmentStatus: personnelSchedule.personnel.employmentStatus,
              personnelScheduleId: personnelSchedule.personnel.id,
              source: 'personnel'
            };
            
            updatedSchedules.push(newSchedule);
            
            // ذخیره برنامه کلاسی بروزرسانی شده
            await hybridStorageService.saveClassSchedule(
              schedule.grade,
              schedule.classNumber,
              schedule.field,
              updatedSchedules
            );
          } else {
            // ایجاد برنامه کلاسی جدید
            const newSchedule: Schedule = {
              ...schedule,
              id: schedule.id,
              personnelCode: personnelSchedule.personnel.personnelCode,
              fullName: personnelSchedule.personnel.fullName,
              mainPosition: personnelSchedule.personnel.mainPosition,
              employmentStatus: personnelSchedule.personnel.employmentStatus,
              personnelScheduleId: personnelSchedule.personnel.id,
              source: 'personnel'
            };
            
            // ذخیره برنامه کلاسی جدید
            await hybridStorageService.saveClassSchedule(
              schedule.grade,
              schedule.classNumber,
              schedule.field,
              [newSchedule]
            );
          }
        }
      }
    } catch (error) {
      console.error('خطا در ذخیره برنامه پرسنلی:', error);
    }
  }

  // ذخیره برنامه کلاسی و بروزرسانی برنامه‌های پرسنلی مرتبط
  async saveClassSchedule(classSchedule: SavedClassSchedule): Promise<void> {
    try {
      // ذخیره برنامه کلاسی
      await hybridStorageService.saveClassSchedule(
        classSchedule.grade,
        classSchedule.classNumber,
        classSchedule.field,
        classSchedule.schedules
      );

      // بروزرسانی برنامه‌های پرسنلی مرتبط
      for (const schedule of classSchedule.schedules) {
        if (schedule.personnelCode) {
          // جستجوی پرسنل مربوطه
          const personnel = await hybridStorageService.getPersonnelByCode(schedule.personnelCode);
          
          if (personnel) {
            const personnelSchedule = await hybridStorageService.getPersonnelSchedulesByCode(schedule.personnelCode);
            
            if (personnelSchedule) {
              // حذف برنامه قبلی از همین روز و ساعت
              const updatedSchedules = personnelSchedule.schedules.filter(s => 
                !(s.day === schedule.day && s.timeStart === schedule.timeStart && s.timeEnd === schedule.timeEnd)
              );
              
              // اضافه کردن برنامه جدید
              const newSchedule: Schedule = {
                ...schedule,
                id: schedule.id,
                personnelId: personnel.id,
                classScheduleId: classSchedule.id,
                source: 'class'
              };
              
              updatedSchedules.push(newSchedule);
              
              // ذخیره برنامه پرسنلی بروزرسانی شده
              await hybridStorageService.savePersonnelSchedule(personnel, updatedSchedules);
            }
          } else {
            // ایجاد پرسنل جدید
            const newPersonnel: Personnel = {
              id: uuidv4(),
              personnelCode: schedule.personnelCode,
              fullName: schedule.fullName || '',
              mainPosition: schedule.mainPosition || '',
              employmentStatus: schedule.employmentStatus || ''
            };
            
            // ایجاد پرسنل در سیستم
            await hybridStorageService.createPersonnel(newPersonnel);
            
            // ایجاد برنامه پرسنلی جدید
            const newSchedule: Schedule = {
              ...schedule,
              id: schedule.id,
              personnelId: newPersonnel.id,
              classScheduleId: classSchedule.id,
              source: 'class'
            };
            
            // ذخیره برنامه پرسنلی جدید
            await hybridStorageService.savePersonnelSchedule(newPersonnel, [newSchedule]);
          }
        }
      }
    } catch (error) {
      console.error('خطا در ذخیره برنامه کلاسی:', error);
    }
  }

  // حذف برنامه از هر دو طرف (کلاسی و پرسنلی)
  async deleteScheduleFromBoth(schedule: Schedule): Promise<void> {
    try {
      // حذف از برنامه کلاسی
      if (schedule.grade && schedule.classNumber && schedule.field) {
        const classSchedule = await this.getClassSchedule(schedule.grade, schedule.classNumber, schedule.field);
        
        if (classSchedule) {
          const updatedSchedules = classSchedule.schedules.filter(s => s.id !== schedule.id);
          await hybridStorageService.saveClassSchedule(
            schedule.grade,
            schedule.classNumber,
            schedule.field,
            updatedSchedules
          );
        }
      }
      
      // حذف از برنامه پرسنلی
      if (schedule.personnelCode) {
        const personnelSchedule = await hybridStorageService.getPersonnelSchedulesByCode(schedule.personnelCode);
        
        if (personnelSchedule) {
          const updatedSchedules = personnelSchedule.schedules.filter(s => s.id !== schedule.id);
          await hybridStorageService.savePersonnelSchedule(personnelSchedule.personnel, updatedSchedules);
        }
      }
    } catch (error) {
      console.error('خطا در حذف برنامه از هر دو طرف:', error);
    }
  }

  // پاک کردن تمام برنامه‌ها
  async clearAllSchedules(): Promise<void> {
    try {
      await hybridStorageService.clearAllSchedules();
    } catch (error) {
      console.error('خطا در پاک کردن تمام برنامه‌ها:', error);
    }
  }
}

// صادر کردن نمونه منحصر به فرد از سرویس
export const scheduleSyncService = new ScheduleSyncService(); 