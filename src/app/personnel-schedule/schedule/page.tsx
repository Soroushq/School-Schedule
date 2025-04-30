'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaPlus, FaTimes, FaSearch } from "react-icons/fa";
import styles from '../personnel-schedule.module.css';
import { findPersonnelByCode, Personnel } from '../../../data/personnel';

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
}

const toPersianNumber = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => persianNumbers[+w]);
};

const PersonnelSchedulePage = () => {
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
    // اگر پارامترهای URL وجود داشته باشند، از آنها استفاده کنیم
    if (personnelCodeParam && fullNameParam && mainPositionParam) {
      setSelectedPersonnel({
        id: Date.now().toString(),
        personnelCode: personnelCodeParam,
        fullName: fullNameParam,
        mainPosition: mainPositionParam,
        employmentStatus: 'شاغل' // مقدار پیش‌فرض
      });
      setShowPersonnelModal(false);
    }
  }, [personnelCodeParam, fullNameParam, mainPositionParam]);

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
    if (selectedCell && grade && classNumber && field && mainPosition && hourType && teachingGroup) {
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
        timeEnd
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
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDay: string, targetTime: string) => {
    e.preventDefault();
    
    if (draggedItem && dragStartRef.current) {
      const updatedSchedule = schedule.map(item => {
        if (item.id === draggedItem.id) {
          return {
            ...item,
            day: targetDay,
            timeStart: targetTime
          };
        }
        return item;
      });
      
      setSchedule(updatedSchedule);
      setDraggedItem(null);
      dragStartRef.current = null;
    }
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedule(schedule.filter(item => item.id !== id));
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
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowPersonnelModal(true)}
            className={styles.actionButton}
          >
            تغییر پرسنل
          </button>
          <button 
            onClick={handleAddNewSchedule}
            className={styles.actionButton}
            disabled={!selectedPersonnel}
          >
            <FaPlus className="ml-1" />
            افزودن برنامه جدید
          </button>
        </div>
      </header>

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
                      {timeSlots.map(time => (
                        <td 
                          key={`${day}-${time}`}
                          className={styles.scheduleCell}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day, time)}
                        >
                          {getScheduleForCell(day, time).map(item => (
                            <div 
                              key={item.id}
                              className={styles.scheduleItem}
                              draggable
                              onDragStart={(e) => handleDragStart(e, item, day, time)}
                            >
                              <p className="font-bold text-gray-900">{item.grade} {item.classNumber}</p>
                              <p className="text-gray-800">{item.field}</p>
                              <p className="text-gray-800">{item.mainPosition}</p>
                              <p className="text-gray-800">{item.hourType}</p>
                              <button 
                                onClick={() => handleDeleteSchedule(item.id)}
                                className={styles.deleteButton}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                          {getScheduleForCell(day, time).length === 0 && (
                            <div 
                              className="w-full h-full min-h-[6rem] flex items-center justify-center cursor-pointer hover:bg-gray-50"
                              onClick={() => handleTimeSelection(day, time)}
                            >
                              <span className="text-gray-500">+</span>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
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
                        setSearchError(''); // پاک کردن خطا هنگام تغییر ورودی
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
    </div>
  );
};

export default PersonnelSchedulePage; 