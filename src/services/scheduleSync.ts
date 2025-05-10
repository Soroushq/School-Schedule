import { v4 as uuidv4 } from 'uuid';
import { storageService } from './storageService';

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
  getAllPersonnelSchedules(): SavedPersonnelSchedule[] {
    try {
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
      
      return schedules;
    } catch (error) {
      console.error('خطا در بارگیری برنامه‌های پرسنلی:', error);
      return [];
    }
  }

  // بارگذاری تمام برنامه‌های کلاسی ذخیره شده
  getAllClassSchedules(): SavedClassSchedule[] {
    try {
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
      
      return schedules;
    } catch (error) {
      console.error('خطا در بارگیری برنامه‌های کلاسی:', error);
      return [];
    }
  }

  // بارگذاری برنامه پرسنلی با ID مشخص
  getPersonnelScheduleById(personnelId: string): SavedPersonnelSchedule | null {
    try {
      const key = `personnel_schedule_${personnelId}`;
      const savedData = storageService.getItem(key);
      
      if (savedData) {
        return JSON.parse(savedData);
      }
      
      return null;
    } catch (error) {
      console.error('خطا در بارگیری برنامه پرسنلی:', error);
      return null;
    }
  }

  // بارگذاری برنامه کلاسی با اطلاعات مشخص
  getClassSchedule(grade: string, classNumber: string, field: string): SavedClassSchedule | null {
    try {
      const key = `class_schedule_${grade}-${classNumber}-${field}`;
      const savedData = storageService.getItem(key);
      
      if (savedData) {
        return JSON.parse(savedData);
      }
      
      return null;
    } catch (error) {
      console.error('خطا در بارگیری برنامه کلاسی:', error);
      return null;
    }
  }

  // ذخیره برنامه پرسنلی و بروزرسانی برنامه‌های کلاسی مرتبط
  savePersonnelSchedule(personnelSchedule: SavedPersonnelSchedule): void {
    try {
      // ذخیره برنامه پرسنلی
      const key = `personnel_schedule_${personnelSchedule.personnel.id}`;
      storageService.setItem(key, JSON.stringify({
        ...personnelSchedule,
        timestamp: Date.now()
      }));

      // بروزرسانی برنامه‌های کلاسی مرتبط
      personnelSchedule.schedules.forEach(schedule => {
        if (schedule.grade && schedule.classNumber && schedule.field) {
          const classSchedule = this.getClassSchedule(schedule.grade, schedule.classNumber, schedule.field);
          
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
            this.saveClassScheduleWithoutSync({
              ...classSchedule,
              schedules: updatedSchedules,
              timestamp: Date.now()
            });
          } else {
            // ایجاد برنامه کلاسی جدید
            const newClassSchedule: SavedClassSchedule = {
              id: uuidv4(),
              grade: schedule.grade,
              classNumber: schedule.classNumber,
              field: schedule.field,
              schedules: [{
                ...schedule,
                id: schedule.id,
                personnelCode: personnelSchedule.personnel.personnelCode,
                fullName: personnelSchedule.personnel.fullName,
                mainPosition: personnelSchedule.personnel.mainPosition,
                employmentStatus: personnelSchedule.personnel.employmentStatus,
                personnelScheduleId: personnelSchedule.personnel.id,
                source: 'personnel'
              }],
              timestamp: Date.now()
            };
            
            // ذخیره برنامه کلاسی جدید
            this.saveClassScheduleWithoutSync(newClassSchedule);
          }
        }
      });
    } catch (error) {
      console.error('خطا در ذخیره برنامه پرسنلی:', error);
    }
  }

  // ذخیره برنامه کلاسی و بروزرسانی برنامه‌های پرسنلی مرتبط
  saveClassSchedule(classSchedule: SavedClassSchedule): void {
    try {
      // ذخیره برنامه کلاسی
      this.saveClassScheduleWithoutSync({
        ...classSchedule,
        timestamp: Date.now()
      });

      // بروزرسانی برنامه‌های پرسنلی مرتبط
      classSchedule.schedules.forEach(schedule => {
        if (schedule.personnelCode) {
          // جستجوی پرسنل مربوطه
          const personnelSchedules = this.getAllPersonnelSchedules();
          const matchingPersonnel = personnelSchedules.find(ps => 
            ps.personnel.personnelCode === schedule.personnelCode
          );
          
          if (matchingPersonnel) {
            // حذف برنامه قبلی از همین روز و ساعت
            const updatedSchedules = matchingPersonnel.schedules.filter(s => 
              !(s.day === schedule.day && s.timeStart === schedule.timeStart && s.timeEnd === schedule.timeEnd)
            );
            
            // اضافه کردن برنامه جدید
            const newSchedule: Schedule = {
              ...schedule,
              id: schedule.id,
              personnelId: matchingPersonnel.personnel.id,
              classScheduleId: classSchedule.id,
              source: 'class'
            };
            
            updatedSchedules.push(newSchedule);
            
            // ذخیره برنامه پرسنلی بروزرسانی شده
            this.savePersonnelScheduleWithoutSync({
              ...matchingPersonnel,
              schedules: updatedSchedules,
              timestamp: Date.now()
            });
          } else {
            // ایجاد پرسنل جدید
            const newPersonnelId = uuidv4();
            const newPersonnel: Personnel = {
              id: newPersonnelId,
              personnelCode: schedule.personnelCode,
              fullName: schedule.fullName || '',
              mainPosition: schedule.mainPosition || '',
              employmentStatus: schedule.employmentStatus || ''
            };
            
            // ایجاد برنامه پرسنلی جدید
            const newPersonnelSchedule: SavedPersonnelSchedule = {
              personnel: newPersonnel,
              schedules: [{
                ...schedule,
                id: schedule.id,
                personnelId: newPersonnelId,
                classScheduleId: classSchedule.id,
                source: 'class'
              }],
              timestamp: Date.now()
            };
            
            // ذخیره برنامه پرسنلی جدید
            this.savePersonnelScheduleWithoutSync(newPersonnelSchedule);
          }
        }
      });
    } catch (error) {
      console.error('خطا در ذخیره برنامه کلاسی:', error);
    }
  }

  // ذخیره برنامه پرسنلی بدون همگام‌سازی با برنامه‌های کلاسی
  private savePersonnelScheduleWithoutSync(personnelSchedule: SavedPersonnelSchedule): void {
    try {
      const key = `personnel_schedule_${personnelSchedule.personnel.id}`;
      storageService.setItem(key, JSON.stringify({
        ...personnelSchedule,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('خطا در ذخیره برنامه پرسنلی:', error);
    }
  }

  // ذخیره برنامه کلاسی بدون همگام‌سازی با برنامه‌های پرسنلی
  private saveClassScheduleWithoutSync(classSchedule: SavedClassSchedule): void {
    try {
      const key = `class_schedule_${classSchedule.grade}-${classSchedule.classNumber}-${classSchedule.field}`;
      storageService.setItem(key, JSON.stringify({
        ...classSchedule,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('خطا در ذخیره برنامه کلاسی:', error);
    }
  }

  // حذف برنامه از هر دو طرف (کلاسی و پرسنلی)
  deleteScheduleFromBoth(schedule: Schedule): void {
    try {
      // حذف از برنامه کلاسی
      if (schedule.grade && schedule.classNumber && schedule.field) {
        const classSchedule = this.getClassSchedule(schedule.grade, schedule.classNumber, schedule.field);
        
        if (classSchedule) {
          classSchedule.schedules = classSchedule.schedules.filter(s => s.id !== schedule.id);
          this.saveClassScheduleWithoutSync(classSchedule);
        }
      }
      
      // حذف از برنامه پرسنلی
      if (schedule.personnelId) {
        const personnelSchedule = this.getPersonnelScheduleById(schedule.personnelId);
        
        if (personnelSchedule) {
          personnelSchedule.schedules = personnelSchedule.schedules.filter(s => s.id !== schedule.id);
          this.savePersonnelScheduleWithoutSync(personnelSchedule);
        }
      } else {
        // جستجو در تمام برنامه‌های پرسنلی
        const personnelSchedules = this.getAllPersonnelSchedules();
        
        personnelSchedules.forEach(ps => {
          const hasSchedule = ps.schedules.some(s => s.id === schedule.id);
          
          if (hasSchedule) {
            ps.schedules = ps.schedules.filter(s => s.id !== schedule.id);
            this.savePersonnelScheduleWithoutSync(ps);
          }
        });
      }
    } catch (error) {
      console.error('خطا در حذف برنامه از هر دو طرف:', error);
    }
  }
}

// صادر کردن نمونه منحصر به فرد از سرویس
export const scheduleSyncService = new ScheduleSyncService(); 