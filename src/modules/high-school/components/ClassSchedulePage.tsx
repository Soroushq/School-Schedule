"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHighSchoolSchedule } from './HighSchoolScheduleProvider';
import { useVocationalSchedule } from './VocationalScheduleProvider';
import { Schedule, ScheduleWithFullName, ClassStatistics } from '../../common/types/scheduleTypes';
import { DAYS, TIME_SLOTS, HOUR_TYPES, MAIN_POSITIONS, EMPLOYMENT_STATUSES } from '../../common/constants/scheduleConstants';
import { useTheme } from '@/context/ThemeContext';

// کامپوننت صفحه برنامه‌ریزی کلاسی هنرستان
const HighSchoolClassSchedulePage: React.FC<{isVocational?: boolean}> = ({ isVocational = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gradeParam = searchParams.get('grade') || '';
  const classParam = searchParams.get('class') || '';
  const fieldParam = searchParams.get('field') || '';
  const { theme } = useTheme();
  
  // استفاده از کانتکست مناسب بر اساس نوع مدرسه
  const context = isVocational ? useVocationalSchedule() : useHighSchoolSchedule();
  
  // استفاده از توابع و داده‌های کانتکست
  const {
    grades,
    classOptions,
    fields,
    teachingGroups,
    personnelList,
    createSchedule,
    saveClassSchedule,
    loadClassSchedule,
    removeFromClassSchedule,
    hasClassConflict,
    hasPersonnelConflict,
    personnelSchedules
  } = context;
  
  // استیت‌های صفحه
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
  const [searchResults, setSearchResults] = useState<{personnelCode: string, fullName: string}[]>([]);
  const [showPersonnelSearch, setShowPersonnelSearch] = useState(false);
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [mainPosition, setMainPosition] = useState('');
  const [hourType, setHourType] = useState('');
  const [teachingGroup, setTeachingGroup] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [draggedItem, setDraggedItem] = useState<Schedule | null>(null);
  const dragStartRef = useRef<{ day: string; time: string } | null>(null);
  const [classStats, setClassStats] = useState<ClassStatistics | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCombinedPreview, setShowCombinedPreview] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  // اضافه کردن استیت برای نگهداری برنامه‌های پرسنلی مرتبط با هر سلول
  const [cellPersonnelSchedules, setCellPersonnelSchedules] = useState<{[key: string]: ScheduleWithFullName[]}>({});
  
  // بارگذاری برنامه کلاسی
  useEffect(() => {
    if (grade && classNumber && field) {
      const loadedSchedule = loadClassSchedule(grade, classNumber, field);
      setSchedule(loadedSchedule);
      
      // به‌روزرسانی URL
      const params = new URLSearchParams();
      params.set('grade', grade);
      params.set('class', classNumber);
      params.set('field', field);
      router.push(`/education-levels/${isVocational ? 'vocational' : 'highschool'}/class-schedule?${params.toString()}`);
      
      // بستن مدال انتخاب کلاس
      setShowClassModal(false);
      
      // محاسبه آمار کلاس
      calculateClassStatistics(loadedSchedule);
      
      // بررسی برنامه‌های پرسنلی مرتبط با هر سلول
      findRelatedPersonnelSchedules();
    }
  }, [grade, classNumber, field]);
  
  // محاسبه آمار کلاس
  const calculateClassStatistics = (scheduleData: Schedule[]) => {
    const totalHours = DAYS.length * (TIME_SLOTS.filter(slot => !slot.label.includes('تفریح') && !slot.label.includes('نماز')).length);
    const filledHours = scheduleData.length;
    const emptyHours = totalHours - filledHours;
    
    // شمارش تعداد پرسنل منحصر به فرد
    const uniquePersonnel = new Set(scheduleData.map(s => s.personnelCode).filter(Boolean));
    
    setClassStats({
      totalHours,
      filledHours,
      emptyHours,
      personnelCount: uniquePersonnel.size
    });
  };
  
  // یافتن برنامه‌های پرسنلی مرتبط با هر سلول
  const findRelatedPersonnelSchedules = () => {
    const cellSchedules: {[key: string]: ScheduleWithFullName[]} = {};
    
    personnelSchedules.forEach(ps => {
      ps.schedules.forEach(s => {
        if (s.day && s.timeStart) {
          const key = `${s.day}-${s.timeStart}`;
          if (!cellSchedules[key]) {
            cellSchedules[key] = [];
          }
          
          // فقط برنامه‌های غیر از این کلاس را اضافه کن
          if (s.grade !== grade || s.classNumber !== classNumber || s.field !== field) {
            cellSchedules[key].push({
              ...s,
              fullName: ps.fullName
            });
          }
        }
      });
    });
    
    setCellPersonnelSchedules(cellSchedules);
  };
  
  // باز کردن مدال انتخاب کلاس
  const openClassSelectionModal = () => {
    setShowClassModal(true);
  };
  
  // انتخاب کلاس
  const handleClassSelection = () => {
    if (grade && classNumber && field) {
      // به‌روزرسانی URL
      const params = new URLSearchParams();
      params.set('grade', grade);
      params.set('class', classNumber);
      params.set('field', field);
      router.push(`/education-levels/${isVocational ? 'vocational' : 'highschool'}/class-schedule?${params.toString()}`);
      
      // بستن مدال
      setShowClassModal(false);
      
      // بارگذاری برنامه
      const loadedSchedule = loadClassSchedule(grade, classNumber, field);
      setSchedule(loadedSchedule);
      
      // محاسبه آمار کلاس
      calculateClassStatistics(loadedSchedule);
      
      // بررسی برنامه‌های پرسنلی مرتبط با هر سلول
      findRelatedPersonnelSchedules();
    }
  };
  
  // باز کردن مدال افزودن برنامه
  const openAddScheduleModal = (day: string, time: string) => {
    // بررسی اینکه آیا این سلول قبلاً برنامه‌ای دارد یا خیر
    const existingSchedule = schedule.find(s => s.day === day && s.timeStart === time);
    
    if (existingSchedule) {
      // اگر برنامه وجود دارد، آن را انتخاب کن
      setSelectedCell({ day, time });
      setPersonnelCode(existingSchedule.personnelCode || '');
      setPersonnelName('');
      setEmploymentStatus(existingSchedule.employmentStatus || '');
      setMainPosition(existingSchedule.mainPosition || '');
      setHourType(existingSchedule.hourType || '');
      setTeachingGroup(existingSchedule.teachingGroup || '');
      setDescription(existingSchedule.description || '');
    } else {
      // اگر برنامه وجود ندارد، فرم را خالی کن
      setSelectedCell({ day, time });
      setPersonnelCode('');
      setPersonnelName('');
      setEmploymentStatus('');
      setMainPosition('');
      setHourType('');
      setTeachingGroup('');
      setDescription('');
    }
    
    setModalOpen(true);
  };
  
  // جستجوی پرسنل
  const handlePersonnelSearch = () => {
    if (personnelSearchQuery.length > 0) {
      // جستجو در لیست پرسنل
      const results = personnelList.filter(p => 
        p.fullName.includes(personnelSearchQuery) || 
        p.personnelCode.includes(personnelSearchQuery)
      );
      
      setSearchResults(results.map(p => ({
        personnelCode: p.personnelCode,
        fullName: p.fullName
      })));
    } else {
      setSearchResults([]);
    }
  };
  
  // انتخاب پرسنل از نتایج جستجو
  const selectPersonnel = (personnelCode: string, fullName: string) => {
    setPersonnelCode(personnelCode);
    setPersonnelName(fullName);
    setShowPersonnelSearch(false);
    setPersonnelSearchQuery('');
    setSearchResults([]);
    
    // یافتن اطلاعات بیشتر پرسنل
    const personnel = personnelList.find(p => p.personnelCode === personnelCode);
    if (personnel) {
      setMainPosition(personnel.mainPosition);
      setEmploymentStatus(personnel.employmentStatus);
    }
  };
  
  // ذخیره برنامه
  const handleSaveSchedule = () => {
    if (!selectedCell) return;
    
    // یافتن برنامه قبلی (اگر وجود دارد)
    const existingScheduleIndex = schedule.findIndex(s => 
      s.day === selectedCell.day && s.timeStart === selectedCell.time
    );
    
    // یافتن زمان پایان از روی زمان شروع
    const timeSlot = TIME_SLOTS.find(slot => slot.start === selectedCell.time);
    const timeEnd = timeSlot ? timeSlot.end : '';
    
    // ایجاد برنامه جدید یا به‌روزرسانی برنامه قبلی
    const newSchedule = createSchedule({
      personnelCode,
      employmentStatus,
      mainPosition,
      grade,
      classNumber,
      field,
      day: selectedCell.day,
      timeStart: selectedCell.time,
      timeEnd,
      hourType,
      teachingGroup,
      description,
      classScheduleId: `${grade}-${classNumber}-${field}`
    });
    
    // به‌روزرسانی لیست برنامه‌ها
    let updatedSchedule: Schedule[];
    
    if (existingScheduleIndex >= 0) {
      // به‌روزرسانی برنامه موجود
      updatedSchedule = [...schedule];
      updatedSchedule[existingScheduleIndex] = newSchedule;
    } else {
      // افزودن برنامه جدید
      updatedSchedule = [...schedule, newSchedule];
    }
    
    // ذخیره برنامه
    saveClassSchedule(grade, classNumber, field, updatedSchedule);
    
    // به‌روزرسانی استیت برنامه
    setSchedule(updatedSchedule);
    
    // محاسبه مجدد آمار کلاس
    calculateClassStatistics(updatedSchedule);
    
    // بستن مدال
    setModalOpen(false);
    setSelectedCell(null);
    
    // بررسی مجدد برنامه‌های پرسنلی مرتبط با هر سلول
    findRelatedPersonnelSchedules();
  };
  
  // حذف برنامه
  const handleDeleteSchedule = () => {
    if (!selectedCell) return;
    
    // یافتن برنامه
    const scheduleToDelete = schedule.find(s => 
      s.day === selectedCell.day && s.timeStart === selectedCell.time
    );
    
    if (scheduleToDelete) {
      // حذف برنامه
      removeFromClassSchedule(grade, classNumber, field, scheduleToDelete.id);
      
      // به‌روزرسانی لیست برنامه‌ها
      const updatedSchedule = schedule.filter(s => s.id !== scheduleToDelete.id);
      setSchedule(updatedSchedule);
      
      // محاسبه مجدد آمار کلاس
      calculateClassStatistics(updatedSchedule);
      
      // بستن مدال
      setModalOpen(false);
      setSelectedCell(null);
      
      // بررسی مجدد برنامه‌های پرسنلی مرتبط با هر سلول
      findRelatedPersonnelSchedules();
    }
  };
  
  // رندر سلول برنامه
  const renderScheduleCell = (day: string, time: string) => {
    // بررسی اینکه آیا این سلول برنامه‌ای دارد یا خیر
    const cellSchedule = schedule.find(s => s.day === day && s.timeStart === time);
    
    // بررسی برنامه‌های پرسنلی مرتبط با این سلول
    const relatedSchedules = cellPersonnelSchedules[`${day}-${time}`] || [];
    const hasConflict = relatedSchedules.length > 0;
    
    if (cellSchedule) {
      // اگر برنامه وجود دارد، آن را نمایش بده
      return (
        <div
          className={`schedule-cell filled ${hasConflict ? 'has-conflict' : ''}`}
          onClick={() => openAddScheduleModal(day, time)}
        >
          <div className="schedule-cell-content">
            <div className="schedule-cell-title">{cellSchedule.description}</div>
            <div className="schedule-cell-personnel">{cellSchedule.personnelCode}</div>
            <div className="schedule-cell-hour-type">{cellSchedule.hourType}</div>
          </div>
          {hasConflict && (
            <div className="conflict-indicator" title="تداخل با برنامه پرسنلی">!</div>
          )}
        </div>
      );
    } else {
      // اگر برنامه وجود ندارد، سلول خالی نمایش بده
      return (
        <div
          className={`schedule-cell empty ${hasConflict ? 'has-conflict' : ''}`}
          onClick={() => openAddScheduleModal(day, time)}
        >
          {hasConflict && (
            <div className="conflict-indicator" title="تداخل با برنامه پرسنلی">!</div>
          )}
        </div>
      );
    }
  };
  
  return (
    <div className={`class-schedule-page min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`schedule-header p-4 md:p-6 rounded-lg shadow-md mb-6 mx-4 ${
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          برنامه کلاسی {isVocational ? 'هنرستان فنی و حرفه‌ای' : 'هنرستان'}
        </h1>
        
        <div className="class-selection-section">
          <button 
            onClick={openClassSelectionModal}
            className={`px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            انتخاب کلاس
          </button>
          
          {grade && classNumber && field && (
            <div className={`selected-class-info mt-4 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 ${
              theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-900'
            }`}>
              <div className="info-item">
                <span className={`info-label font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  پایه:
                </span>
                <span className="info-value block mt-1">{grade}</span>
              </div>
              <div className="info-item">
                <span className={`info-label font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  کلاس:
                </span>
                <span className="info-value block mt-1">{classNumber}</span>
              </div>
              <div className="info-item">
                <span className={`info-label font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  رشته:
                </span>
                <span className="info-value block mt-1">{field}</span>
              </div>
            </div>
          )}
        </div>
        
        {classStats && (
          <div className={`class-stats mt-4 p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-900'
          }`}>
            <h3 className="text-lg font-bold mb-2">آمار کلاس</h3>
            <div className="stats-grid grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="stat-item">
                <span className={`stat-label font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  کل ساعات:
                </span>
                <span className="stat-value block mt-1">{classStats.totalHours}</span>
              </div>
              <div className="stat-item">
                <span className={`stat-label font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  ساعات پر شده:
                </span>
                <span className="stat-value block mt-1">{classStats.filledHours}</span>
              </div>
              <div className="stat-item">
                <span className={`stat-label font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  ساعات خالی:
                </span>
                <span className="stat-value block mt-1">{classStats.emptyHours}</span>
              </div>
              <div className="stat-item">
                <span className={`stat-label font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  تعداد پرسنل:
                </span>
                <span className="stat-value block mt-1">{classStats.personnelCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {grade && classNumber && field && (
        <div className={`schedule-table-container mx-4 rounded-lg shadow-md overflow-x-auto ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <table className={`schedule-table w-full ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <thead>
              <tr>
                <th className={`time-header p-3 font-bold text-center border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>ساعت / روز</th>
                {DAYS.map(day => (
                  <th key={day} className={`day-header p-3 font-bold text-center border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(slot => (
                <tr key={slot.start} className={slot.label.includes('تفریح') || slot.label.includes('نماز') ? 'break-row' : ''}>
                  <td className={`time-cell p-2 border ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div className="time-label font-medium">{slot.label}</div>
                    <div className={`time-range text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{slot.start} - {slot.end}</div>
                  </td>
                  {DAYS.map(day => (
                    <td key={`${day}-${slot.start}`} className={`schedule-cell-container p-0 border ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      {slot.label.includes('تفریح') || slot.label.includes('نماز') ? (
                        <div className={`break-cell p-2 text-center ${
                          theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>{slot.label}</div>
                      ) : (
                        renderScheduleCell(day, slot.start)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* مدال انتخاب کلاس */}
      {showClassModal && (
        <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`modal-content w-full max-w-lg rounded-xl shadow-xl ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">انتخاب کلاس</h2>
              
              <div className="space-y-4">
                <div className="form-group">
                  <label className="block mb-1">پایه:</label>
                  <select 
                    value={grade} 
                    onChange={e => setGrade(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-white text-gray-900 border-gray-300'
                    }`}
                  >
                    <option value="">انتخاب کنید</option>
                    {grades.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block mb-1">کلاس:</label>
                  <select 
                    value={classNumber} 
                    onChange={e => setClassNumber(e.target.value)}
                    disabled={!grade}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-white text-gray-900 border-gray-300'
                    } disabled:opacity-50`}
                  >
                    <option value="">انتخاب کنید</option>
                    {grade && classOptions[grade]?.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block mb-1">رشته:</label>
                  <select 
                    value={field} 
                    onChange={e => setField(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-white text-gray-900 border-gray-300'
                    }`}
                  >
                    <option value="">انتخاب کنید</option>
                    {fields.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="modal-actions flex justify-end gap-2 mt-6">
                <button 
                  onClick={handleClassSelection}
                  disabled={!grade || !classNumber || !field}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600'
                      : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300'
                  } text-white disabled:cursor-not-allowed`}
                >
                  تأیید
                </button>
                <button 
                  onClick={() => setShowClassModal(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-gray-300 hover:bg-gray-400'
                  } text-white`}
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* مدال افزودن برنامه */}
      {modalOpen && selectedCell && (
        <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`modal-content w-full max-w-lg rounded-xl shadow-xl ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">افزودن برنامه</h2>
              <div className={`modal-info mb-4 p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <span className="ml-4">روز: {selectedCell.day}</span>
                <span>ساعت: {selectedCell.time}</span>
              </div>
              
              <div className="space-y-4">
                <div className="form-group">
                  <label className="block mb-1">کد پرسنلی:</label>
                  <div className="search-input-container flex gap-2">
                    <input
                      type="text"
                      value={personnelCode}
                      onChange={e => setPersonnelCode(e.target.value)}
                      placeholder="کد پرسنلی را وارد کنید"
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                          : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                      }`}
                    />
                    <button 
                      onClick={() => setShowPersonnelSearch(true)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white`}
                    >
                      جستجو
                    </button>
                  </div>
                </div>
                
                {showPersonnelSearch && (
                  <div className={`personnel-search p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="search-input-container flex gap-2 mb-4">
                      <input
                        type="text"
                        value={personnelSearchQuery}
                        onChange={e => setPersonnelSearchQuery(e.target.value)}
                        placeholder="نام یا کد پرسنلی را وارد کنید"
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 text-white border-gray-500 placeholder-gray-400'
                            : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                        }`}
                      />
                      <button 
                        onClick={handlePersonnelSearch}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                      >
                        جستجو
                      </button>
                    </div>
                    
                    <div className="search-results space-y-2">
                      {searchResults.map(result => (
                        <div
                          key={result.personnelCode}
                          className={`search-result-item p-2 rounded-lg cursor-pointer transition-colors ${
                            theme === 'dark'
                              ? 'hover:bg-gray-600'
                              : 'hover:bg-gray-200'
                          }`}
                          onClick={() => selectPersonnel(result.personnelCode, result.fullName)}
                        >
                          <span className="block font-medium">{result.fullName}</span>
                          <span className={`block text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>{result.personnelCode}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="block mb-1">نوع ساعت:</label>
                  <select 
                    value={hourType} 
                    onChange={e => setHourType(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-white text-gray-900 border-gray-300'
                    }`}
                  >
                    <option value="">انتخاب کنید</option>
                    {HOUR_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block mb-1">گروه تدریس:</label>
                  <select 
                    value={teachingGroup} 
                    onChange={e => setTeachingGroup(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-white text-gray-900 border-gray-300'
                    }`}
                  >
                    <option value="">انتخاب کنید</option>
                    {teachingGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block mb-1">توضیحات:</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="توضیحات را وارد کنید"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                        : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
              
              <div className="modal-actions flex justify-end gap-2 mt-6">
                <button 
                  onClick={handleSaveSchedule}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  ذخیره
                </button>
                <button 
                  onClick={handleDeleteSchedule}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white`}
                >
                  حذف
                </button>
                <button 
                  onClick={() => setModalOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-gray-300 hover:bg-gray-400'
                  } text-white`}
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HighSchoolClassSchedulePage; 