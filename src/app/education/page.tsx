'use client';

import React, { useState } from 'react';
import { EducationSystem, EDUCATION_LEVELS } from '../../types/education';
import { EducationLevelManager } from '../../components/EducationLevelManager';

const initialEducationSystem: EducationSystem = {
  elementary: {
    id: EDUCATION_LEVELS.ELEMENTARY,
    name: 'دوره ابتدایی',
    grades: [
      {
        id: '1',
        name: 'پایه اول',
        classes: []
      },
      {
        id: '2',
        name: 'پایه دوم',
        classes: []
      },
      {
        id: '3',
        name: 'پایه سوم',
        classes: []
      },
      {
        id: '4',
        name: 'پایه چهارم',
        classes: []
      },
      {
        id: '5',
        name: 'پایه پنجم',
        classes: []
      },
      {
        id: '6',
        name: 'پایه ششم',
        classes: []
      }
    ]
  },
  middleSchool: {
    id: EDUCATION_LEVELS.MIDDLE_SCHOOL,
    name: 'دوره اول متوسطه',
    grades: [
      {
        id: '7',
        name: 'پایه هفتم',
        classes: []
      },
      {
        id: '8',
        name: 'پایه هشتم',
        classes: []
      },
      {
        id: '9',
        name: 'پایه نهم',
        classes: []
      }
    ]
  },
  highSchool: {
    id: EDUCATION_LEVELS.HIGH_SCHOOL,
    name: 'دوره دوم متوسطه',
    grades: [
      {
        id: '10',
        name: 'پایه دهم',
        classes: []
      },
      {
        id: '11',
        name: 'پایه یازدهم',
        classes: []
      },
      {
        id: '12',
        name: 'پایه دوازدهم',
        classes: []
      }
    ]
  },
  technicalVocational: {
    id: EDUCATION_LEVELS.TECHNICAL_VOCATIONAL,
    name: 'فنی و حرفه‌ای',
    grades: [
      {
        id: '10-tech',
        name: 'پایه دهم',
        classes: []
      },
      {
        id: '11-tech',
        name: 'پایه یازدهم',
        classes: []
      },
      {
        id: '12-tech',
        name: 'پایه دوازدهم',
        classes: []
      }
    ]
  }
};

export default function EducationPage() {
  const [educationSystem, setEducationSystem] = useState<EducationSystem>(initialEducationSystem);

  const handleLevelUpdate = (levelId: string, updatedLevel: EducationSystem[keyof EducationSystem]) => {
    setEducationSystem((prev: EducationSystem) => ({
      ...prev,
      [levelId]: updatedLevel
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">مدیریت سیستم آموزشی</h1>
      
      <div className="space-y-8">
        <EducationLevelManager
          level={educationSystem.elementary}
          onUpdate={(updated) => handleLevelUpdate(EDUCATION_LEVELS.ELEMENTARY, updated)}
        />
        
        <EducationLevelManager
          level={educationSystem.middleSchool}
          onUpdate={(updated) => handleLevelUpdate(EDUCATION_LEVELS.MIDDLE_SCHOOL, updated)}
        />
        
        <EducationLevelManager
          level={educationSystem.highSchool}
          onUpdate={(updated) => handleLevelUpdate(EDUCATION_LEVELS.HIGH_SCHOOL, updated)}
        />
        
        <EducationLevelManager
          level={educationSystem.technicalVocational}
          onUpdate={(updated) => handleLevelUpdate(EDUCATION_LEVELS.TECHNICAL_VOCATIONAL, updated)}
        />
      </div>
    </div>
  );
} 