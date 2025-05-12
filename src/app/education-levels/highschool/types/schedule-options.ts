export interface HighSchoolScheduleOptions {
  grades: string[];
  classOptions: Record<string, string[]>;
  fields: string[];
  mainPositions: string[];
  hourTypes: string[];
  teachingGroups: string[];
}

export const highSchoolScheduleOptions: HighSchoolScheduleOptions = {
  grades: ['دهم', 'یازدهم', 'دوازدهم'],
  
  classOptions: {
    'دهم': ['الف', 'ب', 'ج'],
    'یازدهم': ['الف', 'ب', 'ج'],
    'دوازدهم': ['الف', 'ب', 'ج']
  },

  fields: [
    'ریاضی فیزیک',
    'علوم تجربی',
    'علوم انسانی'
  ],

  mainPositions: [
    'دبیر',
    'مدیر',
    'معاون',
    'مشاور'
  ],

  hourTypes: [
    'موظف',
    'غیرموظف',
    'موظف معاونین'
  ],

  teachingGroups: [
    'ریاضی',
    'فیزیک',
    'شیمی',
    'زیست شناسی',
    'ادبیات فارسی',
    'عربی',
    'دینی',
    'زبان انگلیسی',
    'تاریخ',
    'جغرافیا',
    'علوم اجتماعی',
    'فلسفه و منطق',
    'تربیت بدنی',
    'کار و فناوری'
  ]
}; 