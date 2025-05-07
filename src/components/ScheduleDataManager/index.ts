import { 
  Schedule, 
  SavedPersonnelSchedule, 
  ClassSchedule, 
  Personnel, 
  storageHelpers 
} from '../../data/models';

/**
 * مدیریت ذخیره و بازیابی داده‌های برنامه
 */
export const ScheduleDataManager = {
  // === توابع مرتبط با برنامه پرسنلی ===
  
  // ذخیره برنامه پرسنلی
  savePersonnelSchedule: (personnel: Personnel, schedules: Schedule[]): void => {
    const personnelSchedule: SavedPersonnelSchedule = {
      personnel,
      schedules: schedules.map(schedule => {
        // اطمینان از وجود تمام فیلدهای لازم
        const updatedSchedule: Schedule = {
          ...schedule,
          personnelId: personnel.id,
          personnelCode: personnel.personnelCode,
          employmentStatus: personnel.employmentStatus,
          timestamp: Date.now(),
          classScheduleId: schedule.grade && schedule.classNumber && schedule.field 
            ? `${schedule.grade}-${schedule.classNumber}-${schedule.field}` 
            : ''
        };
        return updatedSchedule;
      }),
      timestamp: Date.now()
    };
    
    // ذخیره برنامه پرسنلی
    storageHelpers.savePersonnelSchedule(personnelSchedule);
    
    // به‌روزرسانی برنامه‌های کلاسی مرتبط
    schedules.forEach(schedule => {
      if (schedule.grade && schedule.classNumber && schedule.field) {
        storageHelpers.updateClassScheduleFromPersonnel(schedule);
      }
    });
  },
  
  // بارگذاری برنامه پرسنلی با کد پرسنلی
  loadPersonnelScheduleByCode: (personnelCode: string): { personnel: Personnel | null, schedules: Schedule[] } => {
    const savedSchedule = storageHelpers.getPersonnelScheduleByCode(personnelCode);
    if (savedSchedule) {
      return {
        personnel: savedSchedule.personnel,
        schedules: savedSchedule.schedules
      };
    }
    return { personnel: null, schedules: [] };
  },
  
  // بارگذاری برنامه پرسنلی با آیدی
  loadPersonnelScheduleById: (personnelId: string): Schedule[] => {
    const savedSchedule = storageHelpers.getPersonnelSchedule(personnelId);
    return savedSchedule ? savedSchedule.schedules : [];
  },
  
  // بارگذاری همه برنامه‌های پرسنلی
  loadAllPersonnelSchedules: (): SavedPersonnelSchedule[] => {
    return storageHelpers.getAllPersonnelSchedules();
  },
  
  // حذف برنامه از برنامه پرسنلی
  removeFromPersonnelSchedule: (personnelId: string, scheduleId: string): void => {
    const savedSchedule = storageHelpers.getPersonnelSchedule(personnelId);
    if (savedSchedule) {
      // حذف برنامه از لیست
      savedSchedule.schedules = savedSchedule.schedules.filter(s => s.id !== scheduleId);
      savedSchedule.timestamp = Date.now();
      
      // ذخیره تغییرات
      storageHelpers.savePersonnelSchedule(savedSchedule);
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
        return updatedSchedule;
      }),
      timestamp: Date.now()
    };
    
    // ذخیره برنامه کلاسی
    storageHelpers.saveClassSchedule(classSchedule);
    
    // به‌روزرسانی برنامه‌های پرسنلی مرتبط
    schedules.forEach(schedule => {
      if (schedule.personnelCode) {
        storageHelpers.updatePersonnelScheduleFromClass(schedule);
      }
    });
  },
  
  // بارگذاری برنامه کلاسی
  loadClassSchedule: (grade: string, classNumber: string, field: string): Schedule[] => {
    const savedSchedule = storageHelpers.getClassSchedule(grade, classNumber, field);
    return savedSchedule ? savedSchedule.schedules : [];
  },
  
  // بارگذاری همه برنامه‌های کلاسی
  loadAllClassSchedules: (): ClassSchedule[] => {
    return storageHelpers.getAllClassSchedules();
  },
  
  // بارگذاری برنامه کلاسی با استفاده از برنامه‌های پرسنلی
  loadClassScheduleFromPersonnelData: (grade: string, classNumber: string, field: string): Schedule[] => {
    // 1. ابتدا برنامه کلاسی ذخیره شده را بارگذاری می‌کنیم
    const classSchedules = ScheduleDataManager.loadClassSchedule(grade, classNumber, field);
    
    // 2. سپس همه برنامه‌های پرسنلی را بارگذاری می‌کنیم
    const allPersonnelSchedules = ScheduleDataManager.loadAllPersonnelSchedules();
    
    // 3. برنامه‌های پرسنلی مرتبط با این کلاس را پیدا می‌کنیم
    const relatedPersonnelSchedules: Schedule[] = [];
    
    allPersonnelSchedules.forEach(personnelData => {
      const relatedSchedules = personnelData.schedules.filter(s => 
        s.grade === grade && 
        s.classNumber === classNumber && 
        s.field === field
      );
      
      // اضافه کردن اطلاعات پرسنلی به برنامه‌ها
      relatedSchedules.forEach(s => {
        // بررسی تکراری نبودن (یعنی در برنامه کلاسی قبلاً اضافه نشده باشد)
        const alreadyExists = classSchedules.some(existingSchedule => 
          existingSchedule.day === s.day && 
          existingSchedule.timeStart === s.timeStart
        );
        
        // اگر تکراری نباشد، به لیست اضافه می‌کنیم
        if (!alreadyExists) {
          relatedPersonnelSchedules.push({
            ...s,
            personnelCode: personnelData.personnel.personnelCode,
            employmentStatus: personnelData.personnel.employmentStatus,
            mainPosition: s.mainPosition || personnelData.personnel.mainPosition
          });
        }
      });
    });
    
    // 4. ترکیب برنامه‌های کلاسی و پرسنلی
    return [...classSchedules, ...relatedPersonnelSchedules];
  },
  
  // حذف برنامه از برنامه کلاسی
  removeFromClassSchedule: (grade: string, classNumber: string, field: string, scheduleId: string): void => {
    // حذف کلید استفاده نشده
    const savedSchedule = storageHelpers.getClassSchedule(grade, classNumber, field);
    
    if (savedSchedule) {
      // حذف برنامه از لیست
      savedSchedule.schedules = savedSchedule.schedules.filter(s => s.id !== scheduleId);
      savedSchedule.timestamp = Date.now();
      
      // ذخیره تغییرات
      storageHelpers.saveClassSchedule(savedSchedule);
    }
  },
  
  // === توابع کمکی ===
  
  // ایجاد آیدی جدید
  generateId: (): string => {
    return Date.now().toString();
  },
  
  // بررسی وجود تداخل در برنامه کلاسی
  hasClassConflict: (grade: string, classNumber: string, field: string, day: string, timeStart: string): boolean => {
    const classSchedule = storageHelpers.getClassSchedule(grade, classNumber, field);
    if (!classSchedule) return false;
    
    return classSchedule.schedules.some(s => s.day === day && s.timeStart === timeStart);
  },
  
  // بررسی وجود تداخل در برنامه پرسنلی
  hasPersonnelConflict: (personnelCode: string, day: string, timeStart: string): boolean => {
    const personnelSchedule = storageHelpers.getPersonnelScheduleByCode(personnelCode);
    if (!personnelSchedule) return false;
    
    return personnelSchedule.schedules.some(s => s.day === day && s.timeStart === timeStart);
  },
  
  // دریافت برنامه پرسنلی با آیدی (برای استفاده در ScheduleManager)
  getPersonnelSchedule: (personnelId: string): SavedPersonnelSchedule | null => {
    return storageHelpers.getPersonnelSchedule(personnelId);
  },
  
  // دریافت برنامه کلاسی (برای استفاده در ScheduleManager)
  getClassSchedule: (grade: string, classNumber: string, field: string): ClassSchedule | null => {
    return storageHelpers.getClassSchedule(grade, classNumber, field);
  },
  
  // === توابع به‌روزرسانی متقابل ===
  
  // به‌روزرسانی برنامه پرسنلی از برنامه کلاسی
  updatePersonnelScheduleFromClass: (schedule: Schedule): void => {
    if (!schedule.personnelCode) return;
    
    const personnelSchedule = storageHelpers.getPersonnelScheduleByCode(schedule.personnelCode);
    if (!personnelSchedule) return;
    
    const existingIndex = personnelSchedule.schedules.findIndex(
      s => s.day === schedule.day && s.timeStart === schedule.timeStart
    );
    
    if (existingIndex !== -1) {
      personnelSchedule.schedules[existingIndex] = schedule;
    } else {
      personnelSchedule.schedules.push(schedule);
    }
    
    personnelSchedule.timestamp = Date.now();
    storageHelpers.savePersonnelSchedule(personnelSchedule);
  },
  
  // به‌روزرسانی برنامه کلاسی از برنامه پرسنلی
  updateClassScheduleFromPersonnel: (schedule: Schedule): void => {
    if (!schedule.grade || !schedule.classNumber || !schedule.field) return;
    
    storageHelpers.updateClassScheduleFromPersonnel(schedule);
  }
}; 