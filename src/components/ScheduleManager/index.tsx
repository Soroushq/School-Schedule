import React from 'react';
import { Schedule, Personnel, ClassSchedule, SavedPersonnelSchedule, toPersianNumber } from '../../data/models';
import { ScheduleDataManager } from '../ScheduleDataManager';

interface ScheduleContextType {
  // برنامه پرسنلی
  personnelSchedules: SavedPersonnelSchedule[];
  selectedPersonnel: Personnel | null;
  loadPersonnelSchedule: (personnelCode: string) => void;
  savePersonnelSchedule: (personnel: Personnel, schedules: Schedule[]) => void;
  
  // برنامه کلاسی
  classSchedules: ClassSchedule[];
  loadClassSchedule: (grade: string, classNumber: string, field: string) => Schedule[];
  saveClassSchedule: (grade: string, classNumber: string, field: string, schedules: Schedule[]) => void;
  
  // عملیات مشترک
  createSchedule: (scheduleData: Partial<Schedule>) => Schedule;
  updateSchedule: (schedule: Schedule) => void;
  deleteSchedule: (schedule: Schedule) => void;
}

// ایجاد کانتکست برای دسترسی به توابع مدیریت برنامه در کل برنامه
export const ScheduleContext = React.createContext<ScheduleContextType | null>(null);

export const useScheduleManager = () => {
  const context = React.useContext(ScheduleContext);
  if (!context) {
    throw new Error('useScheduleManager must be used within a ScheduleProvider');
  }
  return context;
};

interface ScheduleProviderProps {
  children: React.ReactNode;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
  const [personnelSchedules, setPersonnelSchedules] = React.useState<SavedPersonnelSchedule[]>([]);
  const [classSchedules, setClassSchedules] = React.useState<ClassSchedule[]>([]);
  const [selectedPersonnel, setSelectedPersonnel] = React.useState<Personnel | null>(null);
  
  // بارگذاری اولیه داده‌ها
  React.useEffect(() => {
    loadAllData();
  }, []);
  
  // بارگذاری همه داده‌ها
  const loadAllData = () => {
    // بارگذاری همه برنامه‌های پرسنلی
    const allPersonnelSchedules = ScheduleDataManager.loadAllPersonnelSchedules();
    setPersonnelSchedules(allPersonnelSchedules);
    
    // بارگذاری همه برنامه‌های کلاسی
    const allClassSchedules = ScheduleDataManager.loadAllClassSchedules();
    setClassSchedules(allClassSchedules);
  };
  
  // بارگذاری برنامه پرسنلی با کد پرسنلی
  const loadPersonnelSchedule = (personnelCode: string) => {
    const { personnel, schedules } = ScheduleDataManager.loadPersonnelScheduleByCode(personnelCode);
    if (personnel) {
      setSelectedPersonnel(personnel);
      return schedules;
    }
    return [];
  };
  
  // ذخیره برنامه پرسنلی
  const savePersonnelSchedule = (personnel: Personnel, schedules: Schedule[]) => {
    ScheduleDataManager.savePersonnelSchedule(personnel, schedules);
    loadAllData(); // بارگذاری مجدد داده‌ها
  };
  
  // بارگذاری برنامه کلاسی
  const loadClassSchedule = (grade: string, classNumber: string, field: string): Schedule[] => {
    return ScheduleDataManager.loadClassScheduleFromPersonnelData(grade, classNumber, field);
  };
  
  // ذخیره برنامه کلاسی
  const saveClassSchedule = (grade: string, classNumber: string, field: string, schedules: Schedule[]) => {
    ScheduleDataManager.saveClassSchedule(grade, classNumber, field, schedules);
    loadAllData(); // بارگذاری مجدد داده‌ها
  };
  
  // ایجاد برنامه جدید
  const createSchedule = (scheduleData: Partial<Schedule>): Schedule => {
    const id = ScheduleDataManager.generateId();
    return {
      id,
      personnelId: scheduleData.personnelId || '',
      personnelCode: scheduleData.personnelCode || '',
      employmentStatus: scheduleData.employmentStatus || '',
      mainPosition: scheduleData.mainPosition || '',
      grade: scheduleData.grade || '',
      classNumber: scheduleData.classNumber || '',
      field: scheduleData.field || '',
      classScheduleId: scheduleData.classScheduleId || '',
      day: scheduleData.day || '',
      timeStart: scheduleData.timeStart || '',
      timeEnd: scheduleData.timeEnd || '',
      hourType: scheduleData.hourType || '',
      teachingGroup: scheduleData.teachingGroup || '',
      description: scheduleData.description || '',
      timestamp: Date.now()
    };
  };
  
  // به‌روزرسانی برنامه
  const updateSchedule = (schedule: Schedule) => {
    // بررسی اینکه آیا این برنامه متعلق به یک پرسنل است
    if (schedule.personnelId) {
      const personnelSchedule = ScheduleDataManager.getPersonnelSchedule(schedule.personnelId);
      if (personnelSchedule) {
        // به‌روزرسانی برنامه پرسنلی
        const updatedSchedules = personnelSchedule.schedules.map(s => 
          s.id === schedule.id ? schedule : s
        );
        ScheduleDataManager.savePersonnelSchedule(personnelSchedule.personnel, updatedSchedules);
      }
    }
    
    // بررسی اینکه آیا این برنامه متعلق به یک کلاس است
    if (schedule.classScheduleId) {
      const [grade, classNumber, field] = schedule.classScheduleId.split('-');
      const classSchedule = ScheduleDataManager.getClassSchedule(grade, classNumber, field);
      if (classSchedule) {
        // به‌روزرسانی برنامه کلاسی
        const updatedSchedules = classSchedule.schedules.map(s => 
          s.id === schedule.id ? schedule : s
        );
        ScheduleDataManager.saveClassSchedule(grade, classNumber, field, updatedSchedules);
      }
    }
    
    loadAllData(); // بارگذاری مجدد داده‌ها
  };
  
  // حذف برنامه
  const deleteSchedule = (schedule: Schedule) => {
    // حذف از برنامه پرسنلی
    if (schedule.personnelId) {
      ScheduleDataManager.removeFromPersonnelSchedule(schedule.personnelId, schedule.id);
    }
    
    // حذف از برنامه کلاسی
    if (schedule.classScheduleId) {
      const [grade, classNumber, field] = schedule.classScheduleId.split('-');
      ScheduleDataManager.removeFromClassSchedule(grade, classNumber, field, schedule.id);
    }
    
    loadAllData(); // بارگذاری مجدد داده‌ها
  };
  
  const value: ScheduleContextType = {
    personnelSchedules,
    selectedPersonnel,
    loadPersonnelSchedule,
    savePersonnelSchedule,
    
    classSchedules,
    loadClassSchedule,
    saveClassSchedule,
    
    createSchedule,
    updateSchedule,
    deleteSchedule
  };
  
  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}; 