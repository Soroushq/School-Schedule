'use client';

import React, { useState, useRef, useEffect, Suspense, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Modal from '../../../components/Modal/modal';
import Dropdown from '../../../components/Dropdown/dropdown';
import Input from '../../../components/Input/input';
import SubmitButton from '../../../components/SubmitButton/submitbutton';
import styles from '../personnel-schedule.module.css';
import {
  FaDownload, FaPlus, FaSearch, FaSave, FaTimes, FaExclamationTriangle, FaInfoCircle, FaHistory, FaCalendarAlt, FaFileExport, FaTrash, FaSchool, FaEye, FaFileDownload, FaFilePdf
} from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { scheduleSyncService } from '@/services/scheduleSync';
import { syncService } from '@/services/syncService';
import { getScheduleOptions, type EducationLevel } from '@/app/education-levels/types/schedule-options';
import { EducationLevelLoader } from '../../../components/EducationLevelLoader';

interface Schedule {
  id: string;
  grade: string;
  classNumber: string;
  field: string;
  mainPosition: string;
  hourType: string;
  teachingGroup: string;
  description: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  personnelId?: string;
  timestamp?: number;
  // اضافه کردن فیلد برای ارتباط با برنامه کلاسی
  classScheduleId?: string;
  fullName?: string;
  personnelCode?: string;
  employmentStatus?: string;
  source?: 'class' | 'personnel';
  hourNumber?: number; // اضافه کردن فیلد شماره تک ساعت
}

interface SavedSchedule {
  personnel: Personnel;
  schedules: Schedule[];
  timestamp: number;
}

// اضافه کردن رابط برای ذخیره برنامه کلاس
interface ClassSchedule {
  id: string;
  grade: string;
  classNumber: string;
  field: string;
  schedules: Schedule[];
  timestamp: number;
}

interface Personnel {
  id: string;
  personnelCode: string;
  fullName: string;
  mainPosition: string;
  employmentStatus: string;
}

const toPersianNumber = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => persianNumbers[+w]);
};

