import { v4 as uuidv4 } from 'uuid';
import { storageService } from './storageService';

// سرویس همگام‌سازی برنامه‌های پرسنلی و کلاسی
export class SyncService {
  // همگام‌سازی از برنامه پرسنلی به کلاسی
  syncFromPersonnelToClass(
    personnelCode: string,
    fullName: string,
    mainPosition: string,
    employmentStatus: string,
    day: string,
    timeStart: string,
    timeEnd: string,
    grade: string,
    classNumber: string,
    field: string,
    hourType: string,
    teachingGroup: string,
    description: string,
    scheduleId: string,
    personnelId: string,
    hourNumber?: number
  ): void {
    try {
      // ساخت کلید برنامه کلاسی
      const classKey = `class_schedule_${grade}-${classNumber}-${field}`;
      
      // بررسی وجود برنامه کلاسی
      const classScheduleStr = storageService.getItem(classKey);
      
      if (classScheduleStr) {
        // برنامه کلاسی وجود دارد
        const classSchedule = JSON.parse(classScheduleStr);
        
        // جستجوی برنامه قبلی با همین روز و زمان
        const existingScheduleIndex = classSchedule.schedules.findIndex(
          (s: any) => s.day === day && s.timeStart === timeStart && s.timeEnd === timeEnd
        );
        
        if (existingScheduleIndex >= 0) {
          // بروزرسانی برنامه موجود
          classSchedule.schedules[existingScheduleIndex] = {
            id: scheduleId,
            personnelCode: personnelCode,
            fullName: fullName,
            mainPosition: mainPosition,
            employmentStatus: employmentStatus,
            teachingGroup: teachingGroup,
            hourType: hourType,
            description: description,
            day: day,
            timeStart: timeStart,
            timeEnd: timeEnd,
            hourNumber: hourNumber,
            grade: grade,
            classNumber: classNumber,
            field: field,
            personnelScheduleId: personnelId,
            timestamp: Date.now(),
            source: 'personnel'
          };
        } else {
          // افزودن برنامه جدید
          classSchedule.schedules.push({
            id: scheduleId,
            personnelCode: personnelCode,
            fullName: fullName,
            mainPosition: mainPosition,
            employmentStatus: employmentStatus,
            teachingGroup: teachingGroup,
            hourType: hourType,
            description: description,
            day: day,
            timeStart: timeStart,
            timeEnd: timeEnd,
            hourNumber: hourNumber,
            grade: grade,
            classNumber: classNumber,
            field: field,
            personnelScheduleId: personnelId,
            timestamp: Date.now(),
            source: 'personnel'
          });
        }
        
        // ذخیره تغییرات
        classSchedule.timestamp = Date.now();
        storageService.setItem(classKey, JSON.stringify(classSchedule));
      } else {
        // برنامه کلاسی وجود ندارد، ایجاد برنامه جدید
        const newClassSchedule = {
          id: uuidv4(),
          grade: grade,
          classNumber: classNumber,
          field: field,
          schedules: [{
            id: scheduleId,
            personnelCode: personnelCode,
            fullName: fullName,
            mainPosition: mainPosition,
            employmentStatus: employmentStatus,
            teachingGroup: teachingGroup,
            hourType: hourType,
            description: description,
            day: day,
            timeStart: timeStart,
            timeEnd: timeEnd,
            hourNumber: hourNumber,
            grade: grade,
            classNumber: classNumber,
            field: field,
            personnelScheduleId: personnelId,
            timestamp: Date.now(),
            source: 'personnel'
          }],
          timestamp: Date.now()
        };
        
        storageService.setItem(classKey, JSON.stringify(newClassSchedule));
      }
    } catch (error) {
      console.error('خطا در همگام‌سازی برنامه از پرسنلی به کلاسی:', error);
    }
  }
  
