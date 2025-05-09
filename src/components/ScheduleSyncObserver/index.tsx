'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// تعریف اینترفیس‌های مورد نیاز
interface Personnel {
  id: string;
  personnelCode: string;
  fullName: string;
  mainPosition: string;
  employmentStatus: string;
}

interface Schedule {
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

interface PersonnelSchedule {
  personnel: Personnel;
  schedules: Schedule[];
  timestamp: number;
}

interface ClassSchedule {
  id: string;
  grade: string;
  classNumber: string;
  field: string;
  schedules: Schedule[];
  timestamp: number;
}

/**
 * کامپوننت مشاهده‌گر تغییرات برنامه‌های پرسنلی و کلاسی
 * این کامپوننت هر تغییری در برنامه‌ها را دنبال کرده و آنها را بین برنامه‌های مختلف همگام می‌کند
 */
export const ScheduleSyncObserver = () => {
  const [lastStorageUpdateTime, setLastStorageUpdateTime] = useState<number>(Date.now());

  // زمانی که تغییری در localStorage رخ دهد، این کامپوننت آن را رصد خواهد کرد
  useEffect(() => {
    const storageChangeHandler = () => {
      // بروزرسانی زمان آخرین تغییر
      setLastStorageUpdateTime(Date.now());
    };

    // اضافه کردن شنونده‌ی تغییرات localStorage
    window.addEventListener('storage', storageChangeHandler);

    // پاکسازی شنونده هنگام unmount کامپوننت
    return () => {
      window.removeEventListener('storage', storageChangeHandler);
    };
  }, []);

  // همگام‌سازی برنامه‌ها هر زمان که localStorage تغییر کند
  useEffect(() => {
    // همگام‌سازی برنامه‌های پرسنلی با برنامه‌های کلاسی
    const syncPersonnelToClass = () => {
      try {
        // بارگیری همه برنامه‌های پرسنلی
        const personnelSchedules: PersonnelSchedule[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          
          if (key && key.startsWith('personnel_schedule_')) {
            const savedData = localStorage.getItem(key);
            
            if (savedData) {
              try {
                const parsedData = JSON.parse(savedData) as PersonnelSchedule;
                personnelSchedules.push(parsedData);
              } catch (e) {
                console.error('خطا در تجزیه داده‌های ذخیره شده:', e);
              }
            }
          }
        }
        
        // همگام‌سازی هر برنامه پرسنلی با برنامه‌های کلاسی
        personnelSchedules.forEach(personnelSchedule => {
          const personnel = personnelSchedule.personnel;
          const schedules = personnelSchedule.schedules;
          
          // بررسی هر برنامه زمانی
          schedules.forEach((schedule: Schedule) => {
            if (schedule.grade && schedule.classNumber && schedule.field) {
              // کلید برنامه کلاسی
              const classKey = `class_schedule_${schedule.grade}-${schedule.classNumber}-${schedule.field}`;
              const classScheduleStr = localStorage.getItem(classKey);
              
              if (classScheduleStr) {
                // برنامه کلاسی موجود است
                const classSchedule = JSON.parse(classScheduleStr) as ClassSchedule;
                
                // جستجوی برنامه قبلی در همان روز و زمان
                const existingScheduleIndex = classSchedule.schedules.findIndex((s: Schedule) => 
                  s.day === schedule.day && s.timeStart === schedule.timeStart && s.timeEnd === schedule.timeEnd
                );
                
                // برنامه پرسنلی با اطلاعات پرسنلی
                const scheduleWithPersonnelInfo: Schedule = {
                  ...schedule,
                  personnelCode: personnel.personnelCode,
                  fullName: personnel.fullName,
                  mainPosition: personnel.mainPosition,
                  employmentStatus: personnel.employmentStatus,
                  personnelScheduleId: personnel.id,
                  source: 'personnel'
                };
                
                if (existingScheduleIndex >= 0) {
                  // بروزرسانی برنامه موجود
                  classSchedule.schedules[existingScheduleIndex] = scheduleWithPersonnelInfo;
                } else {
                  // افزودن برنامه جدید
                  classSchedule.schedules.push(scheduleWithPersonnelInfo);
                }
                
                // ذخیره تغییرات برنامه کلاسی
                classSchedule.timestamp = Date.now();
                localStorage.setItem(classKey, JSON.stringify(classSchedule));
              } else {
                // برنامه کلاسی وجود ندارد - ایجاد برنامه جدید
                const newClassSchedule: ClassSchedule = {
                  id: uuidv4(),
                  grade: schedule.grade,
                  classNumber: schedule.classNumber,
                  field: schedule.field,
                  schedules: [{
                    ...schedule,
                    personnelCode: personnel.personnelCode,
                    fullName: personnel.fullName,
                    mainPosition: personnel.mainPosition,
                    employmentStatus: personnel.employmentStatus,
                    personnelScheduleId: personnel.id,
                    source: 'personnel'
                  }],
                  timestamp: Date.now()
                };
                
                localStorage.setItem(classKey, JSON.stringify(newClassSchedule));
              }
            }
          });
        });
      } catch (error) {
        console.error('خطا در همگام‌سازی برنامه‌های پرسنلی با کلاسی:', error);
      }
    };
    
    // همگام‌سازی برنامه‌های کلاسی با برنامه‌های پرسنلی
    const syncClassToPersonnel = () => {
      try {
        // بارگیری همه برنامه‌های کلاسی
        const classSchedules: ClassSchedule[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          
          if (key && key.startsWith('class_schedule_')) {
            const savedData = localStorage.getItem(key);
            
            if (savedData) {
              try {
                const parsedData = JSON.parse(savedData) as ClassSchedule;
                classSchedules.push(parsedData);
              } catch (e) {
                console.error('خطا در تجزیه داده‌های ذخیره شده:', e);
              }
            }
          }
        }
        
        // همگام‌سازی هر برنامه کلاسی با برنامه‌های پرسنلی
        classSchedules.forEach(classSchedule => {
          const classInfo = {
            grade: classSchedule.grade,
            classNumber: classSchedule.classNumber,
            field: classSchedule.field
          };
          
          // بررسی هر برنامه زمانی
          classSchedule.schedules.forEach((schedule: Schedule) => {
            if (schedule.personnelCode && schedule.personnelId) {
              // کلید برنامه پرسنلی
              const personnelKey = `personnel_schedule_${schedule.personnelId}`;
              const personnelScheduleStr = localStorage.getItem(personnelKey);
              
              if (personnelScheduleStr) {
                // برنامه پرسنلی موجود است
                const personnelSchedule = JSON.parse(personnelScheduleStr) as PersonnelSchedule;
                
                // جستجوی برنامه قبلی در همان روز و زمان
                const existingScheduleIndex = personnelSchedule.schedules.findIndex((s: Schedule) => 
                  s.day === schedule.day && s.timeStart === schedule.timeStart && s.timeEnd === schedule.timeEnd
                );
                
                // برنامه کلاسی با اطلاعات کلاس
                const scheduleWithClassInfo: Schedule = {
                  ...schedule,
                  grade: classInfo.grade,
                  classNumber: classInfo.classNumber,
                  field: classInfo.field,
                  classScheduleId: classSchedule.id,
                  source: 'class'
                };
                
                if (existingScheduleIndex >= 0) {
                  // بروزرسانی برنامه موجود
                  personnelSchedule.schedules[existingScheduleIndex] = scheduleWithClassInfo;
                } else {
                  // افزودن برنامه جدید
                  personnelSchedule.schedules.push(scheduleWithClassInfo);
                }
                
                // ذخیره تغییرات برنامه پرسنلی
                personnelSchedule.timestamp = Date.now();
                localStorage.setItem(personnelKey, JSON.stringify(personnelSchedule));
              }
            }
          });
        });
      } catch (error) {
        console.error('خطا در همگام‌سازی برنامه‌های کلاسی با پرسنلی:', error);
      }
    };
    
    // اجرای همگام‌سازی
    syncPersonnelToClass();
    syncClassToPersonnel();
    
  }, [lastStorageUpdateTime]);
  
  // این کامپوننت چیزی نمایش نمی‌دهد، فقط منطق همگام‌سازی را اجرا می‌کند
  return null;
};

export default ScheduleSyncObserver; 