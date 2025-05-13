import React, { useState, useEffect } from 'react';
import { EducationLevel, ClassOption, THEORETICAL_FIELDS, TECHNICAL_VOCATIONAL_FIELDS } from '../types/education';
import { useTheme } from '@/context/ThemeContext';
import { FaCheckCircle, FaArrowLeft, FaCheck, FaGraduationCap, FaDoorOpen, FaBookReader } from 'react-icons/fa';

interface ClassSelectorProps {
  level: EducationLevel;
  onSelect: (selectedClass: ClassOption) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({ level, onSelect }) => {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const { theme } = useTheme();
  
  // فعال کردن event listener برای storage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const newTheme = e.newValue as 'light' | 'dark';
        // اعمال تم به سند
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleGradeSelect = (gradeId: string) => {
    setSelectedGrade(gradeId);
    setSelectedClass(null);
    setSelectedField(null);
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    setSelectedField(null);
  };

  const handleFieldSelect = (field: string) => {
    // فقط تنظیم رشته انتخابی، بدون هدایت خودکار به صفحه بعدی
    setSelectedField(field);
    // دیگر onSelect را اینجا فراخوانی نمی‌کنیم تا کاربر خودش دکمه تایید را بزند
  };

  const selectedGradeObj = level.grades.find(grade => grade.id === selectedGrade);

  return (
    <div className="space-y-8 text-gray-800 dark:text-white">
      {/* انتخاب پایه */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mb-6 dark:bg-gray-800 dark:shadow-lg dark:border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-blue-600 border-b border-gray-200 pb-2 dark:text-blue-400 dark:border-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-blue-600 text-white rounded-full text-sm dark:bg-blue-500">2</span>
          <FaGraduationCap className="ml-2" />
          انتخاب پایه
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {level.grades.map(grade => (
            <button
              key={grade.id}
              onClick={() => handleGradeSelect(grade.id)}
              className={`p-4 rounded-lg text-center transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 relative
                ${selectedGrade === grade.id
                  ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {grade.name}
              {selectedGrade === grade.id && (
                <FaCheckCircle className="absolute top-2 left-2 text-white text-sm" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* انتخاب کلاس */}
      {selectedGradeObj && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mb-6 dark:bg-gray-800 dark:shadow-lg dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-blue-600 border-b border-gray-200 pb-2 dark:text-blue-400 dark:border-gray-700 flex items-center">
            <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-blue-600 text-white rounded-full text-sm dark:bg-blue-500">3</span>
            <FaDoorOpen className="ml-2" />
            انتخاب کلاس
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedGradeObj.classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => handleClassSelect(cls.id)}
                className={`p-4 rounded-lg text-center transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 relative
                  ${selectedClass === cls.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {cls.name}
                {selectedClass === cls.id && (
                  <FaCheckCircle className="absolute top-2 left-2 text-white text-sm" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* انتخاب رشته (فقط برای دبیرستان و فنی حرفه‌ای) */}
      {(level.id === 'highSchool' || level.id === 'technicalVocational') && selectedGrade && selectedClass && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mb-6 dark:bg-gray-800 dark:shadow-lg dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-blue-600 border-b border-gray-200 pb-2 dark:text-blue-400 dark:border-gray-700 flex items-center">
            <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-blue-600 text-white rounded-full text-sm dark:bg-blue-500">4</span>
            <FaBookReader className="ml-2" />
            انتخاب رشته
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {level.id === 'highSchool' ? (
              // رشته‌های نظری
              Object.entries(THEORETICAL_FIELDS).map(([key, fields]) => (
                <button
                  key={key}
                  onClick={() => handleFieldSelect(fields[0])}
                  className={`p-4 rounded-lg text-center transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 relative
                    ${selectedField === fields[0]
                      ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {fields[0]}
                  {selectedField === fields[0] && (
                    <FaCheckCircle className="absolute top-2 left-2 text-white text-sm" />
                  )}
                </button>
              ))
            ) : (
              // رشته‌های فنی و حرفه‌ای
              TECHNICAL_VOCATIONAL_FIELDS.map((field: string) => (
                <button
                  key={field}
                  onClick={() => handleFieldSelect(field)}
                  className={`p-4 rounded-lg text-center transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 relative
                    ${selectedField === field
                      ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {field}
                  {selectedField === field && (
                    <FaCheckCircle className="absolute top-2 left-2 text-white text-sm" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* قسمت مرور و تایید نهایی */}
      {selectedGrade && selectedClass && (
        (level.id === 'highSchool' || level.id === 'technicalVocational' ? selectedField : true) && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mb-6 border-t-4 border-t-green-500 dark:bg-gray-800 dark:shadow-lg dark:border-gray-700 dark:border-t-green-600">
            <h3 className="text-xl font-bold mb-4 text-green-600 border-b border-gray-200 pb-2 text-center dark:text-green-400 dark:border-gray-700 flex items-center justify-center">
              <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-green-600 text-white rounded-full text-sm dark:bg-green-500">5</span>
              تایید انتخاب
            </h3>
            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center space-x-2 space-x-reverse mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-lg dark:bg-blue-900 dark:text-blue-200 mb-2">
                  مقطع: {level.name}
                </span>
                <FaArrowLeft className="text-gray-400 mx-1" />
                <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-lg dark:bg-teal-900 dark:text-teal-200 mb-2">
                  پایه: {selectedGradeObj?.name}
                </span>
                <FaArrowLeft className="text-gray-400 mx-1" />
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-lg dark:bg-purple-900 dark:text-purple-200 mb-2">
                  کلاس: {selectedGradeObj?.classes.find(c => c.id === selectedClass)?.name}
                </span>
                {selectedField && (
                  <>
                    <FaArrowLeft className="text-gray-400 mx-1" />
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg dark:bg-indigo-900 dark:text-indigo-200 mb-2">
                      رشته: {selectedField}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  const selectedClassObj = level.grades
                    .find(grade => grade.id === selectedGrade)
                    ?.classes.find(cls => cls.id === selectedClass);
                  if (selectedClassObj) {
                    onSelect({
                      ...selectedClassObj,
                      field: selectedField || undefined
                    });
                  }
                }}
                className="mt-2 px-8 py-3 rounded-lg font-bold bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 dark:bg-green-600 dark:hover:bg-green-700 flex items-center mx-auto"
              >
                <FaCheck className="ml-2" />
                تایید و ادامه
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}; 