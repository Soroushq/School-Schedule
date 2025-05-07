import type { 
  Schedule, 
  Personnel,
  SavedPersonnelSchedule, 
  ClassSchedule
} from '../../data/models';
import { ScheduleDataManager } from '../ScheduleDataManager';

/**
 * آداپتور برای انتقال تدریجی به مدل داده جدید
 * 
 * این کلاس توابعی را فراهم می‌کند که با روال قبلی هماهنگ هستند
 * اما از مدل داده جدید استفاده می‌کنند
 */
export const ScheduleDataAdapter = {
  // === توابع برنامه پرسنلی ===
  
  // ذخیره برنامه پرسنلی در لوکال استوریج
  savePersonnelScheduleToLocalStorage: (
    personnel: { id: string; personnelCode: string; fullName: string; mainPosition: string; employmentStatus: string },
    schedules: Schedule[]
  ): void => {
    // تبدیل داده‌های قدیمی به مدل جدید
    const newPersonnel: Personnel = {
      id: personnel.id,
      personnelCode: personnel.personnelCode,
      fullName: personnel.fullName,
      mainPosition: personnel.mainPosition,
      employmentStatus: personnel.employmentStatus
    };
    
    const newSchedules: Schedule[] = schedules.map(oldSchedule => ({
      id: oldSchedule.id || Date.now().toString(),
      personnelId: personnel.id,
      personnelCode: personnel.personnelCode,
      employmentStatus: personnel.employmentStatus,
      mainPosition: oldSchedule.mainPosition || personnel.mainPosition,
      grade: oldSchedule.grade || '',
      classNumber: oldSchedule.classNumber || '',
      field: oldSchedule.field || '',
      classScheduleId: oldSchedule.grade && oldSchedule.classNumber && oldSchedule.field
        ? `${oldSchedule.grade}-${oldSchedule.classNumber}-${oldSchedule.field}`
        : '',
      day: oldSchedule.day || '',
      timeStart: oldSchedule.timeStart || '',
      timeEnd: oldSchedule.timeEnd || '',
      hourType: oldSchedule.hourType || '',
      teachingGroup: oldSchedule.teachingGroup || '',
      description: oldSchedule.description || '',
      timestamp: oldSchedule.timestamp || Date.now()
    }));
    
    // استفاده از مدیریت داده جدید
    ScheduleDataManager.savePersonnelSchedule(newPersonnel, newSchedules);
  },
  
  // بارگذاری برنامه پرسنلی از لوکال استوریج
  loadPersonnelScheduleFromLocalStorage: (
    personnelId?: string,
    personnelCode?: string
  ): Schedule[] => {
    if (personnelId) {
      return ScheduleDataManager.loadPersonnelScheduleById(personnelId);
    } else if (personnelCode) {
      const { schedules } = ScheduleDataManager.loadPersonnelScheduleByCode(personnelCode);
      return schedules;
    }
    return [];
  },
  
  // بارگذاری همه برنامه‌های پرسنلی
  loadAllSavedPersonnelSchedules: (): SavedPersonnelSchedule[] => {
    return ScheduleDataManager.loadAllPersonnelSchedules();
  },
  
  // جستجوی پرسنل با کد پرسنلی
  findPersonnelByCode: (personnelCode: string): Personnel | null => {
    const { personnel } = ScheduleDataManager.loadPersonnelScheduleByCode(personnelCode);
    return personnel;
  },
  
  // === توابع برنامه کلاسی ===
  
  // ذخیره برنامه کلاسی در لوکال استوریج
  saveClassScheduleToLocalStorage: (
    grade: string,
    classNumber: string,
    field: string,
    schedules: Schedule[]
  ): void => {
    // تبدیل داده‌های قدیمی به مدل جدید
    const newSchedules: Schedule[] = schedules.map(oldSchedule => ({
      id: oldSchedule.id || Date.now().toString(),
      personnelId: oldSchedule.personnelId || '',
      personnelCode: oldSchedule.personnelCode || '',
      employmentStatus: oldSchedule.employmentStatus || '',
      mainPosition: oldSchedule.mainPosition || '',
      grade: grade,
      classNumber: classNumber,
      field: field,
      classScheduleId: `${grade}-${classNumber}-${field}`,
      day: oldSchedule.day || '',
      timeStart: oldSchedule.timeStart || '',
      timeEnd: oldSchedule.timeEnd || '',
      hourType: oldSchedule.hourType || '',
      teachingGroup: oldSchedule.teachingGroup || '',
      description: oldSchedule.description || '',
      timestamp: oldSchedule.timestamp || Date.now()
    }));
    
    // استفاده از مدیریت داده جدید
    ScheduleDataManager.saveClassSchedule(grade, classNumber, field, newSchedules);
  },
  
  // بارگذاری برنامه کلاسی از لوکال استوریج
  loadClassScheduleFromLocalStorage: (
    grade: string,
    classNumber: string,
    field: string
  ): Schedule[] => {
    return ScheduleDataManager.loadClassScheduleFromPersonnelData(grade, classNumber, field);
  },
  
  // بارگذاری همه برنامه‌های کلاسی
  loadAllSavedClassSchedules: (): ClassSchedule[] => {
    return ScheduleDataManager.loadAllClassSchedules();
  },
  
  // === توابع به‌روزرسانی متقابل ===
  
  // به‌روزرسانی برنامه پرسنلی از برنامه کلاسی
  updatePersonnelScheduleFromClass: (scheduleItem: Schedule): void => {
    if (!scheduleItem.personnelCode) return;
    
    // تبدیل به مدل جدید
    const newSchedule: Schedule = {
      id: scheduleItem.id || Date.now().toString(),
      personnelId: scheduleItem.personnelId || '',
      personnelCode: scheduleItem.personnelCode || '',
      employmentStatus: scheduleItem.employmentStatus || '',
      mainPosition: scheduleItem.mainPosition || '',
      grade: scheduleItem.grade || '',
      classNumber: scheduleItem.classNumber || '',
      field: scheduleItem.field || '',
      classScheduleId: scheduleItem.grade && scheduleItem.classNumber && scheduleItem.field
        ? `${scheduleItem.grade}-${scheduleItem.classNumber}-${scheduleItem.field}`
        : '',
      day: scheduleItem.day || '',
      timeStart: scheduleItem.timeStart || '',
      timeEnd: scheduleItem.timeEnd || '',
      hourType: scheduleItem.hourType || '',
      teachingGroup: scheduleItem.teachingGroup || '',
      description: scheduleItem.description || '',
      timestamp: scheduleItem.timestamp || Date.now()
    };
    
    // استفاده از مدیریت داده جدید
    ScheduleDataManager.updatePersonnelScheduleFromClass(newSchedule);
  },
  
  // به‌روزرسانی برنامه کلاسی از برنامه پرسنلی
  updateClassScheduleFromPersonnel: (scheduleItem: Schedule): void => {
    if (!scheduleItem.grade || !scheduleItem.classNumber || !scheduleItem.field) return;
    
    // تبدیل به مدل جدید
    const newSchedule: Schedule = {
      id: scheduleItem.id || Date.now().toString(),
      personnelId: scheduleItem.personnelId || '',
      personnelCode: scheduleItem.personnelCode || '',
      employmentStatus: scheduleItem.employmentStatus || '',
      mainPosition: scheduleItem.mainPosition || '',
      grade: scheduleItem.grade || '',
      classNumber: scheduleItem.classNumber || '',
      field: scheduleItem.field || '',
      classScheduleId: `${scheduleItem.grade}-${scheduleItem.classNumber}-${scheduleItem.field}`,
      day: scheduleItem.day || '',
      timeStart: scheduleItem.timeStart || '',
      timeEnd: scheduleItem.timeEnd || '',
      hourType: scheduleItem.hourType || '',
      teachingGroup: scheduleItem.teachingGroup || '',
      description: scheduleItem.description || '',
      timestamp: scheduleItem.timestamp || Date.now()
    };
    
    // استفاده از مدیریت داده جدید
    ScheduleDataManager.updateClassScheduleFromPersonnel(newSchedule);
  }
}; 