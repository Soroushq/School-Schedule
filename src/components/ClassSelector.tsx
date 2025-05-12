import React, { useState } from 'react';
import { EducationLevel, ClassOption, THEORETICAL_FIELDS, TECHNICAL_VOCATIONAL_FIELDS } from '../types/education';

interface ClassSelectorProps {
  level: EducationLevel;
  onSelect: (selectedClass: ClassOption) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({ level, onSelect }) => {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);

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
    const selectedClassObj = level.grades
      .find(grade => grade.id === selectedGrade)
      ?.classes.find(cls => cls.id === selectedClass);

    if (selectedClassObj) {
      onSelect({
        ...selectedClassObj,
        field
      });
    }
  };

  const selectedGradeObj = level.grades.find(grade => grade.id === selectedGrade);

  return (
    <div className="space-y-6">
      {/* انتخاب پایه */}
      <div>
        <h3 className="text-lg font-semibold mb-3">انتخاب پایه</h3>
        <div className="grid grid-cols-3 gap-4">
          {level.grades.map(grade => (
            <button
              key={grade.id}
              onClick={() => handleGradeSelect(grade.id)}
              className={`p-3 rounded-lg ${
                selectedGrade === grade.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {grade.name}
            </button>
          ))}
        </div>
      </div>

      {/* انتخاب کلاس */}
      {selectedGradeObj && (
        <div>
          <h3 className="text-lg font-semibold mb-3">انتخاب کلاس</h3>
          <div className="grid grid-cols-3 gap-4">
            {selectedGradeObj.classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => handleClassSelect(cls.id)}
                className={`p-3 rounded-lg ${
                  selectedClass === cls.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* انتخاب رشته (فقط برای دبیرستان و فنی حرفه‌ای) */}
      {selectedClass && (level.id === 'highSchool' || level.id === 'technicalVocational') && (
        <div>
          <h3 className="text-lg font-semibold mb-3">انتخاب رشته</h3>
          <div className="grid grid-cols-3 gap-4">
            {level.id === 'highSchool' ? (
              // رشته‌های نظری
              Object.entries(THEORETICAL_FIELDS).map(([key, fields]) => (
                <button
                  key={key}
                  onClick={() => handleFieldSelect(fields[0])}
                  className={`p-3 rounded-lg ${
                    selectedField === fields[0]
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {fields[0]}
                </button>
              ))
            ) : (
              // رشته‌های فنی و حرفه‌ای
              TECHNICAL_VOCATIONAL_FIELDS.map((field: string) => (
                <button
                  key={field}
                  onClick={() => handleFieldSelect(field)}
                  className={`p-3 rounded-lg ${
                    selectedField === field
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {field}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 