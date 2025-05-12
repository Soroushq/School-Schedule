export interface MiddleSchoolScheduleOptions {
  grades: string[];
  classOptions: Record<string, string[]>;
  fields: string[];
  mainPositions: string[];
  hourTypes: string[];
  teachingGroups: string[];
}

export const middleSchoolScheduleOptions: MiddleSchoolScheduleOptions = {
  grades: ['هفتم', 'هشتم', 'نهم'],
  
  classOptions: {
    'هفتم': ['الف', 'ب', 'ج'],
    'هشتم': ['الف', 'ب', 'ج'],
    'نهم': ['الف', 'ب', 'ج']
  },

  fields: ['عمومی'],

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
    'علوم تجربی',
    'ادبیات فارسی',
    'عربی',
    'دینی',
    'زبان انگلیسی',
    'مطالعات اجتماعی',
    'تربیت بدنی',
    'هنر',
    'کار و فناوری'
  ]
}; 