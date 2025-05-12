"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Schedule, SavedPersonnelSchedule, ClassSchedule, Personnel } from '../../common/types/scheduleTypes';
import { ScheduleDataManager } from '../../common/components/ScheduleDataManager';
import { MIDDLE_SCHOOL_GRADES, MIDDLE_SCHOOL_CLASS_OPTIONS, MIDDLE_SCHOOL_FIELDS, MIDDLE_SCHOOL_TEACHING_GROUPS } from '../constants/middleSchoolConstants';

// تایپ داده‌های کانتکست
interface MiddleSchoolScheduleContextType {
  // داده‌ها
  personnelList: Personnel[];
  personnelSchedules: SavedPersonnelSchedule[];
  classSchedules: ClassSchedule[];
  
  // ثابت‌ها
  grades: string[];
  classOptions: Record<string, string[]>;
  fields: string[];
  teachingGroups: string[];
  
  // توابع مدیریت پرسنل
  addPersonnel: (personnel: Omit<Personnel, 'id'>) => Personnel;
  findPersonnelByCode: (personnelCode: string) => Personnel | null;
  searchPersonnelByName: (query: string) => Personnel[];
  
  // توابع مدیریت برنامه پرسنلی
  savePersonnelSchedule: (personnelCode: string, fullName: string, mainPosition: string, employmentStatus: string, schedules: Schedule[]) => void;
  loadPersonnelSchedule: (personnelCode: string) => Schedule[];
  removeFromPersonnelSchedule: (personnelCode: string, scheduleId: string) => void;
  
  // توابع مدیریت برنامه کلاسی
  saveClassSchedule: (grade: string, classNumber: string, field: string, schedules: Schedule[]) => void;
  loadClassSchedule: (grade: string, classNumber: string, field: string) => Schedule[];
  removeFromClassSchedule: (grade: string, classNumber: string, field: string, scheduleId: string) => void;
  
  // توابع کمکی
  createSchedule: (scheduleData: Partial<Schedule>) => Schedule;
  hasClassConflict: (grade: string, classNumber: string, field: string, day: string, timeStart: string) => boolean;
  hasPersonnelConflict: (personnelCode: string, day: string, timeStart: string) => boolean;
  
  // بارگذاری مجدد داده‌ها
  loadAllData: () => void;
}

// ایجاد کانتکست
const MiddleSchoolScheduleContext = createContext<MiddleSchoolScheduleContextType | undefined>(undefined);

// پراپس‌های کامپوننت Provider
interface MiddleSchoolScheduleProviderProps {
  children: React.ReactNode;
}

// کامپوننت Provider
export const MiddleSchoolScheduleProvider: React.FC<MiddleSchoolScheduleProviderProps> = ({ children }) => {
  // استیت‌های داده
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [personnelSchedules, setPersonnelSchedules] = useState<SavedPersonnelSchedule[]>([]);
  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
  
  // بارگذاری همه داده‌ها
  const loadAllData = () => {
    setPersonnelList(ScheduleDataManager.loadPersonnelList());
    setPersonnelSchedules(ScheduleDataManager.loadAllPersonnelSchedules());
    setClassSchedules(ScheduleDataManager.loadAllClassSchedules());
  };
  
  // بارگذاری داده‌ها در ابتدای لود کامپوننت
  useEffect(() => {
    loadAllData();
  }, []);
  
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
  
  // مقدار کانتکست
  const contextValue: MiddleSchoolScheduleContextType = {
    // داده‌ها
    personnelList,
    personnelSchedules,
    classSchedules,
    
    // ثابت‌ها
    grades: MIDDLE_SCHOOL_GRADES,
    classOptions: MIDDLE_SCHOOL_CLASS_OPTIONS,
    fields: MIDDLE_SCHOOL_FIELDS,
    teachingGroups: MIDDLE_SCHOOL_TEACHING_GROUPS,
    
    // توابع مدیریت پرسنل
    addPersonnel: (personnel) => {
      const newPersonnel = ScheduleDataManager.addPersonnel(personnel);
      loadAllData(); // بارگذاری مجدد داده‌ها
      return newPersonnel;
    },
    findPersonnelByCode: ScheduleDataManager.findPersonnelByCode,
    searchPersonnelByName: ScheduleDataManager.searchPersonnelByName,
    
    // توابع مدیریت برنامه پرسنلی
    savePersonnelSchedule: (personnelCode, fullName, mainPosition, employmentStatus, schedules) => {
      ScheduleDataManager.savePersonnelSchedule(personnelCode, fullName, mainPosition, employmentStatus, schedules);
      loadAllData(); // بارگذاری مجدد داده‌ها
    },
    loadPersonnelSchedule: ScheduleDataManager.loadPersonnelSchedule,
    removeFromPersonnelSchedule: (personnelCode, scheduleId) => {
      ScheduleDataManager.removeFromPersonnelSchedule(personnelCode, scheduleId);
      loadAllData(); // بارگذاری مجدد داده‌ها
    },
    
    // توابع مدیریت برنامه کلاسی
    saveClassSchedule: (grade, classNumber, field, schedules) => {
      ScheduleDataManager.saveClassSchedule(grade, classNumber, field, schedules);
      loadAllData(); // بارگذاری مجدد داده‌ها
    },
    loadClassSchedule: ScheduleDataManager.loadClassSchedule,
    removeFromClassSchedule: (grade, classNumber, field, scheduleId) => {
      ScheduleDataManager.removeFromClassSchedule(grade, classNumber, field, scheduleId);
      loadAllData(); // بارگذاری مجدد داده‌ها
    },
    
    // توابع کمکی
    createSchedule,
    hasClassConflict: ScheduleDataManager.hasClassConflict,
    hasPersonnelConflict: ScheduleDataManager.hasPersonnelConflict,
    
    // بارگذاری مجدد داده‌ها
    loadAllData
  };
  
  return (
    <MiddleSchoolScheduleContext.Provider value={contextValue}>
      {children}
    </MiddleSchoolScheduleContext.Provider>
  );
};

// هوک استفاده از کانتکست
export const useMiddleSchoolSchedule = () => {
  const context = useContext(MiddleSchoolScheduleContext);
  if (context === undefined) {
    throw new Error('useMiddleSchoolSchedule must be used within a MiddleSchoolScheduleProvider');
  }
  return context;
}; 