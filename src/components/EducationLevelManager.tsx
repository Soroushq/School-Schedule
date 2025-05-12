import React from 'react';
import { EducationLevel, Grade } from '../types/education';
import { ClassManager } from './ClassManager';

interface EducationLevelManagerProps {
  level: EducationLevel;
  onUpdate: (updatedLevel: EducationLevel) => void;
}

export const EducationLevelManager: React.FC<EducationLevelManagerProps> = ({
  level,
  onUpdate
}) => {
  const handleGradeUpdate = (updatedGrade: Grade) => {
    const updatedGrades = level.grades.map((grade: Grade) =>
      grade.id === updatedGrade.id ? updatedGrade : grade
    );

    onUpdate({
      ...level,
      grades: updatedGrades
    });
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">{level.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {level.grades.map((grade: Grade) => (
          <ClassManager
            key={grade.id}
            grade={grade}
            onUpdate={handleGradeUpdate}
          />
        ))}
      </div>
    </div>
  );
}; 