"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHighSchoolSchedule } from './HighSchoolScheduleProvider';
import { useVocationalSchedule } from './VocationalScheduleProvider';
import { Schedule, Personnel, ScheduleConflict } from '../../common/types/scheduleTypes';
import { DAYS, TIME_SLOTS, HOUR_TYPES, MAIN_POSITIONS, EMPLOYMENT_STATUSES } from '../../common/constants/scheduleConstants';
import { useTheme } from '@/context/ThemeContext';

// کامپوننت صفحه برنامه‌ریزی پرسنلی هنرستان
const HighSchoolPersonnelSchedulePage: React.FC<{isVocational?: boolean}> = ({ isVocational = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personnelCodeParam = searchParams?.get('code') || '';
  const fullNameParam = searchParams?.get('name') || '';
  const mainPositionParam = searchParams?.get('position') || '';
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
    savePersonnelSchedule,
    loadPersonnelSchedule,
    removeFromPersonnelSchedule,
    addPersonnel,
    findPersonnelByCode,
    searchPersonnelByName,
    hasClassConflict,
    hasPersonnelConflict
  } = context;
  
  // استیت‌های صفحه
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
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  
  // بارگذاری برنامه پرسنلی
  useEffect(() => {
    if (personnelCodeParam) {
      loadPersonnelData(personnelCodeParam);
    }
  }, [personnelCodeParam]);
  
  // بارگذاری اطلاعات پرسنل
  const loadPersonnelData = (code: string) => {
    const personnel = findPersonnelByCode(code);
    
    if (personnel) {
      setSelectedPersonnel(personnel);
      setPersonnelCode(personnel.personnelCode);
      setMainPosition(personnel.mainPosition);
      
      // بارگذاری برنامه پرسنل
      const loadedSchedule = loadPersonnelSchedule(personnel.personnelCode);
      setSchedule(loadedSchedule);
      
      // بررسی تداخل‌ها
      checkConflicts(loadedSchedule);
      
      // به‌روزرسانی URL
      const params = new URLSearchParams();
      params.set('code', personnel.personnelCode);
      params.set('name', personnel.fullName);
      params.set('position', personnel.mainPosition);
      router.push(`/education-levels/${isVocational ? 'vocational' : 'highschool'}/personnel-schedule?${params.toString()}`);
    } else {
      setSearchError('پرسنل با این کد یافت نشد');
    }
  };
  
  // جستجوی پرسنل
  const handlePersonnelSearch = () => {
    if (personnelCode) {
      loadPersonnelData(personnelCode);
    }
  };
  
  // بررسی تداخل‌ها
  const checkConflicts = (scheduleData: Schedule[]) => {
    const conflictList: ScheduleConflict[] = [];
    
    scheduleData.forEach(s => {
      if (s.day && s.timeStart) {
        // بررسی وجود برنامه دیگر در همین زمان
        const sameTimeSchedules = scheduleData.filter(
          other => other.id !== s.id && other.day === s.day && other.timeStart === s.timeStart
        );
        
        if (sameTimeSchedules.length > 0) {
          conflictList.push({
            day: s.day,
            time: s.timeStart,
            grade: s.grade,
            classNumber: s.classNumber,
            field: s.field,
            personnelNames: sameTimeSchedules.map(sts => `${sts.grade} ${sts.classNumber} ${sts.field}`)
          });
        }
      }
    });
    
    setConflicts(conflictList);
    setShowConflictWarning(conflictList.length > 0);
  };
  
  // افزودن پرسنل جدید
  const handleAddPersonnel = () => {
    if (newPersonnel.personnelCode && newPersonnel.fullName && newPersonnel.mainPosition) {
      const addedPersonnel = addPersonnel(newPersonnel);
      
      // انتخاب پرسنل جدید
      setSelectedPersonnel(addedPersonnel);
      setPersonnelCode(addedPersonnel.personnelCode);
      setMainPosition(addedPersonnel.mainPosition);
      
      // بستن مدال
      setShowAddPersonnelModal(false);
      
      // ریست فرم
      setNewPersonnel({
        personnelCode: '',
        fullName: '',
        mainPosition: '',
        employmentStatus: 'شاغل'
      });
      
      // به‌روزرسانی URL
      const params = new URLSearchParams();
      params.set('code', addedPersonnel.personnelCode);
      params.set('name', addedPersonnel.fullName);
      params.set('position', addedPersonnel.mainPosition);
      router.push(`/education-levels/${isVocational ? 'vocational' : 'highschool'}/personnel-schedule?${params.toString()}`);
    }
  };
  
  // باز کردن مدال افزودن برنامه
  const openAddScheduleModal = (day: string, time: string) => {
    // بررسی اینکه آیا این سلول قبلاً برنامه‌ای دارد یا خیر
    const existingSchedule = schedule.find(s => s.day === day && s.timeStart === time);
    
    if (existingSchedule) {
      // اگر برنامه وجود دارد، آن را انتخاب کن
      setSelectedCell({ day, time });
      setGrade(existingSchedule.grade || '');
      setClassNumber(existingSchedule.classNumber || '');
      setField(existingSchedule.field || '');
      setHourType(existingSchedule.hourType || '');
      setTeachingGroup(existingSchedule.teachingGroup || '');
      setDescription(existingSchedule.description || '');
    } else {
      // اگر برنامه وجود ندارد، فرم را خالی کن
      setSelectedCell({ day, time });
      setGrade('');
      setClassNumber('');
      setField('');
      setHourType('');
      setTeachingGroup('');
      setDescription('');
    }
    
    setModalOpen(true);
  };
  
  // ذخیره برنامه
  const handleSaveSchedule = () => {
    if (!selectedCell || !selectedPersonnel) return;
    
    // یافتن برنامه قبلی (اگر وجود دارد)
    const existingScheduleIndex = schedule.findIndex(s => 
      s.day === selectedCell.day && s.timeStart === selectedCell.time
    );
    
    // یافتن زمان پایان از روی زمان شروع
    const timeSlot = TIME_SLOTS.find(slot => slot.start === selectedCell.time);
    const timeEnd = timeSlot ? timeSlot.end : '';
    
    // ایجاد برنامه جدید یا به‌روزرسانی برنامه قبلی
    const newSchedule = createSchedule({
      personnelId: selectedPersonnel.id,
      personnelCode: selectedPersonnel.personnelCode,
      employmentStatus: selectedPersonnel.employmentStatus,
      mainPosition: selectedPersonnel.mainPosition,
      grade,
      classNumber,
      field,
      day: selectedCell.day,
      timeStart: selectedCell.time,
      timeEnd,
      hourType,
      teachingGroup,
      description,
      classScheduleId: grade && classNumber && field ? `${grade}-${classNumber}-${field}` : ''
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
    savePersonnelSchedule(
      selectedPersonnel.personnelCode,
      selectedPersonnel.fullName,
      selectedPersonnel.mainPosition,
      selectedPersonnel.employmentStatus,
      updatedSchedule
    );
    
    // به‌روزرسانی استیت برنامه
    setSchedule(updatedSchedule);
    
    // بررسی تداخل‌ها
    checkConflicts(updatedSchedule);
    
    // بستن مدال
    setModalOpen(false);
    setSelectedCell(null);
  };
  
  // حذف برنامه
  const handleDeleteSchedule = () => {
    if (!selectedCell || !selectedPersonnel) return;
    
    // یافتن برنامه
    const scheduleToDelete = schedule.find(s => 
      s.day === selectedCell.day && s.timeStart === selectedCell.time
    );
    
    if (scheduleToDelete) {
      // حذف برنامه
      removeFromPersonnelSchedule(selectedPersonnel.personnelCode, scheduleToDelete.id);
      
      // به‌روزرسانی لیست برنامه‌ها
      const updatedSchedule = schedule.filter(s => s.id !== scheduleToDelete.id);
      setSchedule(updatedSchedule);
      
      // بررسی تداخل‌ها
      checkConflicts(updatedSchedule);
      
      // بستن مدال
      setModalOpen(false);
      setSelectedCell(null);
    }
  };
  
  // رندر سلول برنامه
  const renderScheduleCell = (day: string, time: string) => {
    // بررسی اینکه آیا این سلول برنامه‌ای دارد یا خیر
    const cellSchedule = schedule.find(s => s.day === day && s.timeStart === time);
    
    // بررسی وجود تداخل
    const hasConflict = conflicts.some(c => c.day === day && c.time === time);
    
    if (cellSchedule) {
      // اگر برنامه وجود دارد، آن را نمایش بده
      return (
        <div
          className={`schedule-cell filled ${hasConflict ? 'has-conflict' : ''}`}
          onClick={() => openAddScheduleModal(day, time)}
        >
          <div className="schedule-cell-content">
            <div className="schedule-cell-title">{cellSchedule.description}</div>
            <div className="schedule-cell-class">{cellSchedule.grade} {cellSchedule.classNumber} {cellSchedule.field}</div>
            <div className="schedule-cell-hour-type">{cellSchedule.hourType}</div>
          </div>
          {hasConflict && (
            <div className="conflict-indicator" title="تداخل با برنامه دیگر">!</div>
          )}
        </div>
      );
    } else {
      // اگر برنامه وجود ندارد، سلول خالی نمایش بده
      return (
        <div
          className="schedule-cell empty"
          onClick={() => openAddScheduleModal(day, time)}
        ></div>
      );
    }
  };
  
  return (
    <div className={`personnel-schedule-page min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`schedule-header p-4 md:p-6 rounded-lg shadow-md mb-6 mx-4 ${
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          برنامه پرسنلی {isVocational ? 'هنرستان فنی و حرفه‌ای' : 'هنرستان'}
        </h1>
        
        <div className="personnel-search-section mb-4">
          <div className="search-input-container flex gap-2">
            <input
              type="text"
              value={personnelCode}
              onChange={e => setPersonnelCode(e.target.value)}
              placeholder="کد پرسنلی را وارد کنید"
              className={`flex-1 px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400'
                  : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
              }`}
            />
            <button 
              onClick={handlePersonnelSearch}
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              جستجو
            </button>
            <button 
              onClick={() => setShowAddPersonnelModal(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              افزودن پرسنل جدید
            </button>
          </div>
          
          {searchError && <div className="search-error text-red-500 mt-2">{searchError}</div>}
        </div>
        
        {selectedPersonnel && (
          <div className={`personnel-info p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-900'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="info-item">
                <span className={`info-label font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  نام و نام خانوادگی:
                </span>
                <span className="info-value block mt-1">{selectedPersonnel.fullName}</span>
              </div>
              <div className="info-item">
                <span className={`info-label font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  کد پرسنلی:
                </span>
                <span className="info-value block mt-1">{selectedPersonnel.personnelCode}</span>
              </div>
              <div className="info-item">
                <span className={`info-label font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  پست اصلی:
                </span>
                <span className="info-value block mt-1">{selectedPersonnel.mainPosition}</span>
              </div>
              <div className="info-item">
                <span className={`info-label font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  وضعیت اشتغال:
                </span>
                <span className="info-value block mt-1">{selectedPersonnel.employmentStatus}</span>
              </div>
            </div>
          </div>
        )}
        
        {showConflictWarning && (
          <div className={`conflict-warning mt-4 p-4 rounded-lg ${
            theme === 'dark' ? 'bg-red-900/50 text-red-100' : 'bg-red-100 text-red-900'
          }`}>
            <h3 className="font-bold mb-2">هشدار: تداخل در برنامه</h3>
            <p>در برنامه این پرسنل تداخل وجود دارد. لطفاً برنامه را بررسی کنید.</p>
          </div>
        )}
      </div>
      
      {selectedPersonnel && (
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
      
      {/* مدال افزودن پرسنل جدید */}
      {showAddPersonnelModal && (
        <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`modal-content w-full max-w-lg rounded-xl shadow-xl ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">افزودن پرسنل جدید</h2>
              
              <div className="space-y-4">
                <div className="form-group">
                  <label className="block mb-1">کد پرسنلی:</label>
                  <input
                    type="text"
                    value={newPersonnel.personnelCode}
                    onChange={e => setNewPersonnel({...newPersonnel, personnelCode: e.target.value})}
                    placeholder="کد پرسنلی را وارد کنید"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                        : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div className="form-group">
                  <label className="block mb-1">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    value={newPersonnel.fullName}
                    onChange={e => setNewPersonnel({...newPersonnel, fullName: e.target.value})}
                    placeholder="نام و نام خانوادگی را وارد کنید"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                        : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div className="form-group">
                  <label className="block mb-1">پست اصلی:</label>
                  <select 
                    value={newPersonnel.mainPosition}
                    onChange={e => setNewPersonnel({...newPersonnel, mainPosition: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400'
                        : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                    }`}
                  >
                    <option value="" className={theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}>انتخاب کنید</option>
                    {MAIN_POSITIONS.map(position => (
                      <option 
                        key={position} 
                        value={position}
                        className={theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}
                      >
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block mb-1">وضعیت اشتغال:</label>
                  <select 
                    value={newPersonnel.employmentStatus}
                    onChange={e => setNewPersonnel({...newPersonnel, employmentStatus: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400'
                        : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                    }`}
                  >
                    <option value="" className={theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}>انتخاب کنید</option>
                    {EMPLOYMENT_STATUSES.map(status => (
                      <option 
                        key={status} 
                        value={status}
                        className={theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="modal-actions flex justify-end gap-2 mt-6">
                <button 
                  onClick={handleAddPersonnel}
                  disabled={!newPersonnel.personnelCode || !newPersonnel.fullName || !newPersonnel.mainPosition}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600'
                      : 'bg-green-500 hover:bg-green-600 disabled:bg-gray-300'
                  } text-white disabled:cursor-not-allowed`}
                >
                  افزودن
                </button>
                <button 
                  onClick={() => setShowAddPersonnelModal(false)}
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
                
                <div className="form-group">
                  <label className="block mb-1">نوع ساعت:</label>
                  <select 
                    value={hourType} 
                    onChange={e => setHourType(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400'
                        : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                    }`}
                  >
                    <option value="" className={theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}>انتخاب کنید</option>
                    {HOUR_TYPES.map(type => (
                      <option 
                        key={type} 
                        value={type}
                        className={theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}
                      >
                        {type}
                      </option>
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
                        ? 'bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400'
                        : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                    }`}
                  >
                    <option value="" className={theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}>انتخاب کنید</option>
                    {teachingGroups.map(group => (
                      <option 
                        key={group} 
                        value={group}
                        className={theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}
                      >
                        {group}
                      </option>
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
                        ? 'bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400'
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

export default HighSchoolPersonnelSchedulePage; 