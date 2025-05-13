import React, { useState } from 'react';
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
    setSelectedField(field);
  };

  const selectedGradeObj = level.grades.find(grade => grade.id === selectedGrade);

  return (
    <div className={`space-y-8 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
      {/* انتخاب پایه */}
      <div className={`rounded-xl shadow-md border p-5 mb-6 ${
        theme === 'dark' 
          ? 'bg-gray-800 shadow-lg border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-xl font-bold mb-4 border-b pb-2 flex items-center ${
          theme === 'dark' 
            ? 'text-blue-400 border-gray-700' 
            : 'text-blue-600 border-gray-200'
        }`}>
          <span className={`inline-flex items-center justify-center w-6 h-6 mr-2 text-white rounded-full text-sm ${
            theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
          }`}>2</span>
          <FaGraduationCap className="ml-2" />
          انتخاب پایه
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {level.grades.map(grade => (
            <button
              key={grade.id}
              onClick={() => handleGradeSelect(grade.id)}
              className={`p-4 rounded-lg text-center transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'focus:ring-offset-gray-800' : '' 
              } relative
                ${selectedGrade === grade.id
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
        <div className={`rounded-xl shadow-md border p-5 mb-6 ${
          theme === 'dark' 
            ? 'bg-gray-800 shadow-lg border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-xl font-bold mb-4 border-b pb-2 flex items-center ${
            theme === 'dark' 
              ? 'text-blue-400 border-gray-700' 
              : 'text-blue-600 border-gray-200'
          }`}>
            <span className={`inline-flex items-center justify-center w-6 h-6 mr-2 text-white rounded-full text-sm ${
              theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
            }`}>3</span>
            <FaDoorOpen className="ml-2" />
            انتخاب کلاس
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedGradeObj.classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => handleClassSelect(cls.id)}
                className={`p-4 rounded-lg text-center transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  theme === 'dark' ? 'focus:ring-offset-gray-800' : ''
                } relative
                  ${selectedClass === cls.id
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
        <div className={`rounded-xl shadow-md border p-5 mb-6 ${
          theme === 'dark' 
            ? 'bg-gray-800 shadow-lg border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-xl font-bold mb-4 border-b pb-2 flex items-center ${
            theme === 'dark' 
              ? 'text-blue-400 border-gray-700' 
              : 'text-blue-600 border-gray-200'
          }`}>
            <span className={`inline-flex items-center justify-center w-6 h-6 mr-2 text-white rounded-full text-sm ${
              theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
            }`}>4</span>
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
                  className={`p-4 rounded-lg text-center transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    theme === 'dark' ? 'focus:ring-offset-gray-800' : ''
                  } relative
                    ${selectedField === fields[0]
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
                  className={`p-4 rounded-lg text-center transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    theme === 'dark' ? 'focus:ring-offset-gray-800' : ''
                  } relative
                    ${selectedField === field
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
          <div className={`rounded-xl shadow-md border p-5 mb-6 border-t-4 ${
            theme === 'dark' 
              ? 'bg-gray-800 shadow-lg border-gray-700 border-t-green-600' 
              : 'bg-white border-gray-100 border-t-green-500'
          }`}>
            <h3 className={`text-xl font-bold mb-4 border-b pb-2 text-center flex items-center justify-center ${
              theme === 'dark' 
                ? 'text-green-400 border-gray-700' 
                : 'text-green-600 border-gray-200'
            }`}>
              <span className={`inline-flex items-center justify-center w-6 h-6 mr-2 text-white rounded-full text-sm ${
                theme === 'dark' ? 'bg-green-500' : 'bg-green-600'
              }`}>5</span>
              تایید انتخاب
            </h3>
            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center space-x-2 space-x-reverse mb-4">
                <span className={`inline-block px-3 py-1 rounded-lg mb-2 ${
                  theme === 'dark' 
                    ? 'bg-blue-900 text-blue-200' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  مقطع: {level.name}
                </span>
                <FaArrowLeft className={`mx-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`inline-block px-3 py-1 rounded-lg mb-2 ${
                  theme === 'dark' 
                    ? 'bg-teal-900 text-teal-200' 
                    : 'bg-teal-100 text-teal-800'
                }`}>
                  پایه: {selectedGradeObj?.name}
                </span>
                <FaArrowLeft className={`mx-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`inline-block px-3 py-1 rounded-lg mb-2 ${
                  theme === 'dark' 
                    ? 'bg-purple-900 text-purple-200' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  کلاس: {selectedGradeObj?.classes.find(c => c.id === selectedClass)?.name}
                </span>
                {selectedField && (
                  <>
                    <FaArrowLeft className={`mx-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`inline-block px-3 py-1 rounded-lg mb-2 ${
                      theme === 'dark' 
                        ? 'bg-indigo-900 text-indigo-200' 
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
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
                className={`mt-2 px-8 py-3 rounded-lg font-bold text-white transition-colors duration-200 flex items-center mx-auto ${
                  theme === 'dark' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
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