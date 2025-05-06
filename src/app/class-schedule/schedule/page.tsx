'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Dropdown from '../../../components/Dropdown/dropdown';
import Modal from '../../../components/Modal/modal';
import SubmitButton from '../../../components/SubmitButton/submitbutton';
import Input from '../../../components/Input/input';
import { FaPlus, FaTimes, FaSave, FaUserAlt, FaDownload, FaSearch } from "react-icons/fa";
import styles from '../class-schedule.module.css';
import { useSearchParams } from 'next/navigation';

interface Schedule {
  id: string;
  personnelCode: string;
  employmentStatus: string;
  mainPosition: string;
  hourType: string;
  teachingGroup: string;
  description: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  grade?: string;
  classNumber?: string;
  field?: string;
  timestamp?: number;
}

interface Personnel {
  id: string;
  personnelCode: string;
  fullName: string;
  mainPosition: string;
  employmentStatus: string;
}

interface SavedPersonnelSchedule {
  personnel: Personnel;
  schedules: Schedule[];
  timestamp: number;
}

interface ClassStatistics {
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

const toPersianNumber = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => persianNumbers[+w]);
};

const SchedulePage = () => {
  return (
    <Suspense fallback={<div className="text-center p-8">در حال بارگذاری...</div>}>
      <SchedulePageContent />
    </Suspense>
  );
};