  // همگام‌سازی از برنامه کلاسی به پرسنلی
  syncFromClassToPersonnel(
    personnelCode: string,
    fullName: string,
    mainPosition: string,
    employmentStatus: string,
    day: string,
    timeStart: string,
    timeEnd: string,
    grade: string,
    classNumber: string,
    field: string,
    hourType: string,
    teachingGroup: string,
    description: string,
    scheduleId: string,
    classScheduleId: string
  ): void {
    try {
      // جستجوی برنامه پرسنلی موجود
      let personnelId: string = '';
      const allKeys = storageService.getAllKeys();
      
      for (const key of allKeys) {
        if (key && key.startsWith('personnel_schedule_')) {
          const scheduleStr = storageService.getItem(key);
          if (!scheduleStr) continue;
          
          const schedule = JSON.parse(scheduleStr);
          
          if (schedule?.personnel?.personnelCode === personnelCode) {
            personnelId = schedule.personnel.id;
            break;
          }
        }
      }
      
      if (personnelId) {
        // برنامه پرسنلی وجود دارد
        const personnelKey = `personnel_schedule_${personnelId}`;
        const personnelScheduleStr = storageService.getItem(personnelKey);
        
        if (personnelScheduleStr) {
          const personnelSchedule = JSON.parse(personnelScheduleStr);
          
          // جستجوی برنامه قبلی با همین روز و زمان
          const existingScheduleIndex = personnelSchedule.schedules.findIndex(
            (s: any) => s.day === day && s.timeStart === timeStart && s.timeEnd === timeEnd
          );
          
          if (existingScheduleIndex >= 0) {
            // بروزرسانی برنامه موجود
            personnelSchedule.schedules[existingScheduleIndex] = {
              id: scheduleId,
              grade: grade,
              classNumber: classNumber,
              field: field,
              mainPosition: mainPosition,
              hourType: hourType,
              teachingGroup: teachingGroup,
              description: description,
              day: day,
              timeStart: timeStart,
              timeEnd: timeEnd,
              personnelId: personnelId,
              personnelCode: personnelCode,
              fullName: fullName,
              employmentStatus: employmentStatus,
              classScheduleId: classScheduleId,
              timestamp: Date.now(),
              source: 'class'
            };
          } else {
            // افزودن برنامه جدید
            personnelSchedule.schedules.push({
              id: scheduleId,
              grade: grade,
              classNumber: classNumber,
              field: field,
              mainPosition: mainPosition,
              hourType: hourType,
              teachingGroup: teachingGroup,
              description: description,
              day: day,
              timeStart: timeStart,
              timeEnd: timeEnd,
              personnelId: personnelId,
              personnelCode: personnelCode,
              fullName: fullName,
              employmentStatus: employmentStatus,
              classScheduleId: classScheduleId,
              timestamp: Date.now(),
              source: 'class'
            });
          }
          
          // ذخیره تغییرات
          personnelSchedule.timestamp = Date.now();
          storageService.setItem(personnelKey, JSON.stringify(personnelSchedule));
        }
      } else {
        // برنامه پرسنلی وجود ندارد، ایجاد برنامه جدید
        const newPersonnelId = uuidv4();
        const newPersonnelKey = `personnel_schedule_${newPersonnelId}`;
        
        const newPersonnelSchedule = {
          id: newPersonnelId,
          personnel: {
            id: newPersonnelId,
            personnelCode: personnelCode,
            fullName: fullName,
            mainPosition: mainPosition,
            employmentStatus: employmentStatus
          },
          schedules: [{
            id: scheduleId,
            grade: grade,
            classNumber: classNumber,
            field: field,
            mainPosition: mainPosition,
            hourType: hourType,
            teachingGroup: teachingGroup,
            description: description,
            day: day,
            timeStart: timeStart,
            timeEnd: timeEnd,
            personnelId: newPersonnelId,
            personnelCode: personnelCode,
            fullName: fullName,
            employmentStatus: employmentStatus,
            classScheduleId: classScheduleId,
            timestamp: Date.now(),
            source: 'class'
          }],
          timestamp: Date.now()
        };
        
        storageService.setItem(newPersonnelKey, JSON.stringify(newPersonnelSchedule));
      }
    } catch (error) {
      console.error('خطا در همگام‌سازی برنامه از کلاسی به پرسنلی:', error);
    }
  }

