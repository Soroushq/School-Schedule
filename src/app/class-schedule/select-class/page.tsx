'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EducationSystem, ClassOption } from '../../../types/education';
import { ClassSelector } from '../../../components/ClassSelector';
import { initialEducationSystem } from '../../../data/educationData';
import { EducationLevelLoader, getGradeOptionsByLevel, getClassOptionsByLevel, getFieldOptionsByLevel, isFieldRequired } from '../../../components/EducationLevelLoader';
import { useTheme } from '@/context/ThemeContext';
import { FaArrowRight, FaCalendarAlt, FaSync, FaStepForward } from 'react-icons/fa';

export default function SelectClassPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<keyof EducationSystem | null>(null);
  const [educationSystem, setEducationSystem] = useState<EducationSystem>(initialEducationSystem);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // خواندن مقطع انتخاب شده از localStorage
  const handleLevelLoaded = (level: string) => {
    if (Object.keys(initialEducationSystem).includes(level)) {
      setSelectedLevel(level as keyof EducationSystem);
    } else {
      // اگر مقطعی انتخاب نشده باشد، به صورت پیش‌فرض دوره دوم متوسطه انتخاب می‌شود
      setSelectedLevel('highSchool');
    }
  };

  // خواندن کلاس انتخاب شده از localStorage
  useEffect(() => {
    const savedClass = localStorage.getItem('selectedClass');
    if (savedClass) {
      try {
        const classData = JSON.parse(savedClass);
        if (classData.grade && classData.name && classData.section) {
          // اطلاعات کلاس انتخاب شده را نمایش می‌دهیم
          console.log('Loaded class data:', classData);
        }
      } catch (error) {
        console.error('Error parsing saved class data:', error);
      }
    }
  }, []);

  const handleClassSelect = (selectedClass: ClassOption) => {
    // ذخیره اطلاعات کلاس انتخاب شده
    localStorage.setItem('selectedClass', JSON.stringify(selectedClass));
    // انتقال به صفحه برنامه کلاس
    router.push('/class-schedule/schedule');
  };

  // اگر کامپوننت هنوز به صورت کامل لود نشده است، نمایش یک اسپینر
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // اگر هنوز مقطع انتخاب نشده است، نمایش لودینگ
  if (!selectedLevel) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-blue-50 text-gray-800'}`}>
        <EducationLevelLoader onLevelLoaded={handleLevelLoaded} />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-12 pt-20 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-blue-50 text-gray-800'}`}>
      {/* دکمه بازگشت */}
      <div className="fixed top-20 right-4 z-10">
        <Link 
          href="/welcome" 
          className={`flex items-center p-2 rounded-full ${
            theme === 'dark' 
              ? 'bg-gray-800 text-blue-400 hover:bg-gray-700' 
              : 'bg-white text-blue-600 hover:bg-blue-100'
          } shadow-md transition-colors`}
          title="بازگشت به صفحه اصلی"
        >
          <FaArrowRight className="text-xl" />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <div className={`rounded-xl p-6 mb-8 text-center ${
          theme === 'dark' 
            ? 'bg-gray-800 shadow-lg border-gray-700' 
            : 'bg-white shadow-md border border-gray-100'
        }`}>
          <FaCalendarAlt className={`text-4xl mb-3 mx-auto ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <h1 className={`text-3xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            انتخاب کلاس
          </h1>
          <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            مقطع <span className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{educationSystem[selectedLevel].name}</span> انتخاب شده است. لطفاً پایه و کلاس مورد نظر خود را انتخاب کنید.
          </p>
        </div>

        {/* انتخاب مقطع */}
        <div className={`rounded-xl p-6 mb-8 ${
          theme === 'dark' 
            ? 'bg-gray-800 shadow-lg border-gray-700' 
            : 'bg-white shadow-md border border-gray-100'
        }`}>
          <h2 className={`text-xl font-bold mb-4 border-b pb-2 flex items-center ${
            theme === 'dark' 
              ? 'text-blue-400 border-gray-700' 
              : 'text-blue-600 border-gray-200'
          }`}>
            <span className={`inline-flex items-center justify-center w-6 h-6 mr-2 ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'} text-white rounded-full text-sm`}>1</span>
            مقطع انتخابی شما
          </h2>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>در صورت تمایل می‌توانید مقطع خود را مجدداً تغییر دهید:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(educationSystem).map(([key, level]) => {
              const isSelected = selectedLevel === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedLevel(key as keyof EducationSystem);
                    localStorage.setItem('selectedLevel', key);
                  }}
                  className={`p-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    theme === 'dark' ? 'focus:ring-offset-gray-800' : ''
                  } relative
                    ${isSelected 
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                >
                  {level.name}
                  {isSelected && <FaSync className="absolute top-2 left-2 text-white text-sm animate-spin" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* انتخاب کلاس */}
        <ClassSelector
          level={educationSystem[selectedLevel]}
          onSelect={handleClassSelect}
        />

        {/* راهنمای مراحل */}
        <div className={`mt-8 p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-blue-900' 
            : 'bg-blue-50 border-blue-100'
        }`}>
          <div className={`flex items-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} font-medium`}>
            <FaStepForward className="ml-2" />
            <p>با انتخاب کلاس و تأیید نهایی به مرحله بعد هدایت خواهید شد.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 