const SchedulePageContent = () => {
  const searchParams = useSearchParams();
  const gradeParam = searchParams.get('grade') || '';
  const classParam = searchParams.get('class') || '';
  const fieldParam = searchParams.get('field') || '';
  
  const [showClassModal, setShowClassModal] = useState(!gradeParam || !classParam || !fieldParam);
  const [grade, setGrade] = useState(gradeParam || '');
  const [classNumber, setClassNumber] = useState(classParam || '');
  const [field, setField] = useState(fieldParam || '');
  const [selectedCell, setSelectedCell] = useState<{day: string, time: string} | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [timeSelectionModalOpen, setTimeSelectionModalOpen] = useState(false);
  const [personnelCode, setPersonnelCode] = useState('');
  const [personnelSearchQuery, setPersonnelSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Personnel[]>([]);
  const [showPersonnelSearch, setShowPersonnelSearch] = useState(false);
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [mainPosition, setMainPosition] = useState('');
  const [hourType, setHourType] = useState('');
  const [teachingGroup, setTeachingGroup] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [draggedItem, setDraggedItem] = useState<Schedule | null>(null);
  const dragStartRef = useRef<{day: string, time: string} | null>(null);
  const [savedPersonnelSchedules, setSavedPersonnelSchedules] = useState<SavedPersonnelSchedule[]>([]);
  const [classStats, setClassStats] = useState<ClassStatistics>({
    totalHours: 0,
    uniquePersonnel: 0,
    dayStats: {},
    personnelStats: {},
    subjectStats: {}
  });
  
  const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
  const hours = Array.from({ length: 14 }, (_, i) => `تک ساعت ${toPersianNumber(i + 1)}م`);

  const grades = ['دهم', 'یازدهم', 'دوازدهم'];
  
  const classOptions = {
    'دهم': ['الف', 'ب', 'ج', 'د'],
    'یازدهم': ['الف', 'ب', 'ج', 'د'],
    'دوازدهم': ['الف', 'ب', 'ج', 'د']
  };

  const hourTypes = [
    'موظف اول',
    'موظف دوبل',
    'غیرموظف اول',
    'غیرموظف دوبل',
    'موظف معاونین',
    'موظف سرپرست بخش'
  ];

  const mainPositions = [
    'هنرآموز',
    'دبیر',
    'مدیر',
    'معاون',
    'سرپرست بخش',
    'استادکار'
  ];

  const employmentStatuses = [
    'شاغل',
    'بازنشسته',
    'خرید خدمات'
  ];

  const fields = [
    'الکتروتکنیک',
    'الکترونیک',
    'کامپیوتر',
    'مکانیک',
    'عمران',
    'معماری'
  ];

  const teachingGroups = [
    'دروس نظری و عمومی',
    'شايستگيهاي غير فني',
    'تربيت بدني_دبير',
    'استادکار',
    'الکتروتکنيک',
    'الکترونيک',
    'امور باغي',
    'اموردامي',
    'بازرگاني واموراداري',
    'برق ورايانه',
    'برق',
    'پويانمايي انميشن',
    'تاسيسات مکانيکي',
    'تربيت بدني_هنرآموز',
    'تربيت كودك',
    'تعمير ،نصب و خدمات صنعتي',
    'توليد برنامه هاي تلوزيوني',
    'توليد محتوي وتوسعه رسانه اي',
    'چاپ',
    'حسابداري بازرگاني',
    'حسابداري',
    'ساختمان',
    'سينما',
    'صنايع چوب و مبلمان',
    'صنايع دستي',
    'صنايع شيميايي',
    'صنايع غذايي',
    'صنايع فلزي',
    'طراحي ودوخت',
    'فتو-گرافيك',
    'کامپيوتر',
    'گرافيک',
    'ماشين ابزار',
    'ماشينهاي کشاورزي',
    'متالوژي',
    'مديريت خانواده',
    'مربی بهداشت',
    'مربی پرورشی',
    'مشاور',
    'معدن',
    'معماري داخلي',
    'مکاترونيک',
    'مکانيک خودرو',
    'موسيقي',
    'نقاشي',
    'نمايش',
    'هتلداري ،گردشگري و مهمانداري'
  ];

  useEffect(() => {
    if (gradeParam && classParam && fieldParam) {
      setGrade(gradeParam);
      setClassNumber(classParam);
      setField(fieldParam);
    }
  }, [gradeParam, classParam, fieldParam]);

  useEffect(() => {
    if (grade && classNumber && field) {
      // بارگذاری برنامه‌های پرسنلی و سپس بارگذاری برنامه کلاسی
      loadSavedPersonnelSchedules(() => {
        loadClassScheduleFromStorage();
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade, classNumber, field]);

  useEffect(() => {
    if (schedule.length > 0) {
      calculateClassStatistics();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, savedPersonnelSchedules]);

  useEffect(() => {
    // اضافه کردن لود کردن برنامه‌های پرسنلی مرتبط برای نمایش در هنگام لود اولیه صفحه
    loadSavedPersonnelSchedules();
  }, []);

  const handleClassSubmit = () => {
    if (grade && classNumber && field) {
      setShowClassModal(false);
      loadClassScheduleFromStorage();
    }
  };

  const handleAddNewSchedule = () => {
    setTimeSelectionModalOpen(true);
  };

  const handleTimeSelection = (day: string, time: string) => {
    // بررسی می‌کنیم آیا قبلاً برنامه‌ای در این زمان تعریف شده است یا خیر
    const cellSchedules = getScheduleForCell(day, time);
    const existingSchedule = cellSchedules.length > 0 ? cellSchedules[0] : null;
    
    if (existingSchedule) {
      // اگر برنامه‌ای وجود داشت، به کاربر پیام می‌دهیم
      const personnelInfo = savedPersonnelSchedules.find(
        p => p.personnel.personnelCode === existingSchedule.personnelCode
      );
      
      const personnelName = personnelInfo?.personnel.fullName || `کد: ${existingSchedule.personnelCode}`;
      
      if (window.confirm(`این زمان قبلاً به ${personnelName} با درس ${existingSchedule.teachingGroup || 'نامشخص'} اختصاص داده شده است. آیا می‌خواهید آن را ویرایش کنید؟`)) {
        setSelectedCell({ day, time });
        setTimeSelectionModalOpen(false);
        
        // پر کردن فرم با مقادیر فعلی برای ویرایش
        setPersonnelCode(existingSchedule.personnelCode);
        setEmploymentStatus(existingSchedule.employmentStatus);
        setMainPosition(existingSchedule.mainPosition);
        setHourType(existingSchedule.hourType);
        setTeachingGroup(existingSchedule.teachingGroup);
        setDescription(existingSchedule.description);
        
        // حذف برنامه قبلی
        handleDeleteSchedule(existingSchedule.id);
        
        setModalOpen(true);
      }
    } else {
      // اگر برنامه‌ای وجود نداشت، مودال افزودن برنامه جدید را نمایش می‌دهیم
      setSelectedCell({ day, time });
      setTimeSelectionModalOpen(false);
      setModalOpen(true);
    }
  };

  const handleSubmit = () => {
    if (selectedCell && personnelCode && employmentStatus && mainPosition) {
      const timeStart = selectedCell.time;
      const timeEndHour = parseInt(timeStart.split(':')[0]) + 1;
      const timeEnd = `${toPersianNumber(timeEndHour)}:۰۰`;
      
      const newScheduleItem: Schedule = {
        id: Date.now().toString(),
        personnelCode,
        employmentStatus,
        mainPosition,
        hourType,
        teachingGroup,
        description,
        day: selectedCell.day,
        timeStart,
        timeEnd
      };
      
      setSchedule([...schedule, newScheduleItem]);
      
      // بروزرسانی برنامه پرسنلی مرتبط
      updatePersonnelSchedule(newScheduleItem);
      
      setModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedCell(null);
    setPersonnelCode('');
    setEmploymentStatus('');
    setMainPosition('');
    setHourType('');
    setTeachingGroup('');
    setDescription('');
    setPersonnelSearchQuery('');
    setSearchResults([]);
    setShowPersonnelSearch(false);
  };

  const getScheduleForCell = (day: string, time: string) => {
    // ابتدا برنامه‌های کلاسی را بررسی می‌کنیم
    const classSchedules = schedule.filter(item => 
      item.day === day && 
      item.timeStart === time && 
      !!item.personnelCode // اطمینان از معتبر بودن برنامه
    );
    
    // اگر برنامه‌ای در داده‌های کلاس پیدا شد، آن را برمی‌گردانیم
    if (classSchedules.length > 0) {
      return classSchedules;
    }
    
    // در غیر این صورت، برنامه‌های پرسنلی مرتبط با این کلاس را بررسی می‌کنیم
    const personnelSchedulesForCell: Schedule[] = [];
    
    savedPersonnelSchedules.forEach(personnelData => {
      // بررسی برنامه‌های همه پرسنل
      personnelData.schedules.forEach(s => {
        if (
          s.day === day && 
          s.timeStart === time && 
          s.grade === grade && 
          s.classNumber === classNumber && 
          s.field === field
        ) {
          // ایجاد یک آبجکت برنامه که شامل اطلاعات پرسنل باشد
          const personnelSchedule: Schedule = {
            ...s,
            id: s.id || `personnel_${personnelData.personnel.personnelCode}_${day}_${time}_${Date.now()}`,
            personnelCode: personnelData.personnel.personnelCode,
            employmentStatus: personnelData.personnel.employmentStatus || s.employmentStatus || '',
            mainPosition: s.mainPosition || personnelData.personnel.mainPosition || '',
            hourType: s.hourType || '',
            teachingGroup: s.teachingGroup || '',
            description: s.description || '',
            timeEnd: s.timeEnd || time
          };
          personnelSchedulesForCell.push(personnelSchedule);
        }
      });
    });
    
    return personnelSchedulesForCell;
  };

  const handleDragStart = (e: React.DragEvent, schedule: Schedule, day: string, time: string) => {
    setDraggedItem(schedule);
    dragStartRef.current = { day, time };
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDay: string, targetTime: string) => {
    e.preventDefault();
    if (draggedItem && dragStartRef.current) {
      const updatedItem = {
        ...draggedItem,
        id: Date.now().toString(),
        day: targetDay,
        timeStart: targetTime,
        timeEnd: `${toPersianNumber(parseInt(targetTime.split(':')[0]) + 1)}:۰۰`
      };
      
      setSchedule([...schedule, updatedItem]);
      setDraggedItem(null);
      dragStartRef.current = null;
    }
  };

  const handleDeleteSchedule = (id: string) => {
    // یافتن برنامه‌ای که باید حذف شود
    const scheduleToDelete = schedule.find(item => item.id === id);
    
    if (scheduleToDelete) {
      // حذف از state فعلی
      setSchedule(schedule.filter(item => item.id !== id));
      
      // حذف از برنامه پرسنلی مرتبط
      removeFromPersonnelSchedule(scheduleToDelete);
      
      // ذخیره تغییرات در localStorage
      saveClassScheduleToStorage();
    } else {
      // ممکن است این برنامه از صفحه پرسنلی اضافه شده باشد و در state اصلی نباشد
      // در این حالت باید یک بررسی اضافی انجام دهیم
      
      savedPersonnelSchedules.forEach(personnelData => {
        const personnelSchedule = personnelData.schedules.find(s => s.id === id);
        if (personnelSchedule) {
          // برنامه پرسنلی متناظر را پیدا کردیم، آن را حذف می‌کنیم
          const scheduleItem: Schedule = {
            id,
            personnelCode: personnelData.personnel.personnelCode,
            employmentStatus: personnelData.personnel.employmentStatus,
            mainPosition: personnelSchedule.mainPosition || personnelData.personnel.mainPosition,
            hourType: personnelSchedule.hourType || '',
            teachingGroup: personnelSchedule.teachingGroup || '',
            description: personnelSchedule.description || '',
            day: personnelSchedule.day,
            timeStart: personnelSchedule.timeStart,
            timeEnd: personnelSchedule.timeEnd
          };
          
          // حذف از برنامه پرسنلی
          removeFromPersonnelSchedule(scheduleItem);
          
          // بارگذاری مجدد برنامه‌ها
          loadClassScheduleFromStorage();
        }
      });
    }
  };

  const updatePersonnelSchedule = (scheduleItem: Schedule) => {
    try {
      // بررسی اینکه آیا پرسنلی با این کد وجود دارد
      const personnelData = savedPersonnelSchedules.find(
        s => s.personnel.personnelCode === scheduleItem.personnelCode
      );
      
      if (personnelData) {
        // پرسنل را پیدا کردیم، برنامه را به‌روزرسانی می‌کنیم
        const personnelId = personnelData.personnel.id;
        const storageKey = `personnel_schedule_${personnelId}`;
        
        // بررسی می‌کنیم آیا برنامه قبلاً در همان روز و ساعت وجود دارد
        const existingScheduleIndex = personnelData.schedules.findIndex(
          s => s.day === scheduleItem.day && s.timeStart === scheduleItem.timeStart && 
          s.grade === grade && s.classNumber === classNumber && s.field === field
        );
        
        const updatedSchedule = {
          ...scheduleItem,
          personnelId: personnelId,  // اضافه کردن شناسه پرسنل
          grade: grade,
          classNumber: classNumber,
          field: field,
          timestamp: Date.now(),
          classScheduleId: `${grade}-${classNumber}-${field}` // اضافه کردن شناسه برنامه کلاسی
        };
        
        if (existingScheduleIndex !== -1) {
          // برنامه را به‌روزرسانی می‌کنیم
          personnelData.schedules[existingScheduleIndex] = updatedSchedule;
        } else {
          // برنامه جدید را اضافه می‌کنیم
          personnelData.schedules.push(updatedSchedule);
        }
        
        // برنامه پرسنلی را ذخیره می‌کنیم
        personnelData.timestamp = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(personnelData));
        
        // بارگذاری مجدد برنامه‌های پرسنلی
        loadSavedPersonnelSchedules();
        
        // نمایش پیام موفقیت (اختیاری)
        // console.log(`برنامه پرسنلی ${personnelData.personnel.fullName} به‌روزرسانی شد`);
      } else {
        // اگر پرسنل یافت نشد، یک پیام خطا در کنسول نمایش می‌دهیم
        console.warn(`پرسنلی با کد ${scheduleItem.personnelCode} یافت نشد`);
      }
    } catch (error) {
      console.error('خطا در به‌روزرسانی برنامه پرسنلی:', error);
    }
  };
  
  const removeFromPersonnelSchedule = (scheduleItem: Schedule) => {
    try {
      // بررسی اینکه آیا پرسنلی با این کد وجود دارد
      const personnelData = savedPersonnelSchedules.find(
        s => s.personnel.personnelCode === scheduleItem.personnelCode
      );
      
      if (personnelData) {
        // پرسنل را پیدا کردیم، برنامه را از لیست حذف می‌کنیم
        const personnelId = personnelData.personnel.id;
        const storageKey = `personnel_schedule_${personnelId}`;
        
        // حذف برنامه از لیست - دقت بیشتر در تشخیص برنامه مورد نظر
        personnelData.schedules = personnelData.schedules.filter(
          s => !(s.day === scheduleItem.day && s.timeStart === scheduleItem.timeStart && 
               s.grade === grade && s.classNumber === classNumber && s.field === field)
        );
        
        // برنامه پرسنلی را ذخیره می‌کنیم
        personnelData.timestamp = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(personnelData));
        
        // بارگذاری مجدد برنامه‌های پرسنلی
        loadSavedPersonnelSchedules();
      } else {
        // اگر پرسنل یافت نشد، یک پیام خطا در کنسول نمایش می‌دهیم
        console.warn(`پرسنلی با کد ${scheduleItem.personnelCode} یافت نشد`);
      }
    } catch (error) {
      console.error('خطا در حذف برنامه از برنامه پرسنلی:', error);
    }
  };
  
  const loadClassScheduleFromStorage = () => {
    if (!grade || !classNumber || !field) return;
    
    try {
      const classKey = `${grade}-${classNumber}-${field}`;
      const storageKey = `class_schedule_${classKey}`;
      let allSchedules: Schedule[] = [];
      
      // 1. Load from class schedule first
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData.schedules && Array.isArray(parsedData.schedules)) {
            allSchedules = [...parsedData.schedules];
          }
        } catch (error) {
          console.error('خطا در تجزیه داده‌ها:', error);
        }
      }
      
      // 2. بارگذاری اطلاعات پرسنلی
      loadSavedPersonnelSchedules(() => {
        // 3. Find any personnel schedules related to this class 
        const personnelSchedulesForThisClass: Schedule[] = [];
        
        savedPersonnelSchedules.forEach(personnelData => {
          const relatedSchedules = personnelData.schedules.filter(s => 
            s.grade === grade && 
            s.classNumber === classNumber && 
            s.field === field
          );
          
          // Add personnel info to these schedules
          relatedSchedules.forEach(s => {
            // بررسی می‌کنیم آیا این برنامه قبلاً در لیست برنامه‌های کلاس اضافه شده است
            const alreadyExists = allSchedules.some(existingSchedule => 
              existingSchedule.day === s.day && 
              existingSchedule.timeStart === s.timeStart &&
              existingSchedule.personnelCode === personnelData.personnel.personnelCode
            );
            
            // اگر برنامه قبلاً اضافه نشده، آن را به لیست اضافه می‌کنیم
            if (!alreadyExists) {
              const personnelSchedule: Schedule = {
                ...s,
                personnelCode: personnelData.personnel.personnelCode,
                employmentStatus: personnelData.personnel.employmentStatus || s.employmentStatus || '',
                mainPosition: s.mainPosition || personnelData.personnel.mainPosition,
                hourType: s.hourType || '',
                teachingGroup: s.teachingGroup || '',
                description: s.description || '',
                id: s.id || Date.now().toString()
              };
              personnelSchedulesForThisClass.push(personnelSchedule);
            }
          });
        });
        
        // 4. Combine both sources
        const combinedSchedules = [...allSchedules, ...personnelSchedulesForThisClass];
        
        setSchedule(combinedSchedules);
        calculateClassStatistics();
      });
      
    } catch (error) {
      console.error('خطا در بارگیری برنامه کلاسی:', error);
    }
  };
  
  const loadSavedPersonnelSchedules = (callback?: () => void) => {
    // بارگیری تمام برنامه‌های پرسنلی از localStorage
    try {
      const personnelSchedules: SavedPersonnelSchedule[] = [];
      
      // بررسی تمام کلیدهای localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('personnel_schedule_')) {
          try {
            const savedData = localStorage.getItem(key);
            if (savedData) {
              const parsedData = JSON.parse(savedData);
              if (parsedData.personnel && parsedData.schedules) {
                personnelSchedules.push(parsedData);
              }
            }
          } catch (error) {
            console.error('خطا در تجزیه داده‌های پرسنلی:', error);
          }
        }
      }
      
      // مرتب‌سازی براساس تاریخ (جدیدترین در ابتدا)
      personnelSchedules.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      
      setSavedPersonnelSchedules(personnelSchedules);
      
      // اجرای callback در صورت وجود
      if (callback) {
        callback();
      }
    } catch (error) {
      console.error('خطا در بارگیری برنامه‌های پرسنلی:', error);
      // اجرای callback حتی در صورت خطا
      if (callback) {
        callback();
      }
    }
  };
  
  const saveClassScheduleToStorage = () => {
    if (!grade || !classNumber || !field) return;
    
    try {
      const classKey = `${grade}-${classNumber}-${field}`;
      const storageKey = `class_schedule_${classKey}`;
      
      // فیلتر کردن و شناسایی برنامه‌های اصلی (آنهایی که از صفحه کلاس اضافه شده‌اند)
      // و برنامه‌های پرسنلی (آنهایی که از صفحه پرسنل اضافه شده‌اند)
      const classSchedules = schedule.filter(item => 
        !!item.personnelCode && // فقط برنامه‌های دارای کد پرسنلی را نگه می‌داریم
        !!item.day && !!item.timeStart // و فقط برنامه‌های دارای روز و زمان را نگه می‌داریم
      );
      
      const savedSchedule = {
        id: Date.now().toString(),
        grade,
        classNumber,
        field,
        schedules: classSchedules,
        timestamp: Date.now()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(savedSchedule));
      
      // به‌روزرسانی همه برنامه‌های پرسنلی مرتبط
      classSchedules.forEach(item => {
        updatePersonnelSchedule(item);
      });
      
      alert('برنامه کلاسی با موفقیت ذخیره شد');
      
      // بارگذاری مجدد برنامه‌ها برای اطمینان از همگام‌سازی
      loadClassScheduleFromStorage();
      
    } catch (error) {
      console.error('خطا در ذخیره برنامه کلاسی:', error);
      alert('خطا در ذخیره برنامه کلاسی');
    }
  };
  
  // تابع برای مشاهده برنامه پرسنلی
  const navigateToPersonnelSchedule = (personnelCode: string, fullName: string, mainPosition: string) => {
    const url = `/personnel-schedule/schedule?code=${encodeURIComponent(personnelCode)}&name=${encodeURIComponent(fullName)}&position=${encodeURIComponent(mainPosition)}`;
    window.open(url, '_blank');
  };

  const calculateClassStatistics = () => {
    const stats: ClassStatistics = {
      totalHours: 0,
      uniquePersonnel: 0,
      dayStats: {},
      personnelStats: {},
      subjectStats: {}
    };

    // آمار کل ساعت‌ها
    const uniqueHours = new Set<string>();
    schedule.forEach(item => {
      const hourKey = `${item.day}-${item.timeStart}`;
      uniqueHours.add(hourKey);
    });
    stats.totalHours = uniqueHours.size;

    // آمار بر اساس روز
    days.forEach(day => {
      const daySchedules = schedule.filter(item => item.day === day);
      if (daySchedules.length > 0) {
        const uniqueDayHours = new Set<string>();
        const personnelInDay = new Set<string>();
        
        daySchedules.forEach(item => {
          personnelInDay.add(item.personnelCode);
          const hourKey = `${item.day}-${item.timeStart}`;
          uniqueDayHours.add(hourKey);
        });

        stats.dayStats[day] = {
          count: uniqueDayHours.size, // تعداد ساعت‌های منحصر به فرد
          personnel: Array.from(personnelInDay)
        };
      }
    });

    // آمار بر اساس پرسنل
    const personnelCodes = new Set<string>();
    schedule.forEach(item => {
      personnelCodes.add(item.personnelCode);

      if (!stats.personnelStats[item.personnelCode]) {
        const personnelInfo = savedPersonnelSchedules.find(
          p => p.personnel.personnelCode === item.personnelCode
        );
        
        stats.personnelStats[item.personnelCode] = {
          count: 0,
          days: [],
          fullName: personnelInfo?.personnel.fullName || `کد: ${item.personnelCode}`
        };
      }
      
      // افزایش تعداد ساعت‌های منحصر به فرد
      const hourKey = `${item.day}-${item.timeStart}`;
      if (!stats.personnelStats[item.personnelCode].hourKeys) {
        stats.personnelStats[item.personnelCode].hourKeys = new Set<string>();
      }
      stats.personnelStats[item.personnelCode].hourKeys?.add(hourKey);
      stats.personnelStats[item.personnelCode].count = stats.personnelStats[item.personnelCode].hourKeys?.size || 0;
      
      if (!stats.personnelStats[item.personnelCode].days.includes(item.day)) {
        stats.personnelStats[item.personnelCode].days.push(item.day);
      }
    });
    stats.uniquePersonnel = personnelCodes.size;

    // آمار بر اساس گروه تدریس
    schedule.forEach(item => {
      if (item.teachingGroup) {
        if (!stats.subjectStats[item.teachingGroup]) {
          stats.subjectStats[item.teachingGroup] = {
            count: 0,
            personnel: [],
            hourKeys: new Set<string>()
          };
        }

        // افزایش تعداد ساعت‌های منحصر به فرد
        const hourKey = `${item.day}-${item.timeStart}`;
        stats.subjectStats[item.teachingGroup].hourKeys?.add(hourKey);
        stats.subjectStats[item.teachingGroup].count = stats.subjectStats[item.teachingGroup].hourKeys?.size || 0;
        
        if (!stats.subjectStats[item.teachingGroup].personnel.includes(item.personnelCode)) {
          stats.subjectStats[item.teachingGroup].personnel.push(item.personnelCode);
        }
      }
    });

    // پاک کردن مجموعه‌های hourKeys از آبجکت نهایی برای سریالایز کردن
    Object.values(stats.personnelStats).forEach(stat => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (stat as any).hourKeys;
    });
    
    Object.values(stats.subjectStats).forEach(stat => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (stat as any).hourKeys;
    });

    setClassStats(stats);
  };

  // تابع جستجوی پرسنل
  const searchPersonnel = (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    const results: Personnel[] = [];
    savedPersonnelSchedules.forEach(schedule => {
      const fullName = schedule.personnel.fullName.toLowerCase();
      const code = schedule.personnel.personnelCode;
      const position = schedule.personnel.mainPosition.toLowerCase();
      
      if (
        fullName.includes(query.toLowerCase()) || 
        code.includes(query) || 
        position.includes(query.toLowerCase())
      ) {
        results.push(schedule.personnel);
      }
    });
    
    setSearchResults(results);
    // نمایش نتایج جستجو به طور خودکار
    setShowPersonnelSearch(results.length > 0);
  };

  // انتخاب پرسنل از نتایج جستجو
  const selectPersonnelFromSearch = (personnel: Personnel) => {
    setPersonnelCode(personnel.personnelCode);
    setEmploymentStatus(personnel.employmentStatus || '');
    setMainPosition(personnel.mainPosition);
    setShowPersonnelSearch(false);
    setPersonnelSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/class-schedule" className={styles.backButton}>
          بازگشت
        </Link>
        <h1 className="text-cyan-700">
          برنامه‌ریزی کلاس {!showClassModal && `${grade}/${classNumber} ${field}`}
        </h1>
      </header>

      <main className={styles.main}>
        <div className="w-full p-4 flex flex-col gap-6">
          {/* افزودن دکمه ذخیره برنامه */}
          {!showClassModal && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <button
                onClick={saveClassScheduleToStorage}
                className="bg-lime-600 text-white px-4 py-2 rounded hover:bg-lime-700 transition-colors mx-2 flex items-center"
              >
                <FaSave className="ml-2" />
                ذخیره برنامه کلاس
              </button>
              <button
                onClick={() => window.location.href = '/personnel-schedule/schedule'}
                className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition-colors mx-2 flex items-center"
              >
                <FaUserAlt className="ml-2" />
                مشاهده برنامه‌های پرسنلی
              </button>
              <button
                onClick={handleAddNewSchedule}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors mx-2 flex items-center"
              >
                <FaPlus className="ml-2" />
                افزودن برنامه جدید
              </button>
              {schedule.length > 0 && (
                <button
                  onClick={() => {
                    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
                      JSON.stringify({
                        grade,
                        classNumber,
                        field,
                        schedules: schedule,
                        timestamp: Date.now()
                      })
                    )}`;
                    const downloadAnchorNode = document.createElement('a');
                    downloadAnchorNode.setAttribute('href', dataStr);
                    downloadAnchorNode.setAttribute('download', `برنامه_کلاس_${grade}_${classNumber}_${field}.json`);
                    document.body.appendChild(downloadAnchorNode);
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors mx-2 flex items-center"
                >
                  <FaDownload className="ml-2" />
                  خروجی فایل
                </button>
              )}
            </div>
          )}

          {/* جدول زمانی هفتگی */}
          <div className="w-full">
            <h2 className="text-xl font-bold mb-4 text-cyan-900 text-center">جدول زمانی هفتگی</h2>
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-black text-right w-24">روز / ساعت</th>
                    {hours.map(hour => (
                      <th key={hour} className="border border-gray-300 p-2 text-cyan-900 text-center min-w-[120px]">{hour}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day}>
                      <td className="border border-gray-300 p-2 text-cyan-900 text-right font-bold">{day}</td>
                      {hours.map(hour => {
                        const cellSchedules = getScheduleForCell(day, hour);
                        const hasSchedule = cellSchedules.length > 0;
                        
                        return (
                          <td 
                            key={`${day}-${hour}`} 
                            className={`border border-gray-300 p-1 h-24 align-top schedule-cell min-w-[120px] ${hasSchedule ? 'bg-blue-50' : ''}`}
                            onClick={() => handleTimeSelection(day, hour)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day, hour)}
                          >
                            {hasSchedule ? (
                              <div 
                                className="w-full h-full p-1 text-black bg-blue-100 rounded text-right schedule-cell-content relative"
                                draggable
                                onDragStart={(e) => handleDragStart(e, cellSchedules[0], day, hour)}
                              >
                                <button
                                  className="absolute top-1 left-1 text-red-500 hover:text-red-700 z-10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSchedule(cellSchedules[0].id);
                                  }}
                                  title="حذف"
                                >
                                  <FaTimes size={12} />
                                </button>
                                
                                {/* بهبود نمایش اطلاعات سلول */}
                                <div className="flex justify-between items-start">
                                  <div className="font-bold text-black mb-1">{cellSchedules[0].mainPosition}</div>
                                </div>
                                
                                <div 
                                  className="text-xs text-black cursor-pointer hover:text-cyan-700 hover:underline flex items-center font-bold"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // یافتن اطلاعات کامل پرسنل
                                    const personnelInfo = savedPersonnelSchedules.find(
                                      p => p.personnel.personnelCode === cellSchedules[0].personnelCode
                                    );
                                    if (personnelInfo) {
                                      navigateToPersonnelSchedule(
                                        personnelInfo.personnel.personnelCode,
                                        personnelInfo.personnel.fullName,
                                        personnelInfo.personnel.mainPosition
                                      );
                                    }
                                  }}
                                >
                                  <span className="inline-block ml-1">👤</span>
                                  {savedPersonnelSchedules.find(p => p.personnel.personnelCode === cellSchedules[0].personnelCode)?.personnel.fullName || 
                                   `کد: ${cellSchedules[0].personnelCode}`}
                                </div>
                                
                                {/* نمایش گروه تدریس با برجستگی بیشتر */}
                                <div className="text-xs text-blue-700 mt-1 font-bold border-t border-gray-200 pt-1">
                                  {cellSchedules[0].teachingGroup || 'بدون گروه تدریس'}
                                </div>
                                
                                <div className="text-xs text-black">نوع ساعت: {cellSchedules[0].hourType || '-'}</div>
                                {cellSchedules[0].description && (
                                  <div className="text-xs text-black mt-1 overflow-hidden text-ellipsis whitespace-nowrap" title={cellSchedules[0].description}>
                                    توضیحات: {cellSchedules[0].description}
                                  </div>
                                )}
                                
                                {/* نشانگر منبع برنامه */}
                                <div className="absolute bottom-1 right-1 text-xs">
                                  {!schedule.some(s => s.day === day && s.timeStart === hour && s.id === cellSchedules[0].id) && (
                                    <span className="text-purple-500 font-medium border border-purple-300 rounded-md px-1 bg-purple-50">
                                      از برنامه پرسنلی
                                    </span>
                                  )}
                                </div>
                                
                                {/* دکمه ویرایش برنامه */}
                                <button
                                  className="absolute top-1 left-6 text-blue-500 hover:text-blue-700 z-10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // پر کردن فرم با مقادیر فعلی برای ویرایش
                                    setSelectedCell({ day, time: hour });
                                    setPersonnelCode(cellSchedules[0].personnelCode);
                                    setEmploymentStatus(cellSchedules[0].employmentStatus);
                                    setMainPosition(cellSchedules[0].mainPosition);
                                    setHourType(cellSchedules[0].hourType);
                                    setTeachingGroup(cellSchedules[0].teachingGroup);
                                    setDescription(cellSchedules[0].description);
                                    
                                    // حذف برنامه قبلی
                                    handleDeleteSchedule(cellSchedules[0].id);
                                    
                                    // باز کردن مودال ویرایش
                                    setModalOpen(true);
                                  }}
                                  title="ویرایش"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded">
                                <FaPlus className="text-gray-400 hover:text-lime-600" />
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
          </div>

          {/* آمار کلی برای کلاس */}
          {schedule.length > 0 && (
            <div className="w-full mt-6 bg-blue-50 rounded-md p-3 border border-blue-200">
              <h3 className="text-base md:text-lg font-bold text-blue-800 mb-2">آمار کلی کلاس {grade} {classNumber} {field}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-2 md:p-3 rounded-md shadow-sm">
                  <p className="text-gray-900 text-xs md:text-sm">تعداد کل ساعت‌ها</p>
                  <p className="text-gray-900 font-bold text-lg md:text-xl">{classStats.totalHours}</p>
                </div>
                <div className="bg-white p-2 md:p-3 rounded-md shadow-sm">
                  <p className="text-gray-900 text-xs md:text-sm">تعداد پرسنل منحصر به فرد</p>
                  <p className="text-gray-900 font-bold text-lg md:text-xl">{classStats.uniquePersonnel}</p>
                </div>
                <div 
                  className="bg-white p-2 md:p-3 rounded-md shadow-sm cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => saveClassScheduleToStorage()}
                >
                  <p className="text-gray-900 text-xs md:text-sm">وضعیت ذخیره‌سازی</p>
                  <p className="text-gray-900 font-bold text-sm md:text-base flex items-center">
                    {localStorage.getItem(`class_schedule_${grade}-${classNumber}-${field}`) ? 
                      <span className="flex items-center text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        ذخیره شده
                      </span> : 
                      <span className="flex items-center text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        ذخیره نشده
                      </span>
                    }
                    <span className="text-xs mr-2 text-cyan-700">
                      (کلیک برای ذخیره)
                    </span>
                  </p>
                </div>
              </div>
              
              {/* جزئیات برنامه روزانه */}
              <div className="mt-4">
                <h4 className="text-sm md:text-base font-bold text-blue-800 mb-2">جزئیات برنامه روزانه</h4>
                <div className="bg-white rounded-md shadow-sm overflow-hidden">
                  {days.map(day => {
                    const dayStat = classStats.dayStats[day];
                    if (!dayStat) return null;
                    
                    return (
                      <div key={day} className="border-b border-gray-100 p-2 md:p-3">
                        <h5 className="text-gray-900 font-bold text-sm md:text-base mb-1">{day}</h5>
                        <div className="pl-3 text-xs md:text-sm">
                          <div className="mb-1 text-gray-900">
                            <span className="font-medium">تعداد ساعت: </span>
                            <span>{dayStat.count}</span>
                          </div>
                          <div className="mb-1 text-gray-900">
                            <span className="font-medium">پرسنل: </span>
                            <span>
                              {dayStat.personnel.map(personnelCode => {
                                const personnelInfo = classStats.personnelStats[personnelCode];
                                return personnelInfo?.fullName || `کد: ${personnelCode}`;
                              }).join('، ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* جزئیات پرسنل */}
              <div className="mt-4">
                <h4 className="text-sm md:text-base font-bold text-blue-800 mb-2">جزئیات پرسنل</h4>
                <div className="bg-white rounded-md shadow-sm overflow-hidden">
                  {Object.entries(classStats.personnelStats).map(([personnelCode, stat], index) => (
                    <div key={index} className="border-b border-gray-100 p-2 md:p-3">
                      <h5 
                        className="text-gray-900 font-bold text-sm md:text-base mb-1 cursor-pointer hover:text-cyan-700 flex items-center"
                        onClick={() => {
                          const personnelInfo = savedPersonnelSchedules.find(
                            p => p.personnel.personnelCode === personnelCode
                          );
                          if (personnelInfo) {
                            navigateToPersonnelSchedule(
                              personnelInfo.personnel.personnelCode,
                              personnelInfo.personnel.fullName,
                              personnelInfo.personnel.mainPosition
                            );
                          }
                        }}
                      >
                        <span className="inline-block ml-1">👤</span>
                        {stat.fullName} <span className="text-xs text-gray-600">({personnelCode})</span>
                      </h5>
                      <div className="pl-3 text-xs md:text-sm">
                        <div className="mb-1 text-gray-900">
                          <span className="font-medium">تعداد ساعت: </span>
                          <span>{stat.count}</span>
                        </div>
                        <div className="mb-1 text-gray-900">
                          <span className="font-medium">روزها: </span>
                          <span>{stat.days.join('، ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* جزئیات گروه‌های تدریسی */}
              <div className="mt-4">
                <h4 className="text-sm md:text-base font-bold text-blue-800 mb-2">جزئیات گروه‌های تدریسی</h4>
                <div className="bg-white rounded-md shadow-sm overflow-hidden">
                  {Object.entries(classStats.subjectStats).map(([subject, stat], index) => (
                    <div key={index} className="border-b border-gray-100 p-2 md:p-3">
                      <h5 className="text-gray-900 font-bold text-sm md:text-base mb-1">
                        {subject}
                      </h5>
                      <div className="pl-3 text-xs md:text-sm">
                        <div className="mb-1 text-gray-900">
                          <span className="font-medium">تعداد ساعت: </span>
                          <span>{stat.count}</span>
                        </div>
                        <div className="mb-1 text-gray-900">
                          <span className="font-medium">پرسنل: </span>
                          <span>
                            {stat.personnel.map(personnelCode => {
                              const personnelInfo = classStats.personnelStats[personnelCode];
                              return personnelInfo?.fullName || `کد: ${personnelCode}`;
                            }).join('، ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* خلاصه متنی برنامه */}
              <div className="mt-4">
                <h4 className="text-sm md:text-base font-bold text-blue-800 mb-2">خلاصه متنی برنامه</h4>
                <div className="bg-white rounded-md shadow-sm p-3 overflow-x-auto">
                  <pre className="text-xs md:text-sm whitespace-pre-wrap font-[Farhang2] text-gray-900 leading-relaxed">
                    {`کلاس: ${grade} ${classNumber} ${field}
تعداد کل ساعت: ${classStats.totalHours}
تعداد پرسنل منحصر به فرد: ${classStats.uniquePersonnel}

${days.map(day => {
  const dayStat = classStats.dayStats[day];
  if (!dayStat) return '';
  
  return `${day}:
${dayStat.personnel.map(personnelCode => {
  const personnelInfo = classStats.personnelStats[personnelCode];
  return `    ${personnelInfo?.fullName || `کد: ${personnelCode}`}`;
}).join('\n')}`;
}).filter(Boolean).join('\n\n')}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* فرم و لیست */}
          <div className="w-full mt-4">
            <div className="border border-gray-300 rounded p-4">
              <h2 className="text-xl font-bold mb-4 text-right text-lime-600">مدیریت برنامه</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2 text-right text-cyan-600">برنامه‌های اخیر</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
                  {schedule.map(item => (
                    <div key={item.id} className="p-2 bg-cyan-100 rounded-lg text-right text-black relative hover:bg-cyan-200 transition-colors">
                      <button
                        className="absolute top-2 left-2 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSchedule(item.id);
                        }}
                        title="حذف"
                      >
                        <FaTimes size={14} />
                      </button>
                      <div 
                        className="font-bold text-black cursor-pointer hover:text-cyan-700 hover:underline flex items-center"
                        onClick={() => {
                          // یافتن اطلاعات کامل پرسنل
                          const personnelInfo = savedPersonnelSchedules.find(
                            p => p.personnel.personnelCode === item.personnelCode
                          );
                          if (personnelInfo) {
                            navigateToPersonnelSchedule(
                              personnelInfo.personnel.personnelCode,
                              personnelInfo.personnel.fullName,
                              personnelInfo.personnel.mainPosition
                            );
                          }
                        }}
                      >
                        <span className="inline-block ml-1">👤</span>
                        {savedPersonnelSchedules.find(p => p.personnel.personnelCode === item.personnelCode)?.personnel.fullName || 
                         `کد: ${item.personnelCode}`}
                      </div>
                      <div className="text-sm text-black">
                        {item.day} - {item.timeStart}
                        {item.timeStart !== item.timeEnd && 
                          ` تا ${item.timeEnd}`
                        }
                      </div>
                      <div className="text-sm text-black">پست: {item.mainPosition}</div>
                      <div className="text-sm text-black">نوع ساعت: {item.hourType}</div>
                      <div className="text-sm text-black">گروه تدریس: {item.teachingGroup}</div>
                      {item.description && (
                        <div className="text-sm text-black mt-1">توضیحات: {item.description}</div>
                      )}
                    </div>
                  ))}
                  {schedule.length === 0 && (
                    <div className="text-black text-center col-span-full">هنوز برنامه‌ای ثبت نشده است</div>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <SubmitButton 
                  label="افزودن برنامه جدید" 
                  onClick={handleAddNewSchedule}
                  className="mx-auto text-lime-600 border border-lime-600 pr-2 hover:text-lime-700 hover:scale-110 transition-all duration-250"
                />
              </div>
            </div>
          </div>
        </div>

        {/* مودال انتخاب زمان */}
        <Modal
          isOpen={timeSelectionModalOpen}
          onClose={() => setTimeSelectionModalOpen(false)}
          title="انتخاب زمان برنامه"
          width="80%"
          className="text-black"
        >
          <div className="space-y-4 text-right">
            <p className="mb-4 text-center">لطفاً روز و ساعت مورد نظر را انتخاب کنید</p>
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-black text-right w-20">روز / ساعت</th>
                    {hours.map(hour => (
                      <th key={hour} className="border border-gray-300 p-2 text-cyan-900 text-center">{hour}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day}>
                      <td className="border border-gray-300 p-2 text-cyan-900 text-right font-bold">{day}</td>
                      {hours.map(hour => (
                        <td 
                          key={`${day}-${hour}`} 
                          className="border border-gray-300 p-1 h-12 align-middle text-center cursor-pointer hover:bg-lime-100"
                          onClick={() => handleTimeSelection(day, hour)}
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            <FaPlus className="text-lime-600" />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>

        {/* مودال افزودن برنامه */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-in-out">
            <div className="absolute inset-0 bg-gradient-to-br opacity-55 from-yellow-500 via-orange-500 to-purple-500 backdrop-blur-[2px] animate-gradient"></div>
            <div className="bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-500 ease-in-out shadow-xl relative text-black">
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTimes size={24} />
                </button>
                <h2 className="text-xl font-bold text-black">افزودن برنامه جدید</h2>
              </div>
              <div className="space-y-4 text-right">
                {selectedCell && (
                  <div className="bg-blue-50 p-2 rounded">
                    <p>زمان انتخاب شده: {selectedCell.day} ساعت {selectedCell.time}</p>
                  </div>
                )}
                    
                {/* جستجوی پرسنل */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">جستجو و انتخاب پرسنل</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={personnelSearchQuery}
                      onChange={(e) => {
                        setPersonnelSearchQuery(e.target.value);
                        searchPersonnel(e.target.value);
                      }}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="نام یا کد پرسنلی را جستجو کنید"
                    />
                    <button
                      onClick={() => setShowPersonnelSearch(!showPersonnelSearch)}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      title="جستجوی پرسنل"
                    >
                      <FaSearch />
                    </button>
                  </div>
                  
                  {showPersonnelSearch && searchResults.length > 0 && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                      {searchResults.map(personnel => (
                        <div
                          key={personnel.id}
                          className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
                          onClick={() => selectPersonnelFromSearch(personnel)}
                        >
                          <div className="font-medium text-gray-900">{personnel.fullName}</div>
                          <div className="text-sm text-gray-600">کد پرسنلی: {personnel.personnelCode}</div>
                          <div className="text-sm text-gray-600">سمت: {personnel.mainPosition}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Input
                  label="کد پرسنلی"
                  value={personnelCode}
                  onChange={(e) => setPersonnelCode(e.target.value)}
                  placeholder="کد پرسنلی را وارد کنید"
                  className="w-full text-black"
                  type="text"
                />

                <Dropdown
                  label="وضعیت اشتغال"
                  options={employmentStatuses}
                  onSelect={setEmploymentStatus}
                  value={employmentStatus}
                  showPlaceholder={true}
                />

                <Dropdown
                  label="پست اصلی"
                  options={mainPositions}
                  onSelect={setMainPosition}
                  value={mainPosition}
                  showPlaceholder={true}
                />

                <Dropdown
                  label="نوع ساعت"
                  options={hourTypes}
                  onSelect={setHourType}
                  value={hourType}
                  showPlaceholder={true}
                />

                <Dropdown
                  label="گروه تدریس"
                  options={teachingGroups}
                  onSelect={setTeachingGroup}
                  value={teachingGroup}
                  showPlaceholder={true}
                />

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    rows={3}
                    placeholder="توضیحات اضافی را وارد کنید"
                  />
                </div>
                
                <div className="flex justify-end pt-4">
                  <SubmitButton 
                    label="ثبت برنامه" 
                    onClick={handleSubmit} 
                    className="ml-2 bg-lime-400 hover:bg-green-500"
                  />
                  <SubmitButton 
                    label="انصراف" 
                    onClick={() => {
                      setModalOpen(false);
                      resetForm();
                    }} 
                    className="bg-red-100 text-red-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* مودال انتخاب کلاس */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-in-out animate-gradientBG">
          <div className="absolute inset-0 bg-gradient-to-br opacity-55 from-yellow-500 via-orange-500 to-purple-500 backdrop-blur-[2px] animate-gradient"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-500 ease-in-out shadow-xl relative">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-black text-center">انتخاب کلاس</h2>
            </div>
            <div className="space-y-6 text-right">
              <Dropdown
                label="پایه"
                options={grades}
                onSelect={(value) => {
                  setGrade(value);
                  setClassNumber('');
                }}
                value={grade}
                showPlaceholder={true}
              />

              <Dropdown
                label="شماره/ نام کلاس"
                options={grade ? classOptions[grade as keyof typeof classOptions] : []}
                onSelect={setClassNumber}
                value={classNumber}
                showPlaceholder={true}
              />

              <Dropdown
                label="رشته تحصیلی"
                options={fields}
                onSelect={setField}
                value={field}
                showPlaceholder={true}
              />

              <div className="flex justify-between pt-6">
                <Link 
                  href="/welcome" 
                  className="py-1 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200 align-middle transition-colors h-8 w-1/4 text-center"
                >
                  انصراف
                </Link>
                <SubmitButton 
                  label="تایید" 
                  onClick={handleClassSubmit} 
                  className="w-2/3 mr-2 bg-lime-600 hover:bg-lime-700 pr-10"
                  disabled={!grade || !classNumber || !field}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .modal-with-gradient::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(156, 39, 176, 0.3), rgba(33, 150, 243, 0.3), rgba(76, 105, 80, 0.3));
          background-size: 300% 300%;
          animation: gradientAnimation 5s ease infinite;
          z-index: -1;
          pointer-events: none;
          opacity: 0.9;
          backdrop-filter: blur(2px);
        }
      `}</style>
    </div>
  );
};

export default SchedulePage; 