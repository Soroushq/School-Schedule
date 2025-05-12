'use client';

import React, { useState, useRef, useEffect, Suspense, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Dropdown from '../../../components/Dropdown/dropdown';
import Modal from '../../../components/Modal/modal';
import SubmitButton from '../../../components/SubmitButton/submitbutton';
import Input from '../../../components/Input/input';
import { FaPlus, FaTimes, FaSave, FaUserAlt, FaDownload, FaSearch, FaTrash, FaHistory, FaEdit, FaEye, FaExclamationTriangle, FaFileDownload, FaFileExport, FaFilePdf } from "react-icons/fa";
import styles from '../class-schedule.module.css';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { syncService } from '@/services/syncService';
import { scheduleSyncService } from '@/services/scheduleSync';

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
  hourNumber?: number; // افزودن شماره تک ساعت
  grade?: string;
  classNumber?: string;
  field?: string;
  timestamp?: number;
  // فیلد برای ارتباط با برنامه پرسنلی
  personnelScheduleId?: string;
  source?: 'class' | 'personnel';
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

interface ScheduleWithFullName extends Schedule {
  fullName?: string;
  source?: 'class' | 'personnel';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const gradeParam = searchParams.get('grade') || '';
  const classParam = searchParams.get('class') || '';
  const fieldParam = searchParams.get('field') || '';
  
  // اضافه کردن متغیر برای نگهداری مقطع انتخاب شده
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  
  const [showClassModal, setShowClassModal] = useState(!gradeParam || !classParam || !fieldParam);
  const [grade, setGrade] = useState(gradeParam || '');
  const [classNumber, setClassNumber] = useState(classParam || '');
  const [field, setField] = useState(fieldParam || '');
  const [selectedCell, setSelectedCell] = useState<{day: string, time: string} | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [timeSelectionModalOpen, setTimeSelectionModalOpen] = useState(false);
  const [personnelCode, setPersonnelCode] = useState('');
  const [personnelName, setPersonnelName] = useState('');
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
  const dragStartRef = useRef<{ day: string; time: string } | null>(null);
  const [savedPersonnelSchedules, setSavedPersonnelSchedules] = useState<SavedPersonnelSchedule[]>([]);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [classStats, setClassStats] = useState<ClassStatistics | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCombinedPreview, setShowCombinedPreview] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  // اضافه کردن استیت برای نگهداری برنامه‌های پرسنلی مرتبط با هر سلول
  const [cellPersonnelSchedules, setCellPersonnelSchedules] = useState<{[key: string]: ScheduleWithFullName[]}>({});
  
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

  const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
  const hours = Array.from({ length: 14 }, (_, i) => `تک ساعت ${toPersianNumber(i + 1)}م`);
  const timeSlots = ['۸:۰۰', '۹:۰۰', '۱۰:۰۰', '۱۱:۰۰', '۱۲:۰۰', '۱۳:۰۰', '۱۴:۰۰', '۱۵:۰۰', '۱۶:۰۰', '۱۷:۰۰', '۱۸:۰۰', '۱۹:۰۰', '۲۰:۰۰', '۲۱:۰۰'];

  // تبدیل ساعت به شماره تک ساعت
  const getHourNumber = (time: string): number => {
    const index = timeSlots.findIndex(t => t === time);
    return index !== -1 ? index + 1 : 0; // شماره تک ساعت از ۱ شروع می‌شود
  };

  // تبدیل شماره تک ساعت به ساعت
  const getTimeFromHourNumber = (hourNumber: number): string => {
    if (hourNumber >= 1 && hourNumber <= timeSlots.length) {
      return timeSlots[hourNumber - 1];
    }
    return '';
  };

  // بارگذاری برنامه‌های پرسنلی ذخیره شده
  const loadSavedPersonnelSchedules = (callback?: () => void) => {
    try {
      // بارگذاری همه کلیدهای لوکال استوریج که با پیشوند personnel_schedule شروع می‌شوند
      const personnelSchedules: SavedPersonnelSchedule[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('personnel_schedule_')) {
          const savedData = localStorage.getItem(key);
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              personnelSchedules.push(parsedData);
            } catch (error) {
              console.error('خطا در تجزیه داده‌های پرسنلی:', error);
            }
          }
        }
      }
      
      // مرتب‌سازی بر اساس نام پرسنل
      personnelSchedules.sort((a, b) => a.personnel.fullName.localeCompare(b.personnel.fullName));
      
      setSavedPersonnelSchedules(personnelSchedules);
      
      // به‌روزرسانی اطلاعات سلول‌های مشترک
      updateCellPersonnelSchedules(personnelSchedules);
      
      if (callback) {
        callback();
      }
      
    } catch (error) {
      console.error('خطا در بارگذاری برنامه‌های پرسنلی:', error);
    }
  };
  
  // تابع جدید برای به‌روزرسانی اطلاعات پرسنلی هر سلول
  const updateCellPersonnelSchedules = useCallback((personnelSchedules: SavedPersonnelSchedule[]) => {
    const cellSchedules: {[key: string]: ScheduleWithFullName[]} = {};
    
    // بررسی برنامه‌های پرسنلی و پیدا کردن برنامه‌های مربوط به کلاس فعلی
    personnelSchedules.forEach(personnelSchedule => {
      personnelSchedule.schedules.forEach(schedule => {
        if (
          schedule.grade === grade && 
          schedule.classNumber === classNumber && 
          schedule.field === field
        ) {
          const cellKey = `${schedule.day}-${schedule.timeStart}`;
          
          const scheduleWithFullName: ScheduleWithFullName = {
            ...schedule,
            fullName: personnelSchedule.personnel.fullName,
            source: 'personnel' as const
          };
          
          if (!cellSchedules[cellKey]) {
            cellSchedules[cellKey] = [];
          }
          
          // افزودن به لیست، اگر قبلاً اضافه نشده باشد
          const alreadyExists = cellSchedules[cellKey].some(
            s => s.id === schedule.id || 
            (s.personnelCode === schedule.personnelCode && 
             s.day === schedule.day && 
             s.timeStart === schedule.timeStart)
          );
          
          if (!alreadyExists) {
            cellSchedules[cellKey].push(scheduleWithFullName);
          }
        }
      });
    });
    
    setCellPersonnelSchedules(cellSchedules);
  }, [grade, classNumber, field]);

  // تابع بارگیری برنامه‌های کلاسی ذخیره شده با useCallback
  const loadClassScheduleFromStorage = useCallback(() => {
    if (!grade || !classNumber || !field) return;
    
    const key = `class-schedule-${grade}-${classNumber}-${field}`;
    const savedScheduleJSON = localStorage.getItem(key);
    
    if (savedScheduleJSON) {
      try {
        const savedData = JSON.parse(savedScheduleJSON);
        const schedules = savedData.schedules || [];
        
        // اضافه کردن source به هر برنامه
        const schedulesWithSource = schedules.map((s: Schedule) => ({
          ...s,
          source: 'class'
        }));
        
        setSchedule(schedulesWithSource);
        setLastSaved(savedData.timestamp || Date.now());
      } catch (error) {
        console.error("خطا در بارگیری برنامه کلاسی:", error);
      }
    } else {
      // اگر برنامه‌ای برای این کلاس وجود نداشت، از برنامه‌های پرسنلی بارگیری می‌کنیم
      const schedulesFromPersonnel: Schedule[] = [];
      
      savedPersonnelSchedules.forEach(personnelSchedule => {
        const matchingSchedules = personnelSchedule.schedules.filter(s => 
          s.grade === grade && 
          s.classNumber === classNumber && 
          s.field === field
        );
        
        if (matchingSchedules.length > 0) {
          // ادغام اطلاعات پرسنلی با برنامه‌ها
          const schedulesWithPersonnelInfo = matchingSchedules.map(s => ({
            ...s,
            personnelCode: personnelSchedule.personnel.personnelCode,
            employmentStatus: personnelSchedule.personnel.employmentStatus || s.employmentStatus,
            mainPosition: s.mainPosition || personnelSchedule.personnel.mainPosition,
            // اضافه کردن ارتباط با برنامه پرسنلی
            personnelScheduleId: personnelSchedule.personnel.id,
            source: 'personnel' as const
          }));
          
          schedulesFromPersonnel.push(...schedulesWithPersonnelInfo);
        }
      });
      
      // تنظیم برنامه‌های یافت شده از برنامه‌های پرسنلی
      setSchedule(schedulesFromPersonnel);
    }
    
    // به‌روزرسانی اطلاعات سلول‌های مشترک
    updateCellPersonnelSchedules(savedPersonnelSchedules);
    
  }, [grade, classNumber, field, savedPersonnelSchedules, updateCellPersonnelSchedules]);

  useEffect(() => {
    // بارگذاری برنامه‌های پرسنلی در هنگام لود اولیه صفحه
    loadSavedPersonnelSchedules();
    
    // اگر پارامترهای کلاس در آدرس نباشند، هنگام تغییر آنها loadClassData فراخوانی می‌شود
    if (gradeParam && classParam && fieldParam) {
      setGrade(gradeParam);
      setClassNumber(classParam);
      setField(fieldParam);
      loadClassData(gradeParam, classParam, fieldParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // بارگذاری مقطع انتخاب شده از localStorage
  useEffect(() => {
    const savedLevel = localStorage.getItem('selectedLevel');
    if (savedLevel) {
      setSelectedLevel(savedLevel);
    }
    
    // بارگذاری اطلاعات کلاس انتخاب شده از localStorage
    const savedClass = localStorage.getItem('selectedClass');
    if (savedClass) {
      try {
        const classData = JSON.parse(savedClass);
        if (classData.grade && classData.name && classData.section) {
          setGrade(classData.grade);
          setClassNumber(classData.section);
          setField(classData.field || '');
          
          // بارگذاری برنامه کلاس
          loadClassData(classData.grade, classData.section, classData.field || '');
          setShowClassModal(false);
        }
      } catch (error) {
        console.error('Error parsing saved class data:', error);
      }
    }
    
    // بارگذاری برنامه‌های پرسنلی
    loadSavedPersonnelSchedules();
  }, []);

  // تابع برای بارگذاری داده‌های کلاس
  const loadClassData = (grade: string, classNumber: string, field: string) => {
    try {
      const classKey = `${grade}-${classNumber}-${field}`;
      const storageKey = `class_schedule_${classKey}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSchedule(parsedData.schedules || []);
        calculateClassStatistics();
      } else {
        setSchedule([]);
      }
    } catch (error) {
      console.error('خطا در بارگذاری داده‌های کلاس:', error);
    }
  };

  useEffect(() => {
    if (schedule.length > 0) {
      calculateClassStatistics();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, savedPersonnelSchedules]);

  const handleClassSubmit = () => {
    if (!grade || !classNumber || !field) {
      toast.error('لطفاً تمامی فیلدهای کلاس را پر کنید');
      return;
    }
    
    setShowClassModal(false);
    
    // تغییر آدرس در URL بدون بارگذاری مجدد صفحه
    const url = `/class-schedule/schedule?grade=${encodeURIComponent(grade)}&class=${encodeURIComponent(classNumber)}&field=${encodeURIComponent(field)}`;
    window.history.pushState({}, '', url);
    
    // بارگذاری داده‌های کلاس
    loadClassData(grade, classNumber, field);
    
    toast.success(`برنامه کلاس ${grade} ${classNumber} ${field} بارگذاری شد`);
  };

  const handleAddNewSchedule = () => {
    setTimeSelectionModalOpen(true);
  };

  const handleTimeSelection = (day: string, time: string) => {
    // بررسی می‌کنیم آیا قبلاً برنامه‌ای در این زمان تعریف شده است یا خیر
    const cellSchedule = getScheduleForCell(day, time);
    
    if (cellSchedule) {
      // اگر برنامه‌ای وجود داشت، به کاربر پیام می‌دهیم
      const personnelInfo = savedPersonnelSchedules.find(
        p => p.personnel.personnelCode === cellSchedule.personnelCode
      );
      
      const personnelName = personnelInfo?.personnel.fullName || `کد: ${cellSchedule.personnelCode}`;
      
      if (window.confirm(`این زمان قبلاً به ${personnelName} با درس ${cellSchedule.teachingGroup || 'نامشخص'} اختصاص داده شده است. آیا می‌خواهید آن را ویرایش کنید؟`)) {
        setSelectedCell({ day, time });
        setTimeSelectionModalOpen(false);
        
        // پر کردن فرم با مقادیر فعلی برای ویرایش
        setPersonnelCode(cellSchedule.personnelCode);
        setEmploymentStatus(cellSchedule.employmentStatus);
        setMainPosition(cellSchedule.mainPosition);
        setHourType(cellSchedule.hourType);
        setTeachingGroup(cellSchedule.teachingGroup);
        setDescription(cellSchedule.description);
        
        // حذف برنامه قبلی
        handleDeleteSchedule(cellSchedule.id);
        
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
      // اعتبارسنجی کد پرسنلی: فقط عدد و دقیقاً ۸ رقم
      if (personnelCode.length !== 8) {
        toast.error('کد پرسنلی باید دقیقاً ۸ رقم باشد');
        return;
      }

      if (!/^\d+$/.test(personnelCode)) {
        toast.error('کد پرسنلی باید فقط شامل اعداد باشد');
        return;
      }
      
      const timeStart = selectedCell.time;
      const timeEndHour = parseInt(timeStart.split(':')[0]) + 1;
      const timeEnd = `${toPersianNumber(timeEndHour)}:۰۰`;
      
      // محاسبه شماره تک ساعت
      const hourNumber = getHourNumber(timeStart);
      
      // بررسی وجود تداخل در برنامه‌های کلاسی
      const existingSchedule = schedule.find(s => 
        s.day === selectedCell.day && 
        s.timeStart === selectedCell.time &&
        s.grade === grade &&
        s.classNumber === classNumber &&
        s.field === field
      );
      
      if (existingSchedule) {
        if (!window.confirm(`برنامه دیگری در این زمان برای کلاس ${grade} ${classNumber} ${field} وجود دارد. آیا می‌خواهید آن را جایگزین کنید؟`)) {
          return;
        }
        // حذف برنامه قبلی
        handleDeleteSchedule(existingSchedule.id);
      }
      
      // بررسی تداخل در برنامه‌های پرسنلی
      const personnelWithSameTime = savedPersonnelSchedules.find(p => 
        p.personnel.personnelCode === personnelCode &&
        p.schedules.some(s => 
          s.day === selectedCell.day && 
          s.timeStart === selectedCell.time
        )
      );
      
      if (personnelWithSameTime) {
        // پیدا کردن برنامه‌ای که تداخل دارد
        const conflictSchedule = personnelWithSameTime.schedules.find(s => 
          s.day === selectedCell.day && 
          s.timeStart === selectedCell.time
        );
        
        if (conflictSchedule) {
          // اگر این تداخل مربوط به همین کلاس است، می‌توانیم آن را جایگزین کنیم
          if (conflictSchedule.grade === grade && 
              conflictSchedule.classNumber === classNumber && 
              conflictSchedule.field === field) {
            // این برنامه مربوط به همین کلاس است و می‌تواند جایگزین شود
            if (!window.confirm(`برنامه دیگری در این زمان برای همین کلاس وجود دارد. آیا می‌خواهید آن را جایگزین کنید؟`)) {
              return;
            }
            // حذف برنامه قبلی (این قسمت قبلاً انجام شده)
          } else {
            // این تداخل مربوط به کلاس دیگری است و نباید اجازه اضافه شدن داده شود
            toast.error(
              `پرسنل ${personnelWithSameTime.personnel.fullName} در ${selectedCell.day} ساعت ${timeStart} در کلاس ${conflictSchedule.grade} ${conflictSchedule.classNumber} ${conflictSchedule.field} برنامه دارد. لطفاً ابتدا از صفحه برنامه پرسنلی، برنامه این پرسنل را ویرایش و خالی کرده و سپس اقدام به اختصاص این بازه زمانی به کلاس دیگری کنید.`,
              { duration: 7000 }
            );
            return; // توقف اجرای تابع
          }
        }
      }
      
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
        timeEnd,
        hourNumber, // اضافه کردن شماره تک ساعت
        grade,
        classNumber,
        field,
        timestamp: Date.now()
      };
      
      // اضافه کردن به برنامه‌های کلاسی
      setSchedule(prevSchedule => [...prevSchedule, newScheduleItem]);
      
      // بروزرسانی برنامه پرسنلی مرتبط
      updatePersonnelSchedule(newScheduleItem, personnelName);
      
      // به‌روزرسانی اطلاعات سلول‌های مشترک
      setCellPersonnelSchedules(prevState => {
        const cellKey = `${selectedCell.day}-${timeStart}`;
        const updatedSchedules = [...(prevState[cellKey] || [])];
        
        // اضافه کردن برنامه جدید به لیست با مشخص کردن منبع
        const scheduleWithInfo: ScheduleWithFullName = {
          ...newScheduleItem,
          fullName: personnelName,
          source: 'class'
        };
        
        updatedSchedules.push(scheduleWithInfo);
        
        return {
          ...prevState,
          [cellKey]: updatedSchedules
        };
      });
      
      toast.success('برنامه با موفقیت اضافه شد');
      
      setModalOpen(false);
      resetForm();
    } else {
      toast.error('لطفاً تمامی فیلدهای ضروری را پر کنید');
    }
  };

  const resetForm = () => {
    setSelectedCell(null);
    setPersonnelCode('');
    setPersonnelName('');
    setEmploymentStatus('');
    setMainPosition('');
    setHourType('');
    setTeachingGroup('');
    setDescription('');
    setPersonnelSearchQuery('');
    setSearchResults([]);
    setShowPersonnelSearch(false);
  };

  const getScheduleForCell = (day: string, time: string): ScheduleWithFullName | null => {
    // ابتدا در برنامه‌های کلاسی جستجو می‌کنیم
    const classSchedule = schedule.find(s => s.day === day && s.timeStart === time);
    if (classSchedule) {
      // اگر برنامه پیدا شد، اطلاعات پرسنل را به آن اضافه می‌کنیم
      const personnelInfo = savedPersonnelSchedules.find(
        p => p.personnel.personnelCode === classSchedule.personnelCode
      );
      
      if (personnelInfo) {
        return {
          ...classSchedule,
          fullName: personnelInfo.personnel.fullName,
          employmentStatus: personnelInfo.personnel.employmentStatus || classSchedule.employmentStatus,
          mainPosition: classSchedule.mainPosition || personnelInfo.personnel.mainPosition,
          source: 'class'
        };
      }
      
      return { ...classSchedule, source: 'class' };
    }
    
    // اگر برنامه‌ای در برنامه‌های کلاسی یافت نشد، در برنامه‌های پرسنلی جستجو می‌کنیم
    for (const personnelSchedule of savedPersonnelSchedules) {
      const matchingSchedule = personnelSchedule.schedules.find(s => 
        s.day === day && 
        s.timeStart === time && 
        s.grade === grade &&
        s.classNumber === classNumber &&
        s.field === field
      );
      
      if (matchingSchedule) {
        // برنامه پرسنلی پیدا شده را با اطلاعات پرسنل ترکیب می‌کنیم
        const scheduleWithPersonnelInfo: ScheduleWithFullName = {
          ...matchingSchedule,
          personnelCode: personnelSchedule.personnel.personnelCode,
          employmentStatus: personnelSchedule.personnel.employmentStatus || matchingSchedule.employmentStatus,
          mainPosition: matchingSchedule.mainPosition || personnelSchedule.personnel.mainPosition,
          fullName: personnelSchedule.personnel.fullName,
          source: 'personnel'
        };
        return scheduleWithPersonnelInfo;
      }
    }
    
    // اگر هیچ برنامه‌ای یافت نشد، null برمی‌گردانیم
    return null;
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

    // بررسی کنیم آیا خانه مقصد قبلاً پر است یا خیر
    const targetCellSchedule = getScheduleForCell(targetDay, targetTime);
    if (targetCellSchedule) {
      // اگر خانه مقصد پر است، عملیات را متوقف می‌کنیم
      toast.error('این خانه قبلاً پر شده است. لطفاً یک خانه خالی را انتخاب کنید.');
      return;
    }

    if (draggedItem && dragStartRef.current) {
      // بررسی تداخل در برنامه‌های پرسنلی
      const personnelWithSameTime = savedPersonnelSchedules.find(p => 
        p.personnel.personnelCode === draggedItem.personnelCode &&
        p.schedules.some(s => 
          s.day === targetDay && 
          s.timeStart === targetTime
        )
      );
      
      if (personnelWithSameTime) {
        // پیدا کردن برنامه‌ای که تداخل دارد
        const conflictSchedule = personnelWithSameTime.schedules.find(s => 
          s.day === targetDay && 
          s.timeStart === targetTime
        );
        
        if (conflictSchedule) {
          // اگر این تداخل مربوط به همین کلاس است، می‌توانیم آن را جایگزین کنیم
          if (conflictSchedule.grade === grade && 
              conflictSchedule.classNumber === classNumber && 
              conflictSchedule.field === field) {
            // این برنامه مربوط به همین کلاس است و می‌تواند جایگزین شود
            if (!window.confirm(`برنامه دیگری در این زمان برای همین کلاس وجود دارد. آیا می‌خواهید آن را جایگزین کنید؟`)) {
              setDraggedItem(null);
              dragStartRef.current = null;
              return;
            }
            // حذف برنامه قبلی (باید اضافه شود)
          } else {
            // این تداخل مربوط به کلاس دیگری است و نباید اجازه جابجایی داده شود
            toast.error(
              `پرسنل ${personnelWithSameTime.personnel.fullName} در ${targetDay} ساعت ${targetTime} در کلاس ${conflictSchedule.grade} ${conflictSchedule.classNumber} ${conflictSchedule.field} برنامه دارد. لطفاً ابتدا از صفحه برنامه پرسنلی، برنامه این پرسنل را ویرایش و خالی کرده و سپس اقدام به انتقال برنامه به این بازه زمانی کنید.`,
              { duration: 7000 }
            );
            setDraggedItem(null);
            dragStartRef.current = null;
            return; // توقف اجرای تابع
          }
        }
      }
      
      // محاسبه شماره تک ساعت برای خانه مقصد
      const hourNumber = getHourNumber(targetTime);
      
      // یافتن اطلاعات پرسنل
      const personnelInfo = savedPersonnelSchedules.find(
        p => p.personnel.personnelCode === draggedItem.personnelCode
      );
      const fullName = personnelInfo?.personnel.fullName || '';
      
      const updatedItem: Schedule = {
        id: Date.now().toString(),
        personnelCode: draggedItem.personnelCode,
        employmentStatus: draggedItem.employmentStatus,
        mainPosition: draggedItem.mainPosition,
        hourType: draggedItem.hourType,
        teachingGroup: draggedItem.teachingGroup,
        description: draggedItem.description,
        day: targetDay,
        timeStart: targetTime,
        timeEnd: `${toPersianNumber(parseInt(targetTime.split(':')[0]) + 1)}:۰۰`,
        hourNumber, // اضافه کردن شماره تک ساعت
        grade: draggedItem.grade,
        classNumber: draggedItem.classNumber,
        field: draggedItem.field,
        timestamp: Date.now()
      };
      
      // اضافه کردن به برنامه‌های کلاسی
      setSchedule([...schedule, updatedItem]);
      
      // بروزرسانی برنامه پرسنلی مرتبط
      updatePersonnelSchedule(updatedItem, fullName);
      
      setDraggedItem(null);
      dragStartRef.current = null;
      
      toast(`برنامه به ${targetDay} ساعت ${targetTime} منتقل شد`);
    }
  };

  const handleDeleteSchedule = async (id?: string) => {
    try {
      if (id) {
        // حذف برنامه خاص
        const scheduleToDelete = schedule.find(item => item.id === id);
        if (scheduleToDelete) {
          // حذف از برنامه کلاسی
          setSchedule(schedule.filter(item => item.id !== id));
          
          // حذف از برنامه پرسنلی مرتبط
          removeFromPersonnelSchedule(scheduleToDelete);
          
          // ذخیره تغییرات در localStorage
          const classKey = `${grade}-${classNumber}-${field}`;
          const storageKey = `class_schedule_${classKey}`;
          
          const savedData = localStorage.getItem(storageKey);
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData.schedules && Array.isArray(parsedData.schedules)) {
              parsedData.schedules = parsedData.schedules.filter((s: {id: string}) => s.id !== id);
              parsedData.timestamp = Date.now();
              localStorage.setItem(storageKey, JSON.stringify(parsedData));
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

  const updatePersonnelSchedule = (scheduleItem: Schedule, fullName: string = '') => {
    try {
      // بررسی اینکه آیا پرسنلی با این کد وجود دارد
      const personnelData = savedPersonnelSchedules.find(
        s => s.personnel.personnelCode === scheduleItem.personnelCode
      );
      
      if (personnelData) {
        // پرسنل را پیدا کردیم، برنامه را به‌روزرسانی می‌کنیم
        const personnelId = personnelData.personnel.id;
        const storageKey = `personnel_schedule_${personnelId}`;
        
        // اضافه کردن اطلاعات کلاس به آیتم برنامه
        const updatedScheduleItem: Schedule = {
          ...scheduleItem,
          grade: grade,
          classNumber: classNumber,
          field: field,
          hourNumber: scheduleItem.hourNumber, // اطمینان از انتقال شماره تک ساعت
          timestamp: Date.now()
        };
        
        // اگر نام پرسنل تغییر کرده باشد، آن را به‌روزرسانی می‌کنیم
        if (fullName && fullName !== personnelData.personnel.fullName) {
          personnelData.personnel.fullName = fullName;
        }
        
        // بررسی می‌کنیم آیا برنامه قبلاً در همان روز و ساعت وجود دارد
        const existingScheduleIndex = personnelData.schedules.findIndex(
          s => s.day === scheduleItem.day && s.timeStart === scheduleItem.timeStart && 
          s.grade === grade && s.classNumber === classNumber && s.field === field
        );
        
        if (existingScheduleIndex !== -1) {
          // برنامه را به‌روزرسانی می‌کنیم
          personnelData.schedules[existingScheduleIndex] = updatedScheduleItem;
        } else {
          // برنامه جدید را اضافه می‌کنیم
          personnelData.schedules.push(updatedScheduleItem);
        }
        
        // برنامه پرسنلی را ذخیره می‌کنیم
        personnelData.timestamp = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(personnelData));
        
        console.log(`برنامه پرسنلی ${personnelData.personnel.fullName} به‌روزرسانی شد`);
      } else {
        // اگر پرسنل یافت نشد، یک پرسنل جدید ایجاد می‌کنیم
        console.warn(`پرسنلی با کد ${scheduleItem.personnelCode} یافت نشد، در حال ایجاد یک رکورد جدید...`);
        
        // ایجاد پرسنل جدید
        const personnel: Personnel = {
          id: Date.now().toString(),
          personnelCode: scheduleItem.personnelCode,
          fullName: fullName || "نامشخص",
          mainPosition: scheduleItem.mainPosition,
          employmentStatus: scheduleItem.employmentStatus
        };
        
        const newPersonnelData: SavedPersonnelSchedule = {
          personnel: personnel,
          schedules: [{
            ...scheduleItem,
            grade: grade,
            classNumber: classNumber,
            field: field,
            hourNumber: scheduleItem.hourNumber, // اطمینان از انتقال شماره تک ساعت
            timestamp: Date.now()
          }],
          timestamp: Date.now()
        };
        
        // ذخیره پرسنل جدید
        const storageKey = `personnel_schedule_${personnel.id}`;
        localStorage.setItem(storageKey, JSON.stringify(newPersonnelData));
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
        let removed = false;
        
        // ابتدا سعی می‌کنیم با شناسه (id) برنامه را پیدا کنیم
        if (scheduleItem.id) {
          const previousLength = personnelData.schedules.length;
          personnelData.schedules = personnelData.schedules.filter(s => s.id !== scheduleItem.id);
          removed = personnelData.schedules.length < previousLength;
        }
        
        // اگر با شناسه پیدا نشد، با روز و ساعت و کلاس جستجو می‌کنیم
        if (!removed) {
          personnelData.schedules = personnelData.schedules.filter(
            s => !(s.day === scheduleItem.day && 
                 s.timeStart === scheduleItem.timeStart && 
                 s.grade === grade && 
                 s.classNumber === classNumber && 
                 s.field === field)
          );
        }
        
        // برنامه پرسنلی را ذخیره می‌کنیم
        personnelData.timestamp = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(personnelData));
        
        // به‌روزرسانی state برنامه‌های پرسنلی
        setSavedPersonnelSchedules(prevSchedules => {
          const updatedSchedules = [...prevSchedules];
          const personnelIndex = updatedSchedules.findIndex(p => p.personnel.id === personnelId);
          
          if (personnelIndex !== -1) {
            updatedSchedules[personnelIndex] = personnelData;
          }
          
          return updatedSchedules;
        });
        
        // به‌روزرسانی اطلاعات سلول‌های مشترک
        setCellPersonnelSchedules(prevState => {
          const cellKey = `${scheduleItem.day}-${scheduleItem.timeStart}`;
          
          if (!prevState[cellKey]) return prevState;
          
          const updatedCellSchedules = prevState[cellKey].filter(s => 
            s.id !== scheduleItem.id && 
            !(s.personnelCode === scheduleItem.personnelCode && 
              s.day === scheduleItem.day && 
              s.timeStart === scheduleItem.timeStart)
          );
          
          return {
            ...prevState,
            [cellKey]: updatedCellSchedules
          };
        });
      } else {
        // اگر پرسنل یافت نشد، یک پیام خطا در کنسول نمایش می‌دهیم
        console.warn(`پرسنلی با کد ${scheduleItem.personnelCode} یافت نشد`);
      }
    } catch (error) {
      console.error('خطا در حذف برنامه از برنامه پرسنلی:', error);
    }
  };
  
  // ذخیره برنامه کلاسی در لوکال استوریج
  const saveClassScheduleToStorage = () => {
    if (!grade || !classNumber || !field) {
      toast.error('اطلاعات کلاس ناقص است. لطفاً ابتدا کلاس را انتخاب کنید.');
      return;
    }
    
    try {
      const classKey = `${grade}-${classNumber}-${field}`;
      const storageKey = `class_schedule_${classKey}`;
      
      // فیلتر کردن و شناسایی برنامه‌های اصلی (آنهایی که از صفحه کلاس اضافه شده‌اند)
      // و برنامه‌های پرسنلی (آنهایی که از صفحه پرسنل اضافه شده‌اند)
      const classSchedules = schedule.filter(item => 
        !!item.personnelCode && // فقط برنامه‌های دارای کد پرسنلی را نگه می‌داریم
        !!item.day && !!item.timeStart // و فقط برنامه‌های دارای روز و زمان را نگه می‌داریم
      );
      
      // اضافه کردن شماره تک ساعت برای برنامه‌هایی که ندارند
      const updatedSchedules = classSchedules.map(item => {
        if (!item.hourNumber) {
          return {
            ...item,
            hourNumber: getHourNumber(item.timeStart)
          };
        }
        return item;
      });
      
      const savedSchedule = {
        id: Date.now().toString(),
        grade,
        classNumber,
        field,
        schedules: updatedSchedules,
        timestamp: Date.now()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(savedSchedule));
      setLastSaved(Date.now());
      
      // به‌روزرسانی همه برنامه‌های پرسنلی مرتبط
      updatedSchedules.forEach(item => {
        updatePersonnelSchedule(item);
      });
      
      // نمایش نوتیفیکیشن موفقیت‌آمیز
      toast.success('برنامه کلاسی با موفقیت ذخیره شد');
      
    } catch (error) {
      console.error('خطا در ذخیره برنامه کلاسی:', error);
      toast.error('خطا در ذخیره برنامه کلاسی');
    }
  };
  
  // تابع جدید برای نمایش نوتیفیکیشن موفقیت‌آمیز
  const showSuccessNotification = (message: string) => {
    // ایجاد یک المنت برای نوتیفیکیشن
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 md:top-8 md:right-8 bg-green-100 border-l-4 border-green-500 py-2 px-3 md:py-4 md:px-6 rounded shadow-md z-50 flex items-center fade-in slide-in-top`;
    
    // تنظیم استایل‌های انیمیشن
    notification.style.animation = 'fadeIn 0.3s ease-out forwards, slideInFromTop 0.5s ease-out forwards';
    
    // اضافه کردن آیکون موفقیت
    notification.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span class="text-green-800 font-medium">${message}</span>
    `;
    
    // اضافه کردن به DOM
    document.body.appendChild(notification);
    
    // حذف بعد از 3 ثانیه
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-out forwards, slideOutToTop 0.5s ease-out forwards';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };
  
  // تابع برای مشاهده برنامه پرسنلی
  const navigateToPersonnelSchedule = (personnelCode: string, fullName: string, mainPosition: string) => {
    const url = `/personnel-schedule/schedule?code=${encodeURIComponent(personnelCode)}&name=${encodeURIComponent(fullName)}&position=${encodeURIComponent(mainPosition)}`;
    
    // انیمیشن مختصر برای نمایش انتقال
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center';
    overlay.style.animation = 'fadeIn 0.3s ease-out forwards';
    
    const content = document.createElement('div');
    content.className = 'bg-white p-8 rounded-lg shadow-lg text-center';
    content.style.animation = 'scaleIn 0.3s ease-out forwards';
    content.innerHTML = `
      <div class="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-cyan-500 mb-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h2 class="text-xl text-cyan-700 mb-2">در حال انتقال به صفحه پرسنلی</h2>
        <p class="text-gray-600 mb-4">لطفاً منتظر بمانید...</p>
        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-cyan-500 rounded-full animate-progress"></div>
        </div>
      </div>
    `;
    
    // اضافه کردن استایل‌های انیمیشن
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes scaleOut {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(1.2); opacity: 0; }
      }
      @keyframes animate-progress {
        0% { width: 0%; }
        100% { width: 100%; }
      }
      .animate-progress {
        animation: animate-progress 1s linear forwards;
      }
    `;
    
    document.head.appendChild(style);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // باز کردن صفحه پرسنلی در تب جدید
    setTimeout(() => {
      overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
      content.style.animation = 'scaleOut 0.3s ease-out forwards';
      
      setTimeout(() => {
        document.body.removeChild(overlay);
        window.open(url, '_blank');
      }, 300);
    }, 1200);
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
      const personnel = schedule.personnel;
      const fullName = personnel.fullName.toLowerCase();
      const code = personnel.personnelCode;
      const position = personnel.mainPosition.toLowerCase();
      
      // اعتبارسنجی کد پرسنلی: فقط عدد و دقیقاً ۸ رقم
      const isValidPersonnelCode = code.length === 8 && /^\d+$/.test(code);
      
      if (
        (fullName.includes(query.toLowerCase()) || 
        code.includes(query) || 
        position.includes(query.toLowerCase())) &&
        isValidPersonnelCode
      ) {
        results.push(personnel);
      }
    });
    
    setSearchResults(results);
    // نمایش نتایج جستجو به طور خودکار
    setShowPersonnelSearch(results.length > 0);
  };

  // انتخاب پرسنل از نتایج جستجو
  const selectPersonnelFromSearch = (personnel: Personnel) => {
    // اعتبارسنجی کد پرسنلی: فقط عدد و دقیقاً ۸ رقم
    if (personnel.personnelCode.length !== 8) {
      toast.error('کد پرسنلی باید دقیقاً ۸ رقم باشد');
      return;
    }

    if (!/^\d+$/.test(personnel.personnelCode)) {
      toast.error('کد پرسنلی باید فقط شامل اعداد باشد');
      return;
    }
    
    setPersonnelCode(personnel.personnelCode);
    setPersonnelName(personnel.fullName);
    setEmploymentStatus(personnel.employmentStatus || '');
    setMainPosition(personnel.mainPosition);
    setShowPersonnelSearch(false);
    setPersonnelSearchQuery('');
    setSearchResults([]);
  };

  const renderCellContent = (day: string, time: string) => {
    const cellSchedule = getScheduleForCell(day, time);
    const cellKey = `${day}-${time}`;
    
    // استفاده از اطلاعات سلول برای نمایش وضعیت (اختیاری)
    const scheduleCount = cellPersonnelSchedules[cellKey]?.length || 0;
    
    if (!cellSchedule) {
      // اگر برنامه کلاسی وجود ندارد، بررسی می‌کنیم آیا برنامه‌های پرسنلی مرتبط وجود دارد
      const relatedPersonnelSchedules = cellPersonnelSchedules[cellKey];
      
      if (relatedPersonnelSchedules && relatedPersonnelSchedules.length > 0) {
        // اگر برنامه‌های پرسنلی مرتبط وجود دارد، آن‌ها را با استایل متفاوت نمایش می‌دهیم
        return (
          <div className={`${styles.relatedSchedule} w-full h-full p-1 border border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 cursor-pointer`}
               onClick={() => handleTimeSelection(day, time)}>
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                {relatedPersonnelSchedules.map((ps, index) => (
                  <div key={index} className="text-xs mb-1 opacity-80">
                    <p className="font-medium text-gray-900">{ps.fullName}</p>
                    <p className="text-gray-700 text-xs">{ps.teachingGroup || ''}</p>
                  </div>
                ))}
              </div>
              <div className="flex-shrink-0 ml-1">
                <span className="inline-block px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  {relatedPersonnelSchedules.length}
                </span>
              </div>
            </div>
          </div>
        );
      }
      
      return (
        <button 
          className={styles.emptyCell}
          onClick={() => handleTimeSelection(day, time)}
          title={`${day} ${time}${scheduleCount > 0 ? ` - ${scheduleCount} برنامه پرسنلی` : ''}`}
        >
          <span className="sr-only">انتخاب {day} {time}</span>
          <div className="w-full h-full flex items-center justify-center">
            <FaPlus className="text-gray-300 hover:text-lime-600" />
          </div>
        </button>
      );
    }
    
    // رنگ پس‌زمینه بر اساس نوع ساعت
    let bgColorClass = "bg-blue-100";
    if (cellSchedule.hourType === 'موظف اول' || cellSchedule.hourType === 'موظف دوبل') {
      bgColorClass = "bg-green-100";
    } else if (cellSchedule.hourType === 'غیرموظف اول' || cellSchedule.hourType === 'غیرموظف دوبل') {
      bgColorClass = "bg-yellow-100";
    }
    
    // یافتن نام پرسنل
    const personnelName = cellSchedule.fullName || 
      savedPersonnelSchedules.find(p => p.personnel.personnelCode === cellSchedule.personnelCode)?.personnel.fullName;
      
    // بررسی سایر برنامه‌های پرسنلی مرتبط
    const relatedPersonnelSchedules = cellPersonnelSchedules[cellKey]?.filter(ps => 
      ps.id !== cellSchedule.id && ps.personnelCode === cellSchedule.personnelCode
    );
    const hasRelatedSchedules = relatedPersonnelSchedules && relatedPersonnelSchedules.length > 0;
    
    return (
      <div 
        className={`w-full h-full p-1 text-black ${bgColorClass} rounded text-right relative`}
        draggable
        onDragStart={(e) => handleDragStart(e, cellSchedule, day, time)}
      >
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
        
        {/* نمایش اطلاعات سلول */}
        <div className="flex justify-between items-start">
          <div className="font-bold text-black mb-1 text-[10px] sm:text-xs">{cellSchedule.mainPosition}</div>
        </div>
        
        <div 
          className="text-[10px] sm:text-xs text-indigo-700 cursor-pointer hover:text-indigo-900 hover:underline flex items-center truncate"
          onClick={(e) => {
            e.stopPropagation();
            // یافتن اطلاعات کامل پرسنل
            const personnelInfo = savedPersonnelSchedules.find(
              p => p.personnel.personnelCode === cellSchedule.personnelCode
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
          {personnelName || `کد: ${cellSchedule.personnelCode}`}
        </div>
        
        {/* نمایش گروه تدریس با برجستگی بیشتر */}
        <div className="text-[10px] sm:text-xs text-blue-700 mt-1 font-bold border-t border-gray-200 pt-1 truncate">
          {cellSchedule.teachingGroup || 'بدون گروه تدریس'}
        </div>
        
        <div className="text-[10px] sm:text-xs text-black truncate">نوع: {cellSchedule.hourType || '-'}</div>
        {cellSchedule.description && (
          <div className="text-[10px] sm:text-xs text-black mt-1 truncate" title={cellSchedule.description}>
            توضیحات: {cellSchedule.description}
          </div>
        )}
        
        {/* نشانگر منبع برنامه */}
        <div className="absolute bottom-1 right-1 hidden sm:block">
          {cellSchedule.source === 'personnel' && (
            <span className="text-[10px] text-purple-500 font-medium border border-purple-300 rounded-md px-1 bg-purple-50">
              از برنامه پرسنلی
            </span>
          )}
        </div>
        
        {/* نمایش برچسب اگر برنامه‌های پرسنلی مرتبط وجود دارد */}
        {hasRelatedSchedules && (
          <div className="absolute bottom-1 left-1">
            <span className="inline-block px-1.5 py-0.5 bg-yellow-500 text-white text-[0.6rem] rounded-full">
              {relatedPersonnelSchedules.length + 1}
            </span>
          </div>
        )}
        
        <div 
          className="absolute inset-0 cursor-pointer z-0"
          onClick={(e) => {
            e.stopPropagation();
            // پر کردن فرم با مقادیر فعلی برای ویرایش
            setSelectedCell({ day, time: time });
            setPersonnelCode(cellSchedule.personnelCode);
            setEmploymentStatus(cellSchedule.employmentStatus);
            setMainPosition(cellSchedule.mainPosition);
            setHourType(cellSchedule.hourType);
            setTeachingGroup(cellSchedule.teachingGroup);
            setDescription(cellSchedule.description);
            
            // حذف برنامه قبلی
            handleDeleteSchedule(cellSchedule.id);
            
            // باز کردن مودال ویرایش
            setModalOpen(true);
          }}
        ></div>
      </div>
    );
  };

  // نمایش زمان آخرین ذخیره‌سازی برنامه
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderLastSaved = () => {
    if (lastSaved) {
      const date = new Date(lastSaved);
      const formattedDate = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      
      return (
        <div className="text-xs text-gray-500 mt-1">
          آخرین به‌روزرسانی: {formattedDate}
        </div>
      );
    }
    return null;
  };

  // تابع برای رندر کردن محتوای جدول
  const renderTableContent = () => {
    return days.map((day, index) => (
      <tr key={day} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
        <td className="border border-gray-300 p-1 sm:p-2 text-cyan-900 text-right font-bold sticky-col">{day}</td>
        {timeSlots.map((time, hourIndex) => {
          const hourNumber = hourIndex + 1; // شماره تک ساعت از 1 شروع می‌شود
          return (
            <td 
              key={`${day}-${time}`} 
              className={`border border-gray-300 p-1 h-16 sm:h-24 align-top schedule-cell min-w-[100px] sm:min-w-[120px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day, time)}
            >
              {renderCellContent(day, time)}
            </td>
          );
        })}
      </tr>
    ));
  };

  // تابع برای هدایت به صفحه برنامه کلاسی از صفحه برنامه پرسنلی
  const navigateToClassSchedule = (grade: string, classNumber: string, field: string) => {
    // ایجاد پارامترهای URL برای صفحه کلاس
    const url = `/class-schedule/schedule?grade=${encodeURIComponent(grade)}&class=${encodeURIComponent(classNumber)}&field=${encodeURIComponent(field)}`;
    
    // بررسی برنامه‌های مربوط به این کلاس
    const classSchedules = schedule.filter(s => 
      s.grade === grade || 
      s.classNumber === classNumber || 
      s.field === field
    );
    
    // اطمینان از وجود hourNumber در همه برنامه‌ها
    if (classSchedules.length > 0) {
      classSchedules.forEach(s => {
        if (!s.hourNumber) {
          const hourIndex = timeSlots.findIndex(t => t === s.timeStart);
          if (hourIndex !== -1) {
            s.hourNumber = hourIndex + 1; // شماره ساعت از 1 شروع می‌شود
            
            // به‌روزرسانی برنامه‌های پرسنلی مرتبط
            if (s.personnelCode) {
              // بررسی برای یافتن نام پرسنل
              let personnelName = '';
              const personnelData = savedPersonnelSchedules.find(
                ps => ps.personnel.personnelCode === s.personnelCode
              );
              if (personnelData) {
                personnelName = personnelData.personnel.fullName;
              }
              updatePersonnelSchedule(s, personnelName);
            }
          }
        }
      });
      
      // ذخیره برنامه‌های به‌روزرسانی شده
      saveClassScheduleToStorage();
    }
    
    // باز کردن صفحه کلاس در تب جدید
    window.open(url, '_blank');
  };

  // تنظیمات پیش‌فرض برای react-hot-toast
  useEffect(() => {
    // تنظیم استایل پیش‌فرض برای توست‌ها
    toast.dismiss(); // پاک کردن توست‌های قبلی
  }, []);

  // تابع برای خروجی گرفتن اکسل
  const exportToExcel = () => {
    if (!grade || !classNumber || !field) {
      toast.error('لطفاً ابتدا کلاس را انتخاب کنید');
      return;
    }

    if (schedule.length === 0) {
      toast.error('هیچ برنامه‌ای برای صدور وجود ندارد');
      return;
    }
    
    setShowCombinedPreview(true);
  };
  
  // تابع برای تبدیل برنامه به فایل اکسل
  const exportCombinedDataToExcel = () => {
    if (schedule.length === 0) {
      toast.error('هیچ برنامه‌ای برای صدور وجود ندارد');
      return;
    }
    
    try {
      const workbook = XLSX.utils.book_new();
      
      // ایجاد یک صفحه برای کل برنامه کلاس
      const classData = days.map(day => {
        const rowData: Record<string, string> = { 'روز/ساعت': day };
        
        hours.forEach((hour, index) => {
          const time = timeSlots[index];
          let cellText = '';
          
          // بررسی سلول برای برنامه برنامه کلاسی
          const cellSchedule = schedule.find(item => 
            item.day === day && item.timeStart === time
          );
          
          if (cellSchedule) {
            // استفاده از اطلاعات پرسنلی ذخیره شده برای نمایش نام کامل
            let fullName = '';
            const personnelData = savedPersonnelSchedules.find(
              ps => ps.personnel.personnelCode === cellSchedule.personnelCode
            );
            
            if (personnelData) {
              fullName = personnelData.personnel.fullName;
            }
            
            cellText = `${cellSchedule.teachingGroup} (${fullName || cellSchedule.personnelCode})`;
          }
          
          rowData[hour] = cellText;
        });
        
        return rowData;
      });
      
      const classWorksheet = XLSX.utils.json_to_sheet(classData);
      XLSX.utils.book_append_sheet(workbook, classWorksheet, `${grade} ${classNumber} ${field}`);
      
      // تنظیم عرض ستون‌ها
      const maxWidth = 20;
      const sheets = Object.keys(workbook.Sheets);
      sheets.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        worksheet['!cols'] = Array(hours.length + 1).fill({ wch: maxWidth });
      });
      
      // ایجاد نام فایل با اطلاعات کلاس و تاریخ
      const filename = `برنامه_کلاس_${grade}_${classNumber}_${field}_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      setShowCombinedPreview(false);
      
    } catch (error) {
      console.error('خطا در صدور به اکسل:', error);
      toast.error('خطا در صدور به اکسل. لطفاً دوباره تلاش کنید.');
    }
  };
  
  // تابع برای خروجی گرفتن JSON
  const exportToJson = () => {
    if (!grade || !classNumber || !field) {
      toast.error('لطفاً ابتدا کلاس را انتخاب کنید');
      return;
    }
    
    if (schedule.length === 0) {
      toast.error('هیچ برنامه‌ای برای صدور وجود ندارد');
      return;
    }
    
    try {
      const dataToExport = {
        grade,
        classNumber,
        field,
        schedules: schedule,
        timestamp: Date.now()
      };
      
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `برنامه_کلاس_${grade}_${classNumber}_${field}_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('فایل JSON با موفقیت ایجاد شد');
    } catch (error) {
      console.error('خطا در ایجاد فایل JSON:', error);
      toast.error('خطا در ایجاد فایل JSON. لطفاً دوباره تلاش کنید.');
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

  // تابع برای خروجی گرفتن PDF
  const exportToPdf = async () => {
    
    if (schedule.length === 0) {
      toast.error('هیچ برنامه‌ای برای صدور وجود ندارد');
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
      element.style.color = '#000000'; // اضافه کردن رنگ متن سیاه به کل محتوا
      
      // افزودن عنوان
      const title = document.createElement('h2');
      title.style.textAlign = 'center';
      title.style.marginBottom = '15px';
      title.style.color = '#1e40af';
      title.textContent = `برنامه کلاس ${grade} ${classNumber} ${field} - ${new Date().toLocaleDateString('fa-IR')}`;
      element.appendChild(title);
      
      // ایجاد جدول
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '20px';
      table.style.color = '#000000'; // اضافه کردن رنگ متن سیاه به جدول
      
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
      dayHeader.style.color = '#000000'; // اضافه کردن رنگ متن سیاه
      headerRow.appendChild(dayHeader);
      
      // ستون‌های ساعت
      timeSlots.forEach((time, index) => {
        const th = document.createElement('th');
        th.style.border = '1px solid #ccc';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f0f9ff';
        th.style.textAlign = 'center';
        th.style.color = '#000000'; // اضافه کردن رنگ متن سیاه
        
        const hourDiv = document.createElement('div');
        hourDiv.textContent = hours[index];
        hourDiv.style.fontWeight = 'bold';
        hourDiv.style.color = '#000000'; // اضافه کردن رنگ متن سیاه
        
        const timeDiv = document.createElement('div');
        timeDiv.textContent = time;
        timeDiv.style.fontSize = '11px';
        timeDiv.style.color = '#4b5563'; // تغییر رنگ به خاکستری تیره
        
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
        dayCell.style.color = '#000000'; // اضافه کردن رنگ متن سیاه
        row.appendChild(dayCell);
        
        // ستون‌های ساعت
        timeSlots.forEach(time => {
          const cell = document.createElement('td');
          cell.style.border = '1px solid #ccc';
          cell.style.padding = '8px';
          cell.style.textAlign = 'center';
          cell.style.verticalAlign = 'top';
          cell.style.height = '70px';
          cell.style.color = '#000000'; // اضافه کردن رنگ متن سیاه
          
          const cellSchedule = schedule.find(item => 
            item.day === day && item.timeStart === time
          );
          
          if (cellSchedule) {
            // پیدا کردن نام کامل پرسنل
            let fullName = '';
            const personnelData = savedPersonnelSchedules.find(
              ps => ps.personnel.personnelCode === cellSchedule.personnelCode
            );
            
            if (personnelData) {
              fullName = personnelData.personnel.fullName;
            }
            
            const subjectDiv = document.createElement('div');
            subjectDiv.textContent = cellSchedule.teachingGroup;
            subjectDiv.style.fontWeight = 'bold';
            subjectDiv.style.color = '#0369a1';
            
            const nameDiv = document.createElement('div');
            nameDiv.textContent = fullName || cellSchedule.personnelCode;
            nameDiv.style.marginTop = '4px';
            nameDiv.style.fontSize = '12px';
            nameDiv.style.color = '#000000'; // اضافه کردن رنگ متن سیاه
            
            cell.appendChild(subjectDiv);
            cell.appendChild(nameDiv);
          }
          
          row.appendChild(cell);
        });
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      element.appendChild(table);
      
      // ایجاد بخش آمار
      const statsDiv = document.createElement('div');
      statsDiv.style.marginTop = '20px';
      statsDiv.style.border = '1px solid #e5e7eb';
      statsDiv.style.borderRadius = '8px';
      statsDiv.style.padding = '15px';
      statsDiv.style.backgroundColor = '#f0f9ff';
      statsDiv.style.color = '#000000'; // اضافه کردن رنگ متن سیاه
      
      const statsTitle = document.createElement('h3');
      statsTitle.textContent = 'آمار کلی';
      statsTitle.style.marginBottom = '10px';
      statsTitle.style.color = '#1e40af';
      statsDiv.appendChild(statsTitle);
      
      const statsList = document.createElement('ul');
      statsList.style.listStyleType = 'none';
      statsList.style.padding = '0';
      statsList.style.margin = '0';
      statsList.style.color = '#000000'; // اضافه کردن رنگ متن سیاه
      
      // آمار تعداد ساعت‌ها
      const totalHoursItem = document.createElement('li');
      totalHoursItem.textContent = `تعداد کل ساعت‌ها: ${classStats?.totalHours || 0}`;
      totalHoursItem.style.marginBottom = '5px';
      totalHoursItem.style.color = '#000000'; // اضافه کردن رنگ متن سیاه
      statsList.appendChild(totalHoursItem);
      
      // آمار تعداد پرسنل
      const totalPersonnelItem = document.createElement('li');
      totalPersonnelItem.textContent = `تعداد پرسنل منحصر به فرد: ${classStats?.uniquePersonnel || 0}`;
      totalPersonnelItem.style.marginBottom = '5px';
      totalPersonnelItem.style.color = '#000000'; // اضافه کردن رنگ متن سیاه
      statsList.appendChild(totalPersonnelItem);
      
      statsDiv.appendChild(statsList);
      element.appendChild(statsDiv);
      
      // تنظیمات PDF
      const opt = {
        margin: 10,
        filename: `برنامه_کلاس_${grade}_${classNumber}_${field}_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.pdf`,
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerButtons}>
          <button onClick={() => router.back()} className={styles.backButton}>
            بازگشت
          </button>
          {/* اصلاح توست در بخش دکمه حذف همه برنامه‌ها */}
          <button
            onClick={() => {
              if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام برنامه‌ها را حذف کنید؟')) {
                // حذف تمام برنامه‌ها از localStorage
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && (key.startsWith('class_schedule_') || key.startsWith('personnel_schedule_'))) {
                    localStorage.removeItem(key);
                  }
                }
                // بارگذاری مجدد برنامه‌ها
                loadSavedPersonnelSchedules();
                setSchedule([]);
                toast.success('تمام برنامه‌ها با موفقیت حذف شدند');
              }
            }}
            className={styles.deleteButton}
          >
            <FaTrash className="ml-1" />
            حذف همه برنامه‌ها
          </button>
        </div>
        <h1>برنامه کلاسی</h1>
      </header>

      <main className={styles.main}>
        <div className="w-full p-2 sm:p-4 flex flex-col gap-4 sm:gap-6">
          {/* افزودن دکمه ذخیره برنامه */}
          {!showClassModal && (
            <div className="flex flex-wrap justify-center gap-2 mb-2 sm:mb-4 responsive-buttons">
              <button
                onClick={saveClassScheduleToStorage}
                className="bg-gradient-to-r from-lime-500 to-green-600 text-white px-3 sm:px-4 py-2 rounded-md hover:from-lime-600 hover:to-green-700 transition-all mx-1 sm:mx-2 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
              >
                <FaSave className="ml-1 sm:ml-2" />
                <span className="button-text">ذخیره برنامه کلاس</span>
              </button>
              <button
                onClick={() => window.location.href = '/personnel-schedule/schedule'}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:from-cyan-600 hover:to-blue-700 transition-all mx-1 sm:mx-2 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
              >
                <FaUserAlt className="ml-1 sm:ml-2" />
                <span className="button-text">مشاهده برنامه‌های پرسنلی</span>
              </button>
              <button
                onClick={handleAddNewSchedule}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 sm:px-4 py-2 rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all mx-1 sm:mx-2 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
              >
                <FaPlus className="ml-1 sm:ml-2" />
                <span className="button-text">افزودن برنامه جدید</span>
              </button>
              {schedule.length > 0 && (
                <div className="relative inline-block" ref={exportMenuRef}>
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 sm:px-4 py-2 rounded-md hover:from-purple-600 hover:to-pink-700 transition-all mx-1 sm:mx-2 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
                  >
                    <FaFileDownload className="ml-1 sm:ml-2" />
                    <span className="button-text">خروجی گرفتن</span>
                  </button>
                  
                  {showExportMenu && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          onClick={() => {
                            setShowExportMenu(false);
                            exportToExcel();
                          }}
                          className="flex items-center w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                          className="flex items-center w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                          className="flex items-center w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          <FaFilePdf className="ml-2" />
                          خروجی PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* جدول زمانی هفتگی */}
          <div className="w-full bg-white rounded-lg shadow-md p-2 sm:p-4">
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-cyan-900 text-center">جدول زمانی هفتگی</h2>
            
            {/* نمایش مشخصات کلاس انتخاب شده */}
            {grade && classNumber && field && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-r-4 border-blue-500">
                <div className="flex items-center">
                  <span className="font-bold ml-2 text-blue-700">پایه:</span>
                  <span className="text-blue-800">{grade}</span>
                </div>
                <div className="hidden sm:block text-gray-400 mx-2">|</div>
                <div className="flex items-center">
                  <span className="font-bold ml-2 text-blue-700">کلاس:</span>
                  <span className="text-blue-800">{classNumber}</span>
                </div>
                <div className="hidden sm:block text-gray-400 mx-2">|</div>
                <div className="flex items-center">
                  <span className="font-bold ml-2 text-blue-700">رشته:</span>
                  <span className="text-blue-800">{field}</span>
                </div>
              </div>
            )}
            
            <div className="w-full overflow-x-auto pb-2 sm:pb-4 schedule-table-container">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gradient-to-r from-cyan-50 to-blue-50">
                    <th className="border border-gray-300 p-1 sm:p-2 text-cyan-900 text-right w-16 sm:w-24 sticky-col">روز / ساعت</th>
                    {timeSlots.map((time, index) => (
                      <th key={time} className="border border-gray-300 p-1 sm:p-2 text-cyan-900 text-center min-w-[100px] sm:min-w-[120px] schedule-header-cell">
                        <div className="font-bold">تک ساعت {toPersianNumber(index + 1)}م</div>
                        <div className="text-[0.7rem] text-gray-600">{time}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {renderTableContent()}
                </tbody>
              </table>
            </div>
          </div>

          {/* آمار کلی برای کلاس */}
          {schedule.length > 0 && (
            <div className="w-full mt-2 sm:mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200 shadow-md">
              <h3 className="text-base md:text-lg font-bold text-blue-800 mb-2">آمار کلی کلاس {grade} {classNumber} {field}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 mb-2 sm:mb-4">
                <div className="bg-white p-2 md:p-3 rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-600 text-xs md:text-sm">تعداد کل ساعت‌ها</p>
                  <p className="text-gray-900 font-bold text-lg md:text-xl">{classStats?.totalHours}</p>
                </div>
                <div className="bg-white p-2 md:p-3 rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-600 text-xs md:text-sm">تعداد پرسنل منحصر به فرد</p>
                  <p className="text-gray-900 font-bold text-lg md:text-xl">{classStats?.uniquePersonnel}</p>
                </div>
                <div 
                  className="bg-white p-2 md:p-3 rounded-md shadow-sm cursor-pointer hover:bg-blue-50 transition-colors hover:shadow-md"
                  onClick={() => saveClassScheduleToStorage()}
                >
                  <p className="text-gray-600 text-xs md:text-sm">وضعیت ذخیره‌سازی</p>
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
                    const dayStat = classStats?.dayStats[day];
                    if (!dayStat) return null;
                    
                    return (
                      <div key={day} className="border-b border-gray-100 p-2 md:p-3 hover:bg-blue-50 transition-colors">
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
                                const personnelInfo = classStats?.personnelStats[personnelCode];
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
                  {Object.entries(classStats?.personnelStats || {}).map(([personnelCode, stat], index) => (
                    <div key={index} className="border-b border-gray-100 p-2 md:p-3 hover:bg-blue-50 transition-colors">
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
                  {Object.entries(classStats?.subjectStats || {}).map(([subject, stat], index) => (
                    <div key={index} className="border-b border-gray-100 p-2 md:p-3 hover:bg-blue-50 transition-colors">
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
                              const personnelInfo = classStats?.personnelStats[personnelCode];
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
تعداد کل ساعت: ${classStats?.totalHours}
تعداد پرسنل منحصر به فرد: ${classStats?.uniquePersonnel}

${days.map(day => {
  const dayStat = classStats?.dayStats[day];
  if (!dayStat) return '';
  
  return `${day}:
${dayStat.personnel.map(personnelCode => {
  const personnelInfo = classStats?.personnelStats[personnelCode];
  return `    ${personnelInfo?.fullName || `کد: ${personnelCode}`}`;
}).join('\n')}`;
}).filter(Boolean).join('\n\n')}`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* مودال انتخاب زمان */}
        <Modal
          isOpen={timeSelectionModalOpen}
          onClose={() => setTimeSelectionModalOpen(false)}
          title="انتخاب زمان برنامه"
          width="95%"
          maxWidth="900px"
          className="text-black backdrop-blur-lg"
          overlayClassName="bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-indigo-600/20 backdrop-blur-md"
        >
          <div className="space-y-4 text-right">
            <p className="mb-4 text-center text-sm sm:text-base">لطفاً روز و ساعت مورد نظر را انتخاب کنید</p>
            <div className={`${styles.tableWrapper} pb-4`}>
              <table className={`${styles.scheduleTable} text-xs sm:text-sm`}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1 sm:p-2 text-gray-900 font-bold text-right sticky right-0 bg-gray-100 z-10">روز / ساعت</th>
                    {timeSlots.map((time, index) => (
                      <th key={time} className="border border-gray-300 p-1 sm:p-2 text-gray-900 font-bold text-center min-w-[70px] sm:min-w-[100px]">
                        تک ساعت {toPersianNumber(index + 1)}م
                        <div className="text-[0.6rem] text-gray-700">{time}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day}>
                      <td className="border border-gray-300 p-1 sm:p-2 text-gray-900 font-bold text-right sticky right-0 bg-gray-50 z-10">{day}</td>
                      {timeSlots.map(time => (
                        <td
                          key={`${day}-${time}`}
                          className="border border-gray-300 p-1 sm:p-2 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => handleTimeSelection(day, time)}
                        >
                          <button className="w-full h-full flex items-center justify-center text-[10px] sm:text-sm">
                            <span className="p-1 rounded-full bg-blue-200 hover:bg-blue-300 transition-colors w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-gray-900">
                              {getScheduleForCell(day, time) ? '✓' : '+'}
                            </span>
                          </button>
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
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-700/30 via-emerald-600/30 to-indigo-950/30 backdrop-blur-sm"></div>
            <div className="bg-white rounded-lg p-6 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto transform shadow-xl relative text-black z-[70]">
              <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-white z-10 py-2 border-b">
                <h2 className="text-lg md:text-xl font-bold text-black">افزودن برنامه جدید</h2>
                <button 
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="space-y-3 md:space-y-4 text-right">
                {selectedCell && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border-r-4 border-cyan-500">
                    <p className="text-cyan-900">زمان انتخاب شده: <span className="font-bold">{selectedCell.day}</span> ساعت <span className="font-bold">{selectedCell.time}</span></p>
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black text-sm transition-all"
                      placeholder="نام یا کد پرسنلی را جستجو کنید"
                    />
                    <button
                      onClick={() => setShowPersonnelSearch(!showPersonnelSearch)}
                      className="p-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 flex-shrink-0 transition-colors"
                      title="جستجوی پرسنل"
                    >
                      <FaSearch />
                    </button>
                  </div>
                  
                  {showPersonnelSearch && searchResults.length > 0 && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-md max-h-36 md:max-h-48 overflow-y-auto shadow-md">
                      {searchResults.map(personnel => (
                        <div
                          key={personnel.id}
                          className="p-2 md:p-3 border-b border-gray-100 hover:bg-cyan-50 cursor-pointer transition-colors"
                          onClick={() => selectPersonnelFromSearch(personnel)}
                        >
                          <div className="font-medium text-gray-900 text-sm">{personnel.fullName}</div>
                          <div className="text-xs text-gray-600">کد پرسنلی: {personnel.personnelCode}</div>
                          <div className="text-xs text-gray-600">سمت: {personnel.mainPosition}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Input
                  label="کد پرسنلی"
                  value={personnelCode}
                  onChange={(e) => {
                    // فقط اعداد قابل قبول هستند و حداکثر ۸ رقم
                    const value = e.target.value;
                    if (value === '' || (/^\d+$/.test(value) && value.length <= 8)) {
                      setPersonnelCode(value);
                    }
                  }}
                  placeholder="کد پرسنلی را وارد کنید"
                  className="w-full text-black text-sm focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  type="text"
                />

                <Input
                  label="نام و نام خانوادگی پرسنل"
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  placeholder="نام و نام خانوادگی پرسنل را وارد کنید"
                  className="w-full text-black text-sm"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                    rows={2}
                    placeholder="توضیحات اضافی را وارد کنید"
                  />
                </div>
                
                <div className="flex justify-start sticky bottom-0 bg-white py-2 border-t mt-4 pt-4">
                  <SubmitButton 
                    label="ثبت برنامه" 
                    onClick={handleSubmit} 
                    className="ml-2 bg-lime-400 hover:bg-lime-500 text-center hover:scale-110 ease-in-out duration-200 text-sm"
                  />
                  <SubmitButton 
                    label="انصراف" 
                    onClick={() => {
                      setModalOpen(false);
                      resetForm();
                    }} 
                    className="bg-red-100 text-red-600 text-center hover:scale-110 ease-in-out duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* مودال انتخاب کلاس */}
      {showClassModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tl from-cyan-700/30 via-emerald-600/30 to-indigo-950/30 backdrop-blur-sm"></div>
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md transform shadow-xl relative z-[70]">
            <div className="mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-black text-center">انتخاب کلاس</h2>
            </div>
            <div className="space-y-4 md:space-y-6 text-right">
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

              <div className="flex justify-between pt-4 md:pt-6">
                <Link 
                  href="/welcome" 
                  className="py-1 bg-gradient-to-r from-red-100 to-red-200 text-red-700 font-bold rounded hover:from-red-200 hover:to-red-300 align-middle transition-colors h-8 w-1/4 text-center flex items-center justify-center text-sm md:text-base"
                >
                  انصراف
                </Link>
                <SubmitButton 
                  label="تایید" 
                  onClick={handleClassSubmit} 
                  className="w-2/3 mr-2 bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 pr-10 text-sm md:text-base transition-all"
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
      <style jsx global>{`
        @media screen and (max-width: 768px) {
          .button-text {
            font-size: 0.8rem;
          }
          
          .responsive-buttons {
            gap: 0.5rem;
          }
          
          .responsive-buttons button {
            margin: 0.25rem;
            padding: 0.5rem 0.75rem;
          }
          
          .schedule-header-cell {
            font-size: 0.7rem;
            padding: 0.25rem !important;
            min-width: 80px !important;
          }
          
          .sticky-col {
            position: sticky;
            right: 0;
            z-index: 2;
            background-color: #f8f9fa;
          }
          
          .schedule-table-container {
            margin-right: -0.5rem;
            margin-left: -0.5rem;
            padding-right: 0.5rem;
            padding-left: 0.5rem;
            width: calc(100% + 1rem);
          }
          
          .mobile-friendly-table {
            font-size: 0.7rem;
          }
          
          .mobile-time-cell {
            min-width: 60px !important;
            padding: 0.25rem !important;
          }
          
          .sticky-header {
            position: sticky;
            right: 0;
            z-index: 2;
            background-color: #f8f9fa;
          }
          
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;  
            overflow: hidden;
          }
          
          /* تنظیم استایل Dropdown در مودال‌ها */
          .dropdown-container select {
            font-size: 0.8rem !important;
            padding: 0.5rem !important;
          }
          
          .dropdown-container label {
            font-size: 0.8rem !important;
          }
          
          /* تنظیم فاصله بین موارد در مودال */
          .space-y-3 > * + * {
            margin-top: 0.5rem !important;
          }
        }
      `}</style>
      <Toaster />

      {/* مودال پیش‌نمایش برای خروجی اکسل */}
      {showCombinedPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">پیش‌نمایش خروجی اکسل</h2>
                <button
                  onClick={() => setShowCombinedPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="mt-2">
                <h3 className="text-lg font-bold text-blue-800 mb-2">اطلاعات کلاس</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">پایه: {grade}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">کلاس: {classNumber}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">رشته: {field}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-grow overflow-auto p-4">
              <div className="overflow-x-auto pb-4">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-gray-900 font-bold text-right">روز / ساعت</th>
                      {hours.map((hour, hourIndex) => (
                        <th key={hourIndex} className="border border-gray-300 p-2 text-gray-900 font-bold text-center">{hour}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, dayIndex) => (
                      <tr key={dayIndex} className={dayIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-300 p-2 text-gray-900 font-bold text-right">{day}</td>
                        {timeSlots.map((time, timeIndex) => {
                          const cellSchedule = schedule.find(item => 
                            item.day === day && item.timeStart === time
                          );
                          
                          return (
                            <td key={timeIndex} className="border border-gray-300 p-2 text-right">
                              {cellSchedule && (
                                <div>
                                  <div className="font-bold text-cyan-800">
                                    {cellSchedule.teachingGroup}
                                  </div>
                                  <div className="text-sm text-gray-800">
                                    {(() => {
                                      let fullName = '';
                                      const personnelData = savedPersonnelSchedules.find(
                                        ps => ps.personnel.personnelCode === cellSchedule.personnelCode
                                      );
                                      
                                      if (personnelData) {
                                        fullName = personnelData.personnel.fullName;
                                      }
                                      
                                      return fullName || cellSchedule.personnelCode;
                                    })()}
                                  </div>
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
            
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowCombinedPreview(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                انصراف
              </button>
              <button
                onClick={exportCombinedDataToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
              >
                <FaFileExport className="ml-2" />
                دانلود فایل اکسل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage; 