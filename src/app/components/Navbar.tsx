'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaHome, FaHistory, FaUserAlt, FaSchool, FaTimes, FaInfoCircle, FaBars } from "react-icons/fa";
import { usePathname } from 'next/navigation';

interface SavedSchedule {
  personnel: {
    id: string;
    personnelCode: string;
    fullName: string;
    mainPosition: string;
    employmentStatus: string;
  };
  schedules: Record<string, unknown>[];
  timestamp: number;
}

interface ClassSchedule {
  id: string;
  grade: string;
  classNumber: string;
  field: string;
  schedules: Record<string, unknown>[];
  timestamp: number;
}

const Navbar = () => {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'personnel' | 'class' | 'all' | null>(null);
  const [savedPersonnelSchedules, setSavedPersonnelSchedules] = useState<SavedSchedule[]>([]);
  const [savedClassSchedules, setSavedClassSchedules] = useState<ClassSchedule[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (showModal) {
      loadAllSavedSchedules();
    }
  }, [showModal, modalType]);

  const loadAllSavedSchedules = () => {
    try {
      // بارگذاری برنامه‌های پرسنلی
      const allPersonnelSchedules: SavedSchedule[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('personnel_schedule_')) {
          const savedData = localStorage.getItem(key);
          
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              allPersonnelSchedules.push(parsedData);
            } catch (e) {
              console.error('خطا در تجزیه داده‌های ذخیره شده:', e);
            }
          }
        }
      }
      
      setSavedPersonnelSchedules(allPersonnelSchedules);
      
      // بارگذاری برنامه‌های کلاسی
      const allClassSchedules: ClassSchedule[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('class_schedule_')) {
          const savedData = localStorage.getItem(key);
          
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              allClassSchedules.push(parsedData);
            } catch (e) {
              console.error('خطا در تجزیه داده‌های ذخیره شده:', e);
            }
          }
        }
      }
      
      setSavedClassSchedules(allClassSchedules);
    } catch (error) {
      console.error('خطا در بارگیری برنامه‌ها:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fa-IR');
  };
  
  const navigateToPersonnelSchedule = (personnel: SavedSchedule['personnel']) => {
    const url = `/personnel-schedule/schedule?code=${encodeURIComponent(personnel.personnelCode)}&name=${encodeURIComponent(personnel.fullName)}&position=${encodeURIComponent(personnel.mainPosition)}`;
    window.open(url, '_blank');
    setShowModal(false);
  };
  
  const navigateToClassSchedule = (schedule: ClassSchedule) => {
    const url = `/class-schedule/schedule?grade=${encodeURIComponent(schedule.grade)}&class=${encodeURIComponent(schedule.classNumber)}&field=${encodeURIComponent(schedule.field)}`;
    window.open(url, '_blank');
    setShowModal(false);
  };

  const deleteSchedule = (key: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این برنامه را حذف کنید؟')) {
      localStorage.removeItem(key);
      loadAllSavedSchedules();
    }
  };

  const renderModalContent = () => {
    if (!modalType) {
      return (
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">انتخاب نوع برنامه</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setModalType('personnel')}
              className="flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FaUserAlt className="text-3xl mb-2" />
              <span className="text-lg font-bold">برنامه‌های بر اساس پرسنل</span>
            </button>
            <button
              onClick={() => setModalType('class')}
              className="flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FaSchool className="text-3xl mb-2" />
              <span className="text-lg font-bold">برنامه‌های کلاس‌ها</span>
            </button>
            <button
              onClick={() => setModalType('all')}
              className="flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FaHistory className="text-3xl mb-2" />
              <span className="text-lg font-bold">مشاهده تمام برنامه‌ها</span>
            </button>
          </div>
        </div>
      );
    }

    if (modalType === 'personnel') {
      return (
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">برنامه‌های پرسنلی</h2>
            <button onClick={() => setModalType(null)} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
          
          <div className="mt-4 max-h-[60vh] overflow-y-auto bg-gray-50 rounded-lg p-2">
            {savedPersonnelSchedules.length > 0 ? (
              <div className="space-y-3">
                {savedPersonnelSchedules.map((schedule) => (
                  <div key={schedule.personnel.id} className="bg-white p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{schedule.personnel.fullName}</h3>
                        <p className="text-sm text-gray-600">کد پرسنلی: {schedule.personnel.personnelCode}</p>
                        <p className="text-sm text-gray-600">سمت: {schedule.personnel.mainPosition}</p>
                        <p className="text-xs text-gray-500 mt-1">آخرین بروزرسانی: {formatDate(schedule.timestamp)}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => navigateToPersonnelSchedule(schedule.personnel)}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm rounded hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          مشاهده
                        </button>
                        <button 
                          onClick={() => deleteSchedule(`personnel_schedule_${schedule.personnel.id}`)}
                          className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <p>تعداد برنامه‌ها: {schedule.schedules.length}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">هیچ برنامه پرسنلی ذخیره نشده است</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (modalType === 'class') {
      return (
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">برنامه‌های کلاسی</h2>
            <button onClick={() => setModalType(null)} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
          
          <div className="mt-4 max-h-[60vh] overflow-y-auto bg-gray-50 rounded-lg p-2">
            {savedClassSchedules.length > 0 ? (
              <div className="space-y-3">
                {savedClassSchedules.map((schedule) => (
                  <div key={`${schedule.grade}-${schedule.classNumber}-${schedule.field}`} className="bg-white p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{schedule.grade} {schedule.classNumber} {schedule.field}</h3>
                        <p className="text-xs text-gray-500 mt-1">آخرین بروزرسانی: {formatDate(schedule.timestamp)}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => navigateToClassSchedule(schedule)}
                          className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-teal-600 text-white text-sm rounded hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          مشاهده
                        </button>
                        <button 
                          onClick={() => deleteSchedule(`class_schedule_${schedule.grade}-${schedule.classNumber}-${schedule.field}`)}
                          className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <p>تعداد برنامه‌ها: {schedule.schedules.length}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">هیچ برنامه کلاسی ذخیره نشده است</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (modalType === 'all') {
      return (
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">تمام برنامه‌ها</h2>
            <button onClick={() => setModalType(null)} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
          
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-blue-800 bg-blue-50 p-2 rounded-lg mb-3">برنامه‌های پرسنلی</h3>
              {savedPersonnelSchedules.length > 0 ? (
                <div className="space-y-2">
                  {savedPersonnelSchedules.map((schedule) => (
                    <div key={schedule.personnel.id} className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900">{schedule.personnel.fullName}</h4>
                          <p className="text-sm text-gray-600">سمت: {schedule.personnel.mainPosition}</p>
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                          <button 
                            onClick={() => navigateToPersonnelSchedule(schedule.personnel)}
                            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm rounded hover:from-blue-600 hover:to-cyan-700"
                          >
                            مشاهده
                          </button>
                          <button 
                            onClick={() => deleteSchedule(`personnel_schedule_${schedule.personnel.id}`)}
                            className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded hover:from-red-600 hover:to-red-700"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">هیچ برنامه پرسنلی ذخیره نشده است</p>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-green-800 bg-green-50 p-2 rounded-lg mb-3">برنامه‌های کلاسی</h3>
              {savedClassSchedules.length > 0 ? (
                <div className="space-y-2">
                  {savedClassSchedules.map((schedule) => (
                    <div key={`${schedule.grade}-${schedule.classNumber}-${schedule.field}`} className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900">{schedule.grade} {schedule.classNumber} {schedule.field}</h4>
                          <p className="text-sm text-gray-600">تعداد برنامه‌ها: {schedule.schedules.length}</p>
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                          <button 
                            onClick={() => navigateToClassSchedule(schedule)}
                            className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-600 text-white text-sm rounded hover:from-green-600 hover:to-teal-700"
                          >
                            مشاهده
                          </button>
                          <button 
                            onClick={() => deleteSchedule(`class_schedule_${schedule.grade}-${schedule.classNumber}-${schedule.field}`)}
                            className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded hover:from-red-600 hover:to-red-700"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">هیچ برنامه کلاسی ذخیره نشده است</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <header className="w-full shadow-md bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 text-white font-sans" style={{ fontFamily: 'inherit' }}>
        <div className="container mx-auto px-4 py-2 md:py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/welcome" className="flex items-center">
                <FaHome className="text-xl md:text-2xl" />
                <span className="mr-2 text-lg md:text-xl font-bold hidden md:inline-block">صفحه اصلی</span>
              </Link>
              
              {/* منوی دسکتاپ */}
              <div className="hidden md:flex space-x-4 space-x-reverse">
                <Link
                  href="/"
                  className={`py-1 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                    pathname === "/" 
                      ? "bg-blue-700" 
                      : ""
                  }`}
                >
                  صفحه اصلی
                </Link>
                <Link
                  href="/class-schedule"
                  className={`py-1 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                    pathname?.includes("/class-schedule") 
                      ? "bg-blue-700" 
                      : ""
                  }`}
                >
                  برنامه کلاسی
                </Link>
                <Link
                  href="/personnel-schedule"
                  className={`py-1 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                    pathname?.includes("/personnel-schedule") 
                      ? "bg-blue-700" 
                      : ""
                  }`}
                >
                  برنامه پرسنلی
                </Link>
                <Link
                  href="/about-me"
                  className={`py-1 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                    pathname === "/about-me" 
                      ? "bg-blue-700" 
                      : ""
                  }`}
                >
                  درباره من
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">              
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center py-1.5 px-3 bg-blue-800 hover:bg-blue-900 text-white rounded-md transition-all duration-200 shadow-md"
              >
                <FaHistory className="ml-1.5" />
                <span>برنامه‌های اخیر</span>
              </button>
              
              {/* دکمه منوی موبایل */}
              <button 
                className="md:hidden flex items-center justify-center p-2 rounded-md bg-blue-800 hover:bg-blue-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <FaBars className="text-xl" />
              </button>
            </div>
          </div>
          
          {/* منوی موبایل */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-3 py-2 border-t border-blue-400">
              <div className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className={`py-2 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                    pathname === "/" 
                      ? "bg-blue-700" 
                      : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  صفحه اصلی
                </Link>
                <Link
                  href="/class-schedule"
                  className={`py-2 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                    pathname?.includes("/class-schedule") 
                      ? "bg-blue-700" 
                      : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  برنامه کلاسی
                </Link>
                <Link
                  href="/personnel-schedule"
                  className={`py-2 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                    pathname?.includes("/personnel-schedule") 
                      ? "bg-blue-700" 
                      : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  برنامه پرسنلی
                </Link>
                <Link
                  href="/about-me"
                  className={`py-2 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                    pathname === "/about-me" 
                      ? "bg-blue-700" 
                      : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  درباره من
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 animate-triple-gradient bg-opacity-90 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl z-10 w-full max-w-3xl max-h-[80vh] overflow-hidden">
            {renderModalContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 