  // حذف برنامه از هر دو طرف (کلاسی و پرسنلی)
  deleteFromBoth(
    scheduleId: string, 
    day: string, 
    timeStart: string, 
    timeEnd: string, 
    grade?: string, 
    classNumber?: string, 
    field?: string,
    personnelId?: string
  ): void {
    try {
      // حذف از برنامه کلاسی
      if (grade && classNumber && field) {
        const classKey = `class_schedule_${grade}-${classNumber}-${field}`;
        const classScheduleStr = storageService.getItem(classKey);
        
        if (classScheduleStr) {
          const classSchedule = JSON.parse(classScheduleStr);
          
          // فیلتر کردن برنامه موردنظر
          classSchedule.schedules = classSchedule.schedules.filter(
            (s: any) => s.id !== scheduleId
          );
          
          // بروزرسانی timestamp
          classSchedule.timestamp = Date.now();
          
          // ذخیره تغییرات
          storageService.setItem(classKey, JSON.stringify(classSchedule));
        }
      }
      
      // حذف از برنامه پرسنلی
      if (personnelId) {
        const personnelKey = `personnel_schedule_${personnelId}`;
        const personnelScheduleStr = storageService.getItem(personnelKey);
        
        if (personnelScheduleStr) {
          const personnelSchedule = JSON.parse(personnelScheduleStr);
          
          // فیلتر کردن برنامه موردنظر
          personnelSchedule.schedules = personnelSchedule.schedules.filter(
            (s: any) => s.id !== scheduleId
          );
          
          // بروزرسانی timestamp
          personnelSchedule.timestamp = Date.now();
          
          // ذخیره تغییرات
          storageService.setItem(personnelKey, JSON.stringify(personnelSchedule));
        }
      } else {
        // جستجو در تمام برنامه‌های پرسنلی
        const allKeys = storageService.getAllKeys();
        
        for (const key of allKeys) {
          if (key && key.startsWith('personnel_schedule_')) {
            const scheduleStr = storageService.getItem(key);
            if (!scheduleStr) continue;
            
            const personnelSchedule = JSON.parse(scheduleStr);
            
            // بررسی وجود برنامه مورد نظر
            const hasSchedule = personnelSchedule.schedules.some(
              (s: any) => s.id === scheduleId || 
                (s.day === day && s.timeStart === timeStart && s.timeEnd === timeEnd &&
                  s.grade === grade && s.classNumber === classNumber && s.field === field)
            );
            
            if (hasSchedule) {
              // فیلتر کردن برنامه موردنظر
              personnelSchedule.schedules = personnelSchedule.schedules.filter(
                (s: any) => s.id !== scheduleId &&
                  !(s.day === day && s.timeStart === timeStart && s.timeEnd === timeEnd &&
                    s.grade === grade && s.classNumber === classNumber && s.field === field)
              );
              
              // بروزرسانی timestamp
              personnelSchedule.timestamp = Date.now();
              
              // ذخیره تغییرات
              storageService.setItem(key, JSON.stringify(personnelSchedule));
            }
          }
        }
      }
    } catch (error) {
      console.error('خطا در حذف برنامه از دو طرف:', error);
    }
  }
  
  // پاک کردن تمام برنامه‌ها
  clearAllSchedules(): void {
    try {
      // حذف کامل تمام برنامه‌ها از localStorage
      const allKeys = storageService.getAllKeys();
      
      for (const key of allKeys) {
        // پاک کردن فقط کلیدهای مربوط به برنامه‌های کلاسی و پرسنلی
        if (key && (key.startsWith('class_schedule_') || key.startsWith('personnel_schedule_'))) {
          storageService.removeItem(key);
        }
      }
    } catch (error) {
      console.error('خطا در پاک کردن تمام برنامه‌ها:', error);
    }
  }
}

// صادر کردن نمونه منحصر به فرد از سرویس
export const syncService = new SyncService(); 