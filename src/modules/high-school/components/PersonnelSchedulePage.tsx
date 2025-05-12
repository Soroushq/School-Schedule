"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHighSchoolSchedule } from './HighSchoolScheduleProvider';
import { useVocationalSchedule } from './VocationalScheduleProvider';
import { Schedule, Personnel, ScheduleConflict } from '../../common/types/scheduleTypes';
import { DAYS, TIME_SLOTS, HOUR_TYPES, MAIN_POSITIONS, EMPLOYMENT_STATUSES } from '../../common/constants/scheduleConstants';

// کامپوننت صفحه برنامه‌ریزی پرسنلی هنرستان
const HighSchoolPersonnelSchedulePage: React.FC<{isVocational?: boolean}> = ({ isVocational = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personnelCodeParam = searchParams?.get('code') || '';
  const fullNameParam = searchParams?.get('name') || '';
  const mainPositionParam = searchParams?.get('position') || '';
  
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
    savePersonnelSchedule,
    loadPersonnelSchedule,
    removeFromPersonnelSchedule,
    addPersonnel,
    findPersonnelByCode,
    searchPersonnelByName,
    hasClassConflict,
    hasPersonnelConflict
  } = isVocational ? vocationalContext! : highSchoolContext;
  
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
    <div className="personnel-schedule-page">
      <div className="schedule-header">
        <h1>برنامه پرسنلی {isVocational ? 'هنرستان فنی و حرفه‌ای' : 'هنرستان'}</h1>
        
        <div className="personnel-search-section">
          <div className="search-input-container">
            <input
              type="text"
              value={personnelCode}
              onChange={e => setPersonnelCode(e.target.value)}
              placeholder="کد پرسنلی را وارد کنید"
            />
            <button onClick={handlePersonnelSearch}>جستجو</button>
            <button onClick={() => setShowAddPersonnelModal(true)}>افزودن پرسنل جدید</button>
          </div>
          
          {searchError && <div className="search-error">{searchError}</div>}
        </div>
        
        {selectedPersonnel && (
          <div className="personnel-info">
            <div className="info-item">
              <span className="info-label">نام و نام خانوادگی:</span>
              <span className="info-value">{selectedPersonnel.fullName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">کد پرسنلی:</span>
              <span className="info-value">{selectedPersonnel.personnelCode}</span>
            </div>
            <div className="info-item">
              <span className="info-label">پست اصلی:</span>
              <span className="info-value">{selectedPersonnel.mainPosition}</span>
            </div>
            <div className="info-item">
              <span className="info-label">وضعیت اشتغال:</span>
              <span className="info-value">{selectedPersonnel.employmentStatus}</span>
            </div>
          </div>
        )}
        
        {showConflictWarning && (
          <div className="conflict-warning">
            <h3>هشدار: تداخل در برنامه</h3>
            <p>در برنامه این پرسنل تداخل وجود دارد. لطفاً برنامه را بررسی کنید.</p>
          </div>
        )}
      </div>
      
      {selectedPersonnel && (
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
      )}
      
      {/* مدال افزودن پرسنل جدید */}
      {showAddPersonnelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>افزودن پرسنل جدید</h2>
            
            <div className="form-group">
              <label>کد پرسنلی:</label>
              <input
                type="text"
                value={newPersonnel.personnelCode}
                onChange={e => setNewPersonnel({...newPersonnel, personnelCode: e.target.value})}
                placeholder="کد پرسنلی را وارد کنید"
              />
            </div>
            
            <div className="form-group">
              <label>نام و نام خانوادگی:</label>
              <input
                type="text"
                value={newPersonnel.fullName}
                onChange={e => setNewPersonnel({...newPersonnel, fullName: e.target.value})}
                placeholder="نام و نام خانوادگی را وارد کنید"
              />
            </div>
            
            <div className="form-group">
              <label>پست اصلی:</label>
              <select 
                value={newPersonnel.mainPosition}
                onChange={e => setNewPersonnel({...newPersonnel, mainPosition: e.target.value})}
              >
                <option value="">انتخاب کنید</option>
                {MAIN_POSITIONS.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>وضعیت اشتغال:</label>
              <select 
                value={newPersonnel.employmentStatus}
                onChange={e => setNewPersonnel({...newPersonnel, employmentStatus: e.target.value})}
              >
                <option value="">انتخاب کنید</option>
                {EMPLOYMENT_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={handleAddPersonnel}
                disabled={!newPersonnel.personnelCode || !newPersonnel.fullName || !newPersonnel.mainPosition}
              >
                افزودن
              </button>
              <button onClick={() => setShowAddPersonnelModal(false)}>انصراف</button>
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

export default HighSchoolPersonnelSchedulePage; 