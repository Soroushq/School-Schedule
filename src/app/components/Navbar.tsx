'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaHome, FaHistory, FaUserAlt, FaSchool, FaTimes, FaInfoCircle, FaBars, FaUserCog, FaSun, FaMoon } from "react-icons/fa";
import { usePathname } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import { useTheme } from '@/context/ThemeContext';

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

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        toggleTheme();
      }}
      className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 backdrop-blur-sm ${
        theme === 'dark' 
          ? 'bg-gray-800/90 border border-gray-700' 
          : 'bg-white/90 border border-gray-200'
      }`}
      aria-label={theme === 'light' ? 'تغییر به حالت تاریک' : 'تغییر به حالت روشن'}
    >
      {theme === 'light' ? (
        <FaSun className="h-5 w-5 text-yellow-500 hover:animate-pulse hover:drop-shadow-[0_0_10px_rgb(255,223,0)]" />
      ) : (
        <FaMoon className="h-5 w-5 text-blue-500 hover:animate-pulse hover:drop-shadow-[0_0_10px_rgb(100,149,237)]" />
      )}
    </button>
  );
};

const Navbar = () => {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'personnel' | 'class' | 'all' | 'role' | null>(null);
  const [savedPersonnelSchedules, setSavedPersonnelSchedules] = useState<SavedSchedule[]>([]);
  const [savedClassSchedules, setSavedClassSchedules] = useState<ClassSchedule[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userRole, setUserRole } = useUserRole();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const openModal = (type: 'personnel' | 'class' | 'all' | 'role' | null) => {
    // اگر مودال دیگری باز است، آن را ببندید
    if (showModal) {
      setShowModal(false);
      // کمی تأخیر برای بستن کامل مودال قبلی قبل از باز کردن مودال جدید
      setTimeout(() => {
        setModalType(type);
        setShowModal(true);
      }, 100);
    } else {
      setModalType(type);
      setShowModal(true);
    }
  };

  const renderModalContent = () => {
    if (!modalType) {
      return (
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">انتخاب نوع برنامه</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => openModal('personnel')}
              className="flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FaUserAlt className="text-3xl mb-2" />
              <span className="text-lg font-bold">برنامه‌های بر اساس پرسنل</span>
            </button>
            <button
              onClick={() => openModal('class')}
              className="flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FaSchool className="text-3xl mb-2" />
              <span className="text-lg font-bold">برنامه‌های کلاس‌ها</span>
            </button>
            <button
              onClick={() => openModal('all')}
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
            <button onClick={() => openModal(null)} className="text-gray-500 hover:text-gray-700">
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
            <button onClick={() => openModal(null)} className="text-gray-500 hover:text-gray-700">
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
            <button onClick={() => openModal(null)} className="text-gray-500 hover:text-gray-700">
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

    if (modalType === 'role') {
      return (
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">انتخاب نقش کاربری</h2>
            <button onClick={() => openModal(null)} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setUserRole('admin');
                setShowModal(false);
              }}
              className={`flex flex-col items-center justify-center p-4 md:p-6 
                ${userRole === 'admin' 
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-700 ring-2 ring-purple-300' 
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'} 
                text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg`}
            >
              <FaUserCog className="text-3xl mb-2" />
              <span className="text-lg font-bold">مدیر سیستم</span>
              <p className="text-xs mt-2 text-gray-100">دسترسی کامل به تمام بخش‌ها</p>
              {userRole === 'admin' && (
                <div className="mt-2 bg-white text-indigo-700 px-2 py-1 rounded-full text-xs font-bold">
                  فعال
                </div>
              )}
            </button>
            
            <button
              onClick={() => {
                setUserRole('educator');
                setShowModal(false);
              }}
              className={`flex flex-col items-center justify-center p-4 md:p-6 
                ${userRole === 'educator' 
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-700 ring-2 ring-blue-300' 
                  : 'bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'} 
                text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg`}
            >
              <FaUserAlt className="text-3xl mb-2" />
              <span className="text-lg font-bold">آموزشگر</span>
              <p className="text-xs mt-2 text-gray-100">دسترسی به برنامه‌های آموزشی</p>
              {userRole === 'educator' && (
                <div className="mt-2 bg-white text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                  فعال
                </div>
              )}
            </button>
            
            <button
              onClick={() => {
                setUserRole('learner');
                setShowModal(false);
              }}
              className={`flex flex-col items-center justify-center p-4 md:p-6 
                ${userRole === 'learner' 
                  ? 'bg-gradient-to-br from-green-600 to-teal-700 ring-2 ring-green-300' 
                  : 'bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700'} 
                text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg`}
            >
              <FaSchool className="text-3xl mb-2" />
              <span className="text-lg font-bold">دانش‌آموز</span>
              <p className="text-xs mt-2 text-gray-100">دسترسی به برنامه‌های کلاسی</p>
              {userRole === 'learner' && (
                <div className="mt-2 bg-white text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                  فعال
                </div>
              )}
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p>با انتخاب هر نقش، سطح دسترسی شما به بخش‌های مختلف سامانه تغییر می‌کند.</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <header className={`w-full shadow-md ${theme === 'dark' ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700'} text-white font-sans`} style={{ fontFamily: 'inherit' }}>
        <div className="container mx-auto px-4 py-2 md:py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/welcome" className="flex items-center">
                <FaHome className="text-xl md:text-2xl" />
                <span className="mr-2 text-lg md:text-xl font-bold hidden md:inline-block">صفحه اصلی</span>
              </Link>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-4 space-x-reverse">
                <Link
                  href="/"
                  className={`py-1 px-3 rounded-md hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors duration-200 ${
                    pathname === "/" 
                      ? theme === 'dark' ? "bg-gray-600" : "bg-blue-700"
                      : ""
                  }`}
                >
                  صفحه اصلی
                </Link>
                <Link
                  href="/class-schedule"
                  className={`py-1 px-3 rounded-md hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors duration-200 ${
                    pathname?.includes("/class-schedule") 
                      ? theme === 'dark' ? "bg-gray-600" : "bg-blue-700"
                      : ""
                  }`}
                >
                  برنامه کلاسی
                </Link>
                <Link
                  href="/personnel-schedule"
                  className={`py-1 px-3 rounded-md hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors duration-200 ${
                    pathname?.includes("/personnel-schedule") 
                      ? theme === 'dark' ? "bg-gray-600" : "bg-blue-700"
                      : ""
                  }`}
                >
                  برنامه پرسنلی
                </Link>
                <Link
                  href="/about-me"
                  className={`py-1 px-3 rounded-md hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors duration-200 ${
                    pathname === "/about-me" 
                      ? theme === 'dark' ? "bg-gray-600" : "bg-blue-700" 
                      : ""
                  }`}
                >
                  درباره من
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse">
              {/* Theme toggle button in desktop menu */}
              <div className="hidden md:flex items-center">
                <ThemeToggleButton />
              </div>

              {/* Desktop buttons */}
              <div className="hidden md:flex items-center space-x-4 space-x-reverse">
                <button 
                  onClick={() => openModal('role')}
                  className={`flex items-center py-1.5 px-3 ${theme === 'dark' ? 'bg-indigo-900 hover:bg-indigo-800' : 'bg-indigo-800 hover:bg-indigo-900'} text-white rounded-md transition-all duration-200 shadow-md`}
                >
                  <FaUserCog className="ml-1.5" />
                  <span>انتخاب نقش</span>
                  {userRole && (
                    <span className="mr-2 text-xs bg-white text-indigo-800 px-2 py-0.5 rounded-full">
                      {userRole === 'admin' ? 'مدیر' : userRole === 'educator' ? 'آموزشگر' : 'دانش‌آموز'}
                    </span>
                  )}
                </button>
                
                <button 
                  onClick={() => openModal(null)}
                  className={`flex items-center py-1.5 px-3 ${theme === 'dark' ? 'bg-blue-900 hover:bg-blue-800' : 'bg-blue-800 hover:bg-blue-900'} text-white rounded-md transition-all duration-200 mx-2 shadow-md`}
                >
                  <FaHistory className="ml-1.5" />
                  <span>برنامه‌های اخیر</span>
                </button>
              </div>

              {/* Mobile buttons */}
              <div className="md:hidden flex items-center space-x-2 space-x-reverse">
                {/* Theme toggle button in mobile view */}
                <ThemeToggleButton />
                
                {/* Role selection button with shortened text */}
                <button 
                  onClick={() => openModal('role')}
                  className={`flex items-center py-1.5 px-2 ${theme === 'dark' ? 'bg-indigo-900 hover:bg-indigo-800' : 'bg-indigo-800 hover:bg-indigo-900'} text-white rounded-md transition-all duration-200 shadow-md text-sm`}
                >
                  <FaUserCog className="ml-1" />
                  <span>نقش: {userRole === 'admin' ? 'مدیر' : userRole === 'educator' ? 'آموزشگر' : 'دانش‌آموز'}</span>
                </button>
                
                {/* Mobile menu button */}
                <button 
                  className={`flex items-center justify-center p-2 mx-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-800 hover:bg-blue-900'} transition-colors`}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <FaBars className="text-xl" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu with animation */}
          <div 
            className={`md:hidden overflow-hidden transition-all duration-250 ease-in-out ${
              isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-2 border-t border-blue-400 dark:border-gray-600 space-y-2">
              <Link
                href="/"
                className={`block py-2 px-3 rounded-md hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors duration-200 ${
                  pathname === "/" 
                    ? theme === 'dark' ? "bg-gray-600" : "bg-blue-700"
                    : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                صفحه اصلی
              </Link>
              <Link
                href="/class-schedule"
                className={`block py-2 px-3 rounded-md hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors duration-200 ${
                  pathname?.includes("/class-schedule") 
                    ? theme === 'dark' ? "bg-gray-600" : "bg-blue-700"
                    : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                برنامه کلاسی
              </Link>
              <Link
                href="/personnel-schedule"
                className={`block py-2 px-3 rounded-md hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors duration-200 ${
                  pathname?.includes("/personnel-schedule") 
                    ? theme === 'dark' ? "bg-gray-600" : "bg-blue-700"
                    : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                برنامه پرسنلی
              </Link>
              <Link
                href="/about-me"
                className={`block py-2 px-3 rounded-md hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors duration-200 ${
                  pathname === "/about-me" 
                    ? theme === 'dark' ? "bg-gray-600" : "bg-blue-700"
                    : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                درباره من
              </Link>
              
              {/* Recent schedules button moved to mobile menu */}
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openModal(null);
                }}
                className={`w-full flex items-center py-2 px-3 rounded-md ${theme === 'dark' ? 'bg-blue-900 hover:bg-blue-800' : 'bg-blue-800 hover:bg-blue-900'} transition-colors duration-200 text-left`}
              >
                <FaHistory className="ml-2" />
                برنامه‌های اخیر
              </button>
            </div>
          </div>
        </div>
      </header>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 animate-triple-gradient bg-opacity-90 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl z-10 w-full max-w-3xl max-h-[80vh] overflow-hidden`}>
            {renderModalContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 