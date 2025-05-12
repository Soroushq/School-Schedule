'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EducationSystem, ClassOption } from '../../../types/education';
import { ClassSelector } from '../../../components/ClassSelector';
import { initialEducationSystem } from '../../../data/educationData';
import { EducationLevelLoader, getGradeOptionsByLevel, getClassOptionsByLevel, getFieldOptionsByLevel, isFieldRequired } from '../../../components/EducationLevelLoader';

export default function SelectClassPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<keyof EducationSystem | null>(null);
  const [educationSystem, setEducationSystem] = useState<EducationSystem>(initialEducationSystem);

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

  // اگر هنوز مقطع انتخاب نشده است، نمایش لودینگ
  if (!selectedLevel) {
    return (
      <>
        <EducationLevelLoader onLevelLoaded={handleLevelLoaded} />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">انتخاب کلاس</h1>

      {/* انتخاب مقطع */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(educationSystem).map(([key, level]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedLevel(key as keyof EducationSystem);
                localStorage.setItem('selectedLevel', key);
              }}
              className={`p-4 rounded-lg ${
                selectedLevel === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
              }`}
            >
              {level.name}
            </button>
          ))}
        </div>
      </div>

      {/* انتخاب کلاس */}
      <ClassSelector
        level={educationSystem[selectedLevel]}
        onSelect={handleClassSelect}
      />
    </div>
  );
} 