'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Dropdown from '../../../components/Dropdown/dropdown';
import Modal from '../../../components/Modal/modal';
import SubmitButton from '../../../components/SubmitButton/submitbutton';
import Input from '../../../components/Input/input';
import { FaPlus, FaTimes } from "react-icons/fa";
import styles from '../class-schedule.module.css';

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
}

const toPersianNumber = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => persianNumbers[+w]);
};

const SchedulePage = () => {
  const [showClassModal, setShowClassModal] = useState(true);
  const [grade, setGrade] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [field, setField] = useState('');
  const [selectedCell, setSelectedCell] = useState<{day: string, time: string} | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [timeSelectionModalOpen, setTimeSelectionModalOpen] = useState(false);
  const [personnelCode, setPersonnelCode] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [mainPosition, setMainPosition] = useState('');
  const [hourType, setHourType] = useState('');
  const [teachingGroup, setTeachingGroup] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [draggedItem, setDraggedItem] = useState<Schedule | null>(null);
  const dragStartRef = useRef<{day: string, time: string} | null>(null);
  
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

  const handleClassSubmit = () => {
    if (grade && classNumber && field) {
      setShowClassModal(false);
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
    setSchedule(schedule.filter(item => item.id !== id));
  };

  const groupScheduleItems = () => {
    // ایجاد یک آرایه جدید برای نگهداری آیتم‌های گروه‌بندی شده
    const groupedItems: Schedule[] = [];
    const tempItems = [...schedule];

    // مرتب‌سازی آیتم‌ها بر اساس روز و ساعت شروع
    tempItems.sort((a, b) => {
      if (a.day !== b.day) {
        return days.indexOf(a.day) - days.indexOf(b.day);
      }
      return hours.indexOf(a.timeStart) - hours.indexOf(b.timeStart);
    });

    // گروه‌بندی آیتم‌های پشت سر هم
    let currentGroup: Schedule | null = null;

    tempItems.forEach((item) => {
      if (!currentGroup) {
        currentGroup = { ...item };
        groupedItems.push(currentGroup);
        return;
      }

      // بررسی اگر آیتم فعلی ادامه گروه قبلی است
      const isSameDay = currentGroup.day === item.day;
      const isSamePersonnel = currentGroup.personnelCode === item.personnelCode;
      const isSameTeachingGroup = currentGroup.teachingGroup === item.teachingGroup;
      const isConsecutiveHour = hours.indexOf(item.timeStart) === hours.indexOf(currentGroup.timeEnd);

      if (isSameDay && isSamePersonnel && isSameTeachingGroup && isConsecutiveHour) {
        // آیتم فعلی ادامه آیتم قبلی است، پس آن را به گروه اضافه می‌کنیم
        currentGroup.timeEnd = item.timeEnd;
      } else {
        // آیتم جدید است، یک گروه جدید شروع می‌کنیم
        currentGroup = { ...item };
        groupedItems.push(currentGroup);
      }
    });

    return groupedItems;
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
                        const cellSchedule = getScheduleForCell(day, hour);
                        return (
                          <td 
                            key={`${day}-${hour}`} 
                            className="border border-gray-300 p-1 h-24 align-top schedule-cell min-w-[120px]"
                            onClick={() => handleTimeSelection(day, hour)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day, hour)}
                          >
                            {cellSchedule.length > 0 ? (
                              <div 
                                className="w-full h-full p-1 text-black bg-blue-100 rounded text-right schedule-cell-content"
                                draggable
                                onDragStart={(e) => handleDragStart(e, cellSchedule[0], day, hour)}
                              >
                                <button
                                  className="schedule-cell-delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSchedule(cellSchedule[0].id);
                                  }}
                                  title="حذف"
                                >
                                  <FaTimes size={12} />
                                </button>
                                <div className="font-bold text-black">{cellSchedule[0].mainPosition}</div>
                                <div className="text-xs text-black">کد پرسنلی: {cellSchedule[0].personnelCode}</div>
                                <div className="text-xs text-black">نوع ساعت: {cellSchedule[0].hourType}</div>
                                <div className="text-xs text-black">گروه تدریس: {cellSchedule[0].teachingGroup}</div>
                                {cellSchedule[0].description && (
                                  <div className="text-xs text-black mt-1">توضیحات: {cellSchedule[0].description}</div>
                                )}
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded">
                                <FaPlus className="text-black" />
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

          {/* فرم و لیست */}
          <div className="w-full mt-4">
            <div className="border border-gray-300 rounded p-4">
              <h2 className="text-xl font-bold mb-4 text-right text-lime-600">مدیریت برنامه</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2 text-right text-cyan-600">برنامه‌های اخیر</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
                  {groupScheduleItems().map(item => (
                    <div key={item.id} className="p-2 bg-cyan-100 rounded-lg text-right text-black relative">
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
                      <div className="font-bold text-black">کد پرسنلی: {item.personnelCode}</div>
                      <div className="text-sm text-black">
                        {item.day} - {item.timeStart}
                        {item.timeStart !== item.timeEnd && hours.indexOf(item.timeEnd) > hours.indexOf(item.timeStart) && 
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
                    
                <Input
                  label="کد پرسنلی"
                  value={personnelCode}
                  onChange={(e) => setPersonnelCode(e.target.value)}
                  placeholder="کد پرسنلی را وارد کنید"
                  className="w-full text-black"
                  type="number"
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