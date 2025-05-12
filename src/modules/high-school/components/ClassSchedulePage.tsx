"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHighSchoolSchedule } from './HighSchoolScheduleProvider';
import { useVocationalSchedule } from './VocationalScheduleProvider';
import { Schedule, ScheduleWithFullName, ClassStatistics } from '../../common/types/scheduleTypes';
import { DAYS, TIME_SLOTS, HOUR_TYPES, MAIN_POSITIONS, EMPLOYMENT_STATUSES } from '../../common/constants/scheduleConstants';

// کامپوننت صفحه برنامه‌ریزی کلاسی هنرستان
const HighSchoolClassSchedulePage: React.FC<{isVocational?: boolean}> = ({ isVocational = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gradeParam = searchParams.get('grade') || '';
  const classParam = searchParams.get('class') || '';
  const fieldParam = searchParams.get('field') || '';
  
  // استفاده از کانتکست مناسب بر اساس نوع مدرسه
  const highSchoolContext = useHighSchoolSchedule();
  const vocationalContext = isVocational ? useVocationalSchedule() : null;
  
  // انتخاب کانتکست مناسب
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
  } = isVocational ? vocationalContext! : highSchoolContext;
  
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
    <div className="class-schedule-page">
      <div className="schedule-header">
        <h1>برنامه کلاسی {isVocational ? 'هنرستان فنی و حرفه‌ای' : 'هنرستان'}</h1>
        <div className="class-info">
          <span>پایه: {grade}</span>
          <span>کلاس: {classNumber}</span>
          <span>رشته: {field}</span>
          <button onClick={openClassSelectionModal} className="change-class-btn">
            تغییر کلاس
          </button>
        </div>
        
        {classStats && (
          <div className="class-stats">
            <div className="stat-item">
              <span className="stat-label">کل ساعات:</span>
              <span className="stat-value">{classStats.totalHours}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">ساعات پر شده:</span>
              <span className="stat-value">{classStats.filledHours}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">ساعات خالی:</span>
              <span className="stat-value">{classStats.emptyHours}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">تعداد پرسنل:</span>
              <span className="stat-value">{classStats.personnelCount}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="schedule-table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="time-header">ساعت / روز</th>
              {DAYS.map(day => (
                <th key={day} className="day-header">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(slot => (
              <tr key={slot.start} className={slot.label.includes('تفریح') || slot.label.includes('نماز') ? 'break-row' : ''}>
                <td className="time-cell">
                  <div className="time-label">{slot.label}</div>
                  <div className="time-range">{slot.start} - {slot.end}</div>
                </td>
                {DAYS.map(day => (
                  <td key={`${day}-${slot.start}`} className="schedule-cell-container">
                    {slot.label.includes('تفریح') || slot.label.includes('نماز') ? (
                      <div className="break-cell">{slot.label}</div>
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
      
      {/* مدال انتخاب کلاس */}
      {showClassModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>انتخاب کلاس</h2>
            <div className="form-group">
              <label>پایه:</label>
              <select value={grade} onChange={e => setGrade(e.target.value)}>
                <option value="">انتخاب کنید</option>
                {grades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>کلاس:</label>
              <select 
                value={classNumber} 
                onChange={e => setClassNumber(e.target.value)}
                disabled={!grade}
              >
                <option value="">انتخاب کنید</option>
                {grade && classOptions[grade]?.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>رشته:</label>
              <select value={field} onChange={e => setField(e.target.value)}>
                <option value="">انتخاب کنید</option>
                {fields.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={handleClassSelection}
                disabled={!grade || !classNumber || !field}
              >
                تأیید
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* مدال افزودن برنامه */}
      {modalOpen && selectedCell && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>افزودن برنامه</h2>
            <div className="modal-info">
              <span>روز: {selectedCell.day}</span>
              <span>ساعت: {selectedCell.time}</span>
            </div>
            
            <div className="form-group">
              <label>کد پرسنلی:</label>
              <div className="search-input-container">
                <input
                  type="text"
                  value={personnelCode}
                  onChange={e => setPersonnelCode(e.target.value)}
                  placeholder="کد پرسنلی را وارد کنید"
                />
                <button onClick={() => setShowPersonnelSearch(true)}>جستجو</button>
              </div>
            </div>
            
            {showPersonnelSearch && (
              <div className="personnel-search">
                <div className="search-input-container">
                  <input
                    type="text"
                    value={personnelSearchQuery}
                    onChange={e => setPersonnelSearchQuery(e.target.value)}
                    placeholder="نام یا کد پرسنلی را وارد کنید"
                  />
                  <button onClick={handlePersonnelSearch}>جستجو</button>
                </div>
                
                <div className="search-results">
                  {searchResults.map(result => (
                    <div
                      key={result.personnelCode}
                      className="search-result-item"
                      onClick={() => selectPersonnel(result.personnelCode, result.fullName)}
                    >
                      <span>{result.fullName}</span>
                      <span>{result.personnelCode}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label>نام و نام خانوادگی:</label>
              <input
                type="text"
                value={personnelName}
                onChange={e => setPersonnelName(e.target.value)}
                placeholder="نام و نام خانوادگی پرسنل را وارد کنید"
              />
            </div>
            
            <div className="form-group">
              <label>وضعیت اشتغال:</label>
              <select value={employmentStatus} onChange={e => setEmploymentStatus(e.target.value)}>
                <option value="">انتخاب کنید</option>
                {EMPLOYMENT_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>پست اصلی:</label>
              <select value={mainPosition} onChange={e => setMainPosition(e.target.value)}>
                <option value="">انتخاب کنید</option>
                {MAIN_POSITIONS.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>نوع ساعت:</label>
              <select value={hourType} onChange={e => setHourType(e.target.value)}>
                <option value="">انتخاب کنید</option>
                {HOUR_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>گروه تدریس:</label>
              <select value={teachingGroup} onChange={e => setTeachingGroup(e.target.value)}>
                <option value="">انتخاب کنید</option>
                {teachingGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>توضیحات:</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="توضیحات را وارد کنید"
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={handleSaveSchedule}>ذخیره</button>
              <button onClick={handleDeleteSchedule} className="delete-btn">حذف</button>
              <button onClick={() => setModalOpen(false)}>انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HighSchoolClassSchedulePage; 