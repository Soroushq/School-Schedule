import { useEffect } from 'react';

interface EducationLevelLoaderProps {
  onLevelLoaded: (level: string) => void;
}

export const EducationLevelLoader: React.FC<EducationLevelLoaderProps> = ({ onLevelLoaded }) => {
  useEffect(() => {
    const savedLevel = localStorage.getItem('selectedLevel');
    if (savedLevel) {
      onLevelLoaded(savedLevel);
    }
  }, [onLevelLoaded]);

  return null;
};

export const getGradeOptionsByLevel = (level: string | null) => {
  if (!level) return ['دهم', 'یازدهم', 'دوازدهم'];
  
  switch(level) {
    case 'elementary':
      return ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'];
    case 'middleSchool':
      return ['هفتم', 'هشتم', 'نهم'];
    case 'highSchool':
    case 'technicalVocational':
      return ['دهم', 'یازدهم', 'دوازدهم'];
    default:
      return ['دهم', 'یازدهم', 'دوازدهم'];
  }
};

export const getClassOptionsByLevel = (level: string | null, grade: string) => {
  const defaultOptions = ['الف', 'ب', 'ج', 'د'];
  
  if (!level) return defaultOptions;
  
  const options: Record<string, Record<string, string[]>> = {
    'elementary': {
      'اول': defaultOptions,
      'دوم': defaultOptions,
      'سوم': defaultOptions,
      'چهارم': defaultOptions,
      'پنجم': defaultOptions,
      'ششم': defaultOptions
    },
    'middleSchool': {
      'هفتم': defaultOptions,
      'هشتم': defaultOptions,
      'نهم': defaultOptions
    },
    'highSchool': {
      'دهم': defaultOptions,
      'یازدهم': defaultOptions,
      'دوازدهم': defaultOptions
    },
    'technicalVocational': {
      'دهم': defaultOptions,
      'یازدهم': defaultOptions,
      'دوازدهم': defaultOptions
    }
  };
  
  return options[level]?.[grade] || defaultOptions;
};

export const getFieldOptionsByLevel = (level: string | null) => {
  if (!level) return [];
  
  switch(level) {
    case 'elementary':
    case 'middleSchool':
      return [];
    case 'highSchool':
      return ['ریاضی', 'تجربی', 'انسانی', 'معارف'];
    case 'technicalVocational':
      return [
        'امور دامي',
        'امور زراعي',
        'پويانمايي (انيميشن)',
        'تأسيسات مكانيكي',
        'تربيت بدني',
        'تربيت كودك',
        'توليد برنامه‌ تلویزيوني',
        'چاپ',
        'حسابداري',
        'ساختمان',
        'سراميك',
        'سينما',
        'شبكه و نرم‌افزار رايانه',
        'صنايع چوب و مبلمان',
        'صنايع دستي - فرش',
        'صنايع شيميايي'
      ];
    default:
      return [];
  }
};

export const isFieldRequired = (level: string | null) => {
  return level === 'highSchool' || level === 'technicalVocational';
}; 