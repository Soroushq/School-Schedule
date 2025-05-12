/**
 * تایپ‌های مشترک برنامه‌ریزی
 * این تایپ‌ها در تمام مقاطع تحصیلی استفاده می‌شوند
 */

// تایپ اصلی برنامه زمانی
export interface Schedule {
  id: string;
  
  // اطلاعات پرسنل
  personnelId: string;
  personnelCode: string;
  employmentStatus: string;
  mainPosition: string;
  
  // اطلاعات کلاس (این فیلدها در هر مقطع متفاوت تفسیر می‌شوند)
  grade: string;
  classNumber: string;
  field: string;
  classScheduleId: string;
  
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
  source?: 'class' | 'personnel';
}

// تایپ اطلاعات پرسنل
export interface Personnel {
  id: string;
  personnelCode: string;
  fullName: string;
  mainPosition: string;
  employmentStatus: string;
  timestamp?: number;
}

// تایپ برنامه ذخیره شده پرسنل
export interface SavedPersonnelSchedule {
  id: string;
  personnelCode: string;
  fullName: string;
  mainPosition: string;
  employmentStatus: string;
  schedules: Schedule[];
  timestamp: number;
}

// تایپ برنامه ذخیره شده کلاس
export interface ClassSchedule {
  id: string;
  grade: string;
  classNumber: string;
  field: string;
  schedules: Schedule[];
  timestamp: number;
}

// تایپ آمار کلاس
export interface ClassStatistics {
  totalHours: number;
  filledHours: number;
  emptyHours: number;
  personnelCount: number;
}

// تایپ برنامه با نام کامل
export interface ScheduleWithFullName extends Schedule {
  fullName: string;
}

// تایپ تداخل برنامه
export interface ScheduleConflict {
  day: string;
  time: string;
  grade: string;
  classNumber: string;
  field: string;
  personnelNames: string[];
} 