'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaPlus, FaTimes, FaSearch, FaSave, FaFileExport, FaUserPlus, FaExclamationTriangle, FaHistory } from "react-icons/fa";
import styles from '../personnel-schedule.module.css';
import { findPersonnelByCode, Personnel } from '../../../data/personnel';
import * as XLSX from 'xlsx';

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
}

interface SavedSchedule {
  personnel: Personnel;
  schedules: Schedule[];
  timestamp: number;
}

const toPersianNumber = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => persianNumbers[+w]);
};

const PersonnelSchedule = () => {
  const searchParams = useSearchParams();
  const personnelCodeParam = searchParams?.get('code') || '';
  const fullNameParam = searchParams?.get('name') || '';
  const mainPositionParam = searchParams?.get('position') || '';
  
  const [showPersonnelModal, setShowPersonnelModal] = useState(true);
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
  const [showCombinedScheduleModal, setShowCombinedScheduleModal] = useState(false);
  const [showCombinedPreview, setShowCombinedPreview] = useState(false);
  const [selectedCellForHistory, setSelectedCellForHistory] = useState<{day: string, time: string} | null>(null);
  const [showCellHistoryMenu, setShowCellHistoryMenu] = useState(false);
  const [cellHistoryPosition, setCellHistoryPosition] = useState({ x: 0, y: 0 });
  
  const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
  const hours = ['تک ساعت اول', 'تک ساعت دوم', 'تک ساعت سوم', 'تک ساعت چهارم', 'تک ساعت پنجم', 'تک ساعت ششم', 'تک ساعت هفتم', 'تک ساعت هشتم', 'تک ساعت نهم', 'تک ساعت دهم', 'تک ساعت یازدهم', 'تک ساعت دوازدهم', 'تک ساعت سیزدهم', 'تک ساعت چهاردهم'];
  const timeSlots = hours.map((_, index) => `${toPersianNumber(7 + Math.floor(index))}:${index % 2 === 0 ? '۰۰' : '۳۰'}`);

  const grades = ['دهم', 'یازدهم', 'دوازدهم'];
  
  const classOptions = {
    'دهم': ['الف', 'ب', 'ج', 'د'],
    'یازدهم': ['الف', 'ب', 'ج', 'د'],
    'دوازدهم': ['الف', 'ب', 'ج', 'د']
  };

  const fields = [
    'الکتروتکنیک',
    'الکترونیک',
    'کامپیوتر',
    'مکانیک',
    'عمران',
    'معماری'
  ];

  const mainPositions = [
    'هنرآموز',
    'دبیر',
    'مدیر',
    'معاون',
    'سرپرست بخش',
    'استادکار'
  ];

  const hourTypes = [
    'موظف اول',
    'موظف دوبل',
    'غیرموظف اول',
    'غیرموظف دوبل',
    'موظف معاونین',
    'موظف سرپرست بخش'
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
    if (personnelCodeParam && fullNameParam && mainPositionParam) {
      setSelectedPersonnel({
        id: Date.now().toString(),
        personnelCode: personnelCodeParam,
        fullName: fullNameParam,
        mainPosition: mainPositionParam,
        employmentStatus: 'شاغل'
      });
      setShowPersonnelModal(false);
    }
  }, [personnelCodeParam, fullNameParam, mainPositionParam]);

  useEffect(() => {
    checkScheduleConflicts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, selectedPersonnel]);

  useEffect(() => {
    loadAllSavedSchedules();
  }, []);

  const handleSearchPersonnel = () => {
    if (!personnelCode.trim()) {
      setSearchError('لطفاً کد پرسنلی را وارد کنید');
      return;
    }

    const foundPersonnel = findPersonnelByCode(personnelCode);
    if (foundPersonnel) {
      setSelectedPersonnel(foundPersonnel);
      setSearchError('');
    } else {
      setSelectedPersonnel(null);
      setSearchError('پرسنلی با این کد یافت نشد');
    }
  };

  const handlePersonnelSubmit = () => {
    if (selectedPersonnel) {
      setShowPersonnelModal(false);
    } else {
      setSearchError('لطفاً ابتدا یک پرسنل را انتخاب کنید');
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
      
      const newScheduleItem: Schedule = {
        id: Date.now().toString(),
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
        personnelId: selectedPersonnel.id
      };
      
      setSchedule([...schedule, newScheduleItem]);
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
    return schedule.filter(item => item.day === day && item.timeStart === time);
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
    
    if (draggedItem) {
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

  const handleDeleteSchedule = (id: string) => {
    setSchedule(schedule.filter(item => item.id !== id));
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
      const index = timeSlots.findIndex(slot => slot === item.timeStart);
      return index !== -1 ? index + 1 : -1;
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
      
      loadAllSavedSchedules();
      
      alert('برنامه با موفقیت ذخیره شد');
    } catch (error) {
      console.error('خطا در ذخیره‌سازی برنامه:', error);
      alert('خطا در ذخیره‌سازی برنامه. لطفاً دوباره تلاش کنید.');
    }
  };

  const loadScheduleFromLocalStorage = (personnelId?: string) => {
    const id = personnelId || selectedPersonnel?.id;
    if (!id) return;
    
    try {
      const storageKey = `personnel_schedule_${id}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData: SavedSchedule = JSON.parse(savedData);
        setSchedule(parsedData.schedules);
        if (!personnelId) {
          alert('برنامه با موفقیت بارگیری شد');
        }
      } else if (!personnelId) {
        alert('برنامه‌ای برای این پرسنل در حافظه محلی یافت نشد');
      }
    } catch (error) {
      console.error('خطا در بارگیری برنامه:', error);
      if (!personnelId) {
        alert('خطا در بارگیری برنامه. لطفاً دوباره تلاش کنید.');
      }
    }
  };

  const loadAllSavedSchedules = () => {
    try {
      const allSchedules: SavedSchedule[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('personnel_schedule_')) {
          const savedData = localStorage.getItem(key);
          
          if (savedData) {
            const parsedData: SavedSchedule = JSON.parse(savedData);
            allSchedules.push(parsedData);
          }
        }
      }
      
      setSavedSchedules(allSchedules);
    } catch (error) {
      console.error('خطا در بارگیری برنامه‌ها:', error);
    }
  };

  const exportToExcel = () => {
    setShowCombinedPreview(true);
  };
  
  const exportCombinedDataToExcel = () => {
    if (savedSchedules.length === 0) {
      alert('هیچ برنامه‌ای برای صدور وجود ندارد');
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
      alert('خطا در صدور به اکسل. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleShowCombinedSchedules = () => {
    loadAllSavedSchedules();
    setShowCombinedScheduleModal(true);
  };

  const handleAddPersonnel = () => {
    if (!newPersonnel.personnelCode.trim() || !newPersonnel.fullName.trim() || !newPersonnel.mainPosition.trim()) {
      setAddPersonnelError('لطفاً تمام فیلدهای الزامی را پر کنید');
      return;
    }
    
    const newPersonnelWithId: Personnel = {
      ...newPersonnel,
      id: Date.now().toString()
    };
    
    setSelectedPersonnel(newPersonnelWithId);
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
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      
      setCellHistoryPosition({
        x: rect.right + 10 + scrollX,
        y: rect.top + scrollY
      });
      setSelectedCellForHistory({ day, time });
      setShowCellHistoryMenu(true);
    }
  };

  const handleChangePersonnel = (personnel: Personnel) => {
    setSelectedPersonnel(personnel);
    setSchedule([]);
    loadScheduleFromLocalStorage(personnel.id);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/welcome" className={styles.backButton}>
          بازگشت
        </Link>
        <h1 className="text-cyan-800 font-bold">
          برنامه پرسنل: {selectedPersonnel?.fullName || 'انتخاب نشده'}
        </h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowPersonnelModal(true)}
            className={styles.actionButton}
          >
            تغییر پرسنل
          </button>
          <button 
            onClick={() => setShowAddPersonnelModal(true)}
            className={styles.actionButton}
            title="افزودن پرسنل جدید"
          >
            <FaUserPlus className="ml-1" />
            افزودن پرسنل جدید
          </button>
          <button 
            onClick={handleAddNewSchedule}
            className={styles.actionButton}
            disabled={!selectedPersonnel}
          >
            <FaPlus className="ml-1" />
            افزودن برنامه
          </button>
          <button 
            onClick={saveScheduleToLocalStorage}
            className={styles.actionButton}
            disabled={!selectedPersonnel || schedule.length === 0}
            title="ذخیره برنامه"
          >
            <FaSave className="ml-1" />
            ذخیره
          </button>
          <button 
            onClick={() => loadScheduleFromLocalStorage()}
            className={styles.actionButton}
            disabled={!selectedPersonnel}
            title="بارگیری برنامه"
          >
            <FaSave className="ml-1" />
            بارگیری
          </button>
          <button 
            onClick={handleShowCombinedSchedules}
            className={styles.actionButton}
            title="نمایش برنامه‌های ترکیبی"
          >
            نمایش برنامه ترکیبی
          </button>
          <button 
            onClick={exportToExcel}
            className={styles.actionButton}
            disabled={savedSchedules.length === 0}
            title="صدور به اکسل"
          >
            <FaFileExport className="ml-1" />
            صدور به اکسل
          </button>
        </div>
      </header>

      {showConflictWarning && conflicts.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
          <div className="flex items-center text-yellow-800 font-bold mb-2">
            <FaExclamationTriangle className="ml-2" />
            <span>هشدار: تداخل در برنامه‌ریزی!</span>
          </div>
          <div className="space-y-2">
            {conflicts.map((conflict, index) => (
              <div key={index} className="p-2 bg-white rounded-md shadow-sm">
                <p className="font-bold text-gray-700">
                  {conflict.day} - {hours[timeSlots.indexOf(conflict.time)]} - {conflict.grade} {conflict.classNumber} {conflict.field}
                </p>
                <p className="text-red-600">
                  تداخل بین پرسنل: {conflict.personnelNames.join(' و ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className={styles.main}>
        {selectedPersonnel ? (
          <div>
            <div className="mb-6 p-4 bg-cyan-50 rounded-lg">
              <h2 className="text-xl font-bold mb-2 text-gray-800">اطلاعات پرسنل</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="font-semibold text-gray-800">کد پرسنلی:</p>
                  <p className="text-gray-900">{selectedPersonnel.personnelCode}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">نام و نام خانوادگی:</p>
                  <p className="text-gray-900">{selectedPersonnel.fullName}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">سمت اصلی:</p>
                  <p className="text-gray-900">{selectedPersonnel.mainPosition}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">وضعیت اشتغال:</p>
                  <p className="text-gray-900">{selectedPersonnel.employmentStatus}</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className={styles.scheduleTable}>
                <thead>
                  <tr>
                    <th className="text-gray-800">روز/ساعت</th>
                    {hours.map(hour => (
                      <th key={hour} className="text-gray-800">{hour}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day}>
                      <th className="text-gray-800">{day}</th>
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
                                    <FaHistory className="w-3 h-3 text-gray-600" />
                                  </button>
                                </div>
                              )}
                              
                              {cellSchedules.map((item) => (
                                <div 
                                  key={item.id}
                                  className={`${styles.scheduleItem} relative`}
                                  style={{zIndex: 10}}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item, day, time)}
                                >
                                  <p className="font-bold text-gray-900">{item.grade} {item.classNumber}</p>
                                  <p className="text-gray-800">{item.field}</p>
                                  <p className="text-gray-800">{item.mainPosition}</p>
                                  <p className="text-gray-800">{item.hourType}</p>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSchedule(item.id);
                                    }}
                                    className={styles.deleteButton}
                                  >
                                    <FaTimes />
                                  </button>
                                </div>
                              ))}
                              
                              {allCellHistory.length > 0 && (
                                <div className="absolute left-1 bottom-1 flex">
                                  {allCellHistory.slice(0, 3).map((historyItem, idx) => (
                                    <div 
                                      key={idx} 
                                      className="bg-gray-200 opacity-50 w-4 h-4 border border-gray-300 -mr-1 rounded-sm"
                                      style={{zIndex: 1, transform: `translateX(${idx * 3}px)`}} 
                                    />
                                  ))}
                                </div>
                              )}
                              
                              {cellSchedules.length === 0 && (
                                <div className="w-full h-full min-h-[6rem] flex items-center justify-center cursor-pointer hover:bg-gray-50">
                                  <span className="text-gray-500">+</span>
                                </div>
                              )}

                              {cellSchedules.length > 0 && (
                                <div className="absolute bottom-1 right-1">
                                  <button
                                    className="bg-cyan-100 hover:bg-cyan-200 p-1 rounded text-xs"
                                    title="افزودن برنامه جدید"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTimeSelection(day, time);
                                    }}
                                  >
                                    <FaPlus className="w-3 h-3 text-cyan-700" />
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

            <div className="mt-8 p-4 bg-cyan-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-right text-gray-800">خلاصه برنامه‌های پرسنل</h2>
              
              {schedule.length > 0 ? (
                <div>
                  <div className="mb-4 p-3 bg-cyan-700 text-white rounded-lg text-center">
                    <p className="font-bold">
                      مجموع ساعات حضور پرسنل: <span className="text-amber-300">{toPersianNumber(calculateTotalHours())}</span> تک ساعت
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {days.map(day => {
                      const daySchedules = schedule.filter(item => item.day === day);
                      
                      if (daySchedules.length === 0) return null;
                      
                      const dayHourNumbers = getDayScheduleHours(day);
                      
                      const groupedSchedules = groupSimilarSchedules(daySchedules);
                      
                      return (
                        <div key={day} className="p-3 bg-white rounded-lg shadow-sm">
                          <h3 className="font-bold text-gray-900 mb-2">
                            {day}: <span className="text-cyan-700">{toPersianNumber(dayHourNumbers.length)} تک ساعت</span>
                          </h3>
                          
                          <div className="p-2 mb-3 bg-cyan-50 rounded-md text-cyan-700 text-sm">
                            {formatHourNumbers(dayHourNumbers)}
                          </div>
                          
                          <div className="space-y-2">
                            {groupedSchedules.map((groupedItem, index) => {
                              return (
                                <div key={`${groupedItem.id}-${index}`} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md">
                                  <div className="text-gray-800">
                                    <span className="ml-2 font-semibold">{groupedItem.grade} {groupedItem.classNumber}</span>
                                    <span className="ml-2">{groupedItem.field}</span>
                                    <span className="ml-2">({groupedItem.hourType})</span>
                                  </div>
                                  <div className="text-cyan-700">
                                    {formatHourNumbers(groupedItem.hourNumbers)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">هنوز برنامه‌ای ثبت نشده است</p>
              )}
              
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={handleAddNewSchedule}
                  className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
                >
                  <FaPlus className="ml-1 inline-block" />
                  افزودن برنامه جدید
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="mb-4 text-gray-800">لطفاً ابتدا پرسنل را انتخاب کنید</p>
            <button
              onClick={() => setShowPersonnelModal(true)}
              className={styles.actionButton}
            >
              انتخاب پرسنل
            </button>
          </div>
        )}
      </main>

      {showPersonnelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-in-out">
          <div className="absolute inset-0 bg-gradient-to-br opacity-55 from-gray-700 via-gray-800 to-gray-900 backdrop-blur-[2px]"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-500 ease-in-out shadow-xl relative">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 text-center">انتخاب پرسنل</h2>
            </div>
            <div className={styles.scrollableContent}>
              <div className="space-y-6 text-right">
                <div className="space-y-2">
                  <label htmlFor="personnelCode" className="block text-gray-800 font-medium">کد پرسنلی:</label>
                  <div className="flex">
                    <input
                      id="personnelCode"
                      type="text"
                      value={personnelCode}
                      onChange={(e) => {
                        setPersonnelCode(e.target.value);
                        setSearchError('');
                      }}
                      placeholder="کد پرسنلی را وارد کنید"
                      className="w-full p-2 border border-gray-300 rounded-r text-gray-900"
                    />
                    <button 
                      onClick={handleSearchPersonnel}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-l"
                    >
                      <FaSearch />
                    </button>
                  </div>
                  {searchError && (
                    <p className="text-red-600 mt-1">{searchError}</p>
                  )}
                </div>

                {selectedPersonnel && (
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-md">
                    <h3 className="font-bold text-gray-900 mb-2">اطلاعات پرسنل:</h3>
                    <p className="text-gray-800"><span className="font-semibold">نام و نام خانوادگی:</span> {selectedPersonnel.fullName}</p>
                    <p className="text-gray-800"><span className="font-semibold">سمت اصلی:</span> {selectedPersonnel.mainPosition}</p>
                    <p className="text-gray-800"><span className="font-semibold">وضعیت اشتغال:</span> {selectedPersonnel.employmentStatus}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Link 
                href="/welcome" 
                className="py-2 px-4 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200 transition-colors"
              >
                انصراف
              </Link>
              <button 
                onClick={handlePersonnelSubmit} 
                className={`py-2 px-6 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded transition-colors ${!selectedPersonnel ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!selectedPersonnel}
              >
                تایید
              </button>
            </div>
          </div>
        </div>
      )}

      {timeSelectionModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className="text-xl font-bold mb-4 text-gray-900">انتخاب زمان</h2>
            <div className={styles.scrollableContent}>
              <div className="grid grid-cols-2 gap-3">
                {days.map(day => (
                  <div key={day} className="mb-4">
                    <h3 className="font-bold mb-2 text-gray-800">{day}</h3>
                    <div className="space-y-2">
                      {timeSlots.map(time => (
                        <button
                          key={`${day}-${time}`}
                          className="block w-full text-right py-2 px-3 border rounded hover:bg-gray-100 text-gray-800"
                          onClick={() => handleTimeSelection(day, time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setTimeSelectionModalOpen(false)}
                className="px-4 py-2 border rounded mr-2 text-gray-800"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className="text-xl font-bold mb-4 text-gray-900">اضافه کردن برنامه جدید</h2>
            <p className="mb-4 text-gray-800">
              روز: {selectedCell?.day}، ساعت: {selectedCell?.time}
            </p>
            
            <div className={styles.scrollableContent}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-gray-800">پایه:</label>
                  <select
                    className="w-full p-2 border rounded text-gray-900"
                    value={grade}
                    onChange={(e) => {
                      setGrade(e.target.value);
                      setClassNumber('');
                    }}
                  >
                    <option value="">انتخاب کنید</option>
                    {grades.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 text-gray-800">شماره/ نام کلاس:</label>
                  <select
                    className="w-full p-2 border rounded text-gray-900"
                    value={classNumber}
                    onChange={(e) => setClassNumber(e.target.value)}
                    disabled={!grade}
                  >
                    <option value="">انتخاب کنید</option>
                    {grade && classOptions[grade as keyof typeof classOptions].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 text-gray-800">رشته:</label>
                  <select
                    className="w-full p-2 border rounded text-gray-900"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                  >
                    <option value="">انتخاب کنید</option>
                    {fields.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-gray-800">پست اصلی:</label>
                  <select
                    className="w-full p-2 border rounded text-gray-900"
                    value={mainPosition}
                    onChange={(e) => setMainPosition(e.target.value)}
                  >
                    <option value="">انتخاب کنید</option>
                    {mainPositions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 text-gray-800">نوع ساعت:</label>
                  <select
                    className="w-full p-2 border rounded text-gray-900"
                    value={hourType}
                    onChange={(e) => setHourType(e.target.value)}
                  >
                    <option value="">انتخاب کنید</option>
                    {hourTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 text-gray-800">گروه تدریس:</label>
                  <select
                    className="w-full p-2 border rounded text-gray-900"
                    value={teachingGroup}
                    onChange={(e) => setTeachingGroup(e.target.value)}
                  >
                    <option value="">انتخاب کنید</option>
                    {teachingGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 text-gray-800">توضیحات (اختیاری):</label>
                  <textarea
                    className="w-full p-2 border rounded text-gray-900"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border rounded text-gray-800"
              >
                انصراف
              </button>
              <button 
                onClick={handleSubmit}
                className={`px-4 py-2 bg-cyan-600 text-white rounded ${(!grade || !classNumber || !field || !mainPosition || !hourType || !teachingGroup) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!grade || !classNumber || !field || !mainPosition || !hourType || !teachingGroup}
              >
                ثبت
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
              <h2 className="text-xl font-bold text-gray-900 text-center">افزودن پرسنل جدید</h2>
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
                    value={newPersonnel.personnelCode}
                    onChange={(e) => setNewPersonnel({...newPersonnel, personnelCode: e.target.value})}
                    placeholder="کد پرسنلی را وارد کنید"
                    className="w-full p-2 border border-gray-300 rounded text-gray-900"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newFullName" className="block text-gray-800 font-medium">نام و نام خانوادگی:</label>
                  <input
                    id="newFullName"
                    type="text"
                    value={newPersonnel.fullName}
                    onChange={(e) => setNewPersonnel({...newPersonnel, fullName: e.target.value})}
                    placeholder="نام و نام خانوادگی را وارد کنید"
                    className="w-full p-2 border border-gray-300 rounded text-gray-900"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newMainPosition" className="block text-gray-800 font-medium">سمت اصلی:</label>
                  <select
                    id="newMainPosition"
                    value={newPersonnel.mainPosition}
                    onChange={(e) => setNewPersonnel({...newPersonnel, mainPosition: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded text-gray-900"
                  >
                    <option value="">انتخاب کنید</option>
                    {mainPositions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newEmploymentStatus" className="block text-gray-800 font-medium">وضعیت اشتغال:</label>
                  <select
                    id="newEmploymentStatus"
                    value={newPersonnel.employmentStatus}
                    onChange={(e) => setNewPersonnel({...newPersonnel, employmentStatus: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded text-gray-900"
                  >
                    <option value="شاغل">شاغل</option>
                    <option value="بازنشسته">بازنشسته</option>
                    <option value="خرید خدمات">خرید خدمات</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button 
                onClick={() => setShowAddPersonnelModal(false)}
                className="py-2 px-4 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200 transition-colors"
              >
                انصراف
              </button>
              <button 
                onClick={handleAddPersonnel}
                className="py-2 px-6 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded transition-colors"
              >
                افزودن
              </button>
            </div>
          </div>
        </div>
      )}

      {showCombinedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-in-out">
          <div className="absolute inset-0 bg-gradient-to-br opacity-55 from-gray-700 via-gray-800 to-gray-900 backdrop-blur-[2px]"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] transform transition-all duration-500 ease-in-out shadow-xl relative">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 text-center">پیش‌نمایش برنامه کلی پرسنل</h2>
              <p className="text-center text-gray-600 mt-2">لطفاً پیش از دانلود فایل اکسل، برنامه کلی را تأیید کنید</p>
            </div>
            <div className={styles.scrollableContent} style={{ maxHeight: '70vh' }}>
              {savedSchedules.length > 0 ? (
                <div className="overflow-x-auto">
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
                                    <p className="font-bold text-gray-900">{item.grade} {item.classNumber}</p>
                                    <p className="text-gray-800">{item.field}</p>
                                    <p className="text-sm text-cyan-700">{savedSchedule.personnel.fullName}</p>
                                    <p className="text-xs text-gray-600">{item.mainPosition} - {item.hourType}</p>
                                  </div>
                                );
                              });
                            });
                            
                            return (
                              <td key={`${day}-${time}`} className={styles.scheduleCell}>
                                {cellContents.length > 0 ? cellContents : (
                                  <div className="w-full h-full min-h-[6rem] flex items-center justify-center">
                                    <span className="text-gray-300">-</span>
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
                <div className="text-center p-8">
                  <p className="text-gray-800">هیچ برنامه‌ای برای نمایش وجود ندارد</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-between">
              <button 
                onClick={() => setShowCombinedPreview(false)} 
                className="py-2 px-4 bg-gray-200 text-gray-800 font-bold rounded hover:bg-gray-300 transition-colors"
              >
                انصراف
              </button>
              <button 
                onClick={exportCombinedDataToExcel}
                className="py-2 px-6 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded transition-colors"
                disabled={savedSchedules.length === 0}
              >
                تأیید و دانلود
              </button>
            </div>
          </div>
        </div>
      )}

      {showCombinedScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-in-out">
          <div className="absolute inset-0 bg-gradient-to-br opacity-55 from-gray-700 via-gray-800 to-gray-900 backdrop-blur-[2px]"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-500 ease-in-out shadow-xl relative">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 text-center">برنامه‌های ذخیره‌شده</h2>
            </div>
            <div className={styles.scrollableContent}>
              {savedSchedules.length > 0 ? (
                <div className="space-y-2">
                  {savedSchedules.map(savedSchedule => (
                    <div key={savedSchedule.personnel.id} className="p-3 border rounded-md flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900">{savedSchedule.personnel.fullName}</p>
                        <p className="text-sm font-medium text-gray-700">{savedSchedule.personnel.mainPosition}</p>
                        <p className="text-xs font-medium text-gray-600">آخرین بروزرسانی: {new Date(savedSchedule.timestamp).toLocaleDateString('fa-IR')}</p>
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <button 
                          onClick={() => {
                            handleChangePersonnel(savedSchedule.personnel);
                            setShowCombinedScheduleModal(false);
                          }}
                          className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
                        >
                          انتخاب
                        </button>
                        <button 
                          onClick={() => {
                            const confirmed = confirm(`آیا از حذف برنامه ${savedSchedule.personnel.fullName} اطمینان دارید؟`);
                            if (confirmed) {
                              localStorage.removeItem(`personnel_schedule_${savedSchedule.personnel.id}`);
                              loadAllSavedSchedules();
                            }
                          }}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center font-medium text-gray-700">هیچ برنامه‌ای ذخیره نشده است</p>
              )}
            </div>
            
            <div className="mt-6 flex justify-between">
              <button 
                onClick={() => setShowCombinedScheduleModal(false)} 
                className="py-2 px-4 bg-gray-200 text-gray-800 font-bold rounded hover:bg-gray-300 transition-colors"
              >
                بازگشت
              </button>
              {savedSchedules.length > 0 && (
                <button 
                  onClick={exportToExcel}
                  className="py-2 px-6 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded transition-colors"
                >
                  صدور به اکسل
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showCellHistoryMenu && selectedCellForHistory && (
        <div 
          className={styles.cellHistoryMenu}
          style={{
            position: 'absolute',
            top: `${cellHistoryPosition.y}px`,
            left: `${cellHistoryPosition.x}px`,
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            padding: '10px',
            width: '280px'
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-900">تاریخچه برنامه‌ها</h3>
            <button 
              onClick={() => setShowCellHistoryMenu(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="text-sm text-gray-700 mb-2">
            <span className="font-medium">روز: </span>{selectedCellForHistory.day}، 
            <span className="font-medium mr-1">ساعت: </span>{hours[timeSlots.indexOf(selectedCellForHistory.time)]}
          </div>
          
          <div className="divide-y divide-gray-200">
            {getAllSavedSchedulesForCell(selectedCellForHistory.day, selectedCellForHistory.time).map((item, index) => (
              <div key={index} className="py-2 text-gray-900">
                <p className="font-bold text-gray-900">{item.personnel?.fullName || 'نامشخص'}</p>
                <p className="text-sm text-gray-700">{item.grade} {item.classNumber} - {item.field}</p>
                <p className="text-sm text-gray-700">{item.mainPosition} - {item.hourType}</p>
                {item.description && <p className="text-sm text-gray-700">{item.description}</p>}
                <p className="text-xs text-gray-600 mt-1">تاریخ نامشخص</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PersonnelSchedulePage = () => {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <PersonnelSchedule />
    </Suspense>
  );
};

export default PersonnelSchedulePage; 