/* eslint-disable @typescript-eslint/no-unused-vars */
const PersonnelSchedule = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const educationLevel = searchParams?.get('level') as EducationLevel || 'vocational';
  const scheduleOptions = getScheduleOptions(educationLevel);
  const { grades, classOptions, fields, mainPositions, hourTypes, teachingGroups } = scheduleOptions;

  const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
  const hours = ['تک ساعت اول', 'تک ساعت دوم', 'تک ساعت سوم', 'تک ساعت چهارم', 'تک ساعت پنجم', 'تک ساعت ششم', 'تک ساعت هفتم', 'تک ساعت هشتم', 'تک ساعت نهم', 'تک ساعت دهم', 'تک ساعت یازدهم', 'تک ساعت دوازدهم', 'تک ساعت سیزدهم', 'تک ساعت چهاردهم'];
  const timeSlots = ['۸:۰۰', '۹:۰۰', '۱۰:۰۰', '۱۱:۰۰', '۱۲:۰۰', '۱۳:۰۰', '۱۴:۰۰', '۱۵:۰۰', '۱۶:۰۰', '۱۷:۰۰', '۱۸:۰۰', '۱۹:۰۰', '۲۰:۰۰', '۲۱:۰۰'];

  const personnelCodeParam = searchParams?.get('code') || '';
  const fullNameParam = searchParams?.get('name') || '';
  const mainPositionParam = searchParams?.get('position') || '';
  
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [personnelCode, setPersonnelCode] = useState('');
  const [searchError, setSearchError] = useState('');
  const [selectedCell, setSelectedCell] = useState<{day: string, time: string} | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [timeSelectionModalOpen, setTimeSelectionModalOpen] = useState(false);
  const [grade, setGrade] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [field, setField] = useState('');
  const [mainPosition, setMainPosition] = useState('');
  const [hourType, setHourType] = useState('');
  const [teachingGroup, setTeachingGroup] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [draggedItem, setDraggedItem] = useState<Schedule | null>(null);
  const dragStartRef = useRef<{day: string, time: string} | null>(null);
  const [showAddPersonnelModal, setShowAddPersonnelModal] = useState(false);
  const [newPersonnel, setNewPersonnel] = useState<Omit<Personnel, 'id'>>({
    personnelCode: '',
    fullName: '',
    mainPosition: '',
    employmentStatus: 'شاغل'
  });
  const [conflicts, setConflicts] = useState<{
    day: string;
    time: string;
    grade: string;
    classNumber: string;
    field: string;
    personnelNames: string[];
  }[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [addPersonnelError, setAddPersonnelError] = useState('');
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([]);
  const [showCombinedPreview, setShowCombinedPreview] = useState(false);
  const [selectedCellForHistory, setSelectedCellForHistory] = useState<{day: string, time: string} | null>(null);
  const [showCellHistoryMenu, setShowCellHistoryMenu] = useState(false);
  const [cellHistoryPosition, setCellHistoryPosition] = useState({ x: 0, y: 0 });
  const [showCellHistoryModalOpen, setShowCellHistoryModalOpen] = useState(false);
  const [clickedHistoryButton, setClickedHistoryButton] = useState<HTMLElement | null>(null);
  const [menuPositionUpdateCounter, setMenuPositionUpdateCounter] = useState(0);
  const [savedClassSchedules, setSavedClassSchedules] = useState<ClassSchedule[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [showFooter, setShowFooter] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  useEffect(() => {
    if (personnelCodeParam && fullNameParam && mainPositionParam) {
      const newPersonnel = {
        id: uuidv4(),
        personnelCode: personnelCodeParam,
        fullName: fullNameParam,
        mainPosition: mainPositionParam,
        employmentStatus: 'شاغل'
      };
      
      setSelectedPersonnel(newPersonnel);
      
      // بارگذاری برنامه بعد از انتخاب پرسنل
      try {
        const storageKey = `personnel_schedule_${newPersonnel.id}`;
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setSchedule(parsedData.schedules);
        } else {
          setSchedule([]);
        }
      } catch (error) {
        console.error('خطا در بارگیری برنامه:', error);
      }
    }
  }, [personnelCodeParam, fullNameParam, mainPositionParam]);

  useEffect(() => {
    checkScheduleConflicts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, selectedPersonnel]);

  useEffect(() => {
    loadAllSavedSchedules();
    loadAllSavedClassSchedules();
  }, []);

  const handleSearchPersonnel = () => {
    if (!personnelCode.trim()) {
      setSearchError('لطفاً کد پرسنلی را وارد کنید');
      return;
    }

    if (personnelCode.length !== 8) {
      setSearchError('کد پرسنلی باید دقیقاً ۸ کاراکتر باشد');
      return;
    }

    if (!/^\d+$/.test(personnelCode)) {
      setSearchError('کد پرسنلی باید فقط شامل اعداد باشد');
      return;
    }

    setSearchError('');
    
    try {
      let foundPersonnel = false;
      let foundPersonnelData: SavedSchedule | null = null;
      
      const directStorageKey = `personnel_schedule_${personnelCode}`;
      const directData = localStorage.getItem(directStorageKey);
      
      if (directData) {
        try {
          foundPersonnelData = JSON.parse(directData);
          foundPersonnel = true;
        } catch (e) {
          console.error('خطا در تجزیه داده‌های ذخیره شده:', e);
        }
      }
      
      if (!foundPersonnel) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          
          if (key && key.startsWith('personnel_schedule_')) {
            const data = localStorage.getItem(key);
            
            if (data) {
              try {
                const parsedData: SavedSchedule = JSON.parse(data);
                if (parsedData.personnel && parsedData.personnel.personnelCode === personnelCode) {
                  foundPersonnelData = parsedData;
                  foundPersonnel = true;
                  break;
                }
              } catch (e) {
                console.error('خطا در تجزیه داده‌های ذخیره شده:', e);
              }
            }
          }
        }
      }
      
      if (foundPersonnel && foundPersonnelData) {
        setSelectedPersonnel(foundPersonnelData.personnel);
        setSchedule(foundPersonnelData.schedules || []);
        setShowPersonnelModal(false);
      } else {
        const newPersonnel: Personnel = {
          id: Date.now().toString(),
          personnelCode: personnelCode,
          fullName: '',
          mainPosition: '',
          employmentStatus: 'شاغل'
        };
        setSelectedPersonnel(newPersonnel);
        setSchedule([]);
        setShowAddPersonnelModal(true);
      }
    } catch (error) {
      console.error('خطا در بررسی کد پرسنلی:', error);
      const newPersonnel: Personnel = {
        id: Date.now().toString(),
        personnelCode: personnelCode,
        fullName: '',
        mainPosition: '',
        employmentStatus: 'شاغل'
      };
      setSelectedPersonnel(newPersonnel);
      setSchedule([]);
      setShowAddPersonnelModal(true);
    }
  };

  const handlePersonnelSubmit = () => {
    if (!personnelCode.trim()) {
      setSearchError('لطفاً ابتدا کد پرسنلی را وارد کنید');
      return;
    }
    
    try {
      let isUsedByOtherPerson = false;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('personnel_schedule_')) {
          const savedData = localStorage.getItem(key);
          
          if (savedData) {
            try {
              const parsedData: SavedSchedule = JSON.parse(savedData);
              if (parsedData.personnel && parsedData.personnel.personnelCode === personnelCode) {
                isUsedByOtherPerson = true;
                setSelectedPersonnel(parsedData.personnel);
                setSchedule(parsedData.schedules || []);
                setShowPersonnelModal(false);
                return;
              }
            } catch (e) {
              console.error('خطا در تجزیه داده‌های ذخیره شده:', e);
            }
          }
        }
      }
      
      if (!isUsedByOtherPerson) {
        const newPersonnel: Personnel = {
          id: Date.now().toString(),
          personnelCode: personnelCode,
          fullName: '',
          mainPosition: '',
          employmentStatus: 'شاغل'
        };
        setSelectedPersonnel(newPersonnel);
        setSchedule([]);
        setShowAddPersonnelModal(true);
      }
    } catch (error) {
      console.error('خطا در بررسی تکراری بودن کد پرسنلی:', error);
      const newPersonnel: Personnel = {
        id: Date.now().toString(),
        personnelCode: personnelCode,
        fullName: '',
        mainPosition: '',
        employmentStatus: 'شاغل'
      };
      setSelectedPersonnel(newPersonnel);
      setSchedule([]);
      setShowAddPersonnelModal(true);
    }
  };

  const handleAddNewSchedule = () => {
    setTimeSelectionModalOpen(true);
  };

  const handleTimeSelection = (day: string, time: string) => {
    setSelectedCell({ day, time });
    setTimeSelectionModalOpen(false);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (selectedPersonnel && selectedCell && grade && classNumber && field && mainPosition && hourType && teachingGroup) {
      const timeStart = selectedCell.time;
      const timeEndHour = parseInt(timeStart.split(':')[0]) + 1;
      const timeEnd = `${toPersianNumber(timeEndHour)}:۰۰`;
      
      // محاسبه شماره تک ساعت
      const hourIndex = timeSlots.findIndex(t => t === timeStart);
      const hourNumber = hourIndex + 1; // شماره ساعت از 1 شروع می‌شود
      
      // بررسی آیا پرسنل در این زمان خاص برنامه دیگری دارد یا خیر
      const existingSchedulesAtSameTime = schedule.filter(
        item => item.day === selectedCell.day && item.timeStart === timeStart
      );
      
      if (existingSchedulesAtSameTime.length > 0) {
        // پرسنل قبلاً در این زمان برنامه دیگری دارد
        const existingClass = existingSchedulesAtSameTime[0];
        toast.error(
          `این پرسنل قبلاً در ${selectedCell.day} ساعت ${timeStart} در کلاس ${existingClass.grade} ${existingClass.classNumber} ${existingClass.field} برنامه دارد. لطفاً ابتدا از صفحه برنامه پرسنلی، برنامه این پرسنل را ویرایش و خالی کرده و سپس اقدام به اختصاص این بازه زمانی به کلاس دیگری کنید.`,
          { duration: 7000 }
        );
        return;
      }
      
      // بررسی برنامه‌های ذخیره شده پرسنل در سایر کلاس‌ها
      try {
        const storageKey = `personnel_schedule_${selectedPersonnel.id}`;
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          const savedSchedules = parsedData.schedules || [];
          
          const conflictingSchedules = savedSchedules.filter(
            (item: Schedule) => item.day === selectedCell.day && item.timeStart === timeStart
          );
          
          if (conflictingSchedules.length > 0) {
            const conflictClass = conflictingSchedules[0];
            toast.error(
              `این پرسنل قبلاً در ${selectedCell.day} ساعت ${timeStart} در کلاس ${conflictClass.grade} ${conflictClass.classNumber} ${conflictClass.field} برنامه دارد. لطفاً ابتدا از صفحه برنامه پرسنلی، برنامه این پرسنل را ویرایش و خالی کرده و سپس اقدام به اختصاص این بازه زمانی به کلاس دیگری کنید.`,
              { duration: 7000 }
            );
            return;
          }
        }
      } catch (error) {
        console.error('خطا در بررسی تداخل با برنامه‌های ذخیره شده:', error);
      }
      
      const newScheduleId = uuidv4();
      
      const newScheduleItem: Schedule = {
        id: newScheduleId,
        grade,
        classNumber,
        field,
        mainPosition,
        hourType,
        teachingGroup,
        description,
        day: selectedCell.day,
        timeStart,
        timeEnd,
        hourNumber, // افزودن شماره تک ساعت
        personnelId: selectedPersonnel.id,
        timestamp: Date.now()
      };
      
      // افزودن برنامه به state برنامه پرسنلی
      setSchedule([...schedule, newScheduleItem]);
      
      // همگام‌سازی با برنامه کلاسی
      syncService.syncFromPersonnelToClass(
        selectedPersonnel.personnelCode,
        selectedPersonnel.fullName,
        selectedPersonnel.mainPosition,
        selectedPersonnel.employmentStatus,
        selectedCell.day,
        timeStart,
        timeEnd,
        grade,
        classNumber,
        field,
        hourType,
        teachingGroup,
        description,
        newScheduleId,
        selectedPersonnel.id,
        hourNumber // ارسال شماره تک ساعت
      );
      
      // به‌روزرسانی یا ایجاد برنامه کلاسی
      updateClassSchedule(newScheduleItem);
      
      setModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedCell(null);
    setGrade('');
    setClassNumber('');
    setField('');
    setMainPosition('');
    setHourType('');
    setTeachingGroup('');
    setDescription('');
  };

  const getScheduleForCell = (day: string, time: string) => {
    // بارگرداندن تمام برنامه‌های مربوط به روز و ساعت مشخص شده
    let schedules = schedule.filter(item => item.day === day && item.timeStart === time);
    
    // بررسی آیا در برنامه‌های ذخیره شده نیز برنامه‌ای وجود دارد
    if (selectedPersonnel) {
      try {
        const storageKey = `personnel_schedule_${selectedPersonnel.id}`;
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          const savedSchedules = parsedData.schedules || [];
          
          // پیدا کردن برنامه‌های ذخیره شده مطابق با روز و ساعت
          const additionalSchedules = savedSchedules.filter(
            (item: Schedule) => 
              item.day === day && 
              item.timeStart === time &&
              // فقط برنامه‌هایی که در لیست فعلی نیستند را اضافه کنیم
              !schedules.some(s => s.id === item.id)
          );
          
          // اضافه کردن برنامه‌های یافت شده به لیست
          if (additionalSchedules.length > 0) {
            schedules = [...schedules, ...additionalSchedules];
          }
        }
      } catch (error) {
        console.error('خطا در بازیابی برنامه‌های ذخیره شده:', error);
      }
    }
    
    return schedules;
  };

  const handleDragStart = (e: React.DragEvent, schedule: Schedule, day: string, time: string) => {
    setDraggedItem(schedule);
    dragStartRef.current = { day, time };
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, targetDay: string, targetTime: string) => {
    e.preventDefault();
    
    if (draggedItem && selectedPersonnel) {
      // بررسی آیا پرسنل در این زمان خاص برنامه دیگری دارد یا خیر
      const existingSchedulesAtSameTime = schedule.filter(
        item => item.day === targetDay && item.timeStart === targetTime
      );
      
      if (existingSchedulesAtSameTime.length > 0) {
        // پرسنل قبلاً در این زمان برنامه دیگری دارد
        const existingClass = existingSchedulesAtSameTime[0];
        toast.error(
          `این پرسنل قبلاً در ${targetDay} ساعت ${targetTime} در کلاس ${existingClass.grade} ${existingClass.classNumber} ${existingClass.field} برنامه دارد. لطفاً ابتدا از صفحه برنامه پرسنلی، برنامه این پرسنل را ویرایش و خالی کرده و سپس اقدام به انتقال برنامه به این بازه زمانی کنید.`,
          { duration: 7000 }
        );
        setDraggedItem(null);
        return;
      }
      
      // بررسی برنامه‌های ذخیره شده پرسنل در سایر کلاس‌ها
      try {
        const storageKey = `personnel_schedule_${selectedPersonnel.id}`;
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          const savedSchedules = parsedData.schedules || [];
          
          const conflictingSchedules = savedSchedules.filter(
            (item: Schedule) => 
              item.day === targetDay && 
              item.timeStart === targetTime && 
              // اطمینان حاصل کنیم که برنامه در حال حرکت را دوباره بررسی نمی‌کنیم
              item.id !== draggedItem.id
          );
          
          if (conflictingSchedules.length > 0) {
            const conflictClass = conflictingSchedules[0];
            toast.error(
              `این پرسنل قبلاً در ${targetDay} ساعت ${targetTime} در کلاس ${conflictClass.grade} ${conflictClass.classNumber} ${conflictClass.field} برنامه دارد که در صفحه فعلی نمایش داده نشده است. لطفاً ابتدا از صفحه برنامه پرسنلی، برنامه این پرسنل را ویرایش و خالی کرده و سپس اقدام به انتقال برنامه به این بازه زمانی کنید.`,
              { duration: 7000 }
            );
            setDraggedItem(null);
            return;
          }
        }
      } catch (error) {
        console.error('خطا در بررسی تداخل با برنامه‌های ذخیره شده:', error);
      }
      
      const updatedItem = {
        ...draggedItem,
        id: Date.now().toString(),
        day: targetDay,
        timeStart: targetTime,
        timeEnd: `${toPersianNumber(parseInt(targetTime.split(':')[0]) + 1)}:۰۰`,
        personnelId: selectedPersonnel?.id
      };
      
      setSchedule([...schedule, updatedItem]);
      setDraggedItem(null);
    }
  };

  const handleDeleteSchedule = async (id?: string) => {
    try {
      if (id) {
        // حذف برنامه خاص
        const scheduleToDelete = schedule.find(item => item.id === id);
        if (scheduleToDelete) {
          // حذف از برنامه پرسنلی
          setSchedule(schedule.filter(item => item.id !== id));
          
          // حذف از برنامه کلاسی مرتبط
          removeFromClassSchedule(scheduleToDelete);
          
          // ذخیره تغییرات در localStorage
          if (selectedPersonnel?.id) {
            const storageKey = `personnel_schedule_${selectedPersonnel.id}`;
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
              const parsedData = JSON.parse(savedData);
              if (parsedData.schedules && Array.isArray(parsedData.schedules)) {
                parsedData.schedules = parsedData.schedules.filter((s: {id: string}) => s.id !== id);
                parsedData.timestamp = Date.now();
                localStorage.setItem(storageKey, JSON.stringify(parsedData));
              }
            }
          }
          
          toast.success('برنامه با موفقیت حذف شد');
        }
      } else {
        // حذف همه برنامه‌ها
        syncService.clearAllSchedules();
        setSchedule([]);
        toast.success('تمام برنامه‌ها با موفقیت حذف شدند');
      }
    } catch (error) {
      console.error('خطا در حذف برنامه:', error);
      toast.error('خطا در حذف برنامه');
    }
  };

  const calculateTotalHours = () => {
    const uniqueHours = new Set<string>();
    
    schedule.forEach(item => {
      const hourKey = `${item.day}-${item.timeStart}`;
      uniqueHours.add(hourKey);
    });
    
    return uniqueHours.size;
  };

  const groupSimilarSchedules = (daySchedules: Schedule[]) => {
    const groups: { [key: string]: Schedule[] } = {};
    
    daySchedules.forEach(schedule => {
      const key = `${schedule.grade}-${schedule.classNumber}-${schedule.field}-${schedule.mainPosition}-${schedule.hourType}-${schedule.teachingGroup}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(schedule);
    });
    
    return Object.values(groups).map(groupItems => {
      const hourNumbers = groupItems.map(item => {
        const hourIndex = hours.findIndex(hour => {
          const hourTimeSlot = timeSlots[hours.indexOf(hour)];
          return hourTimeSlot === item.timeStart;
        });
        
        return hourIndex !== -1 ? hourIndex + 1 : -1;
      }).filter(index => index !== -1).sort((a, b) => a - b);
      
      return {
        id: groupItems[0].id,
        grade: groupItems[0].grade,
        classNumber: groupItems[0].classNumber,
        field: groupItems[0].field,
        mainPosition: groupItems[0].mainPosition,
        hourType: groupItems[0].hourType,
        teachingGroup: groupItems[0].teachingGroup,
        description: groupItems[0].description,
        hourNumbers: hourNumbers
      };
    });
  };

  const getDayScheduleHours = (day: string) => {
    const daySchedules = schedule.filter(item => item.day === day);
    
    if (daySchedules.length === 0) return [];
    
    const hourIndexes = daySchedules.map(item => {
      return timeSlots.findIndex(slot => slot === item.timeStart);
    }).filter(index => index !== -1);
    
    return [...new Set(hourIndexes)].sort((a, b) => a - b);
  };

  const formatHourNumbers = (hourNumbers: number[]) => {
    if (!hourNumbers || hourNumbers.length === 0) return "هیچ تک‌ساعتی";
    
    if (hourNumbers.length === 1) {
      return `تک ساعت ${toPersianNumber(hourNumbers[0])}م`;
    }
    
    const sortedHours = [...hourNumbers].sort((a, b) => a - b);
    
    const ranges: {start: number, end: number}[] = [];
    let currentRange = { start: sortedHours[0], end: sortedHours[0] };
    
    for (let i = 1; i < sortedHours.length; i++) {
      if (sortedHours[i] === currentRange.end + 1) {
        currentRange.end = sortedHours[i];
      } else {
        ranges.push({...currentRange});
        currentRange = { start: sortedHours[i], end: sortedHours[i] };
      }
    }
    ranges.push(currentRange);
    
    return ranges.map(range => {
      if (range.start === range.end) {
        return `تک ساعت ${toPersianNumber(range.start)}م`;
      } else {
        return `تک ساعت ${toPersianNumber(range.start)}م تا ${toPersianNumber(range.end)}م`;
      }
    }).join('، ');
  };

  const checkScheduleConflicts = useCallback(() => {
    const groupedByTimeAndClass: Record<string, { items: Schedule[], personnelIds: string[] }> = {};
    
    schedule.forEach(item => {
      const key = `${item.day}-${item.timeStart}-${item.grade}-${item.classNumber}-${item.field}`;
      
      if (!groupedByTimeAndClass[key]) {
        groupedByTimeAndClass[key] = {
          items: [],
          personnelIds: []
        };
      }
      
      groupedByTimeAndClass[key].items.push(item);
      if (item.personnelId && !groupedByTimeAndClass[key].personnelIds.includes(item.personnelId)) {
        groupedByTimeAndClass[key].personnelIds.push(item.personnelId);
      }
    });
    
    const newConflicts = Object.entries(groupedByTimeAndClass)
      .filter(([, group]) => group.personnelIds.length > 1)
      .map(([key, group]) => {
        const [day, time, grade, classNumber, field] = key.split('-');
        
        const personnelNames = group.personnelIds.map(id => {
          return selectedPersonnel?.id === id 
            ? selectedPersonnel.fullName 
            : 'پرسنل نامشخص';
        });
        
        return {
          day,
          time,
          grade,
          classNumber,
          field,
          personnelNames
        };
      });
      
    setConflicts(newConflicts);
    if (newConflicts.length > 0 && !showConflictWarning) {
      setShowConflictWarning(true);
    } else if (newConflicts.length === 0 && showConflictWarning) {
      setShowConflictWarning(false);
    }
  }, [schedule, selectedPersonnel, showConflictWarning]);

  const saveScheduleToLocalStorage = () => {
    if (!selectedPersonnel) return;
    
    // بررسی تداخل‌های زمانی در برنامه‌های فعلی
    const timeConflicts: {day: string, time: string}[] = [];
    const scheduleByTime: Record<string, Schedule[]> = {};
    
    // گروه‌بندی برنامه‌ها بر اساس روز و زمان
    schedule.forEach(item => {
      const key = `${item.day}-${item.timeStart}`;
      if (!scheduleByTime[key]) {
        scheduleByTime[key] = [];
      }
      scheduleByTime[key].push(item);
    });
    
    // بررسی تداخل‌ها
    Object.entries(scheduleByTime).forEach(([key, items]) => {
      if (items.length > 1) {
        const [day, time] = key.split('-');
        timeConflicts.push({day, time});
      }
    });
    
    if (timeConflicts.length > 0) {
      const conflictDetails = timeConflicts.map(conflict => 
        `${conflict.day} ساعت ${conflict.time}`
      ).join('، ');
      
      if (!window.confirm(
        `تداخل زمانی در برنامه این پرسنل وجود دارد. در زمان‌های (${conflictDetails}) برنامه‌های متعددی ثبت شده است. آیا مطمئن هستید که می‌خواهید برنامه را با این تداخل‌ها ذخیره کنید؟`
      )) {
        return;
      }
    }
    
    const savedSchedule: SavedSchedule = {
      personnel: selectedPersonnel,
      schedules: schedule.map(item => ({
        ...item,
        personnelId: selectedPersonnel.id
      })),
      timestamp: Date.now()
    };
    
    try {
      const storageKey = `personnel_schedule_${selectedPersonnel.id}`;
      localStorage.setItem(storageKey, JSON.stringify(savedSchedule));
      
      // همگام‌سازی با برنامه‌های کلاسی - ایجاد یا بروزرسانی همه برنامه‌ها در جدول کلاسی
      schedule.forEach(item => {
        if (item.grade && item.classNumber && item.field) {
          syncService.syncFromPersonnelToClass(
            selectedPersonnel.personnelCode,
            selectedPersonnel.fullName,
            selectedPersonnel.mainPosition,
            selectedPersonnel.employmentStatus,
            item.day,
            item.timeStart,
            item.timeEnd,
            item.grade,
            item.classNumber,
            item.field,
            item.hourType,
            item.teachingGroup,
            item.description,
            item.id,
            selectedPersonnel.id
          );
        }
      });
      
      // به‌روزرسانی برنامه‌های کلاسی مرتبط
      updateAllClassSchedules(savedSchedule.schedules);
      
      loadAllSavedSchedules();
      
      toast.success('برنامه با موفقیت ذخیره شد');
    } catch (error) {
      console.error('خطا در ذخیره‌سازی برنامه:', error);
      toast.error('خطا در ذخیره‌سازی برنامه. لطفاً دوباره تلاش کنید.');
    }
  };

  const loadScheduleFromLocalStorage = useCallback((personnelId?: string) => {
    try {
      if (selectedPersonnel) {
        const id = personnelId || selectedPersonnel.id;
        const savedSchedule = scheduleSyncService.getPersonnelScheduleById(id);
        
        if (savedSchedule) {
          // تبدیل نوع داده‌ها به تایپ‌های مورد نیاز داخلی
          const convertedSchedules = savedSchedule.schedules.map(s => ({
            id: s.id,
            grade: s.grade || '',
            classNumber: s.classNumber || '',
            field: s.field || '',
            mainPosition: s.mainPosition || '',
            hourType: s.hourType,
            teachingGroup: s.teachingGroup,
            description: s.description,
            day: s.day,
            timeStart: s.timeStart,
            timeEnd: s.timeEnd,
            personnelId: s.personnelId,
            timestamp: s.timestamp,
            classScheduleId: s.classScheduleId,
            fullName: s.fullName,
            personnelCode: s.personnelCode,
            employmentStatus: s.employmentStatus,
            source: s.source
          }));
          
          setSchedule(convertedSchedules);
        } else {
          setSchedule([]);
        }
      }
    } catch (error) {
      console.error('خطا در بارگیری برنامه:', error);
    }
  }, [selectedPersonnel]);

  const loadAllSavedSchedules = () => {
    try {
      const allSchedules = scheduleSyncService.getAllPersonnelSchedules();
      
      // تبدیل به نوع داده‌های داخلی
      const convertedSchedules: SavedSchedule[] = allSchedules.map(s => ({
        personnel: s.personnel,
        schedules: s.schedules.map(sch => ({
          id: sch.id,
          grade: sch.grade || '',
          classNumber: sch.classNumber || '',
          field: sch.field || '',
          mainPosition: sch.mainPosition || '',
          hourType: sch.hourType,
          teachingGroup: sch.teachingGroup,
          description: sch.description,
          day: sch.day,
          timeStart: sch.timeStart,
          timeEnd: sch.timeEnd,
          personnelId: sch.personnelId,
          timestamp: sch.timestamp,
          classScheduleId: sch.classScheduleId,
          fullName: sch.fullName,
          personnelCode: sch.personnelCode,
          employmentStatus: sch.employmentStatus,
          source: sch.source
        })),
        timestamp: s.timestamp
      }));
      
      setSavedSchedules(convertedSchedules);
    } catch (error) {
      console.error('خطا در بارگیری همه برنامه‌ها:', error);
    }
  };

  const exportToExcel = () => {
    setShowCombinedPreview(true);
  };
  
  const handleAddPersonnel = () => {
    if (!newPersonnel.fullName.trim() || !newPersonnel.mainPosition.trim()) {
      setAddPersonnelError('لطفاً تمام فیلدهای الزامی را پر کنید');
      return;
    }
    
    const personnelCodeToUse = personnelCode || newPersonnel.personnelCode;
    if (!personnelCodeToUse) {
      setAddPersonnelError('کد پرسنلی مشخص نشده است');
      return;
    }

    // اعتبارسنجی کد پرسنلی: فقط عدد و دقیقاً ۸ رقم
    if (personnelCodeToUse.length !== 8) {
      setAddPersonnelError('کد پرسنلی باید دقیقاً ۸ کاراکتر باشد');
      return;
    }

    if (!/^\d+$/.test(personnelCodeToUse)) {
      setAddPersonnelError('کد پرسنلی باید فقط شامل اعداد باشد');
      return;
    }
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key !== `personnel_schedule_${personnelCodeToUse}` && key.startsWith('personnel_schedule_')) {
          const savedData = localStorage.getItem(key);
          
          if (savedData) {
            const parsedData: SavedSchedule = JSON.parse(savedData);
            if (parsedData.personnel.personnelCode === personnelCodeToUse) {
              setAddPersonnelError('این کد پرسنلی قبلاً برای کاربر دیگری ثبت شده است');
              return;
            }
          }
        }
      }
    } catch (error) {
      console.error('خطا در بررسی تکراری بودن کد پرسنلی:', error);
    }
    
    const newPersonnelWithId: Personnel = {
      ...newPersonnel,
      personnelCode: personnelCodeToUse,
      id: Date.now().toString()
    };
    
    setSelectedPersonnel(newPersonnelWithId);
    setSchedule([]);
    setShowAddPersonnelModal(false);
    setShowPersonnelModal(false);
    setNewPersonnel({
      personnelCode: '',
      fullName: '',
      mainPosition: '',
      employmentStatus: 'شاغل'
    });
    setAddPersonnelError('');
  };

  const getAllSavedSchedulesForCell = (day: string, time: string) => {
    const cellSchedules: {
      id: string;
      personnel: Personnel;
      grade: string;
      classNumber: string;
      field: string;
      mainPosition: string;
      hourType: string;
      teachingGroup: string;
      description: string;
    }[] = [];
    
    savedSchedules.forEach(savedSchedule => {
      const items = savedSchedule.schedules.filter(item => 
        item.day === day && item.timeStart === time
      );
      
      items.forEach(item => {
        cellSchedules.push({
          id: `${item.id}-${savedSchedule.personnel.id}`,
          personnel: savedSchedule.personnel,
          grade: item.grade,
          classNumber: item.classNumber,
          field: item.field,
          mainPosition: item.mainPosition,
          hourType: item.hourType,
          teachingGroup: item.teachingGroup,
          description: item.description
        });
      });
    });
    
    return cellSchedules;
  };

  const handleShowCellHistory = (day: string, time: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cellHistory = getAllSavedSchedulesForCell(day, time);
    if (cellHistory.length > 0) {
      const button = e.currentTarget as HTMLElement;
      
      // ذخیره عنصر کلیک شده برای محاسبه موقعیت دقیق
      setClickedHistoryButton(button);
      
      // ذخیره موقعیت روز و ساعت
      setSelectedCellForHistory({ day, time });
      setShowCellHistoryMenu(true);
    }
  };

  // محاسبه موقعیت منو بر اساس موقعیت آیکون در هر رندر
  const calculateMenuPosition = useCallback(() => {
    if (!clickedHistoryButton) return { left: 0, top: 0, position: 'right' };

    const rect = clickedHistoryButton.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 250; // عرض تقریبی منو
    const menuHeight = 300; // ارتفاع تقریبی منو
    
    let left = 0;
    let top = 0;
    let position = 'right';
    
    // بررسی موقعیت افقی - ترجیحاً سمت راست آیکون
    if (rect.right + menuWidth < viewportWidth) {
      // فضای کافی در سمت راست داریم
      left = rect.right;
      position = 'right';
    } else if (rect.left - menuWidth > 0) {
      // فضای کافی در سمت چپ داریم
      left = rect.left - menuWidth;
      position = 'left';
    } else {
      // در هر دو حالت فضای کافی نداریم، منو را به مرکز آیکون میبریم
      left = Math.max(5, Math.min(viewportWidth - menuWidth - 5, rect.left + (rect.width / 2) - (menuWidth / 2)));
      position = 'center';
    }
    
    // بررسی موقعیت عمودی - ترجیحاً زیر آیکون
    if (rect.bottom + menuHeight < viewportHeight) {
      // فضای کافی در پایین داریم
      top = rect.bottom;
    } else if (rect.top - menuHeight > 0) {
      // فضای کافی در بالا داریم
      top = rect.top - menuHeight;
    } else {
      // در هر دو حالت فضای کافی نداریم، منو را در وسط صفحه قرار می‌دهیم
      top = Math.max(5, Math.min(viewportHeight - menuHeight - 5, viewportHeight / 2 - menuHeight / 2));
    }
    
    return { left, top, position };
}, [clickedHistoryButton]);

  // تنظیم مجدد منو در هنگام resize شدن صفحه
  useEffect(() => {
    if (!showCellHistoryMenu) return;
    
    const handleResize = () => {
      // در صورت تغییر اندازه صفحه، موقعیت منو را محاسبه می‌کنیم
      forceMenuPositionUpdate();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [showCellHistoryMenu]);

  // استفاده از useState برای اعمال تغییرات اجباری در موقعیت منو
  const forceMenuPositionUpdate = () => setMenuPositionUpdateCounter(prev => prev + 1);

  // محاسبه موقعیت فعلی منو
  const menuPosition = useMemo(() => {
    return calculateMenuPosition();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculateMenuPosition, menuPositionUpdateCounter]);

  const handleChangePersonnel = (personnel: Personnel) => {
    setSelectedPersonnel(personnel);
    
    // بارگذاری برنامه‌های پرسنل از localStorage
    try {
      const storageKey = `personnel_schedule_${personnel.id}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData: SavedSchedule = JSON.parse(savedData);
        setSchedule(parsedData.schedules || []);
      } else {
        setSchedule([]);
      }
    } catch (error) {
      console.error('خطا در بارگذاری برنامه پرسنل:', error);
      setSchedule([]);
    }
  };

  const getScheduleByDay = () => {
    const scheduleByDay: Record<string, Schedule[]> = {};
    
    days.forEach(day => {
      scheduleByDay[day] = schedule.filter(item => item.day === day);
    });
    
    return scheduleByDay;
  };

  const getScheduleByClass = () => {
    const scheduleByClass: Record<string, Schedule[]> = {};
    
    schedule.forEach(item => {
      const key = `${item.grade}-${item.classNumber}-${item.field}`;
      if (!scheduleByClass[key]) {
        scheduleByClass[key] = [];
      }
      scheduleByClass[key].push(item);
    });
    
    return scheduleByClass;
  };

  const getDayHoursSummary = (day: string) => {
    const daySchedules = schedule.filter(item => item.day === day);
    if (daySchedules.length === 0) return null;
    
    const hourIndices = daySchedules.map(item => {
      return timeSlots.findIndex(time => time === item.timeStart);
    }).filter(index => index !== -1);
    
    const hoursByClass: Record<string, number[]> = {};
    daySchedules.forEach(item => {
      const key = `${item.grade} ${item.classNumber} ${item.field}`;
      if (!hoursByClass[key]) {
        hoursByClass[key] = [];
      }
      
      const hourIndex = timeSlots.findIndex(time => time === item.timeStart);
      if (hourIndex !== -1) {
        hoursByClass[key].push(hourIndex + 1);
      }
    });
    
    return Object.entries(hoursByClass).map(([className, hourIndices]) => {
      return {
        className,
        hours: formatHourNumbers(hourIndices)
      };
    });
  };

  // اضافه کردن یک Event Listener برای بستن منو در صورت کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCellHistoryMenu && event.target && !(event.target as HTMLElement).closest('.cell-history-container')) {
        setShowCellHistoryMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCellHistoryMenu]);

  // تابع برای به‌روزرسانی برنامه کلاسی
  const updateClassSchedule = (newSchedule: Schedule) => {
    try {
      // کلید برنامه کلاسی را با استفاده از پایه، شماره کلاس و رشته ایجاد می‌کنیم
      const classKey = `${newSchedule.grade}-${newSchedule.classNumber}-${newSchedule.field}`;
      const storageKey = `class_schedule_${classKey}`;
      
      // بررسی می‌کنیم آیا قبلاً برنامه‌ای برای این کلاس ذخیره شده است یا نه
      let classSchedule: ClassSchedule | null = null;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        // اگر برنامه‌ای موجود بود، آن را بارگیری می‌کنیم
        classSchedule = JSON.parse(savedData);
      } else {
        // اگر برنامه‌ای موجود نبود، یک برنامه جدید ایجاد می‌کنیم
        classSchedule = {
          id: Date.now().toString(),
          grade: newSchedule.grade,
          classNumber: newSchedule.classNumber,
          field: newSchedule.field,
          schedules: [],
          timestamp: Date.now()
        };
      }
      
      if (classSchedule) {
        // بررسی می‌کنیم آیا این برنامه قبلاً اضافه شده است یا نه
        const existingScheduleIndex = classSchedule.schedules.findIndex(
          s => s.day === newSchedule.day && s.timeStart === newSchedule.timeStart
        );
        
        // آماده کردن برنامه برای اضافه شدن به برنامه کلاسی
        const classScheduleItem = {
          id: newSchedule.id,
          personnelCode: selectedPersonnel?.personnelCode || '',
          employmentStatus: selectedPersonnel?.employmentStatus || '',
          mainPosition: newSchedule.mainPosition,
          hourType: newSchedule.hourType,
          teachingGroup: newSchedule.teachingGroup,
          description: newSchedule.description,
          day: newSchedule.day,
          timeStart: newSchedule.timeStart,
          timeEnd: newSchedule.timeEnd,
          grade: newSchedule.grade,
          classNumber: newSchedule.classNumber,
          field: newSchedule.field,
          timestamp: Date.now()
        };
        
        if (existingScheduleIndex !== -1) {
          // اگر برنامه موجود بود، آن را به‌روزرسانی می‌کنیم
          classSchedule.schedules[existingScheduleIndex] = classScheduleItem;
        } else {
          // اگر برنامه موجود نبود، آن را اضافه می‌کنیم
          classSchedule.schedules.push(classScheduleItem);
        }
        
        // برنامه به‌روزرسانی شده را ذخیره می‌کنیم
        classSchedule.timestamp = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(classSchedule));
      }
      
      // برنامه‌های کلاسی را مجدداً بارگیری می‌کنیم
      loadAllSavedClassSchedules();
      
    } catch (error) {
      console.error('خطا در به‌روزرسانی برنامه کلاسی:', error);
    }
  };

  // تابع برای حذف برنامه از برنامه کلاسی
  const removeFromClassSchedule = (scheduleToRemove: Schedule) => {
    try {
      if (!scheduleToRemove.grade || !scheduleToRemove.classNumber || !scheduleToRemove.field) {
        console.warn('اطلاعات کلاس برای حذف ناقص است');
        return;
      }
      
      // کلید برنامه کلاسی را با استفاده از پایه، شماره کلاس و رشته ایجاد می‌کنیم
      const classKey = `${scheduleToRemove.grade}-${scheduleToRemove.classNumber}-${scheduleToRemove.field}`;
      const storageKey = `class_schedule_${classKey}`;
      
      // بررسی می‌کنیم آیا برنامه‌ای برای این کلاس ذخیره شده است یا نه
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        // اگر برنامه‌ای موجود بود، آن را بارگیری می‌کنیم
        const classSchedule: ClassSchedule = JSON.parse(savedData);
        
        // برنامه مورد نظر را با استفاده از ID حذف می‌کنیم
        if (scheduleToRemove.id) {
          classSchedule.schedules = classSchedule.schedules.filter(s => s.id !== scheduleToRemove.id);
        } else {
          // اگر ID وجود نداشت، از روز و ساعت استفاده می‌کنیم
          classSchedule.schedules = classSchedule.schedules.filter(
            s => !(s.day === scheduleToRemove.day && s.timeStart === scheduleToRemove.timeStart)
          );
        }
        
        // برنامه به‌روزرسانی شده را ذخیره می‌کنیم
        classSchedule.timestamp = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(classSchedule));
        
        // حذف از سرویس همگام‌سازی
        if (scheduleToRemove.id) {
          syncService.deleteFromBoth(
            scheduleToRemove.id,
            scheduleToRemove.day,
            scheduleToRemove.timeStart,
            scheduleToRemove.timeEnd,
            scheduleToRemove.grade,
            scheduleToRemove.classNumber,
            scheduleToRemove.field,
            selectedPersonnel?.id
          );
        }
        
        // برنامه‌های کلاسی را مجدداً بارگیری می‌کنیم
        loadAllSavedClassSchedules();
      }
    } catch (error) {
      console.error('خطا در حذف برنامه از برنامه کلاسی:', error);
    }
  };

  // تابع برای به‌روزرسانی همه برنامه‌های کلاسی
  const updateAllClassSchedules = (schedules: Schedule[]) => {
    try {
      // برنامه‌ها را بر اساس کلاس گروه‌بندی می‌کنیم
      const schedulesByClass: Record<string, Schedule[]> = {};
      
      schedules.forEach(schedule => {
        if (!schedule.grade || !schedule.classNumber || !schedule.field) {
          console.warn('اطلاعات کلاس ناقص است:', schedule);
          return;
        }
        
        const classKey = `${schedule.grade}-${schedule.classNumber}-${schedule.field}`;
        if (!schedulesByClass[classKey]) {
          schedulesByClass[classKey] = [];
        }
        schedulesByClass[classKey].push(schedule);
      });
      
      // هر گروه را به‌روزرسانی می‌کنیم
      Object.entries(schedulesByClass).forEach(([classKey, classSchedules]) => {
        const storageKey = `class_schedule_${classKey}`;
        
        // بررسی می‌کنیم آیا برنامه‌ای برای این کلاس ذخیره شده است یا نه
        let classSchedule: ClassSchedule;
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
          // اگر برنامه‌ای موجود بود، آن را بارگیری می‌کنیم
          classSchedule = JSON.parse(savedData);
        } else {
          // اگر برنامه‌ای موجود نبود، یک برنامه جدید ایجاد می‌کنیم
          const [grade, classNumber, field] = classKey.split('-');
          classSchedule = {
            id: Date.now().toString(),
            grade,
            classNumber,
            field,
            schedules: [],
            timestamp: Date.now()
          };
        }
        
        // برنامه‌های کلاسی را با برنامه‌های پرسنلی مطابقت می‌دهیم
        classSchedules.forEach(schedule => {
          const existingScheduleIndex = classSchedule.schedules.findIndex(
            s => s.day === schedule.day && s.timeStart === schedule.timeStart
          );
          
          // آماده کردن برنامه برای اضافه شدن به برنامه کلاسی
          const classScheduleItem = {
            id: schedule.id,
            personnelCode: selectedPersonnel?.personnelCode || '',
            employmentStatus: selectedPersonnel?.employmentStatus || '',
            mainPosition: schedule.mainPosition,
            hourType: schedule.hourType,
            teachingGroup: schedule.teachingGroup,
            description: schedule.description,
            day: schedule.day,
            timeStart: schedule.timeStart,
            timeEnd: schedule.timeEnd,
            grade: schedule.grade,
            classNumber: schedule.classNumber,
            field: schedule.field,
            timestamp: Date.now()
          };
          
          if (existingScheduleIndex !== -1) {
            // اگر برنامه موجود بود، آن را به‌روزرسانی می‌کنیم
            classSchedule.schedules[existingScheduleIndex] = classScheduleItem;
          } else {
            // اگر برنامه موجود نبود، آن را اضافه می‌کنیم
            classSchedule.schedules.push(classScheduleItem);
          }
        });
        
        // برنامه به‌روزرسانی شده را ذخیره می‌کنیم
        classSchedule.timestamp = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(classSchedule));
      });
      
      // برنامه‌های کلاسی را مجدداً بارگیری می‌کنیم
      loadAllSavedClassSchedules();
      
    } catch (error) {
      console.error('خطا در به‌روزرسانی برنامه‌های کلاسی:', error);
    }
  };

  // تابع برای انتقال به برنامه کلاسی
  const navigateToClassSchedule = (grade: string, classNumber: string, field: string) => {
    // ایجاد پارامترهای URL برای صفحه کلاس
    const url = `/class-schedule/schedule?grade=${encodeURIComponent(grade)}&class=${encodeURIComponent(classNumber)}&field=${encodeURIComponent(field)}`;
    
    // بررسی آیا برنامه‌های پرسنلی فعلی مربوط به این کلاس هستند
    if (selectedPersonnel) {
      const classRelatedSchedules = schedule.filter(s => 
        s.grade === grade && 
        s.classNumber === classNumber && 
        s.field === field
      );
      
      // اگر برنامه‌های مرتبط وجود دارند، ذخیره‌سازی آنها را بررسی کنید
      if (classRelatedSchedules.length > 0) {
        // بررسی همه برنامه‌ها برای اطمینان از وجود hourNumber
        classRelatedSchedules.forEach(s => {
          if (!s.hourNumber) {
            const hourIndex = timeSlots.findIndex(t => t === s.timeStart);
            s.hourNumber = hourIndex + 1; // شماره ساعت از 1 شروع می‌شود
          }
        });
        
        // اطمینان از به‌روزرسانی برنامه‌های کلاسی با اطلاعات hourNumber
        updateAllClassSchedules(classRelatedSchedules);
      }
    }
    
    // باز کردن صفحه کلاس در تب جدید
    window.open(url, '_blank');
  };

  const loadAllSavedClassSchedules = () => {
    try {
      const allClassSchedules = scheduleSyncService.getAllClassSchedules();
      
      // تبدیل به نوع داده‌های داخلی
      const convertedClassSchedules: ClassSchedule[] = allClassSchedules.map(s => ({
        id: s.id,
        grade: s.grade,
        classNumber: s.classNumber,
        field: s.field,
        schedules: s.schedules.map(sch => ({
          id: sch.id,
          grade: sch.grade || '',
          classNumber: sch.classNumber || '',
          field: sch.field || '',
          mainPosition: sch.mainPosition || '',
          hourType: sch.hourType,
          teachingGroup: sch.teachingGroup,
          description: sch.description,
          day: sch.day,
          timeStart: sch.timeStart,
          timeEnd: sch.timeEnd,
          personnelId: sch.personnelId,
          timestamp: sch.timestamp,
          classScheduleId: sch.classScheduleId,
          fullName: sch.fullName,
          personnelCode: sch.personnelCode,
          employmentStatus: sch.employmentStatus,
          source: sch.source
        })),
        timestamp: s.timestamp
      }));
      
      setSavedClassSchedules(convertedClassSchedules);
    } catch (error) {
      console.error('خطا در بارگیری برنامه‌های کلاسی:', error);
    }
  };

  const exportCombinedDataToExcel = () => {
    if (savedSchedules.length === 0) {
      toast.error('هیچ برنامه‌ای برای صدور وجود ندارد');
      return;
    }
    
    try {
      const workbook = XLSX.utils.book_new();
      
      const combinedData = days.map(day => {
        const rowData: Record<string, string> = { 'روز/ساعت': day };
        
        hours.forEach((hour, index) => {
          const time = timeSlots[index];
          const cellText: string[] = [];
          
          savedSchedules.forEach(savedSchedule => {
            const cellSchedules = savedSchedule.schedules.filter(item => 
              item.day === day && item.timeStart === time
            );
            
            if (cellSchedules.length > 0) {
              cellSchedules.forEach(item => {
                cellText.push(`${item.grade} ${item.classNumber} ${item.field} (${savedSchedule.personnel.fullName})`);
              });
            }
          });
          
          rowData[hour] = cellText.join('\n');
        });
        
        return rowData;
      });
      
      const combinedWorksheet = XLSX.utils.json_to_sheet(combinedData);
      XLSX.utils.book_append_sheet(workbook, combinedWorksheet, 'برنامه کلی');
      
      savedSchedules.forEach(savedSchedule => {
        const personnelData = days.map(day => {
          const rowData: Record<string, string> = { 'روز/ساعت': day };
          
          hours.forEach((hour, index) => {
            const time = timeSlots[index];
            const cellSchedules = savedSchedule.schedules.filter(item => 
              item.day === day && item.timeStart === time
            );
            
            if (cellSchedules.length > 0) {
              const cellText = cellSchedules.map(item => 
                `${item.grade} ${item.classNumber} ${item.field}`
              ).join('\n');
              
              rowData[hour] = cellText;
            } else {
              rowData[hour] = '';
            }
          });
          
          return rowData;
        });
        
        const worksheet = XLSX.utils.json_to_sheet(personnelData);
        XLSX.utils.book_append_sheet(workbook, worksheet, `${savedSchedule.personnel.fullName}`);
      });
      
      const maxWidth = 20;
      const sheets = Object.keys(workbook.Sheets);
      sheets.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        worksheet['!cols'] = Array(hours.length + 1).fill({ wch: maxWidth });
      });
      
      const filename = `برنامه_کلی_پرسنل_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      setShowCombinedPreview(false);
      
    } catch (error) {
      console.error('خطا در صدور به اکسل:', error);
      toast.error('خطا در صدور به اکسل. لطفاً دوباره تلاش کنید.');
    }
  };

  // تابع جدید برای خروجی گرفتن json
  const exportToJson = () => {
    if (selectedPersonnel && schedule.length > 0) {
      try {
        const dataToExport = {
          personnel: selectedPersonnel,
          schedules: schedule,
          timestamp: Date.now()
        };
        
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `برنامه_پرسنلی_${selectedPersonnel.fullName.replace(/ /g, '_')}_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('فایل JSON با موفقیت ایجاد شد');
      } catch (error) {
        console.error('خطا در ایجاد فایل JSON:', error);
        toast.error('خطا در ایجاد فایل JSON. لطفاً دوباره تلاش کنید.');
      }
    } else {
      toast.error('برنامه‌ای برای خروجی گرفتن وجود ندارد');
    }
  };

  // اضافه کردن Effect برای بستن منوی آبشاری با کلیک خارج از آن
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // تابع جدید برای خروجی گرفتن PDF
  const exportToPdf = async () => {
    if (!selectedPersonnel || schedule.length === 0) {
      toast.error('برنامه‌ای برای خروجی گرفتن وجود ندارد');
      return;
    }
    
    try {
      // بارگذاری کتابخانه html2pdf به صورت دینامیک
      const html2pdf = (await import('html2pdf.js')).default;
      
      // ایجاد یک المنت div موقت برای رندر جدول
      const element = document.createElement('div');
      element.style.padding = '20px';
      element.style.fontFamily = 'Farhang2, Tahoma, sans-serif';
      element.style.direction = 'rtl';
      element.style.color = '#000000';
      
      // افزودن عنوان
      const title = document.createElement('h2');
      title.style.textAlign = 'center';
      title.style.marginBottom = '15px';
      title.style.color = '#1e40af';
      title.textContent = `برنامه پرسنلی: ${selectedPersonnel.fullName} - ${new Date().toLocaleDateString('fa-IR')}`;
      element.appendChild(title);
      
      // افزودن اطلاعات پرسنل
      const infoDiv = document.createElement('div');
      infoDiv.style.textAlign = 'center';
      infoDiv.style.marginBottom = '15px';
      infoDiv.style.padding = '10px';
      infoDiv.style.backgroundColor = '#f9fafb';
      infoDiv.style.borderRadius = '8px';
      infoDiv.style.color = '#000000';
      
      const personnelInfo = document.createElement('p');
      personnelInfo.innerHTML = `<strong>کد پرسنلی:</strong> ${selectedPersonnel.personnelCode} | <strong>سمت:</strong> ${selectedPersonnel.mainPosition} | <strong>وضعیت اشتغال:</strong> ${selectedPersonnel.employmentStatus}`;
      personnelInfo.style.color = '#000000';
      infoDiv.appendChild(personnelInfo);
      
      element.appendChild(infoDiv);

      // تقسیم ساعت‌ها به دو بخش
      const morningHours = timeSlots.slice(0, 8); // از ساعت 8 تا 15
      const eveningHours = timeSlots.slice(8); // از ساعت 16 به بعد
      const morningHoursLabels = hours.slice(0, 8);
      const eveningHoursLabels = hours.slice(8);

      // تابع کمکی برای ایجاد جدول
      const createScheduleTable = (timeSlots: string[], hourLabels: string[], title: string) => {
        const tableContainer = document.createElement('div');
        tableContainer.style.marginBottom = '30px';
        tableContainer.style.pageBreakAfter = 'always';

        const tableTitle = document.createElement('h3');
        tableTitle.textContent = title;
        tableTitle.style.textAlign = 'center';
        tableTitle.style.marginBottom = '15px';
        tableTitle.style.color = '#1e40af';
        tableContainer.appendChild(tableTitle);

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginBottom = '20px';
        table.style.color = '#000000';

        // ایجاد سر ستون‌ها
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // ستون روز/ساعت
        const dayHeader = document.createElement('th');
        dayHeader.textContent = 'روز/ساعت';
        dayHeader.style.border = '1px solid #ccc';
        dayHeader.style.padding = '8px';
        dayHeader.style.backgroundColor = '#f0f9ff';
        dayHeader.style.textAlign = 'right';
        dayHeader.style.color = '#000000';
        headerRow.appendChild(dayHeader);

        // ستون‌های ساعت
        timeSlots.forEach((time, index) => {
          const th = document.createElement('th');
          th.style.border = '1px solid #ccc';
          th.style.padding = '8px';
          th.style.backgroundColor = '#f0f9ff';
          th.style.textAlign = 'center';
          th.style.color = '#000000';

          const hourDiv = document.createElement('div');
          hourDiv.textContent = hourLabels[index];
          hourDiv.style.fontWeight = 'bold';
          hourDiv.style.color = '#000000';

          const timeDiv = document.createElement('div');
          timeDiv.textContent = time;
          timeDiv.style.fontSize = '11px';
          timeDiv.style.color = '#4b5563';

          th.appendChild(hourDiv);
          th.appendChild(timeDiv);
          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // ایجاد بدنه جدول
        const tbody = document.createElement('tbody');

        days.forEach((day, dayIndex) => {
          const row = document.createElement('tr');
          row.style.backgroundColor = dayIndex % 2 === 0 ? '#f9fafb' : 'white';

          // ستون روز
          const dayCell = document.createElement('td');
          dayCell.textContent = day;
          dayCell.style.border = '1px solid #ccc';
          dayCell.style.padding = '8px';
          dayCell.style.fontWeight = 'bold';
          dayCell.style.textAlign = 'right';
          dayCell.style.color = '#000000';
          row.appendChild(dayCell);

          // ستون‌های ساعت
          timeSlots.forEach(time => {
            const cell = document.createElement('td');
            cell.style.border = '1px solid #ccc';
            cell.style.padding = '8px';
            cell.style.textAlign = 'center';
            cell.style.verticalAlign = 'top';
            cell.style.height = '70px';
            cell.style.color = '#000000';

            const cellSchedules = schedule.filter(item => item.day === day && item.timeStart === time);

            if (cellSchedules.length > 0) {
              cellSchedules.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.style.padding = '5px';
                itemDiv.style.marginBottom = '5px';
                itemDiv.style.backgroundColor = '#f0f9ff';
                itemDiv.style.borderRadius = '4px';
                itemDiv.style.color = '#000000';

                const classDiv = document.createElement('div');
                classDiv.textContent = `${item.grade} ${item.classNumber} ${item.field}`;
                classDiv.style.fontWeight = 'bold';
                classDiv.style.color = '#0369a1';

                const positionDiv = document.createElement('div');
                positionDiv.textContent = item.mainPosition;
                positionDiv.style.fontSize = '11px';
                positionDiv.style.color = '#000000';

                const hourTypeDiv = document.createElement('div');
                hourTypeDiv.textContent = item.hourType;
                hourTypeDiv.style.fontSize = '11px';
                hourTypeDiv.style.color = '#4b5563';

                itemDiv.appendChild(classDiv);
                itemDiv.appendChild(positionDiv);
                itemDiv.appendChild(hourTypeDiv);

                cell.appendChild(itemDiv);
              });
            }

            row.appendChild(cell);
          });

          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);
        return tableContainer;
      };

      // ایجاد جداول برای هر بخش
      const morningTable = createScheduleTable(morningHours, morningHoursLabels, 'برنامه صبح (ساعت ۸ تا ۱۵)');
      const eveningTable = createScheduleTable(eveningHours, eveningHoursLabels, 'برنامه عصر (ساعت ۱۶ به بعد)');

      element.appendChild(morningTable);
      element.appendChild(eveningTable);

      // ایجاد بخش آمار
      const statsDiv = document.createElement('div');
      statsDiv.style.marginTop = '20px';
      statsDiv.style.border = '1px solid #e5e7eb';
      statsDiv.style.borderRadius = '8px';
      statsDiv.style.padding = '15px';
      statsDiv.style.backgroundColor = '#f0f9ff';
      statsDiv.style.color = '#000000';

      const statsTitle = document.createElement('h3');
      statsTitle.textContent = 'آمار کلی';
      statsTitle.style.marginBottom = '10px';
      statsTitle.style.color = '#1e40af';
      statsDiv.appendChild(statsTitle);

      const statsList = document.createElement('ul');
      statsList.style.listStyleType = 'none';
      statsList.style.padding = '0';
      statsList.style.margin = '0';
      statsList.style.color = '#000000';

      const totalHoursItem = document.createElement('li');
      totalHoursItem.textContent = `تعداد کل ساعت: ${calculateTotalHours()}`;
      totalHoursItem.style.marginBottom = '5px';
      totalHoursItem.style.color = '#000000';
      statsList.appendChild(totalHoursItem);

      const uniqueClassesCount = new Set(schedule.map(item => `${item.grade}-${item.classNumber}-${item.field}`)).size;
      const uniqueClassesItem = document.createElement('li');
      uniqueClassesItem.textContent = `تعداد کلاس‌های منحصر به فرد: ${uniqueClassesCount}`;
      uniqueClassesItem.style.marginBottom = '5px';
      uniqueClassesItem.style.color = '#000000';
      statsList.appendChild(uniqueClassesItem);

      statsDiv.appendChild(statsList);
      element.appendChild(statsDiv);

      // خلاصه متنی
      const summaryDiv = document.createElement('div');
      summaryDiv.style.marginTop = '20px';
      summaryDiv.style.border = '1px solid #e5e7eb';
      summaryDiv.style.borderRadius = '8px';
      summaryDiv.style.padding = '15px';
      summaryDiv.style.backgroundColor = '#f0fff4';
      summaryDiv.style.color = '#000000';

      const summaryTitle = document.createElement('h3');
      summaryTitle.textContent = 'خلاصه برنامه روزانه';
      summaryTitle.style.marginBottom = '10px';
      summaryTitle.style.color = '#046c4e';
      summaryDiv.appendChild(summaryTitle);

      days.forEach(day => {
        const daySummary = getDayHoursSummary(day);
        if (!daySummary || daySummary.length === 0) return;

        const dayTitle = document.createElement('h4');
        dayTitle.textContent = day;
        dayTitle.style.marginTop = '10px';
        dayTitle.style.marginBottom = '5px';
        dayTitle.style.fontWeight = 'bold';
        dayTitle.style.color = '#000000';
        summaryDiv.appendChild(dayTitle);

        const dayList = document.createElement('ul');
        dayList.style.paddingRight = '20px';
        dayList.style.margin = '0';
        dayList.style.color = '#000000';

        daySummary.forEach(item => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<strong>${item.className}:</strong> ${item.hours}`;
          listItem.style.marginBottom = '3px';
          listItem.style.color = '#000000';
          dayList.appendChild(listItem);
        });

        summaryDiv.appendChild(dayList);
      });

      element.appendChild(summaryDiv);

      // تنظیمات PDF
      const opt = {
        margin: 10,
        filename: `برنامه_پرسنلی_${selectedPersonnel.fullName.replace(/ /g, '_')}_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
      };

      // ایجاد PDF
      html2pdf().from(element).set(opt).save();

      toast.success('فایل PDF با موفقیت ایجاد شد');
    } catch (error) {
      console.error('خطا در ایجاد فایل PDF:', error);
      toast.error('خطا در ایجاد فایل PDF. لطفاً دوباره تلاش کنید.');
    }
  };

  // تابع برای دریافت مقطع انتخاب شده
  const handleLevelLoaded = (level: string) => {
    setSelectedLevel(level);
    console.log('Loaded education level:', level);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerButtons}>
          <button onClick={() => router.back()} className={styles.backButton}>
            بازگشت
          </button>
          <button
            onClick={() => {
              if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام برنامه‌ها را حذف کنید؟')) {
                // حذف تمام برنامه‌ها از localStorage
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && (key.startsWith('personnel_schedule_') || key.startsWith('class_schedule_'))) {
                    localStorage.removeItem(key);
                  }
                }
                // بارگذاری مجدد برنامه‌ها
                loadAllSavedSchedules();
                setSchedule([]);
                toast.success('تمام برنامه‌ها با موفقیت حذف شدند.');
              }
            }}
            className={styles.deleteButton}
          >
            <FaTrash className="ml-1" />
            حذف همه برنامه‌ها
          </button>
        </div>
        <h1>برنامه پرسنلی</h1>
      </header>

      <main className={styles.main}>
        {!selectedPersonnel ? (
          <div className="flex flex-col items-center justify-center py-4 md:py-8">
            <div className="w-full max-w-md">
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>کد پرسنلی:</label>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    value={personnelCode}
                    onChange={(e) => {
                      // فقط اعداد قابل قبول هستند و حداکثر ۸ رقم
                      const value = e.target.value;
                      if (value === '' || (/^\d+$/.test(value) && value.length <= 8)) {
                        setPersonnelCode(value);
                      }
                    }}
                    placeholder="کد پرسنلی را وارد کنید"
                    className="w-full p-2 border border-gray-300 rounded text-black"
                  />
                  <button
                    onClick={handleSearchPersonnel}
                    className={styles.actionButton}
                    disabled={!personnelCode.trim()}
                  >
                    <FaSearch className="ml-1 inline-block" />
                    <span className="inline-block">جستجو</span>
                  </button>
                </div>
                {searchError && <p className="text-red-500 mt-2 text-sm">{searchError}</p>}
              </div>
              
              <div className={`${styles.actionButtonsContainer} flex-wrap mb-4`}>
                <button
                  onClick={() => {
                    // اعتبارسنجی کد پرسنلی قبل از باز کردن مودال
                    if (!personnelCode.trim()) {
                      setSearchError('لطفاً ابتدا کد پرسنلی را وارد کنید');
                      return;
                    }

                    if (personnelCode.length !== 8) {
                      setSearchError('کد پرسنلی باید دقیقاً ۸ کاراکتر باشد');
                      return;
                    }

                    if (!/^\d+$/.test(personnelCode)) {
                      setSearchError('کد پرسنلی باید فقط شامل اعداد باشد');
                      return;
                    }

                    setSearchError('');
                    // تنظیم کد پرسنلی در فرم افزودن پرسنل جدید
                    setNewPersonnel({
                      personnelCode: personnelCode,
                      fullName: '',
                      mainPosition: '',
                      employmentStatus: 'شاغل'
                    });
                    setShowAddPersonnelModal(true);
                  }}
                  className={styles.actionButton}
                >
                  <FaPlus className="ml-1 inline-block" />
                  <span className="inline-block">افزودن پرسنل جدید</span>
                </button>
              </div>

              {/* دکمه‌های عملیات سیستمی */}
              <div className="flex flex-wrap gap-2 mt-4 border-t pt-4 border-gray-200">
                <p className="w-full text-sm text-black mb-2">عملیات سیستمی:</p>
                <button
                  onClick={() => {
                    if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام تاریخچه برنامه‌ها را حذف کنید؟')) {
                      // حذف تمام تاریخچه از localStorage
                      for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith('personnel_schedule_')) {
                          localStorage.removeItem(key);
                        }
                      }
                      loadAllSavedSchedules();
                      toast.success('تمام تاریخچه برنامه‌ها با موفقیت حذف شد.');
                    }
                  }}
                  className="py-1.5 px-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs md:text-sm font-medium rounded hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <FaTimes className="ml-1 inline-block" />
                  <span className="inline-block">حذف تاریخچه</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('آیا مطمئن هستید که می‌خواهید از برنامه خارج شوید؟')) {
                      window.location.href = '/';
                    }
                  }}
                  className="py-1.5 px-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs md:text-sm font-medium rounded hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <span className="inline-block">خروج</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 md:mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                <div>
                  <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900">برنامه پرسنلی: {selectedPersonnel.fullName}</h2>
                  <p className="text-xs md:text-sm text-black mt-1">کد پرسنلی: {selectedPersonnel.personnelCode} | سمت: {selectedPersonnel.mainPosition}</p>
                </div>
                <div className="mt-3 md:mt-0">
                  <button
                    onClick={() => {
                      setSelectedPersonnel(null);
                      setSchedule([]);
                    }}
                    className={styles.actionButton}
                  >
                    تغییر پرسنل
                  </button>
                </div>
              </div>

              <div className={`${styles.actionButtonsContainer} flex-wrap mb-4`}>
                <button
                  onClick={() => setTimeSelectionModalOpen(true)}
                  className="py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm md:text-base font-medium rounded hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
                >
                  <FaPlus className="ml-1 inline-block" />
                  <span className="inline-block">افزودن برنامه جدید</span>
                </button>
                <button
                  onClick={saveScheduleToLocalStorage}
                  className="py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm md:text-base font-medium rounded hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
                  disabled={schedule.length === 0}
                >
                  <FaSave className="ml-1 inline-block" />
                  <span className="inline-block">ذخیره برنامه</span>
                </button>
                
                {/* منوی آبشاری خروجی گرفتن */}
                <div className="relative inline-block" ref={exportMenuRef}>
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="py-2 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm md:text-base font-medium rounded hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
                    disabled={schedule.length === 0}
                  >
                    <FaFileDownload className="ml-1 inline-block" />
                    <span className="inline-block">خروجی گرفتن</span>
                  </button>
                  
                  {showExportMenu && schedule.length > 0 && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          onClick={() => {
                            setShowExportMenu(false);
                            exportToExcel();
                          }}
                          className="flex items-center w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          role="menuitem"
                        >
                          <FaFileExport className="ml-2" />
                          خروجی اکسل
                        </button>
                        <button
                          onClick={() => {
                            setShowExportMenu(false);
                            exportToJson();
                          }}
                          className="flex items-center w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          role="menuitem"
                        >
                          <FaFileDownload className="ml-2" />
                          خروجی JSON
                        </button>
                        <button
                          onClick={() => {
                            setShowExportMenu(false);
                            exportToPdf();
                          }}
                          className="flex items-center w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          role="menuitem"
                        >
                          <FaFilePdf className="ml-2" />
                          خروجی PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {savedClassSchedules.length > 0 && (
                  <button
                    onClick={() => window.open('/class-schedule', '_blank')}
                    className={`${styles.actionButton} bg-cyan-600 text-white hover:bg-cyan-700 flex items-center`}
                  >
                    <FaCalendarAlt className="ml-1 inline-block" />
                    <span className="inline-block">مشاهده برنامه‌های کلاسی</span>
                  </button>
                )}
              </div>

              {schedule.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 md:p-3 mt-3 md:mt-4 flex items-start">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="text-yellow-500 text-base md:text-xl ml-2 md:ml-3" />
                  </div>
                  <div>
                    <p className="text-yellow-800 font-semibold text-sm md:text-base">تعداد ساعت کلاس: {calculateTotalHours()}</p>
                    <p className="text-xs md:text-sm text-yellow-700">* برای جابجایی برنامه‌ها، آنها را drag & drop کنید</p>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.scheduleTable}>
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-gray-100 z-10">روز/ساعت</th>
                    {hours.map(hour => (
                      <th key={hour}>{hour}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day}>
                      <th className="sticky left-0 bg-gray-100 z-10">{day}</th>
                      {timeSlots.map(time => {
                        const cellSchedules = getScheduleForCell(day, time);
                        const allCellHistory = getAllSavedSchedulesForCell(day, time);
                        const hasCellHistory = allCellHistory.length > 0;
                        
                        return (
                          <td 
                            key={`${day}-${time}`}
                            className={styles.scheduleCell}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day, time)}
                            onClick={() => cellSchedules.length === 0 && handleTimeSelection(day, time)}
                          >
                            <div className="relative w-full h-full">
                              {hasCellHistory && (
                                <div className="absolute top-1 right-1 z-10">
                                  <button
                                    className="bg-gray-200 hover:bg-gray-300 p-1 rounded-full text-xs"
                                    title="نمایش تاریخچه"
                                    onClick={(e) => handleShowCellHistory(day, time, e)}
                                  >
                                    <FaHistory className="w-2 h-2 md:w-3 md:h-3 text-gray-600" />
                                  </button>
                                </div>
                              )}
                              
                              {cellSchedules.length > 0 ? (
                                <div className={`w-full h-full p-1 relative ${styles.scheduleCellContent}`}>
                                  {cellSchedules.map((cellSchedule, index) => {
                                    // رنگ پس‌زمینه بر اساس نوع ساعت
                                    let bgColorClass = "bg-blue-100";
                                    if (cellSchedule.hourType === 'موظف اول' || cellSchedule.hourType === 'موظف دوبل') {
                                      bgColorClass = "bg-green-100";
                                    } else if (cellSchedule.hourType === 'غیرموظف اول' || cellSchedule.hourType === 'غیرموظف دوبل') {
                                      bgColorClass = "bg-yellow-100";
                                    }
                                    
                                    return (
                                      <div 
                                        key={cellSchedule.id} 
                                        className={`${bgColorClass} rounded p-1 mb-1 text-right relative`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, cellSchedule, day, time)}
                                      >
                                        {/* دکمه حذف برای هر برنامه - بدون توجه به منبع آن */}
                                        <button
                                          className="absolute top-1 left-1 text-red-500 hover:text-red-700 z-10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`آیا از حذف این برنامه اطمینان دارید؟`)) {
                                              handleDeleteSchedule(cellSchedule.id);
                                            }
                                          }}
                                          title="حذف"
                                        >
                                          <FaTimes size={12} className="sm:text-[14px]" />
                                        </button>

                                        <div className="text-[10px] sm:text-xs font-bold text-black mb-1">{cellSchedule.grade} {cellSchedule.classNumber} - {cellSchedule.field}</div>
                                        <div className="text-[10px] sm:text-xs text-black">{cellSchedule.mainPosition}</div>
                                        <div className="text-[10px] sm:text-xs text-blue-700 font-bold">{cellSchedule.teachingGroup || 'بدون گروه تدریس'}</div>
                                        <div className="text-[10px] sm:text-xs text-black">{cellSchedule.hourType || '-'}</div>
                                        {cellSchedule.description && (
                                          <div className="text-[10px] sm:text-xs text-gray-600 mt-1 truncate" title={cellSchedule.description}>
                                            {cellSchedule.description}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="w-full h-full min-h-[4rem] md:min-h-[6rem] flex items-center justify-center cursor-pointer hover:bg-gray-50">
                                  <span className="text-gray-500">+</span>
                                </div>
                              )}

                              {cellSchedules.length > 0 && (
                                <div className="absolute bottom-1 right-1">
                                  <button
                                    className="bg-cyan-100 hover:bg-cyan-200 p-0.5 md:p-1 rounded text-xs"
                                    title="افزودن برنامه جدید"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTimeSelection(day, time);
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {schedule.length > 0 && (
              <div className="mt-6 bg-blue-50 rounded-md p-3 border border-blue-200">
                <h3 className="text-base md:text-lg font-bold text-blue-800 mb-2">آمار کلی</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-2 md:p-3 rounded-md shadow-sm">
                    <p className="text-gray-900 text-xs md:text-sm">تعداد کل ساعت‌ها</p>
                    <p className="text-gray-900 font-bold text-lg md:text-xl">{calculateTotalHours()}</p>
                  </div>
                  <div className="bg-white p-2 md:p-3 rounded-md shadow-sm">
                    <p className="text-gray-900 text-xs md:text-sm">تعداد کلاس‌های منحصر به فرد</p>
                    <p className="text-gray-900 font-bold text-lg md:text-xl">
                      {new Set(schedule.map(item => `${item.grade}-${item.classNumber}-${item.field}`)).size}
                    </p>
                  </div>
                  <div 
                    className="bg-white p-2 md:p-3 rounded-md shadow-sm cursor-pointer hover:bg-blue-50"
                    onClick={() => {
                      if (savedClassSchedules.length > 0) {
                        // نمایش لیست کلاس‌های مرتبط در یک مودال
                        // برای سادگی، از تابع navigate استفاده می‌کنیم تا به صفحه لیست کلاس‌ها منتقل شویم
                        window.open('/class-schedule', '_blank');
                      }
                    }}
                  >
                    <p className="text-gray-900 text-xs md:text-sm">کلاس‌های با برنامه</p>
                    <p className="text-gray-900 font-bold text-lg md:text-xl flex items-center">
                      {savedClassSchedules.length}
                      <span className="text-xs mr-2 text-cyan-700">
                        (مشاهده همه)
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm md:text-base font-bold text-blue-800 mb-2">جزئیات برنامه روزانه</h4>
                  <div className="bg-white rounded-md shadow-sm overflow-hidden">
                    {days.map(day => {
                      const daySummary = getDayHoursSummary(day);
                      if (!daySummary || daySummary.length === 0) return null;
                      
                      return (
                        <div key={day} className="border-b border-gray-100 p-2 md:p-3">
                          <h5 className="text-gray-900 font-bold text-sm md:text-base mb-1">{day}</h5>
                          <div className="pl-3 text-xs md:text-sm">
                            {daySummary.map((item, index) => (
                              <div key={index} className="mb-1 text-gray-900">
                                <span className="font-medium">{item.className}: </span>
                                <span>{item.hours}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm md:text-base font-bold text-blue-800 mb-2">جزئیات کلاس‌ها</h4>
                  <div className="bg-white rounded-md shadow-sm overflow-hidden">
                    {Object.entries(getScheduleByClass()).map(([classKey, classSchedules], index) => {
                      const [grade, classNumber, field] = classKey.split('-');
                      
                      const scheduleByDay: Record<string, Schedule[]> = {};
                      days.forEach(day => {
                        const daySchedules = classSchedules.filter(s => s.day === day);
                        if (daySchedules.length > 0) {
                          scheduleByDay[day] = daySchedules;
                        }
                      });
                      
                      return (
                        <div key={index} className="border-b border-gray-100 p-2 md:p-3">
                          <h5 
                            className="text-gray-900 font-bold text-sm md:text-base mb-1 cursor-pointer hover:text-cyan-700 flex items-center"
                            onClick={() => navigateToClassSchedule(grade, classNumber, field)}
                          >
                            <FaSchool className="ml-1" />
                            {grade} {classNumber} {field}
                            <span className="text-xs text-cyan-600 mr-2 flex items-center">
                              <FaEye className="ml-1" />
                              (مشاهده برنامه کلاسی)
                            </span>
                          </h5>
                          <div className="pl-3 text-xs md:text-sm">
                            {Object.entries(scheduleByDay).map(([day, daySchedules], idx) => {
                              const hourIndices = daySchedules.map(s => {
                                return timeSlots.findIndex(time => time === s.timeStart) + 1;
                              });
                              
                              return (
                                <div key={idx} className="mb-1 text-gray-900">
                                  <span className="font-medium">{day}: </span>
                                  <span>{formatHourNumbers(hourIndices)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            
            {/* خلاصه متنی برنامه - همیشه نمایش داده می‌شود */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-3 md:p-4">
              <h3 className="text-base md:text-lg font-bold text-green-800 mb-3">خلاصه متنی برنامه</h3>
              {schedule.length > 0 ? (
                <div className="bg-white rounded-md p-3 overflow-x-auto shadow-sm">
                  <pre className="text-xs md:text-sm whitespace-pre-wrap font-[Farhang2] text-gray-900 leading-relaxed">
                    {`نام پرسنل: ${selectedPersonnel?.fullName}
کد پرسنلی: ${selectedPersonnel?.personnelCode}
سمت: ${selectedPersonnel?.mainPosition}
تعداد کل ساعت: ${calculateTotalHours()}

${days.map(day => {
  const daySchedules = schedule.filter(s => s.day === day);
  if (daySchedules.length === 0) return '';
  
  const groupedByClass = daySchedules.reduce((acc, curr) => {
    const key = `${curr.grade} ${curr.classNumber} ${curr.field}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {} as Record<string, Schedule[]>);
  
  return `${day}:
${Object.entries(groupedByClass).map(([className, schedules]) => {
  const hourIndices = schedules.map(s => timeSlots.indexOf(s.timeStart) + 1);
  return `    ${className}: ${formatHourNumbers(hourIndices)}`;
}).join('\n')}`;
}).filter(Boolean).join('\n\n')}`}
                  </pre>
                </div>
              ) : (
                <div className="bg-white rounded-md p-3 text-center shadow-sm">
                  <p className="text-black">هنوز برنامه‌ای ثبت نشده است</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {showConflictWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-md z-10 relative">
            <div className="flex items-center justify-center mb-4 text-red-600">
              <FaExclamationTriangle className="text-4xl" />
            </div>
            <h2 className="text-xl font-bold text-center mb-4">هشدار تداخل برنامه</h2>
            <div className="max-h-96 overflow-y-auto">
              <p className="text-black mb-4">برنامه‌های زیر با برنامه‌های پرسنل دیگر تداخل دارند:</p>
              <ul className="space-y-3">
                {conflicts.map((conflict, index) => (
                  <li key={index} className="border border-red-200 rounded-md p-3 bg-red-50">
                    <p className="font-bold text-black">{conflict.day} - {hours[timeSlots.indexOf(conflict.time)]}</p>
                    <p className="text-black">کلاس: {conflict.grade} {conflict.classNumber} - {conflict.field}</p>
                    <p className="text-black">پرسنل های دارای تداخل:</p>
                    <ul className="list-disc mr-6 mt-1">
                      {conflict.personnelNames.map((name, idx) => (
                        <li key={idx} className="text-red-700">{name}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex justify-center">
              <button 
                onClick={() => setShowConflictWarning(false)} 
                className="py-2 px-4 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className="text-xl font-bold mb-4 text-black">افزودن برنامه جدید</h2>
            <div className={styles.formGroup}>
              <label className={styles.formLabel + " text-black"}>پایه تحصیلی:</label>
              <select 
                className={styles.formSelect}
                value={grade} 
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="" className="text-black">انتخاب کنید</option>
                {grades.map(g => (
                  <option key={g} value={g} className="text-black">{g}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel + " text-black"}>کلاس:</label>
              <select 
                className={styles.formSelect}
                value={classNumber} 
                onChange={(e) => setClassNumber(e.target.value)} 
                disabled={!grade}
              >
                <option value="" className="text-black">انتخاب کنید</option>
                {grade && classOptions[grade as keyof typeof classOptions]?.map(c => (
                  <option key={c} value={c} className="text-black">{c}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel + " text-black"}>رشته:</label>
              <select 
                className={styles.formSelect}
                value={field} 
                onChange={(e) => setField(e.target.value)}
              >
                <option value="" className="text-black">انتخاب کنید</option>
                {fields.map(f => (
                  <option key={f} value={f} className="text-black">{f}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel + " text-black"}>سمت:</label>
              <select 
                className={styles.formSelect}
                value={mainPosition} 
                onChange={(e) => setMainPosition(e.target.value)}
              >
                <option value="" className="text-black">انتخاب کنید</option>
                {mainPositions.map(p => (
                  <option key={p} value={p} className="text-black">{p}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel + " text-black"}>نوع ساعت:</label>
              <select 
                className={styles.formSelect}
                value={hourType} 
                onChange={(e) => setHourType(e.target.value)}
              >
                <option value="" className="text-black">انتخاب کنید</option>
                {hourTypes.map(h => (
                  <option key={h} value={h} className="text-black">{h}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel + " text-black"}>گروه آموزشی:</label>
              <select 
                className={styles.formSelect}
                value={teachingGroup} 
                onChange={(e) => setTeachingGroup(e.target.value)}
              >
                <option value="" className="text-black">انتخاب کنید</option>
                {teachingGroups.map(t => (
                  <option key={t} value={t} className="text-black">{t}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel + " text-black"}>توضیحات:</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded text-black"
              ></textarea>
            </div>

            <div className={styles.formButtonGroup}>
              <button 
                className={styles.actionButton}
                onClick={handleSubmit}
                disabled={!grade || !classNumber || !field || !mainPosition || !hourType || !selectedCell}
              >
                ثبت
              </button>
              <button 
                className="py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {timeSelectionModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className="text-lg md:text-xl font-bold mb-4 text-center">انتخاب زمان برنامه</h2>
            <div className={styles.scrollableContent}>
              <div className="mb-4">
                <h3 className="text-base md:text-lg font-semibold mb-2 text-black">روزهای هفته</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {days.map(day => (
                    <button
                      key={day}
                      className={`p-2 border rounded ${selectedCell?.day === day ? 'bg-cyan-100 border-cyan-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                      onClick={() => setSelectedCell(prev => ({ day, time: prev?.time || timeSlots[0] }))}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-base md:text-lg font-semibold mb-2 text-black">ساعت‌ها</h3>
                <div className={styles.timeSelectionGrid}>
                  {timeSlots.map((time, index) => (
                    <button
                      key={time}
                      className={`${styles.timeButton} ${selectedCell?.time === time ? 'bg-cyan-100 border-cyan-300' : ''}`}
                      onClick={() => setSelectedCell(prev => ({ day: prev?.day || days[0], time }))}
                    >
                      {hours[index]}
                      <br />
                      <span className="text-xs md:text-sm text-black mt-1">{time}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formButtonGroup}>
              <button
                onClick={() => {
                  if (selectedCell) {
                    handleAddNewSchedule();
                    setTimeSelectionModalOpen(false);
                    setModalOpen(true);
                  }
                }}
                className={styles.actionButton}
                disabled={!selectedCell}
              >
                ادامه
              </button>
              <button
                onClick={() => setTimeSelectionModalOpen(false)}
                className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddPersonnelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-in-out">
          <div className="absolute inset-0 bg-gradient-to-br opacity-55 from-gray-700 via-gray-800 to-gray-900 backdrop-blur-[2px]"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-500 ease-in-out shadow-xl relative">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 text-center">تکمیل اطلاعات</h2>
              <p className="text-center text-black mt-2">لطفاً اطلاعات خود را تکمیل کنید</p>
            </div>
            <div className={styles.scrollableContent}>
              <div className="space-y-6 text-right">
                {addPersonnelError && (
                  <p className="text-red-600 p-2 bg-red-50 rounded">{addPersonnelError}</p>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="newPersonnelCode" className="block text-gray-800 font-medium">کد پرسنلی:</label>
                  <input
                    id="newPersonnelCode"
                    type="text"
                    value={newPersonnel.personnelCode || personnelCode}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded text-black bg-gray-100"
                  />
                  <p className="text-xs text-black">کد پرسنلی قابل تغییر نیست</p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newFullName" className="block text-gray-800 font-medium">نام و نام خانوادگی:</label>
                  <input
                    id="newFullName"
                    type="text"
                    value={newPersonnel.fullName}
                    onChange={(e) => setNewPersonnel({...newPersonnel, fullName: e.target.value})}
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                    className="w-full p-2 border border-gray-300 rounded text-black"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newMainPosition" className="block text-gray-800 font-medium">سمت شغلی:</label>
                  <select
                    id="newMainPosition"
                    value={newPersonnel.mainPosition}
                    onChange={(e) => setNewPersonnel({...newPersonnel, mainPosition: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded text-black"
                  >
                    <option value="" className="text-black">انتخاب کنید</option>
                    {mainPositions.map(pos => (
                      <option key={pos} value={pos} className="text-black">{pos}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newEmploymentStatus" className="block text-gray-800 font-medium">وضعیت اشتغال:</label>
                  <select
                    id="newEmploymentStatus"
                    value={newPersonnel.employmentStatus}
                    onChange={(e) => setNewPersonnel({...newPersonnel, employmentStatus: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded text-black"
                  >
                    <option value="شاغل" className="text-black">شاغل</option>
                    <option value="بازنشسته" className="text-black">بازنشسته</option>
                    <option value="خرید خدمات" className="text-black">خرید خدمات</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button 
                onClick={() => {
                  setShowAddPersonnelModal(false);
                  setShowPersonnelModal(true);
                }}
                className="py-2 px-4 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200 transition-colors"
              >
                بازگشت
              </button>
              <button 
                onClick={handleAddPersonnel}
                className="py-2 px-6 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded transition-colors"
              >
                ذخیره و ادامه
              </button>
            </div>
          </div>
        </div>
      )}

      {showCombinedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-in-out">
          <div className="absolute inset-0 bg-gradient-to-br opacity-55 from-gray-700 via-gray-800 to-gray-900 backdrop-blur-[2px]"></div>
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-7xl max-h-[90vh] transform transition-all duration-500 ease-in-out shadow-xl relative">
            <div className="mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center">پیش‌نمایش برنامه کلی پرسنل</h2>
              <p className="text-center text-black mt-1 md:mt-2 text-xs md:text-sm">لطفاً پیش از دانلود فایل اکسل، برنامه کلی را تأیید کنید</p>
            </div>
            <div className={styles.scrollableContent} style={{ maxHeight: '70vh' }}>
              {savedSchedules.length > 0 ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.scheduleTable}>
                    <thead>
                      <tr>
                        <th className="text-gray-800 sticky left-0 bg-gray-100">روز/ساعت</th>
                        {hours.map(hour => (
                          <th key={hour} className="text-gray-800">{hour}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map(day => (
                        <tr key={day}>
                          <th className="text-gray-800 sticky left-0 bg-gray-100">{day}</th>
                          {timeSlots.map(time => {
                            const cellContents: React.ReactElement[] = [];
                            
                            savedSchedules.forEach(savedSchedule => {
                              const cellSchedules = savedSchedule.schedules.filter(item => 
                                item.day === day && item.timeStart === time
                              );
                              
                              cellSchedules.forEach(item => {
                                cellContents.push(
                                  <div key={`${item.id}-${savedSchedule.personnel.id}`} className={styles.scheduleItem}>
                                    <p className="font-bold text-gray-900 text-xs md:text-sm">{item.grade} {item.classNumber}</p>
                                    <p className="text-gray-800 text-xs md:text-sm">{item.field}</p>
                                    <p className="text-xs text-cyan-700">{savedSchedule.personnel.fullName}</p>
                                    <p className="text-xs text-gray-600 hidden md:block">{item.mainPosition} - {item.hourType}</p>
                                  </div>
                                );
                              });
                            });
                            
                            return (
                              <td key={`${day}-${time}`} className={styles.scheduleCell}>
                                {cellContents.length > 0 ? cellContents : (
                                  <div className="w-full h-full min-h-[3rem] md:min-h-[4rem] lg:min-h-[6rem] flex items-center justify-center">
                                    <span className="text-black">-</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4 md:p-8">
                  <p className="text-black">هیچ برنامه‌ای برای نمایش وجود ندارد</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-6 flex justify-between">
              <button 
                onClick={() => setShowCombinedPreview(false)} 
                className="py-1.5 md:py-2 px-3 md:px-4 bg-gray-200 text-gray-800 font-bold rounded hover:bg-gray-300 transition-colors text-sm md:text-base"
              >
                انصراف
              </button>
              <button 
                onClick={exportCombinedDataToExcel}
                className="py-1.5 md:py-2 px-3 md:px-6 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded transition-colors text-sm md:text-base"
                disabled={savedSchedules.length === 0}
              >
                تأیید و دانلود
              </button>
            </div>
          </div>
        </div>
      )}

      {showCellHistoryMenu && selectedCellForHistory && (
        <div 
          className={`${styles.cellHistoryMenu} cell-history-container`}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            padding: '12px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            width: '250px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflow: 'hidden'
          }}
        >
          {/* اضافه کردن فلش برای نشان دادن ارتباط با آیکون */}
          <div 
            className="absolute w-3 h-3 bg-white transform rotate-45 border"
            style={{
              top: menuPosition.position === 'center' ? '-6px' : (menuPosition.position === 'left' ? '10px' : 'auto'),
              left: menuPosition.position === 'center' ? '50%' : (menuPosition.position === 'right' ? '-6px' : 'auto'),
              right: menuPosition.position === 'left' ? '-6px' : 'auto',
              marginLeft: menuPosition.position === 'center' ? '-6px' : '0',
              borderColor: menuPosition.position === 'center' ? '#e5e7eb transparent transparent #e5e7eb' : 
                          (menuPosition.position === 'right' ? 'transparent #e5e7eb #e5e7eb transparent' : 
                                                            'transparent transparent #e5e7eb #e5e7eb'),
              zIndex: 1
            }}
          ></div>
          <div className="relative z-10 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-2 sticky top-0 bg-white pb-2 border-b">
              <h3 className="font-bold text-black text-sm md:text-base">تاریخچه برنامه‌ها</h3>
              <button 
                onClick={() => setShowCellHistoryMenu(false)}
                className="text-gray-600 hover:text-gray-900 p-1"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="text-xs md:text-sm text-black mb-2 pb-2">
              <span className="font-medium text-black">روز: </span>{selectedCellForHistory.day}، 
              <span className="font-medium text-black mr-1">ساعت: </span>{hours[timeSlots.indexOf(selectedCellForHistory.time)]}
            </div>
            
            <div className="divide-y divide-gray-200 overflow-y-auto flex-grow">
              {getAllSavedSchedulesForCell(selectedCellForHistory.day, selectedCellForHistory.time).slice(0, 3).map((item, index) => (
                <div key={index} className="py-2 text-black hover:bg-gray-50 px-1 rounded">
                  <p className="font-bold text-black text-xs md:text-sm">{item.personnel?.fullName || 'نامشخص'}</p>
                  <p className="text-xs md:text-sm text-black">{item.grade} {item.classNumber} - {item.field}</p>
                  <p className="text-xs text-black">{item.mainPosition} - {item.hourType}</p>
                  {item.description && <p className="text-xs text-black">{item.description}</p>}
                </div>
              ))}
            </div>
            
            {getAllSavedSchedulesForCell(selectedCellForHistory.day, selectedCellForHistory.time).length > 3 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <button 
                  onClick={() => {
                    setShowCellHistoryMenu(false);
                    setShowCellHistoryModalOpen(true);
                  }}
                  className="w-full py-1.5 px-3 bg-cyan-600 text-white text-xs md:text-sm rounded hover:bg-cyan-700 transition-colors"
                >
                  نمایش همه موارد
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showCellHistoryModalOpen && selectedCellForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-lg z-10 m-4 md:m-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">تاریخچه کامل برنامه‌ها</h2>
              <button 
                onClick={() => setShowCellHistoryModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="text-sm md:text-base text-black mb-3 bg-gray-50 p-2 rounded">
              <span className="font-bold text-black">روز: </span>{selectedCellForHistory.day}، 
              <span className="font-bold text-black mr-1">ساعت: </span>{hours[timeSlots.indexOf(selectedCellForHistory.time)]}
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto bg-gray-50 rounded p-2">
              <div className="divide-y divide-gray-200">
                {getAllSavedSchedulesForCell(selectedCellForHistory.day, selectedCellForHistory.time).map((item, index) => (
                  <div key={index} className="py-3 text-black bg-white mb-2 p-3 rounded shadow-sm">
                    <p className="font-bold text-black text-sm md:text-base">{item.personnel?.fullName || 'نامشخص'}</p>
                    <p className="text-sm md:text-base text-black">{item.grade} {item.classNumber} - {item.field}</p>
                    <p className="text-sm text-black">{item.mainPosition} - {item.hourType}</p>
                    {item.description && <p className="text-sm text-black mt-1">{item.description}</p>}
                    <p className="text-xs text-black mt-2">تاریخ نامشخص</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowCellHistoryModalOpen(false)}
                className="py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded hover:bg-gray-300 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
      {/* نمایش اعلان‌ها */}
      <Toaster />
      
      {/* فوتر انیمیشن‌دار */}
      {showFooter && (
        <div className="fixed bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 overflow-hidden z-50">
          <div className="relative h-full">
            <button
              onClick={() => setShowFooter(false)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors duration-500 z-10"
            >
              <FaTimes />
            </button>
            <div className="animate-marquee whitespace-nowrap text-white text-sm py-1.5">
              <span className="inline-block mx-4">designed and created by Soroush Qary Ivary</span>
              <span className="inline-block mx-4">طراحی و توسعه توسط سروش قاری ایوری</span>
            </div>
          </div>
        </div>
      )}
      <EducationLevelLoader onLevelLoaded={handleLevelLoaded} />
    </div>
  );
};
/* eslint-enable @typescript-eslint/no-unused-vars */

interface PersonnelSchedulePageProps {
  educationLevel: EducationLevel;
}

export default function PersonnelSchedulePage() {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <PersonnelSchedule />
    </Suspense>
  );
} 