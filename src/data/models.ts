// مدل‌های داده برای استفاده در برنامه

/**
 * مدل پرسنل
 */
export interface Personnel {
  id: string;
  personnelCode: string;
  fullName: string;
  mainPosition: string;
  employmentStatus: string;
}

/**
 * مدل برنامه زمانی
 */
export interface Schedule {
  id: string;
  // اطلاعات پرسنل
  personnelId: string;
  personnelCode: string;
  employmentStatus: string;
  mainPosition: string;
  
  // اطلاعات کلاس
  grade: string;
  classNumber: string;
  field: string;
  classScheduleId: string; // کلید خارجی به کلاس - به فرمت `${grade}-${classNumber}-${field}`
  
  // اطلاعات زمان
  day: string;
  timeStart: string;
  timeEnd: string;
  
  // اطلاعات درس
  hourType: string;
  teachingGroup: string;
  description: string;
  
  // متادیتا
  timestamp: number;
}

/**
 * مدل برنامه پرسنلی ذخیره شده
 */
export interface SavedPersonnelSchedule {
  personnel: Personnel;
  schedules: Schedule[];
  timestamp: number;
}

/**
 * مدل برنامه کلاسی
 */
export interface ClassSchedule {
  id: string;
  grade: string;
  classNumber: string;
  field: string;
  schedules: Schedule[];
  timestamp: number;
}

/**
 * مدل آمار کلاس
 */
export interface ClassStatistics {
  totalHours: number;
  uniquePersonnel: number;
  dayStats: { 
    [key: string]: { 
      count: number; 
      personnel: string[] 
    } 
  };
  personnelStats: { 
    [key: string]: { 
      count: number; 
      days: string[]; 
      fullName?: string;
      hourKeys?: Set<string>; 
    } 
  };
  subjectStats: { 
    [key: string]: { 
      count: number; 
      personnel: string[];
      hourKeys?: Set<string>;
    } 
  };
}

/**
 * تبدیل اعداد به نسخه فارسی
 */
export const toPersianNumber = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => persianNumbers[+w]);
};

/**
 * توابع کمکی برای ذخیره و بازیابی داده‌ها
 */
export const storageHelpers = {
  // ذخیره برنامه پرسنلی
  savePersonnelSchedule: (personnelSchedule: SavedPersonnelSchedule): void => {
    const storageKey = `personnel_schedule_${personnelSchedule.personnel.id}`;
    localStorage.setItem(storageKey, JSON.stringify(personnelSchedule));
  },
  
  // بازیابی برنامه پرسنلی با آیدی
  getPersonnelSchedule: (personnelId: string): SavedPersonnelSchedule | null => {
    const storageKey = `personnel_schedule_${personnelId}`;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  },
  
  // بازیابی برنامه پرسنلی با کد پرسنلی
  getPersonnelScheduleByCode: (personnelCode: string): SavedPersonnelSchedule | null => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('personnel_schedule_')) {
        const data = localStorage.getItem(key);
        if (data) {
          const schedule: SavedPersonnelSchedule = JSON.parse(data);
          if (schedule.personnel.personnelCode === personnelCode) {
            return schedule;
          }
        }
      }
    }
    return null;
  },
  
  // بازیابی همه برنامه‌های پرسنلی
  getAllPersonnelSchedules: (): SavedPersonnelSchedule[] => {
    const schedules: SavedPersonnelSchedule[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('personnel_schedule_')) {
        const data = localStorage.getItem(key);
        if (data) {
          schedules.push(JSON.parse(data));
        }
      }
    }
    return schedules.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  },
  
  // ذخیره برنامه کلاسی
  saveClassSchedule: (classSchedule: ClassSchedule): void => {
    const classKey = `${classSchedule.grade}-${classSchedule.classNumber}-${classSchedule.field}`;
    const storageKey = `class_schedule_${classKey}`;
    localStorage.setItem(storageKey, JSON.stringify(classSchedule));
  },
  
  // بازیابی برنامه کلاسی
  getClassSchedule: (grade: string, classNumber: string, field: string): ClassSchedule | null => {
    const classKey = `${grade}-${classNumber}-${field}`;
    const storageKey = `class_schedule_${classKey}`;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  },
  
  // بازیابی همه برنامه‌های کلاسی
  getAllClassSchedules: (): ClassSchedule[] => {
    const schedules: ClassSchedule[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('class_schedule_')) {
        const data = localStorage.getItem(key);
        if (data) {
          schedules.push(JSON.parse(data));
        }
      }
    }
    return schedules.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  },
  
  // به‌روزرسانی برنامه کلاسی از برنامه پرسنلی
  updateClassScheduleFromPersonnel: (schedule: Schedule): void => {
    if (!schedule.grade || !schedule.classNumber || !schedule.field) return;
    
    const classKey = `${schedule.grade}-${schedule.classNumber}-${schedule.field}`;
    const storageKey = `class_schedule_${classKey}`;
    
    let classSchedule: ClassSchedule;
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
      classSchedule = JSON.parse(savedData);
    } else {
      classSchedule = {
        id: Date.now().toString(),
        grade: schedule.grade,
        classNumber: schedule.classNumber,
        field: schedule.field,
        schedules: [],
        timestamp: Date.now()
      };
    }
    
    // بررسی تکراری بودن
    const existingIndex = classSchedule.schedules.findIndex(
      s => s.day === schedule.day && s.timeStart === schedule.timeStart
    );
    
    if (existingIndex !== -1) {
      classSchedule.schedules[existingIndex] = schedule;
    } else {
      classSchedule.schedules.push(schedule);
    }
    
    classSchedule.timestamp = Date.now();
    localStorage.setItem(storageKey, JSON.stringify(classSchedule));
  },
  
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
  }
}; 