'use client';

import React, { useState, useRef } from 'react';
import Dropdown from '../components/Dropdown/dropdown';
import Modal from '../components/Modal/modal';
import SubmitButton from '../components/SubmitButton/submitbutton';
import Input from '../components/Input/input';
import { FaPlus, FaTimes } from "react-icons/fa";

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

export default function Home() {
  const [selectedCell, setSelectedCell] = useState<{day: string, time: string} | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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
  const hours = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 6;
    return `${toPersianNumber(hour)}:۰۰`;
  });

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
    'تعمير ،نصب و خدمات  صنعتي',
    'توليد برنامه هاي  تلوزيوني',
    'توليد محتوي  وتوسعه رسانه اي',
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

  const handleCellClick = (day: string, time: string) => {
    setSelectedCell({ day, time });
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

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row gap-6">
      {/* جدول زمانی هفتگی */}
      <div className="w-full lg:w-2/3 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4 text-right">جدول زمانی هفتگی</h2>
        <div className="min-w-[800px]">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-black text-right">روز / ساعت</th>
                {hours.map(hour => (
                  <th key={hour} className="border border-gray-300 p-2 text-cyan-900 text-center">{hour}</th>
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
                        className="border border-gray-300 p-1 h-16 align-top schedule-cell"
                        onClick={() => handleCellClick(day, hour)}
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
      <div className="w-full lg:w-1/3 mt-4 lg:mt-0">
        <div className="border border-gray-300 rounded p-4">
          <h2 className="text-xl font-bold mb-4 text-right">مدیریت برنامه</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2 text-right">برنامه‌های اخیر</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {schedule.map(item => (
                <div key={item.id} className="p-2 bg-gray-100 rounded text-right text-black relative">
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
                  <div className="text-sm text-black">{item.day} - {toPersianNumber(item.timeStart)} تا {toPersianNumber(item.timeEnd)}</div>
                  <div className="text-sm text-black">پست: {item.mainPosition}</div>
                  <div className="text-sm text-black">نوع ساعت: {item.hourType}</div>
                  <div className="text-sm text-black">گروه تدریس: {item.teachingGroup}</div>
                  {item.description && (
                    <div className="text-sm text-black mt-1">توضیحات: {item.description}</div>
                  )}
                </div>
              ))}
              {schedule.length === 0 && (
                <div className="text-black text-center">هنوز برنامه‌ای ثبت نشده است</div>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <SubmitButton 
              label="افزودن برنامه جدید" 
              onClick={() => {
                setSelectedCell(null);
                setModalOpen(true);
              }}
              className="mx-auto"
            />
          </div>
        </div>
      </div>

      {/* مودال افزودن برنامه */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title="افزودن برنامه جدید"
        width="500px"
        className='text-cyan-800'
      >
        <div className="space-y-4 text-right">
          {selectedCell && (
            <div className="bg-blue-50 p-2 rounded">
              <p>زمان انتخاب شده: {selectedCell.day} ساعت {toPersianNumber(selectedCell.time)}</p>
            </div>
          )}
          
          <Input
            label="کد پرسنلی"
            value={personnelCode}
            onChange={(e) => setPersonnelCode(e.target.value)}
            placeholder="کد پرسنلی را وارد کنید"
            className="w-full"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="توضیحات اضافی را وارد کنید"
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <SubmitButton 
              label="ثبت برنامه" 
              onClick={handleSubmit} 
              className="ml-2"
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
      </Modal>
    </div>
  );
}
