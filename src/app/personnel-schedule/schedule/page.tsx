'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaPlus, FaTimes, FaSearch, FaSave, FaFileExport, FaExclamationTriangle, FaHistory } from "react-icons/fa";
import styles from '../personnel-schedule.module.css';
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
  const searchParams = useSearchParams();
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
  const [showCombinedScheduleModal, setShowCombinedScheduleModal] = useState(false);
  const [showCombinedPreview, setShowCombinedPreview] = useState(false);
  const [selectedCellForHistory, setSelectedCellForHistory] = useState<{day: string, time: string} | null>(null);
  const [showCellHistoryMenu, setShowCellHistoryMenu] = useState(false);
  const [cellHistoryPosition, setCellHistoryPosition] = useState({ x: 0, y: 0 });
  const [showCellHistoryModalOpen, setShowCellHistoryModalOpen] = useState(false);
  const [clickedHistoryButton, setClickedHistoryButton] = useState<HTMLElement | null>(null);
  const [menuPositionUpdateCounter, setMenuPositionUpdateCounter] = useState(0);
  
  const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
  const hours = ['تک ساعت اول', 'تک ساعت دوم', 'تک ساعت سوم', 'تک ساعت چهارم', 'تک ساعت پنجم', 'تک ساعت ششم', 'تک ساعت هفتم', 'تک ساعت هشتم', 'تک ساعت نهم', 'تک ساعت دهم', 'تک ساعت یازدهم', 'تک ساعت دوازدهم', 'تک ساعت سیزدهم', 'تک ساعت چهاردهم'];
  const timeSlots = hours.map((_, index) => `${toPersianNumber(7 + Math.floor(index))}:${index % 2 === 0 ? '۰۰' : '۳۰'}`);

  const grades = ['دهم', 'یازدهم', 'دوازدهم'];
  
  const classOptions: Record<string, string[]> = {
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
      setSchedule([]);
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
    if (!newPersonnel.fullName.trim() || !newPersonnel.mainPosition.trim()) {
      setAddPersonnelError('لطفاً تمام فیلدهای الزامی را پر کنید');
      return;
    }
    
    const personnelCodeToUse = personnelCode || newPersonnel.personnelCode;
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
        setShowCombinedScheduleModal(false);
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          بازگشت
        </Link>
        <h1 className="text-cyan-700">
          برنامه‌ریزی پرسنل
        </h1>
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
                    className={styles.formInput}
                    value={personnelCode}
                    onChange={(e) => setPersonnelCode(e.target.value)}
                    placeholder="کد پرسنلی را وارد کنید"
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
                  onClick={() => setShowAddPersonnelModal(true)}
                  className={styles.actionButton}
                >
                  <FaPlus className="ml-1 inline-block" />
                  <span className="inline-block">افزودن پرسنل جدید</span>
                </button>
                <button
                  onClick={handleShowCombinedSchedules}
                  className={styles.actionButton}
                >
                  <FaHistory className="ml-1 inline-block" />
                  <span className="inline-block">برنامه‌های اخیر</span>
                </button>
              </div>

              {/* دکمه‌های عملیات سیستمی */}
              <div className="flex flex-wrap gap-2 mt-4 border-t pt-4 border-gray-200">
                <p className="w-full text-sm text-gray-600 mb-2">عملیات سیستمی:</p>
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
                      alert('تمام تاریخچه برنامه‌ها با موفقیت حذف شد.');
                    }
                  }}
                  className="py-1.5 px-3 bg-red-600 text-white text-xs md:text-sm font-medium rounded hover:bg-red-700 transition-colors"
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
                  className="py-1.5 px-3 bg-gray-600 text-white text-xs md:text-sm font-medium rounded hover:bg-gray-700 transition-colors"
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
                  <p className="text-xs md:text-sm text-gray-700 mt-1">کد پرسنلی: {selectedPersonnel.personnelCode} | سمت: {selectedPersonnel.mainPosition}</p>
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
                  className={styles.actionButton}
                >
                  <FaPlus className="ml-1 inline-block" />
                  <span className="inline-block">افزودن برنامه جدید</span>
                </button>
                <button
                  onClick={saveScheduleToLocalStorage}
                  className={styles.actionButton}
                  disabled={schedule.length === 0}
                >
                  <FaSave className="ml-1 inline-block" />
                  <span className="inline-block">ذخیره برنامه</span>
                </button>
                <button
                  onClick={handleShowCombinedSchedules}
                  className={styles.actionButton}
                >
                  <FaHistory className="ml-1 inline-block" />
                  <span className="inline-block">برنامه‌های اخیر</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className={styles.actionButton}
                  disabled={schedule.length === 0}
                >
                  <FaFileExport className="ml-1 inline-block" />
                  <span className="inline-block">خروجی اکسل</span>
                </button>
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
                              
                              {cellSchedules.map((item) => (
                                <div 
                                  key={item.id}
                                  className={`${styles.scheduleItem} relative`}
                                  style={{zIndex: 10}}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item, day, time)}
                                >
                                  <p className="font-bold text-gray-900 text-xs md:text-sm">{item.grade} {item.classNumber}</p>
                                  <p className="text-gray-800 text-xs md:text-sm">{item.field}</p>
                                  <p className="text-gray-800 text-xs md:text-sm">{item.mainPosition}</p>
                                  <p className="text-gray-800 text-xs md:text-sm">{item.hourType}</p>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSchedule(item.id);
                                    }}
                                    className={styles.deleteButton}
                                  >
                                    <FaTimes className="w-2 h-2 md:w-3 md:h-3" />
                                  </button>
                                </div>
                              ))}
                              
                              {allCellHistory.length > 0 && (
                                <div className="absolute left-1 bottom-1 flex">
                                  {allCellHistory.slice(0, 3).map((historyItem, idx) => (
                                    <div 
                                      key={idx} 
                                      className="bg-gray-200 opacity-50 w-3 h-3 md:w-4 md:h-4 border border-gray-300 -mr-1 rounded-sm"
                                      style={{zIndex: 1, transform: `translateX(${idx * 2}px)`}} 
                                    />
                                  ))}
                                </div>
                              )}
                              
                              {cellSchedules.length === 0 && (
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
                  <div className="bg-white p-2 md:p-3 rounded-md shadow-sm">
                    <p className="text-gray-900 text-xs md:text-sm">وضعیت ذخیره‌سازی</p>
                    <p className="text-gray-900 font-bold text-sm md:text-base">
                      {savedSchedules.some(s => s.personnel.id === selectedPersonnel?.id) ? 
                        'ذخیره شده' : 'ذخیره نشده'}
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
                          <h5 className="text-gray-900 font-bold text-sm md:text-base mb-1">
                            {grade} {classNumber} {field}
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
                  <p className="text-gray-500">هنوز برنامه‌ای ثبت نشده است</p>
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
              <p className="text-gray-700 mb-4">برنامه‌های زیر با برنامه‌های پرسنل دیگر تداخل دارند:</p>
              <ul className="space-y-3">
                {conflicts.map((conflict, index) => (
                  <li key={index} className="border border-red-200 rounded-md p-3 bg-red-50">
                    <p className="font-bold text-gray-900">{conflict.day} - {hours[timeSlots.indexOf(conflict.time)]}</p>
                    <p className="text-gray-800">کلاس: {conflict.grade} {conflict.classNumber} - {conflict.field}</p>
                    <p className="text-gray-800">پرسنل های دارای تداخل:</p>
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
                <option value="">انتخاب کنید</option>
                {grades.map(g => (
                  <option key={g} value={g}>{g}</option>
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
                <option value="">انتخاب کنید</option>
                {grade && classOptions[grade as keyof typeof classOptions]?.map(c => (
                  <option key={c} value={c}>{c}</option>
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
                <option value="">انتخاب کنید</option>
                {fields.map(f => (
                  <option key={f} value={f}>{f}</option>
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
                <option value="">انتخاب کنید</option>
                {mainPositions.map(p => (
                  <option key={p} value={p}>{p}</option>
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
                <option value="">انتخاب کنید</option>
                {hourTypes.map(h => (
                  <option key={h} value={h}>{h}</option>
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
                <option value="">انتخاب کنید</option>
                {teachingGroups.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel + " text-black"}>توضیحات:</label>
              <textarea 
                className={styles.formInput}
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
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
                <h3 className="text-base md:text-lg font-semibold mb-2">روزهای هفته</h3>
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
                <h3 className="text-base md:text-lg font-semibold mb-2">ساعت‌ها</h3>
                <div className={styles.timeSelectionGrid}>
                  {timeSlots.map((time, index) => (
                    <button
                      key={time}
                      className={`${styles.timeButton} ${selectedCell?.time === time ? 'bg-cyan-100 border-cyan-300' : ''}`}
                      onClick={() => setSelectedCell(prev => ({ day: prev?.day || days[0], time }))}
                    >
                      {hours[index]}
                      <br />
                      <span className="text-xs md:text-sm text-gray-500 mt-1">{time}</span>
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
              <p className="text-center text-gray-600 mt-2">لطفاً اطلاعات خود را تکمیل کنید</p>
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
                    className="w-full p-2 border border-gray-300 rounded text-gray-500 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">کد پرسنلی قابل تغییر نیست</p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newFullName" className="block text-gray-800 font-medium">نام و نام خانوادگی:</label>
                  <input
                    id="newFullName"
                    type="text"
                    value={newPersonnel.fullName}
                    onChange={(e) => setNewPersonnel({...newPersonnel, fullName: e.target.value})}
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                    className="w-full p-2 border border-gray-300 rounded text-gray-900"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newMainPosition" className="block text-gray-800 font-medium">سمت شغلی:</label>
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
              <p className="text-center text-gray-600 mt-1 md:mt-2 text-xs md:text-sm">لطفاً پیش از دانلود فایل اکسل، برنامه کلی را تأیید کنید</p>
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
                <div className="text-center p-4 md:p-8">
                  <p className="text-gray-800">هیچ برنامه‌ای برای نمایش وجود ندارد</p>
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
              <span className="font-medium">روز: </span>{selectedCellForHistory.day}، 
              <span className="font-medium mr-1">ساعت: </span>{hours[timeSlots.indexOf(selectedCellForHistory.time)]}
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
            
            <div className="text-sm md:text-base text-gray-900 mb-3 bg-gray-50 p-2 rounded">
              <span className="font-bold">روز: </span>{selectedCellForHistory.day}، 
              <span className="font-bold mr-1">ساعت: </span>{hours[timeSlots.indexOf(selectedCellForHistory.time)]}
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto bg-gray-50 rounded p-2">
              <div className="divide-y divide-gray-200">
                {getAllSavedSchedulesForCell(selectedCellForHistory.day, selectedCellForHistory.time).map((item, index) => (
                  <div key={index} className="py-3 text-gray-900 bg-white mb-2 p-3 rounded shadow-sm">
                    <p className="font-bold text-black text-sm md:text-base">{item.personnel?.fullName || 'نامشخص'}</p>
                    <p className="text-sm md:text-base text-gray-900">{item.grade} {item.classNumber} - {item.field}</p>
                    <p className="text-sm text-gray-800">{item.mainPosition} - {item.hourType}</p>
                    {item.description && <p className="text-sm text-gray-800 mt-1">{item.description}</p>}
                    <p className="text-xs text-gray-600 mt-2">تاریخ نامشخص</p>
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
    </div>
  );
};
/* eslint-enable @typescript-eslint/no-unused-vars */

const PersonnelSchedulePage = () => {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <PersonnelSchedule />
    </Suspense>
  );
};

export default PersonnelSchedulePage; 